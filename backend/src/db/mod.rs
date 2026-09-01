pub mod schema;

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::models::{Location, WeatherReading};

#[derive(Error, Debug)]
pub enum DbError {
    #[error("SQLite database error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("Location not found with id: {0}")]
    LocationNotFound(i64),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CaseStudyInfo {
    pub series_id: String,
    pub start_timestamp: i64,
    pub end_timestamp: i64,
    pub record_count: usize,
    pub ingested_at: i64,
    pub is_stale: bool,
}

/// Initializes database tables and enables WAL mode and foreign key constraints
pub fn init_db(conn: &Connection) -> Result<(), DbError> {
    conn.execute_batch(
        r#"
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        "#,
    )?;

    conn.execute(schema::CREATE_LOCATIONS_TABLE, [])?;
    conn.execute(schema::CREATE_READINGS_TABLE, [])?;
    conn.execute(schema::CREATE_READINGS_INDEX, [])?;

    Ok(())
}

/// Inserts or updates a city location profile, returning its ID
pub fn upsert_location(conn: &Connection, loc: &Location) -> Result<i64, DbError> {
    let mut stmt = conn.prepare(
        r#"
        INSERT INTO locations (name, country, admin1, latitude, longitude, elevation, timezone, is_active, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        ON CONFLICT(latitude, longitude) DO UPDATE SET
            name = excluded.name,
            country = excluded.country,
            admin1 = excluded.admin1,
            elevation = excluded.elevation,
            timezone = excluded.timezone
        RETURNING id;
        "#,
    )?;

    let id: i64 = stmt.query_row(
        params![
            loc.name,
            loc.country,
            loc.admin1,
            loc.latitude,
            loc.longitude,
            loc.elevation,
            loc.timezone,
            loc.is_active,
            loc.created_at,
        ],
        |row| row.get(0),
    )?;

    Ok(id)
}

/// Gets the currently active city location
pub fn get_active_location(conn: &Connection) -> Result<Option<Location>, DbError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, country, admin1, latitude, longitude, elevation, timezone, is_active, created_at
        FROM locations
        WHERE is_active = 1
        LIMIT 1;
        "#,
    )?;

    let location = stmt
        .query_row([], |row| {
            Ok(Location {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                country: row.get(2)?,
                admin1: row.get(3)?,
                latitude: row.get(4)?,
                longitude: row.get(5)?,
                elevation: row.get(6)?,
                timezone: row.get(7)?,
                is_active: row.get(8)?,
                created_at: row.get(9)?,
            })
        })
        .optional()?;

    Ok(location)
}

/// Sets a specific location as active and marks all other locations as inactive
pub fn set_active_location(conn: &Connection, location_id: i64) -> Result<(), DbError> {
    conn.execute_batch(&format!(
        r#"
        UPDATE locations SET is_active = 0;
        UPDATE locations SET is_active = 1 WHERE id = {};
        "#,
        location_id
    ))?;

    Ok(())
}

/// Lists all saved city location profiles
pub fn list_locations(conn: &Connection) -> Result<Vec<Location>, DbError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, country, admin1, latitude, longitude, elevation, timezone, is_active, created_at
        FROM locations
        ORDER BY is_active DESC, name ASC;
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Location {
            id: Some(row.get(0)?),
            name: row.get(1)?,
            country: row.get(2)?,
            admin1: row.get(3)?,
            latitude: row.get(4)?,
            longitude: row.get(5)?,
            elevation: row.get(6)?,
            timezone: row.get(7)?,
            is_active: row.get(8)?,
            created_at: row.get(9)?,
        })
    })?;

    let mut locations = Vec::new();
    for row in rows {
        locations.push(row?);
    }

    Ok(locations)
}

/// Deletes a location and all associated timeseries readings (via CASCADE)
pub fn delete_location(conn: &Connection, location_id: i64) -> Result<(), DbError> {
    conn.execute("DELETE FROM locations WHERE id = ?1;", params![location_id])?;
    Ok(())
}

/// Inserts a batch of WeatherReading objects inside a single SQLite transaction
pub fn insert_readings_batch(conn: &mut Connection, readings: &[WeatherReading]) -> Result<usize, DbError> {
    if readings.is_empty() {
        return Ok(0);
    }

    let tx = conn.transaction()?;
    let mut inserted_count = 0;

    {
        let mut stmt = tx.prepare(
            r#"
            INSERT INTO weather_readings (
                location_id, timestamp, time_iso, source_type, series_id, ingested_at,
                temperature_2m, apparent_temperature, dewpoint_2m, relative_humidity,
                surface_pressure, wind_speed_10m, wind_direction_10m, wind_u, wind_v,
                shortwave_radiation, uv_index, precipitation, soil_temperature_0_to_7cm, soil_moisture_0_to_7cm
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)
            ON CONFLICT(location_id, timestamp, source_type, series_id) DO UPDATE SET
                time_iso = excluded.time_iso,
                ingested_at = excluded.ingested_at,
                temperature_2m = excluded.temperature_2m,
                apparent_temperature = excluded.apparent_temperature,
                dewpoint_2m = excluded.dewpoint_2m,
                relative_humidity = excluded.relative_humidity,
                surface_pressure = excluded.surface_pressure,
                wind_speed_10m = excluded.wind_speed_10m,
                wind_direction_10m = excluded.wind_direction_10m,
                wind_u = excluded.wind_u,
                wind_v = excluded.wind_v,
                shortwave_radiation = excluded.shortwave_radiation,
                uv_index = excluded.uv_index,
                precipitation = excluded.precipitation,
                soil_temperature_0_to_7cm = excluded.soil_temperature_0_to_7cm,
                soil_moisture_0_to_7cm = excluded.soil_moisture_0_to_7cm;
            "#,
        )?;

        for r in readings {
            let series_id_str = r.series_id.as_deref().unwrap_or("");
            stmt.execute(params![
                r.location_id,
                r.timestamp,
                r.time_iso,
                r.source_type,
                series_id_str,
                r.ingested_at,
                r.temperature_2m,
                r.apparent_temperature,
                r.dewpoint_2m,
                r.relative_humidity,
                r.surface_pressure,
                r.wind_speed_10m,
                r.wind_direction_10m,
                r.wind_u,
                r.wind_v,
                r.shortwave_radiation,
                r.uv_index,
                r.precipitation,
                r.soil_temperature_0_to_7cm,
                r.soil_moisture_0_to_7cm,
            ])?;
            inserted_count += 1;
        }
    }

    tx.commit()?;
    Ok(inserted_count)
}

/// Returns the latest observation timestamp for a location and source type
pub fn get_latest_reading_timestamp(
    conn: &Connection,
    location_id: i64,
    source_type: &str,
) -> Result<Option<i64>, DbError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT MAX(timestamp)
        FROM weather_readings
        WHERE location_id = ?1 AND source_type = ?2;
        "#,
    )?;

    let max_ts: Option<i64> = stmt.query_row(params![location_id, source_type], |row| row.get(0))?;
    Ok(max_ts)
}

/// Returns the earliest observation timestamp for a location and source type
pub fn get_earliest_reading_timestamp(
    conn: &Connection,
    location_id: i64,
    source_type: &str,
) -> Result<Option<i64>, DbError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT MIN(timestamp)
        FROM weather_readings
        WHERE location_id = ?1 AND source_type = ?2;
        "#,
    )?;

    let min_ts: Option<i64> = stmt.query_row(params![location_id, source_type], |row| row.get(0))?;
    Ok(min_ts)
}

/// Queries timeseries readings for a location within a timestamp range
pub fn get_readings_by_range(
    conn: &Connection,
    location_id: i64,
    start_timestamp: i64,
    end_timestamp: i64,
    source_type: Option<&str>,
    series_id: Option<&str>,
) -> Result<Vec<WeatherReading>, DbError> {
    let mut sql = String::from(
        r#"
        SELECT id, location_id, timestamp, time_iso, source_type, series_id, ingested_at,
               temperature_2m, apparent_temperature, dewpoint_2m, relative_humidity,
               surface_pressure, wind_speed_10m, wind_direction_10m, wind_u, wind_v,
               shortwave_radiation, uv_index, precipitation, soil_temperature_0_to_7cm, soil_moisture_0_to_7cm
        FROM weather_readings
        WHERE location_id = ?1 AND timestamp >= ?2 AND timestamp <= ?3
        "#,
    );

    if source_type.is_some() {
        sql.push_str(" AND source_type = ?4");
    }
    if series_id.is_some() {
        sql.push_str(" AND series_id = ?5");
    }
    sql.push_str(" ORDER BY timestamp ASC;");

    let mut stmt = conn.prepare(&sql)?;

    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![
        Box::new(location_id),
        Box::new(start_timestamp),
        Box::new(end_timestamp),
    ];
    if let Some(st) = source_type {
        params_vec.push(Box::new(st.to_string()));
    }
    if let Some(sid) = series_id {
        params_vec.push(Box::new(sid.to_string()));
    }

    let rusqlite_params: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|b| b.as_ref()).collect();

    let rows = stmt.query_map(&rusqlite_params[..], |row| {
        let sid_raw: String = row.get(5)?;
        let series_id = if sid_raw.is_empty() { None } else { Some(sid_raw) };

        Ok(WeatherReading {
            id: Some(row.get(0)?),
            location_id: row.get(1)?,
            timestamp: row.get(2)?,
            time_iso: row.get(3)?,
            source_type: row.get(4)?,
            series_id,
            ingested_at: row.get(6)?,
            temperature_2m: row.get(7)?,
            apparent_temperature: row.get(8)?,
            dewpoint_2m: row.get(9)?,
            relative_humidity: row.get(10)?,
            surface_pressure: row.get(11)?,
            wind_speed_10m: row.get(12)?,
            wind_direction_10m: row.get(13)?,
            wind_u: row.get(14)?,
            wind_v: row.get(15)?,
            shortwave_radiation: row.get(16)?,
            uv_index: row.get(17)?,
            precipitation: row.get(18)?,
            soil_temperature_0_to_7cm: row.get(19)?,
            soil_moisture_0_to_7cm: row.get(20)?,
        })
    })?;

    let mut readings = Vec::new();
    for row in rows {
        readings.push(row?);
    }

    Ok(readings)
}

/// Purges automated readings older than the retention timestamp threshold
pub fn purge_automated_readings(
    conn: &Connection,
    location_id: Option<i64>,
    older_than_timestamp: i64,
) -> Result<usize, DbError> {
    let deleted = if let Some(loc_id) = location_id {
        conn.execute(
            "DELETE FROM weather_readings WHERE location_id = ?1 AND source_type = 'automated' AND timestamp < ?2;",
            params![loc_id, older_than_timestamp],
        )?
    } else {
        conn.execute(
            "DELETE FROM weather_readings WHERE source_type = 'automated' AND timestamp < ?1;",
            params![older_than_timestamp],
        )?
    };

    Ok(deleted)
}

/// Deletes a specific user-requested case study
pub fn delete_case_study(conn: &Connection, location_id: i64, series_id: &str) -> Result<usize, DbError> {
    let deleted = conn.execute(
        "DELETE FROM weather_readings WHERE location_id = ?1 AND series_id = ?2 AND source_type = 'user_requested';",
        params![location_id, series_id],
    )?;
    Ok(deleted)
}

/// Lists all saved case studies for a location with record counts and staleness status
pub fn list_case_studies(
    conn: &Connection,
    location_id: i64,
    current_timestamp: i64,
) -> Result<Vec<CaseStudyInfo>, DbError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT series_id, MIN(timestamp), MAX(timestamp), COUNT(*), MAX(ingested_at)
        FROM weather_readings
        WHERE location_id = ?1 AND source_type = 'user_requested' AND series_id != ''
        GROUP BY series_id
        ORDER BY MAX(timestamp) DESC;
        "#,
    )?;

    let rows = stmt.query_map(params![location_id], |row| {
        let series_id: String = row.get(0)?;
        let start_ts: i64 = row.get(1)?;
        let end_ts: i64 = row.get(2)?;
        let count: i64 = row.get(3)?;
        let ingested_at: i64 = row.get(4)?;
        let is_stale = (current_timestamp - ingested_at) > (30 * 86400);

        Ok(CaseStudyInfo {
            series_id,
            start_timestamp: start_ts,
            end_timestamp: end_ts,
            record_count: count as usize,
            ingested_at,
            is_stale,
        })
    })?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }

    Ok(list)
}
