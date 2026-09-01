use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

use crate::models::{CorrelationStats, WeatherReading, WindRoseBin, WindVectorStats};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ScatterPoint {
    pub x: f64,
    pub y: f64,
    pub timestamp: i64,
    pub time_iso: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SmoothedPoint {
    pub timestamp: i64,
    pub time_iso: String,
    pub raw_value: Option<f64>,
    pub smoothed_value: Option<f64>,
}

/// Helper to extract numeric values from WeatherReading by column name
pub fn extract_field_value(reading: &WeatherReading, field_name: &str) -> Option<f64> {
    match field_name {
        "temperature_2m" | "temp" => reading.temperature_2m,
        "apparent_temperature" => reading.apparent_temperature,
        "dewpoint_2m" | "dewpoint" => reading.dewpoint_2m,
        "relative_humidity" | "relative_humidity_2m" | "humidity" => reading.relative_humidity.map(|h| h as f64),
        "surface_pressure" | "pressure" => reading.surface_pressure,
        "wind_speed_10m" | "wind_speed" => reading.wind_speed_10m,
        "wind_direction_10m" | "wind_dir" => reading.wind_direction_10m.map(|d| d as f64),
        "wind_u" => reading.wind_u,
        "wind_v" => reading.wind_v,
        "shortwave_radiation" | "solar" => reading.shortwave_radiation,
        "uv_index" => reading.uv_index,
        "precipitation" | "rain" => reading.precipitation,
        "soil_temperature_0_to_7cm" | "soil_temp" => reading.soil_temperature_0_to_7cm,
        "soil_moisture_0_to_7cm" | "soil_moisture" => reading.soil_moisture_0_to_7cm,
        _ => None,
    }
}

/// Computes Pearson correlation coefficient (r), linear regression parameters, and paired scatter points
pub fn compute_correlation(
    readings: &[WeatherReading],
    x_field: &str,
    y_field: &str,
) -> Option<(CorrelationStats, Vec<ScatterPoint>)> {
    let mut pairs = Vec::new();

    for r in readings {
        if let (Some(x), Some(y)) = (extract_field_value(r, x_field), extract_field_value(r, y_field)) {
            pairs.push((
                ScatterPoint {
                    x,
                    y,
                    timestamp: r.timestamp,
                    time_iso: r.time_iso.clone(),
                },
                x,
                y,
            ));
        }
    }

    let n = pairs.len();
    if n < 2 {
        return None;
    }

    let n_f = n as f64;
    let sum_x: f64 = pairs.iter().map(|(_, x, _)| x).sum();
    let sum_y: f64 = pairs.iter().map(|(_, _, y)| y).sum();
    let mean_x = sum_x / n_f;
    let mean_y = sum_y / n_f;

    let mut sum_sq_diff_x = 0.0;
    let mut sum_sq_diff_y = 0.0;
    let mut sum_diff_product = 0.0;

    for (_, x, y) in &pairs {
        let dx = x - mean_x;
        let dy = y - mean_y;
        sum_sq_diff_x += dx * dx;
        sum_sq_diff_y += dy * dy;
        sum_diff_product += dx * dy;
    }

    let std_x = (sum_sq_diff_x / (n_f - 1.0)).sqrt();
    let std_y = (sum_sq_diff_y / (n_f - 1.0)).sqrt();
    let covariance = sum_diff_product / (n_f - 1.0);

    let denominator = (sum_sq_diff_x * sum_sq_diff_y).sqrt();
    let pearson_r = if denominator.abs() > 1e-9 {
        sum_diff_product / denominator
    } else {
        0.0
    };

    // Linear regression: y = slope * x + intercept
    // slope m = Cov(X,Y) / Var(X) = sum_diff_product / sum_sq_diff_x
    let slope = if sum_sq_diff_x.abs() > 1e-9 {
        sum_diff_product / sum_sq_diff_x
    } else {
        0.0
    };
    let intercept = mean_y - slope * mean_x;

    let stats = CorrelationStats {
        sample_size: n,
        mean_x: (mean_x * 1000.0).round() / 1000.0,
        mean_y: (mean_y * 1000.0).round() / 1000.0,
        std_x: (std_x * 1000.0).round() / 1000.0,
        std_y: (std_y * 1000.0).round() / 1000.0,
        covariance: (covariance * 1000.0).round() / 1000.0,
        pearson_r: (pearson_r * 1000.0).round() / 1000.0,
        regression_slope: (slope * 1000.0).round() / 1000.0,
        regression_intercept: (intercept * 1000.0).round() / 1000.0,
    };

    let scatter_points = pairs.into_iter().map(|(p, _, _)| p).collect();
    Some((stats, scatter_points))
}

/// Computes Simple Moving Average (SMA) smoothing over a rolling time window
pub fn compute_simple_moving_average(
    readings: &[WeatherReading],
    field_name: &str,
    window_size: usize,
) -> Vec<SmoothedPoint> {
    if window_size == 0 || readings.is_empty() {
        return readings
            .iter()
            .map(|r| SmoothedPoint {
                timestamp: r.timestamp,
                time_iso: r.time_iso.clone(),
                raw_value: extract_field_value(r, field_name),
                smoothed_value: extract_field_value(r, field_name),
            })
            .collect();
    }

    let mut result = Vec::with_capacity(readings.len());
    let mut rolling_window: Vec<f64> = Vec::new();

    for r in readings {
        let val = extract_field_value(r, field_name);
        if let Some(v) = val {
            rolling_window.push(v);
            if rolling_window.len() > window_size {
                rolling_window.remove(0);
            }
        }

        let smoothed_value = if !rolling_window.is_empty() {
            let avg = rolling_window.iter().sum::<f64>() / (rolling_window.len() as f64);
            Some((avg * 100.0).round() / 100.0)
        } else {
            None
        };

        result.push(SmoothedPoint {
            timestamp: r.timestamp,
            time_iso: r.time_iso.clone(),
            raw_value: val,
            smoothed_value,
        });
    }

    result
}

/// Computes Wind Vector statistics and 16-compass cardinal direction histogram bins (Wind Rose)
pub fn compute_wind_vector_stats(readings: &[WeatherReading]) -> WindVectorStats {
    let mut valid_count = 0;
    let mut sum_speed = 0.0;
    let mut sum_u = 0.0;
    let mut sum_v = 0.0;

    // 16 cardinal compass directions
    let labels = [
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
    ];

    let sector_width = 360.0 / 16.0; // 22.5 degrees per sector
    let mut sector_counts = [0usize; 16];
    let mut sector_speed_sums = [0.0f64; 16];

    for r in readings {
        if let (Some(spd), Some(dir)) = (r.wind_speed_10m, r.wind_direction_10m) {
            valid_count += 1;
            sum_speed += spd;

            let u = r.wind_u.unwrap_or_else(|| {
                let rad = (dir as f64) * PI / 180.0;
                -spd * rad.sin()
            });
            let v = r.wind_v.unwrap_or_else(|| {
                let rad = (dir as f64) * PI / 180.0;
                -spd * rad.cos()
            });

            sum_u += u;
            sum_v += v;

            // Normalize angle to [0, 360) and find sector index
            let normalized_deg = (dir as f64).rem_euclid(360.0);
            // Shift by half sector (11.25 deg) so North spans [348.75, 11.25)
            let shifted = (normalized_deg + 11.25).rem_euclid(360.0);
            let sector_idx = ((shifted / sector_width).floor() as usize) % 16;

            sector_counts[sector_idx] += 1;
            sector_speed_sums[sector_idx] += spd;
        }
    }

    if valid_count == 0 {
        return WindVectorStats {
            mean_speed: 0.0,
            mean_u: 0.0,
            mean_v: 0.0,
            resultant_direction: 0.0,
            wind_rose_bins: Vec::new(),
        };
    }

    let count_f = valid_count as f64;
    let mean_speed = sum_speed / count_f;
    let mean_u = sum_u / count_f;
    let mean_v = sum_v / count_f;

    // Resultant meteorological direction: θ = atan2(-mean_u, -mean_v) in degrees
    let resultant_dir_rad = (-mean_u).atan2(-mean_v);
    let mut resultant_dir_deg = resultant_dir_rad * 180.0 / PI;
    if resultant_dir_deg < 0.0 {
        resultant_dir_deg += 360.0;
    }

    let mut wind_rose_bins = Vec::with_capacity(16);
    for i in 0..16 {
        let center_angle = i as f64 * sector_width;
        let mut angle_min = center_angle - 11.25;
        if angle_min < 0.0 {
            angle_min += 360.0;
        }
        let angle_max = (center_angle + 11.25).rem_euclid(360.0);

        let freq_pct = (sector_counts[i] as f64 / count_f) * 100.0;
        let avg_spd = if sector_counts[i] > 0 {
            sector_speed_sums[i] / (sector_counts[i] as f64)
        } else {
            0.0
        };

        wind_rose_bins.push(WindRoseBin {
            direction_label: labels[i].to_string(),
            angle_min: (angle_min * 10.0).round() / 10.0,
            angle_max: (angle_max * 10.0).round() / 10.0,
            frequency_pct: (freq_pct * 10.0).round() / 10.0,
            avg_speed: (avg_spd * 10.0).round() / 10.0,
        });
    }

    WindVectorStats {
        mean_speed: (mean_speed * 100.0).round() / 100.0,
        mean_u: (mean_u * 100.0).round() / 100.0,
        mean_v: (mean_v * 100.0).round() / 100.0,
        resultant_direction: (resultant_dir_deg * 10.0).round() / 10.0,
        wind_rose_bins,
    }
}
