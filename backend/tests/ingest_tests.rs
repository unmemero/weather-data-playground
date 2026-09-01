use reqwest::Client;

use backend::models::open_meteo::{OpenMeteoHourlyData, OpenMeteoHourlyResponse};
use backend::services::ingest::{
    calculate_wind_components, fetch_forecast_timeseries, fetch_historical_timeseries,
    parse_iso_time_to_epoch, parse_open_meteo_hourly_data, search_locations,
};

#[test]
fn test_calculate_wind_components() {
    // Wind blowing FROM North (0 deg / 360 deg) with speed 10 km/h:
    // U = -10 * sin(0) = 0.0
    // V = -10 * cos(0) = -10.0 (pointing South)
    let (u, v) = calculate_wind_components(Some(10.0), Some(0));
    assert_eq!(u, Some(0.0));
    assert_eq!(v, Some(-10.0));

    // Wind blowing FROM East (90 deg) with speed 10 km/h:
    // U = -10 * sin(90) = -10.0 (pointing West)
    // V = -10 * cos(90) = 0.0
    let (u, v) = calculate_wind_components(Some(10.0), Some(90));
    assert_eq!(u, Some(-10.0));
    assert_eq!(v, Some(0.0));

    // Wind blowing FROM South (180 deg) with speed 10 km/h:
    // U = -10 * sin(180) = 0.0
    // V = -10 * cos(180) = +10.0 (pointing North)
    let (u, v) = calculate_wind_components(Some(10.0), Some(180));
    assert_eq!(u, Some(0.0));
    assert_eq!(v, Some(10.0));

    // Missing values test
    let (u, v) = calculate_wind_components(None, Some(90));
    assert_eq!(u, None);
    assert_eq!(v, None);
}

#[test]
fn test_parse_iso_time_to_epoch() {
    let epoch = parse_iso_time_to_epoch("2026-08-30T14:00").unwrap();
    // 2026-08-30 14:00:00 UTC epoch timestamp is 1788098400
    assert_eq!(epoch, 1788098400);

    let invalid = parse_iso_time_to_epoch("invalid-date");
    assert!(invalid.is_err());
}

#[test]
fn test_parse_open_meteo_hourly_data() {
    let sample_response = OpenMeteoHourlyResponse {
        latitude: 30.26,
        longitude: -97.74,
        elevation: Some(150.0),
        timezone: Some("America/Chicago".to_string()),
        hourly: Some(OpenMeteoHourlyData {
            time: vec!["2026-08-30T12:00".to_string(), "2026-08-30T13:00".to_string()],
            temperature_2m: Some(vec![Some(32.5), Some(34.0)]),
            apparent_temperature: Some(vec![Some(36.0), Some(38.2)]),
            dewpoint_2m: Some(vec![Some(21.0), Some(20.5)]),
            relative_humidity_2m: Some(vec![Some(55), Some(48)]),
            surface_pressure: Some(vec![Some(1012.0), Some(1011.5)]),
            wind_speed_10m: Some(vec![Some(15.0), Some(18.0)]),
            wind_direction_10m: Some(vec![Some(180), Some(225)]),
            precipitation: Some(vec![Some(0.0), Some(0.0)]),
            shortwave_radiation: Some(vec![Some(800.0), Some(850.0)]),
            uv_index: Some(vec![Some(8.5), Some(9.0)]),
            soil_temperature_0_to_7cm: Some(vec![Some(28.0), Some(29.0)]),
            soil_moisture_0_to_7cm: Some(vec![Some(0.20), Some(0.19)]),
        }),
    };

    let readings = parse_open_meteo_hourly_data(
        sample_response,
        1,
        "automated",
        None,
        1788098400,
    ).unwrap();

    assert_eq!(readings.len(), 2);
    assert_eq!(readings[0].location_id, 1);
    assert_eq!(readings[0].time_iso, "2026-08-30T12:00");
    assert_eq!(readings[0].temperature_2m, Some(32.5));
    assert_eq!(readings[0].relative_humidity, Some(55));
    // Wind from 180 (South) at 15 km/h -> U = 0.0, V = 15.0
    assert_eq!(readings[0].wind_u, Some(0.0));
    assert_eq!(readings[0].wind_v, Some(15.0));

    assert_eq!(readings[1].time_iso, "2026-08-30T13:00");
    assert_eq!(readings[1].temperature_2m, Some(34.0));
}

#[tokio::test]
async fn test_live_geocoding_search() {
    let client = Client::new();
    let locations = search_locations(&client, "Austin", 2).await;
    assert!(locations.is_ok(), "Geocoding query failed: {:?}", locations.err());
    let list = locations.unwrap();
    assert!(!list.is_empty());
    assert_eq!(list[0].name, "Austin");
    assert!((list[0].latitude - 30.26).abs() < 1.0);
}

#[tokio::test]
async fn test_live_forecast_timeseries_fetch() {
    let client = Client::new();
    let readings = fetch_forecast_timeseries(
        &client,
        30.2672,
        -97.7431,
        2,
        0,
        1,
        "automated",
        None,
    ).await;

    assert!(readings.is_ok(), "Forecast fetch failed: {:?}", readings.err());
    let data = readings.unwrap();
    assert!(data.len() >= 48);
    assert!(data[0].temperature_2m.is_some());
    assert!(data[0].relative_humidity.is_some());
    assert!(data[0].surface_pressure.is_some());
    assert!(data[0].wind_u.is_some());
    assert!(data[0].wind_v.is_some());
}

#[tokio::test]
async fn test_live_historical_archive_fetch() {
    let client = Client::new();
    let readings = fetch_historical_timeseries(
        &client,
        30.2672,
        -97.7431,
        "2023-01-01",
        "2023-01-03",
        1,
        Some("case_study_test"),
    ).await;

    assert!(readings.is_ok(), "Historical archive fetch failed: {:?}", readings.err());
    let data = readings.unwrap();
    assert_eq!(data.len(), 72);
    assert_eq!(data[0].source_type, "user_requested");
    assert_eq!(data[0].series_id, Some("case_study_test".to_string()));
}
