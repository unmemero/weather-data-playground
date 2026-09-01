use backend::models::WeatherReading;
use backend::services::stats::{
    compute_correlation, compute_simple_moving_average, compute_wind_vector_stats,
    extract_field_value,
};

fn create_mock_reading(
    timestamp: i64,
    temp: Option<f64>,
    humidity: Option<i64>,
    pressure: Option<f64>,
    wind_spd: Option<f64>,
    wind_dir: Option<i64>,
) -> WeatherReading {
    WeatherReading {
        id: None,
        location_id: 1,
        timestamp,
        time_iso: format!("2026-08-30T{:02}:00", (timestamp / 3600) % 24),
        source_type: "automated".to_string(),
        series_id: None,
        ingested_at: timestamp,
        temperature_2m: temp,
        apparent_temperature: temp.map(|t| t + 2.0),
        dewpoint_2m: temp.map(|t| t - 5.0),
        relative_humidity: humidity,
        surface_pressure: pressure,
        wind_speed_10m: wind_spd,
        wind_direction_10m: wind_dir,
        wind_u: None,
        wind_v: None,
        shortwave_radiation: Some(500.0),
        uv_index: Some(5.0),
        precipitation: Some(0.0),
        soil_temperature_0_to_7cm: temp,
        soil_moisture_0_to_7cm: Some(0.25),
    }
}

#[test]
fn test_field_extraction() {
    let r = create_mock_reading(1000, Some(25.0), Some(60), Some(1013.0), Some(15.0), Some(180));
    assert_eq!(extract_field_value(&r, "temperature_2m"), Some(25.0));
    assert_eq!(extract_field_value(&r, "temp"), Some(25.0));
    assert_eq!(extract_field_value(&r, "relative_humidity"), Some(60.0));
    assert_eq!(extract_field_value(&r, "surface_pressure"), Some(1013.0));
    assert_eq!(extract_field_value(&r, "non_existent"), None);
}

#[test]
fn test_pearson_correlation_and_regression() {
    // Perfect negative correlation: Temp increases, Humidity decreases linearly
    // Temp: [20, 25, 30, 35, 40]
    // Humidity: [80, 70, 60, 50, 40]
    // Expected r = -1.0, slope = -2.0, intercept = 120.0
    let readings = vec![
        create_mock_reading(0, Some(20.0), Some(80), None, None, None),
        create_mock_reading(3600, Some(25.0), Some(70), None, None, None),
        create_mock_reading(7200, Some(30.0), Some(60), None, None, None),
        create_mock_reading(10800, Some(35.0), Some(50), None, None, None),
        create_mock_reading(14400, Some(40.0), Some(40), None, None, None),
    ];

    let (stats, points) = compute_correlation(&readings, "temp", "humidity").unwrap();

    assert_eq!(stats.sample_size, 5);
    assert_eq!(stats.mean_x, 30.0);
    assert_eq!(stats.mean_y, 60.0);
    assert!((stats.pearson_r - (-1.0)).abs() < 1e-3, "Expected r = -1.0, got {}", stats.pearson_r);
    assert!((stats.regression_slope - (-2.0)).abs() < 1e-3, "Expected slope = -2.0, got {}", stats.regression_slope);
    assert!((stats.regression_intercept - 120.0).abs() < 1e-3, "Expected intercept = 120.0, got {}", stats.regression_intercept);
    assert_eq!(points.len(), 5);
}

#[test]
fn test_simple_moving_average() {
    let readings = vec![
        create_mock_reading(0, Some(10.0), None, None, None, None),
        create_mock_reading(3600, Some(20.0), None, None, None, None),
        create_mock_reading(7200, Some(30.0), None, None, None, None),
        create_mock_reading(10800, Some(40.0), None, None, None, None),
    ];

    // 3-hour window
    let smoothed = compute_simple_moving_average(&readings, "temp", 3);
    assert_eq!(smoothed.len(), 4);

    // Point 1: [10] -> avg = 10.0
    assert_eq!(smoothed[0].smoothed_value, Some(10.0));
    // Point 2: [10, 20] -> avg = 15.0
    assert_eq!(smoothed[1].smoothed_value, Some(15.0));
    // Point 3: [10, 20, 30] -> avg = 20.0
    assert_eq!(smoothed[2].smoothed_value, Some(20.0));
    // Point 4: [20, 30, 40] -> avg = 30.0
    assert_eq!(smoothed[3].smoothed_value, Some(30.0));
}

#[test]
fn test_wind_vector_stats_and_rose_binning() {
    // 2 readings:
    // 1. Wind from North (0 deg) at 10 km/h -> U = 0, V = -10
    // 2. Wind from East (90 deg) at 10 km/h -> U = -10, V = 0
    // Mean U = -5, Mean V = -5 -> Resultant direction is NE (45 deg)
    let readings = vec![
        create_mock_reading(0, None, None, None, Some(10.0), Some(0)),
        create_mock_reading(3600, None, None, None, Some(10.0), Some(90)),
    ];

    let stats = compute_wind_vector_stats(&readings);
    assert_eq!(stats.mean_speed, 10.0);
    assert_eq!(stats.mean_u, -5.0);
    assert_eq!(stats.mean_v, -5.0);
    assert_eq!(stats.resultant_direction, 45.0); // Exactly North-East (45 degrees)

    // Verify 16 sectors exist
    assert_eq!(stats.wind_rose_bins.len(), 16);
    // North bin (index 0) has 50% freq
    assert_eq!(stats.wind_rose_bins[0].direction_label, "N");
    assert_eq!(stats.wind_rose_bins[0].frequency_pct, 50.0);
    // East bin (index 4) has 50% freq
    assert_eq!(stats.wind_rose_bins[4].direction_label, "E");
    assert_eq!(stats.wind_rose_bins[4].frequency_pct, 50.0);
}
