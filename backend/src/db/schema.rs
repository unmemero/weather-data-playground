// SQL Schema definitions matching backend_design.md

pub const CREATE_LOCATIONS_TABLE: &str = r#"
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    admin1 TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    elevation REAL,
    timezone TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER NOT NULL,
    UNIQUE(latitude, longitude)
);
"#;

pub const CREATE_READINGS_TABLE: &str = r#"
CREATE TABLE IF NOT EXISTS weather_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    time_iso TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'automated',
    series_id TEXT NOT NULL DEFAULT '',
    ingested_at INTEGER NOT NULL,
    temperature_2m REAL,
    apparent_temperature REAL,
    dewpoint_2m REAL,
    relative_humidity INTEGER,
    surface_pressure REAL,
    wind_speed_10m REAL,
    wind_direction_10m INTEGER,
    wind_u REAL,
    wind_v REAL,
    shortwave_radiation REAL,
    uv_index REAL,
    precipitation REAL,
    soil_temperature_0_to_7cm REAL,
    soil_moisture_0_to_7cm REAL,
    FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE(location_id, timestamp, source_type, series_id)
);
"#;

pub const CREATE_READINGS_INDEX: &str = r#"
CREATE INDEX IF NOT EXISTS idx_readings_loc_time 
ON weather_readings(location_id, timestamp, source_type);
"#;
