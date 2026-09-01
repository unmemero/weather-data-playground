pub mod open_meteo;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: Option<i64>,
    pub name: String,
    pub country: String,
    pub admin1: Option<String>,
    pub latitude: f64,
    pub longitude: f64,
    pub elevation: Option<f64>,
    pub timezone: String,
    pub is_active: bool,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WeatherReading {
    pub id: Option<i64>,
    pub location_id: i64,
    pub timestamp: i64,
    pub time_iso: String,
    pub source_type: String, // "automated" | "user_requested"
    pub series_id: Option<String>,
    pub ingested_at: i64,
    pub temperature_2m: Option<f64>,
    pub apparent_temperature: Option<f64>,
    pub dewpoint_2m: Option<f64>,
    pub relative_humidity: Option<i64>,
    pub surface_pressure: Option<f64>,
    pub wind_speed_10m: Option<f64>,
    pub wind_direction_10m: Option<i64>,
    pub wind_u: Option<f64>,
    pub wind_v: Option<f64>,
    pub shortwave_radiation: Option<f64>,
    pub uv_index: Option<f64>,
    pub precipitation: Option<f64>,
    pub soil_temperature_0_to_7cm: Option<f64>,
    pub soil_moisture_0_to_7cm: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrelationStats {
    pub sample_size: usize,
    pub mean_x: f64,
    pub mean_y: f64,
    pub std_x: f64,
    pub std_y: f64,
    pub covariance: f64,
    pub pearson_r: f64,
    pub regression_slope: f64,
    pub regression_intercept: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindVectorStats {
    pub mean_speed: f64,
    pub mean_u: f64,
    pub mean_v: f64,
    pub resultant_direction: f64,
    pub wind_rose_bins: Vec<WindRoseBin>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindRoseBin {
    pub direction_label: String, // e.g. "N", "NNE", "NE"
    pub angle_min: f64,
    pub angle_max: f64,
    pub frequency_pct: f64,
    pub avg_speed: f64,
}
