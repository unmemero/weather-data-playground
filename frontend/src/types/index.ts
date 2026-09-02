export interface Location {
  id: number | null;
  name: string;
  country: string;
  admin1?: string | null;
  latitude: number;
  longitude: number;
  elevation?: number | null;
  timezone: string;
  is_active: boolean;
  created_at: number;
}

export interface WeatherReading {
  id: number | null;
  location_id: number;
  timestamp: number;
  time_iso: string;
  source_type: 'automated' | 'user_requested' | string;
  series_id: string | null;
  ingested_at: number;
  temperature_2m: number | null;
  apparent_temperature: number | null;
  dewpoint_2m: number | null;
  relative_humidity: number | null;
  surface_pressure: number | null;
  wind_speed_10m: number | null;
  wind_direction_10m: number | null;
  wind_u: number | null;
  wind_v: number | null;
  shortwave_radiation: number | null;
  uv_index: number | null;
  precipitation: number | null;
  soil_temperature_0_to_7cm: number | null;
  soil_moisture_0_to_7cm: number | null;
}

export interface CorrelationStats {
  sample_size: number;
  mean_x: number;
  mean_y: number;
  std_x: number;
  std_y: number;
  covariance: number;
  pearson_r: number;
  regression_slope: number;
  regression_intercept: number;
}

export interface ScatterPoint {
  x: number;
  y: number;
  timestamp: number;
  time_iso: string;
}

export interface CorrelationResponse {
  stats: CorrelationStats;
  points: ScatterPoint[];
}

export interface WindRoseBin {
  direction_label: string;
  angle_min: number;
  angle_max: number;
  frequency_pct: number;
  avg_speed: number;
}

export interface WindVectorStats {
  mean_speed: number;
  mean_u: number;
  mean_v: number;
  resultant_direction: number;
  wind_rose_bins: WindRoseBin[];
}

export interface SmoothedPoint {
  timestamp: number;
  time_iso: string;
  raw_value: number | null;
  smoothed_value: number | null;
}

export interface TimeseriesResponse {
  readings: WeatherReading[];
  smoothed?: SmoothedPoint[] | null;
}

export interface CaseStudyInfo {
  series_id: string;
  start_timestamp: number;
  end_timestamp: number;
  record_count: number;
  ingested_at: number;
  is_stale: boolean;
}

export interface SyncResult {
  location_id: number;
  records_added: number;
  purged_records: number;
  last_synced_timestamp: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
