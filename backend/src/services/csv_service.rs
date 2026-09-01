use crate::models::WeatherReading;
use crate::services::ingest::{calculate_wind_components, parse_iso_time_to_epoch, IngestError};

pub fn export_readings_to_csv(readings: &[WeatherReading]) -> String {
    let mut csv = String::from(
        "timestamp,time_iso,temperature_2m,apparent_temperature,dewpoint_2m,relative_humidity,surface_pressure,wind_speed_10m,wind_direction_10m,wind_u,wind_v,shortwave_radiation,uv_index,precipitation,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm\n"
    );

    for r in readings {
        csv.push_str(&format!(
            "{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}\n",
            r.timestamp,
            r.time_iso,
            r.temperature_2m.map(|v| v.to_string()).unwrap_or_default(),
            r.apparent_temperature.map(|v| v.to_string()).unwrap_or_default(),
            r.dewpoint_2m.map(|v| v.to_string()).unwrap_or_default(),
            r.relative_humidity.map(|v| v.to_string()).unwrap_or_default(),
            r.surface_pressure.map(|v| v.to_string()).unwrap_or_default(),
            r.wind_speed_10m.map(|v| v.to_string()).unwrap_or_default(),
            r.wind_direction_10m.map(|v| v.to_string()).unwrap_or_default(),
            r.wind_u.map(|v| v.to_string()).unwrap_or_default(),
            r.wind_v.map(|v| v.to_string()).unwrap_or_default(),
            r.shortwave_radiation.map(|v| v.to_string()).unwrap_or_default(),
            r.uv_index.map(|v| v.to_string()).unwrap_or_default(),
            r.precipitation.map(|v| v.to_string()).unwrap_or_default(),
            r.soil_temperature_0_to_7cm.map(|v| v.to_string()).unwrap_or_default(),
            r.soil_moisture_0_to_7cm.map(|v| v.to_string()).unwrap_or_default(),
        ));
    }

    csv
}

pub fn import_readings_from_csv(
    csv_content: &str,
    location_id: i64,
    source_type: &str,
    series_id: Option<&str>,
    ingested_at: i64,
) -> Result<Vec<WeatherReading>, IngestError> {
    let mut readings = Vec::new();
    let lines: Vec<&str> = csv_content.lines().collect();
    if lines.is_empty() {
        return Ok(readings);
    }

    let header_line = lines[0];
    let headers: Vec<&str> = header_line.split(',').map(|s| s.trim()).collect();

    // Map column indices
    let idx_time_iso = headers.iter().position(|&h| h == "time_iso" || h == "time");
    let idx_temp = headers.iter().position(|&h| h == "temperature_2m" || h == "temp");
    let idx_apparent_temp = headers.iter().position(|&h| h == "apparent_temperature");
    let idx_dewpoint = headers.iter().position(|&h| h == "dewpoint_2m" || h == "dewpoint");
    let idx_humidity = headers.iter().position(|&h| h == "relative_humidity" || h == "relative_humidity_2m" || h == "humidity");
    let idx_pressure = headers.iter().position(|&h| h == "surface_pressure" || h == "pressure");
    let idx_wind_speed = headers.iter().position(|&h| h == "wind_speed_10m" || h == "wind_speed");
    let idx_wind_dir = headers.iter().position(|&h| h == "wind_direction_10m" || h == "wind_dir");
    let idx_solar = headers.iter().position(|&h| h == "shortwave_radiation" || h == "solar");
    let idx_uv = headers.iter().position(|&h| h == "uv_index");
    let idx_precip = headers.iter().position(|&h| h == "precipitation" || h == "rain");
    let idx_soil_temp = headers.iter().position(|&h| h == "soil_temperature_0_to_7cm");
    let idx_soil_moisture = headers.iter().position(|&h| h == "soil_moisture_0_to_7cm");

    for line in lines.iter().skip(1) {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let cols: Vec<&str> = trimmed.split(',').map(|s| s.trim()).collect();

        let time_iso = if let Some(idx) = idx_time_iso {
            cols.get(idx).copied().unwrap_or("").to_string()
        } else {
            return Err(IngestError::TimeParse("Missing time_iso column".to_string()));
        };

        let timestamp = parse_iso_time_to_epoch(&time_iso)?;

        let parse_f64 = |idx_opt: Option<usize>| -> Option<f64> {
            idx_opt.and_then(|idx| cols.get(idx)).and_then(|val| val.parse::<f64>().ok())
        };

        let parse_i64 = |idx_opt: Option<usize>| -> Option<i64> {
            idx_opt.and_then(|idx| cols.get(idx)).and_then(|val| val.parse::<i64>().ok())
        };

        let temp = parse_f64(idx_temp);
        let apparent_temp = parse_f64(idx_apparent_temp);
        let dewpoint = parse_f64(idx_dewpoint);
        let humidity = parse_i64(idx_humidity);
        let pressure = parse_f64(idx_pressure);
        let wind_speed = parse_f64(idx_wind_speed);
        let wind_dir = parse_i64(idx_wind_dir);
        let solar = parse_f64(idx_solar);
        let uv = parse_f64(idx_uv);
        let precip = parse_f64(idx_precip);
        let soil_temp = parse_f64(idx_soil_temp);
        let soil_moisture = parse_f64(idx_soil_moisture);

        let (wind_u, wind_v) = calculate_wind_components(wind_speed, wind_dir);

        readings.push(WeatherReading {
            id: None,
            location_id,
            timestamp,
            time_iso,
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
