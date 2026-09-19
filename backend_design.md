# ⚙️ Meteorology Workbook: Backend Architecture & API Specification

This document details the backend architecture, SQLite schema, data lifecycle policies, and Open-Meteo API specifications for the Meteorology Workbook application.

---

## 📡 1. External API Specification (Open-Meteo)

### A. Geocoding Endpoint
*   **URL:** `https://geocoding-api.open-meteo.com/v1/search`
*   **Method:** `GET`
*   **Sample Query:** `?name=Austin&count=1&language=en&format=json`
*   **Verified Response Structure:**
    ```json
    {
      "results": [
        {
          "id": 4671654,
          "name": "Austin",
          "latitude": 30.26715,
          "longitude": -97.74306,
          "elevation": 149.0,
          "country_code": "US",
          "timezone": "America/Chicago",
          "country": "United States",
          "admin1": "Texas"
        }
      ],
      "generationtime_ms": 0.58
    }
    ```

### B. Forecast & Recent Past Timeseries Endpoint
*   **URL:** `https://api.open-meteo.com/v1/forecast`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `latitude`, `longitude` (Required floats)
    *   `hourly` (Comma-separated 12 curated variables)
    *   `past_days` (e.g. `90` for initial baseline seeding, or specific gap length)
    *   `forecast_days` (`1`)
    *   `timezone` (`auto` or local machine zone)
*   **Curated Variables:** `temperature_2m`, `apparent_temperature`, `dewpoint_2m`, `relative_humidity_2m`, `surface_pressure`, `wind_speed_10m`, `wind_direction_10m`, `precipitation`, `shortwave_radiation`, `uv_index`, `soil_temperature_0_to_7cm`, `soil_moisture_0_to_7cm`.

### C. Historical Archive Endpoint (ERA5 Reanalysis)
*   **URL:** `https://archive-api.open-meteo.com/v1/archive`
*   **Method:** `GET`
*   **Query Parameters:** `latitude`, `longitude`, `start_date` (`YYYY-MM-DD`), `end_date` (`YYYY-MM-DD`), `hourly`, `timezone`.
*   **Use Case:** Fetching user-requested historical case studies (e.g. storms/freezes from past years).

---

## 🗄️ 2. SQLite Database Schema Design

The backend uses a single-file SQLite database with indexed lookups, supporting distinct city profiles, automated streams, and pinned case studies:

```sql
-- 1. City Profiles Table
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
    created_at INTEGER NOT NULL, -- Unix epoch
    UNIQUE(latitude, longitude)
);

-- 2. Main Timeseries Readings Table
CREATE TABLE IF NOT EXISTS weather_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,          -- Unix epoch (seconds) of observation
    time_iso TEXT NOT NULL,               -- Localized ISO 8601 string
    source_type TEXT NOT NULL DEFAULT 'automated', -- 'automated' | 'user_requested'
    series_id TEXT,                       -- Optional ID for user-requested case studies (e.g. 'case_study_2021_freeze')
    ingested_at INTEGER NOT NULL,        -- Unix epoch of when the record was downloaded
    temperature_2m REAL,                  -- °C
    apparent_temperature REAL,            -- °C
    dewpoint_2m REAL,                     -- °C
    relative_humidity INTEGER,            -- %
    surface_pressure REAL,                -- hPa
    wind_speed_10m REAL,                  -- km/h
    wind_direction_10m INTEGER,           -- degrees (0-360)
    wind_u REAL,                          -- Computed zonal vector (km/h)
    wind_v REAL,                          -- Computed meridional vector (km/h)
    shortwave_radiation REAL,             -- W/m²
    uv_index REAL,
    precipitation REAL,                   -- mm
    soil_temperature_0_to_7cm REAL,       -- °C
    soil_moisture_0_to_7cm REAL,          -- m³/m³
    FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE(location_id, timestamp, source_type, series_id)
);

-- Timeseries Index for sub-millisecond range queries and filtering
CREATE INDEX IF NOT EXISTS idx_readings_loc_time 
ON weather_readings(location_id, timestamp, source_type);
```

---

## 🔄 3. Data Lifecycle & Ingestion Engine

### A. Startup Catch-Up & Backfill Algorithm
When the application starts, Rust checks the active city profile:
1.  Query `SELECT MAX(timestamp) FROM weather_readings WHERE location_id = active_id AND source_type = 'automated'`.
2.  Compute the gap between `last_timestamp + 3600` and `floor_hour(now)`:
    *   **Case 1: First Run (No records exist):** Fetch `past_days=90` from Open-Meteo Forecast API and bulk insert into SQLite.
    *   **Case 2: Gap $< 2\text{ Years}$ (730 days):** Fetch the exact missing hourly gap from Open-Meteo (`start_date` to `end_date`), seamlessly backfilling the database.
    *   **Case 3: Gap $\ge 2\text{ Years}$:** The automated history is considered expired. Delete all records for this location where `source_type = 'automated'` and fetch a fresh `past_days=90` baseline.
3.  **Scheduled Polling:** Schedule the next update to trigger at the top of the next hour ($XX:00:00$), updating hourly.
4.  **Manual Sync:** A manual "Sync Now" trigger runs the same catch-up calculation on demand.

### B. Retention & Purge Policy
*   **`automated` Data:** Hard retention cap of **2 Years (730 days)**. Any record with `source_type = 'automated'` and `timestamp < (now - 2 years)` is automatically purged during the hourly sync cycle.
*   **`user_requested` Data:** **Never automatically purged.** Retained indefinitely as pinned case studies until the user explicitly deletes them.
*   **Stale Tag Flag:** If `(now - ingested_at) > 30 days` on a user-requested series, it is flagged in the metadata as "Collected $>30$ days ago."

### C. City Profile Switching
1.  When a user searches and selects a new city:
    *   The previous active city is set to `is_active = 0` (all its data remains safely archived in SQLite).
    *   If the new city already exists in `locations`, set `is_active = 1` and run the startup catch-up algorithm.
    *   If the new city is brand new, insert into `locations`, set `is_active = 1`, and fetch its 90-day baseline.

---

## 🦀 4. Rust Backend Engine Architecture (Axum)

### A. Core Crates
*   `axum`: Asynchronous HTTP web server.
*   `tokio`: Async runtime with interval timers for background hourly syncs.
*   `rusqlite`: SQLite connection pooling and transactional batch inserts.
*   `reqwest`: Non-blocking HTTP client for querying Open-Meteo.
*   `chrono` / `chrono-tz`: Time arithmetic, epoch conversions, and local machine timezone formatting.
*   `serde` & `serde_json`: High-speed JSON serialization.

### B. REST API Endpoints (Exposed to React)

#### Location & Profile Management
*   `GET /api/locations` -> List all saved city profiles (name, coordinates, is_active, last_synced).
*   `GET /api/locations/search?query=Austin&count=5` -> Searches Open-Meteo geocoding API for candidate stations.
*   `POST /api/locations/select` -> Selects existing profile (`{ "location_id": 1 }`) or inserts and activates a new station (`{ "location": { ... } }`), triggering immediate baseline backfill.
*   `DELETE /api/locations/:id` -> Deletes a city profile and cascades all its stored readings.

#### Timeseries & Analytics
*   `POST /api/weather/sync` -> Manually triggers the catch-up backfill for the active city.
*   `GET /api/weather/timeseries?range=24h|7d|30d|90d|2y|all&series_id=...&sma_window=24` -> Returns continuous rows and optional backend SMA smoothed points.
*   `GET /api/weather/stats/correlation?x_var=temperature_2m&y_var=relative_humidity&range=30d&series_id=...` -> Computes Pearson $r$, covariance, mean values, and linear regression parameters ($m, c, R^2$) in Rust.
*   `GET /api/weather/stats/wind-rose?range=24h&series_id=...` -> Computes 16-sector compass polar frequencies and vector-averaged kinematics ($\bar{\Phi}, \bar{U}, \bar{V}$).

#### Case Studies & Data Portability
*   `POST /api/weather/case-studies/download` -> Downloads a custom historical date range from Open-Meteo Archive API and saves it under `source_type = 'user_requested'` with a given `series_id`.
*   `GET /api/weather/case-studies` -> Lists all saved case studies with their date ranges, record counts, and 30-day staleness flags.
*   `DELETE /api/weather/case-studies/:series_id` -> Deletes a pinned historical case study.
*   `GET /api/weather/export/csv?range=30d&series_id=...` -> Exports RFC 4180 CSV file formatted for Pandas, R, and Excel.
*   `POST /api/weather/import/csv` -> Imports an external CSV weather file into the SQLite database with transactional batch insert.
