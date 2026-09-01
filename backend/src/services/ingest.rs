use std::f64::consts::PI;
use chrono::{NaiveDateTime, Utc};
use reqwest::Client;
use thiserror::Error;

use crate::models::open_meteo::{GeocodingResponse, OpenMeteoHourlyResponse};
use crate::models::{Location, WeatherReading};

#[derive(Error, Debug)]
pub enum IngestError {
    #[error("HTTP request failed: {0}")]
    Http(#[from] reqwest::Error),
    #[error("JSON serialization/deserialization failed: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Failed to parse time string '{0}'")]
    TimeParse(String),
    #[error("No results found for query: {0}")]
    NotFound(String),
    #[error("API returned error: {0}")]
    ApiError(String),
}

/// Helper function to calculate meteorological U (zonal, East-West) and V (meridional, North-South) wind vectors
/// Note: Wind direction θ is where the wind is blowing FROM.
/// U = -speed * sin(θ in radians)
/// V = -speed * cos(θ in radians)
pub fn calculate_wind_components(speed: Option<f64>, direction_deg: Option<i64>) -> (Option<f64>, Option<f64>) {
    match (speed, direction_deg) {
        (Some(spd), Some(dir)) => {
            let rad = (dir as f64) * PI / 180.0;
            let u = -spd * rad.sin();
            let v = -spd * rad.cos();
            // Round to 2 decimal places for clean floating point representation
            let u_rounded = (u * 100.0).round() / 100.0;
            let v_rounded = (v * 100.0).round() / 100.0;
            (Some(u_rounded), Some(v_rounded))
        }
        _ => (None, None),
    }
}

/// Helper function to parse an ISO 8601 string like "2026-08-30T14:00" to unix epoch seconds
pub fn parse_iso_time_to_epoch(time_str: &str) -> Result<i64, IngestError> {
    // Open-Meteo returns time in "YYYY-MM-DDTHH:MM" format
    if let Ok(naive) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%dT%H:%M") {
        Ok(naive.and_utc().timestamp())
    } else if let Ok(naive) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M") {
        Ok(naive.and_utc().timestamp())
    } else {
        Err(IngestError::TimeParse(time_str.to_string()))
    }
}

/// Converts an OpenMeteoHourlyResponse into a list of unified WeatherReading models
pub fn parse_open_meteo_hourly_data(
    response: OpenMeteoHourlyResponse,
    location_id: i64,
    source_type: &str,
    series_id: Option<&str>,
    ingested_at: i64,
) -> Result<Vec<WeatherReading>, IngestError> {
    let hourly = response.hourly.ok_or_else(|| IngestError::ApiError("No hourly data in payload".to_string()))?;
    let total_records = hourly.time.len();
    let mut readings = Vec::with_capacity(total_records);

    for i in 0..total_records {
        let time_iso = &hourly.time[i];
        let timestamp = parse_iso_time_to_epoch(time_iso)?;

        let temp = hourly.temperature_2m.as_ref().and_then(|v| v.get(i).copied().flatten());
        let apparent_temp = hourly.apparent_temperature.as_ref().and_then(|v| v.get(i).copied().flatten());
        let dewpoint = hourly.dewpoint_2m.as_ref().and_then(|v| v.get(i).copied().flatten());
        let humidity = hourly.relative_humidity_2m.as_ref().and_then(|v| v.get(i).copied().flatten());
        let pressure = hourly.surface_pressure.as_ref().and_then(|v| v.get(i).copied().flatten());
        let wind_speed = hourly.wind_speed_10m.as_ref().and_then(|v| v.get(i).copied().flatten());
        let wind_dir = hourly.wind_direction_10m.as_ref().and_then(|v| v.get(i).copied().flatten());
        let precip = hourly.precipitation.as_ref().and_then(|v| v.get(i).copied().flatten());
        let solar = hourly.shortwave_radiation.as_ref().and_then(|v| v.get(i).copied().flatten());
        let uv = hourly.uv_index.as_ref().and_then(|v| v.get(i).copied().flatten());
        let soil_temp = hourly.soil_temperature_0_to_7cm.as_ref().and_then(|v| v.get(i).copied().flatten());
        let soil_moisture = hourly.soil_moisture_0_to_7cm.as_ref().and_then(|v| v.get(i).copied().flatten());

        let (wind_u, wind_v) = calculate_wind_components(wind_speed, wind_dir);

        readings.push(WeatherReading {
            id: None,
            location_id,
            timestamp,
            time_iso: time_iso.clone(),
            source_type: source_type.to_string(),
            series_id: series_id.map(|s| s.to_string()),
            ingested_at,
            temperature_2m: temp,
            apparent_temperature: apparent_temp,
            dewpoint_2m: dewpoint,
            relative_humidity: humidity,
            surface_pressure: pressure,
            wind_speed_10m: wind_speed,
            wind_direction_10m: wind_dir,
            wind_u,
            wind_v,
            shortwave_radiation: solar,
            uv_index: uv,
            precipitation: precip,
            soil_temperature_0_to_7cm: soil_temp,
            soil_moisture_0_to_7cm: soil_moisture,
        });
    }

    Ok(readings)
}

/// Searches for city locations using the Open-Meteo Geocoding API
pub async fn search_locations(client: &Client, query: &str, count: usize) -> Result<Vec<Location>, IngestError> {
    let url = format!(
        "https://geocoding-api.open-meteo.com/v1/search?name={}&count={}&language=en&format=json",
        urlencoding_encode(query),
        count
    );

    let resp = client.get(&url).send().await?.error_for_status()?;
    let geo_resp: GeocodingResponse = resp.json().await?;

    let results = geo_resp.results.unwrap_or_default();
    if results.is_empty() {
        return Err(IngestError::NotFound(query.to_string()));
    }

    let now = Utc::now().timestamp();
    let locations = results
        .into_iter()
        .map(|r| Location {
            id: None,
            name: r.name,
            country: r.country.unwrap_or_else(|| r.country_code.unwrap_or_default()),
            admin1: r.admin1,
            latitude: r.latitude,
            longitude: r.longitude,
            elevation: r.elevation,
            timezone: r.timezone.unwrap_or_else(|| "UTC".to_string()),
            is_active: false,
            created_at: now,
        })
        .collect();

    Ok(locations)
}

/// Fetches recent/past forecast timeseries data from Open-Meteo
#[allow(clippy::too_many_arguments)]
pub async fn fetch_forecast_timeseries(
    client: &Client,
    lat: f64,
    lon: f64,
    past_days: u32,
    forecast_days: u32,
    location_id: i64,
    source_type: &str,
    series_id: Option<&str>,
) -> Result<Vec<WeatherReading>, IngestError> {
    let url = format!(
        "https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&hourly=temperature_2m,apparent_temperature,dewpoint_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation,shortwave_radiation,uv_index,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&past_days={}&forecast_days={}&timezone=auto",
        lat, lon, past_days, forecast_days
    );

    let resp = client.get(&url).send().await?.error_for_status()?;
    let data: OpenMeteoHourlyResponse = resp.json().await?;
    let now = Utc::now().timestamp();

    parse_open_meteo_hourly_data(data, location_id, source_type, series_id, now)
}

/// Fetches historical case study data from Open-Meteo Archive API
pub async fn fetch_historical_timeseries(
    client: &Client,
    lat: f64,
    lon: f64,
    start_date: &str,
    end_date: &str,
    location_id: i64,
    series_id: Option<&str>,
) -> Result<Vec<WeatherReading>, IngestError> {
    let url = format!(
        "https://archive-api.open-meteo.com/v1/archive?latitude={}&longitude={}&start_date={}&end_date={}&hourly=temperature_2m,apparent_temperature,dewpoint_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation,shortwave_radiation,uv_index,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&timezone=auto",
        lat, lon, start_date, end_date
    );

    let resp = client.get(&url).send().await?.error_for_status()?;
    let data: OpenMeteoHourlyResponse = resp.json().await?;
    let now = Utc::now().timestamp();

    parse_open_meteo_hourly_data(data, location_id, "user_requested", series_id, now)
}

fn urlencoding_encode(s: &str) -> String {
    url::form_urlencoded::byte_serialize(s.as_bytes()).collect()
}
