use rusqlite::Connection;

use backend::db::{
    delete_case_study, delete_location, get_active_location, get_earliest_reading_timestamp,
    get_latest_reading_timestamp, get_readings_by_range, init_db, insert_readings_batch,
    list_case_studies, list_locations, purge_automated_readings, set_active_location,
    upsert_location,
};
use backend::models::{Location, WeatherReading};
use backend::services::ingest::fetch_forecast_timeseries;

fn setup_in_memory_db() -> Connection {
    let conn = Connection::open_in_memory().expect("Failed to create in-memory database");
    init_db(&conn).expect("Failed to initialize database schema");
    conn
}

#[test]
fn test_location_crud_and_active_profile() {
    let conn = setup_in_memory_db();

    // 1. Insert Austin
    let austin = Location {
        id: None,
        name: "Austin".to_string(),
        country: "United States".to_string(),
        admin1: Some("Texas".to_string()),
        latitude: 30.2672,
        longitude: -97.7431,
        elevation: Some(150.0),
        timezone: "America/Chicago".to_string(),
        is_active: true,
        created_at: 1000,
    };
    let austin_id = upsert_location(&conn, &austin).unwrap();
    assert!(austin_id > 0);

    // 2. Insert Denver
    let denver = Location {
        id: None,
        name: "Denver".to_string(),
        country: "United States".to_string(),
        admin1: Some("Colorado".to_string()),
        latitude: 39.7392,
        longitude: -104.9903,
        elevation: Some(1600.0),
        timezone: "America/Denver".to_string(),
        is_active: false,
        created_at: 1001,
    };
    let denver_id = upsert_location(&conn, &denver).unwrap();
    assert!(denver_id > 0);

    // Check active location (Austin)
    let active = get_active_location(&conn).unwrap().expect("Should have active location");
    assert_eq!(active.id, Some(austin_id));
    assert_eq!(active.name, "Austin");

    // 3. Switch active location to Denver
    set_active_location(&conn, denver_id).unwrap();
    let new_active = get_active_location(&conn).unwrap().expect("Should have active location");
    assert_eq!(new_active.id, Some(denver_id));
    assert_eq!(new_active.name, "Denver");

    // 4. List locations
    let list = list_locations(&conn).unwrap();
    assert_eq!(list.len(), 2);
    assert_eq!(list[0].id, Some(denver_id)); // active first

    // 5. Delete Austin
    delete_location(&conn, austin_id).unwrap();
    let list_after = list_locations(&conn).unwrap();
    assert_eq!(list_after.len(), 1);
    assert_eq!(list_after[0].id, Some(denver_id));
}

#[test]
fn test_insert_readings_batch_and_range_query() {
    let mut conn = setup_in_memory_db();

    let loc = Location {
        id: None,
        name: "Austin".to_string(),
        country: "US".to_string(),
        admin1: None,
        latitude: 30.26,
        longitude: -97.74,
        elevation: None,
        timezone: "UTC".to_string(),
        is_active: true,
        created_at: 1000,
    };
    let loc_id = upsert_location(&conn, &loc).unwrap();

    let r1 = WeatherReading {
        id: None,
        location_id: loc_id,
        timestamp: 10000,
        time_iso: "2026-08-30T10:00".to_string(),
        source_type: "automated".to_string(),
        series_id: None,
        ingested_at: 10000,
        temperature_2m: Some(25.0),
        apparent_temperature: Some(26.0),
        dewpoint_2m: Some(18.0),
        relative_humidity: Some(60),
        surface_pressure: Some(1013.0),
        wind_speed_10m: Some(10.0),
        wind_direction_10m: Some(180),
        wind_u: Some(0.0),
        wind_v: Some(10.0),
        shortwave_radiation: Some(500.0),
        uv_index: Some(5.0),
        precipitation: Some(0.0),
        soil_temperature_0_to_7cm: Some(22.0),
        soil_moisture_0_to_7cm: Some(0.25),
    };

    let r2 = WeatherReading {
        id: None,
        location_id: loc_id,
        timestamp: 13600,
        time_iso: "2026-08-30T11:00".to_string(),
        source_type: "automated".to_string(),
        series_id: None,
        ingested_at: 10000,
        temperature_2m: Some(27.0),
        apparent_temperature: Some(28.5),
        dewpoint_2m: Some(18.5),
        relative_humidity: Some(55),
        surface_pressure: Some(1012.5),
        wind_speed_10m: Some(12.0),
        wind_direction_10m: Some(190),
        wind_u: Some(-2.08),
        wind_v: Some(11.82),
        shortwave_radiation: Some(600.0),
        uv_index: Some(6.0),
        precipitation: Some(0.0),
        soil_temperature_0_to_7cm: Some(23.0),
        soil_moisture_0_to_7cm: Some(0.24),
    };

    // Insert batch
    let count = insert_readings_batch(&mut conn, &[r1.clone(), r2.clone()]).unwrap();
    assert_eq!(count, 2);

    // Timestamps
    assert_eq!(get_earliest_reading_timestamp(&conn, loc_id, "automated").unwrap(), Some(10000));
    assert_eq!(get_latest_reading_timestamp(&conn, loc_id, "automated").unwrap(), Some(13600));

    // Range query
    let queried = get_readings_by_range(&conn, loc_id, 9000, 14000, Some("automated"), None).unwrap();
    assert_eq!(queried.len(), 2);
    assert_eq!(queried[0].temperature_2m, Some(25.0));
    assert_eq!(queried[1].temperature_2m, Some(27.0));

    // On conflict update test: re-insert r1 with updated temp
    let mut r1_updated = r1.clone();
    r1_updated.temperature_2m = Some(26.5);
    insert_readings_batch(&mut conn, &[r1_updated]).unwrap();

    let after_update = get_readings_by_range(&conn, loc_id, 9000, 11000, Some("automated"), None).unwrap();
    assert_eq!(after_update.len(), 1);
    assert_eq!(after_update[0].temperature_2m, Some(26.5));
}

#[test]
fn test_purge_automated_readings_2year_rule() {
    let mut conn = setup_in_memory_db();
    let loc_id = upsert_location(
        &conn,
        &Location {
            id: None,
            name: "Test City".to_string(),
            country: "US".to_string(),
            admin1: None,
            latitude: 30.0,
            longitude: -97.0,
            elevation: None,
            timezone: "UTC".to_string(),
            is_active: true,
            created_at: 1000,
        },
    ).unwrap();

    let two_years_seconds = 730 * 86400; // 63,072,000s
    let now = 100_000_000;
    let threshold = now - two_years_seconds;

    // 1. Automated reading older than 2 years -> should be purged
    let r_old_automated = WeatherReading {
        id: None,
        location_id: loc_id,
        timestamp: threshold - 3600,
        time_iso: "old-auto".to_string(),
        source_type: "automated".to_string(),
        series_id: None,
        ingested_at: now,
        temperature_2m: Some(10.0),
        apparent_temperature: None,
        dewpoint_2m: None,
        relative_humidity: None,
        surface_pressure: None,
        wind_speed_10m: None,
        wind_direction_10m: None,
        wind_u: None,
        wind_v: None,
        shortwave_radiation: None,
        uv_index: None,
        precipitation: None,
        soil_temperature_0_to_7cm: None,
        soil_moisture_0_to_7cm: None,
    };

    // 2. Automated reading within 2 years -> should NOT be purged
    let r_fresh_automated = WeatherReading {
        id: None,
        location_id: loc_id,
        timestamp: threshold + 3600,
        time_iso: "fresh-auto".to_string(),
        source_type: "automated".to_string(),
        series_id: None,
        ingested_at: now,
        temperature_2m: Some(20.0),
        apparent_temperature: None,
        dewpoint_2m: None,
        relative_humidity: None,
        surface_pressure: None,
        wind_speed_10m: None,
        wind_direction_10m: None,
        wind_u: None,
        wind_v: None,
        shortwave_radiation: None,
        uv_index: None,
        precipitation: None,
        soil_temperature_0_to_7cm: None,
        soil_moisture_0_to_7cm: None,
    };

    // 3. User-requested case study older than 2 years -> should NEVER be purged automatically
    let r_old_user_case_study = WeatherReading {
        id: None,
        location_id: loc_id,
        timestamp: threshold - 3600,
        time_iso: "old-user-study".to_string(),
        source_type: "user_requested".to_string(),
        series_id: Some("case_study_2011".to_string()),
        ingested_at: now,
        temperature_2m: Some(35.0),
        apparent_temperature: None,
        dewpoint_2m: None,
        relative_humidity: None,
        surface_pressure: None,
        wind_speed_10m: None,
        wind_direction_10m: None,
        wind_u: None,
        wind_v: None,
        shortwave_radiation: None,
        uv_index: None,
        precipitation: None,
        soil_temperature_0_to_7cm: None,
        soil_moisture_0_to_7cm: None,
    };

    insert_readings_batch(
        &mut conn,
        &[r_old_automated, r_fresh_automated, r_old_user_case_study],
    ).unwrap();

    // Execute purge
    let deleted_count = purge_automated_readings(&conn, Some(loc_id), threshold).unwrap();
    assert_eq!(deleted_count, 1);

    // Verify remaining
    let all_remaining = get_readings_by_range(&conn, loc_id, 0, now + 1000, None, None).unwrap();
    assert_eq!(all_remaining.len(), 2);
    assert!(all_remaining.iter().any(|r| r.time_iso == "fresh-auto"));
    assert!(all_remaining.iter().any(|r| r.time_iso == "old-user-study"));
}

#[test]
fn test_case_studies_management() {
    let mut conn = setup_in_memory_db();
    let loc_id = upsert_location(
        &conn,
        &Location {
            id: None,
            name: "Austin".to_string(),
            country: "US".to_string(),
            admin1: None,
            latitude: 30.26,
            longitude: -97.74,
            elevation: None,
            timezone: "UTC".to_string(),
            is_active: true,
            created_at: 1000,
        },
    ).unwrap();

    let now = 2_000_000_000; // current time
    let stale_ingest_time = now - (40 * 86400); // 40 days ago (>30d stale)
    let fresh_ingest_time = now - (5 * 86400); // 5 days ago (<30d fresh)

    // Series 1: Stale case study from 2021
    let s1_r1 = WeatherReading {
        id: None,
        location_id: loc_id,
        timestamp: 1613347200, // Feb 15, 2021
        time_iso: "2021-02-15T00:00".to_string(),
        source_type: "user_requested".to_string(),
        series_id: Some("winter_storm_uri".to_string()),
        ingested_at: stale_ingest_time,
        temperature_2m: Some(-10.0),
        apparent_temperature: None,
        dewpoint_2m: None,
        relative_humidity: None,
        surface_pressure: None,
        wind_speed_10m: None,
        wind_direction_10m: None,
        wind_u: None,
        wind_v: None,
        shortwave_radiation: None,
        uv_index: None,
        precipitation: None,
        soil_temperature_0_to_7cm: None,
        soil_moisture_0_to_7cm: None,
    };

    // Series 2: Fresh case study from 2023
    let s2_r1 = WeatherReading {
        id: None,
        location_id: loc_id,
        timestamp: 1690848000, // Aug 1, 2023
        time_iso: "2023-08-01T00:00".to_string(),
        source_type: "user_requested".to_string(),
        series_id: Some("heatwave_2023".to_string()),
        ingested_at: fresh_ingest_time,
        temperature_2m: Some(40.0),
        apparent_temperature: None,
        dewpoint_2m: None,
        relative_humidity: None,
        surface_pressure: None,
        wind_speed_10m: None,
        wind_direction_10m: None,
        wind_u: None,
        wind_v: None,
        shortwave_radiation: None,
        uv_index: None,
        precipitation: None,
        soil_temperature_0_to_7cm: None,
        soil_moisture_0_to_7cm: None,
    };

    insert_readings_batch(&mut conn, &[s1_r1, s2_r1]).unwrap();

    // List case studies
    let case_studies = list_case_studies(&conn, loc_id, now).unwrap();
    assert_eq!(case_studies.len(), 2);

    let uri_study = case_studies.iter().find(|c| c.series_id == "winter_storm_uri").unwrap();
    assert!(uri_study.is_stale, "Winter storm URI should be flagged as stale (>30d)");
    assert_eq!(uri_study.record_count, 1);

    let heat_study = case_studies.iter().find(|c| c.series_id == "heatwave_2023").unwrap();
    assert!(!heat_study.is_stale, "Heatwave 2023 should NOT be stale (<30d)");

    // Delete case study
    let deleted = delete_case_study(&conn, loc_id, "winter_storm_uri").unwrap();
    assert_eq!(deleted, 1);

    let remaining_studies = list_case_studies(&conn, loc_id, now).unwrap();
    assert_eq!(remaining_studies.len(), 1);
    assert_eq!(remaining_studies[0].series_id, "heatwave_2023");
}

#[tokio::test]
async fn test_ingest_to_db_pipeline() {
    let mut conn = setup_in_memory_db();
    let client = reqwest::Client::new();

    // 1. Create Location
    let loc_id = upsert_location(
        &conn,
        &Location {
            id: None,
            name: "Austin".to_string(),
            country: "United States".to_string(),
            admin1: Some("Texas".to_string()),
            latitude: 30.2672,
            longitude: -97.7431,
            elevation: Some(150.0),
            timezone: "America/Chicago".to_string(),
            is_active: true,
            created_at: 1000,
        },
    ).unwrap();

    // 2. Fetch live data from Open-Meteo
    let readings = fetch_forecast_timeseries(
        &client,
        30.2672,
        -97.7431,
        2, // past 2 days
        0,
        loc_id,
        "automated",
        None,
    ).await.expect("Live fetch failed");

    assert!(readings.len() >= 48);

    // 3. Store into SQLite
    let inserted = insert_readings_batch(&mut conn, &readings).unwrap();
    assert_eq!(inserted, readings.len());

    // 4. Retrieve from SQLite and verify data integrity
    let start_ts = readings[0].timestamp;
    let end_ts = readings.last().unwrap().timestamp;

    let db_readings = get_readings_by_range(&conn, loc_id, start_ts, end_ts, Some("automated"), None).unwrap();
    assert_eq!(db_readings.len(), readings.len());

    // Verify first row matches exactly
    assert_eq!(db_readings[0].time_iso, readings[0].time_iso);
    assert_eq!(db_readings[0].temperature_2m, readings[0].temperature_2m);
    assert_eq!(db_readings[0].surface_pressure, readings[0].surface_pressure);
    assert_eq!(db_readings[0].wind_u, readings[0].wind_u);
    assert_eq!(db_readings[0].wind_v, readings[0].wind_v);
}
