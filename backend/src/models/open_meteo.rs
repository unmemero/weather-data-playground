use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeocodingResponse {
    #[serde(default)]
    pub results: Option<Vec<GeocodingResult>>,
    pub generationtime_ms: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeocodingResult {
    pub id: i64,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub elevation: Option<f64>,
    pub country_code: Option<String>,
    pub country: Option<String>,
    pub admin1: Option<String>,
    pub timezone: Option<String>,
    pub population: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenMeteoHourlyResponse {
    pub latitude: f64,
    pub longitude: f64,
    pub elevation: Option<f64>,
    pub timezone: Option<String>,
    pub hourly: Option<OpenMeteoHourlyData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenMeteoHourlyData {
    pub time: Vec<String>,
    pub temperature_2m: Option<Vec<Option<f64>>>,
    pub apparent_temperature: Option<Vec<Option<f64>>>,
    pub dewpoint_2m: Option<Vec<Option<f64>>>,
    pub relative_humidity_2m: Option<Vec<Option<i64>>>,
    pub surface_pressure: Option<Vec<Option<f64>>>,
    pub wind_speed_10m: Option<Vec<Option<f64>>>,
    pub wind_direction_10m: Option<Vec<Option<i64>>>,
    pub precipitation: Option<Vec<Option<f64>>>,
    pub shortwave_radiation: Option<Vec<Option<f64>>>,
    pub uv_index: Option<Vec<Option<f64>>>,
    pub soil_temperature_0_to_7cm: Option<Vec<Option<f64>>>,
    pub soil_moisture_0_to_7cm: Option<Vec<Option<f64>>>,
}
