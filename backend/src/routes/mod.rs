use std::sync::Arc;
use axum::{
    extract::{Path, Query, State},
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Json, Router,
};
use chrono::Utc;
use reqwest::Client;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

use crate::db::{
    delete_case_study, delete_location, get_active_location,
    get_latest_reading_timestamp, get_readings_by_range, insert_readings_batch,
    list_case_studies, list_locations, purge_automated_readings, set_active_location,
    upsert_location, CaseStudyInfo,
};
use crate::models::{CorrelationStats, Location, WeatherReading, WindVectorStats};
use crate::services::csv_service::{export_readings_to_csv, import_readings_from_csv};
use crate::services::ingest::{fetch_forecast_timeseries, fetch_historical_timeseries, search_locations};
use crate::services::stats::{compute_correlation, compute_simple_moving_average, compute_wind_vector_stats, ScatterPoint, SmoothedPoint};

#[derive(Clone)]
pub struct AppState {
    pub conn: Arc<Mutex<Connection>>,
    pub client: Client,
}

#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Response {
        (
            StatusCode::OK,
            Json(Self {
                success: true,
                data: Some(data),
                error: None,
            }),
        )
            .into_response()
    }

    pub fn err(status: StatusCode, message: impl Into<String>) -> Response {
        (
            status,
            Json(Self {
                success: false,
                data: None,
                error: Some(message.into()),
            }),
        )
            .into_response()
    }
}

// ----------------------------------------------------------------------------
// Location Handlers
// ----------------------------------------------------------------------------

pub async fn list_locations_handler(State(state): State<AppState>) -> Response {
    let conn = state.conn.lock().await;
    match list_locations(&conn) {
        Ok(locations) => ApiResponse::ok(locations),
        Err(e) => ApiResponse::<Vec<Location>>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub query: String,
    pub count: Option<usize>,
}

pub async fn search_locations_handler(
    State(state): State<AppState>,
    Query(params): Query<SearchQuery>,
) -> Response {
    let count = params.count.unwrap_or(5);
    match search_locations(&state.client, &params.query, count).await {
        Ok(locations) => ApiResponse::ok(locations),
        Err(e) => ApiResponse::<Vec<Location>>::err(StatusCode::BAD_REQUEST, e.to_string()),
    }
}

#[derive(Deserialize)]
pub struct SelectLocationPayload {
    pub location_id: Option<i64>,
    pub location: Option<Location>,
}

pub async fn select_location_handler(
    State(state): State<AppState>,
    Json(payload): Json<SelectLocationPayload>,
) -> Response {
    let mut loc_id_opt = payload.location_id;

    if let (None, Some(loc)) = (loc_id_opt, payload.location) {
        let conn = state.conn.lock().await;
        match upsert_location(&conn, &loc) {
            Ok(id) => loc_id_opt = Some(id),
            Err(e) => return ApiResponse::<Location>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
        }
    }

    let loc_id = match loc_id_opt {
        Some(id) => id,
        None => return ApiResponse::<Location>::err(StatusCode::BAD_REQUEST, "Missing location_id or location body"),
    };

    {
        let conn = state.conn.lock().await;
        if let Err(e) = set_active_location(&conn, loc_id) {
            return ApiResponse::<Location>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string());
        }
    }

    // Trigger catch-up backfill
    let _ = sync_location_internal(&state, loc_id).await;

    let conn = state.conn.lock().await;
    match get_active_location(&conn) {
        Ok(Some(loc)) => ApiResponse::ok(loc),
        Ok(None) => ApiResponse::<Location>::err(StatusCode::NOT_FOUND, "Location activated but not found"),
        Err(e) => ApiResponse::<Location>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

pub async fn delete_location_handler(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Response {
    let conn = state.conn.lock().await;
    match delete_location(&conn, id) {
        Ok(_) => ApiResponse::ok(true),
        Err(e) => ApiResponse::<bool>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

// ----------------------------------------------------------------------------
// Ingestion & Synchronization Handlers
// ----------------------------------------------------------------------------

#[derive(Serialize, Deserialize)]
pub struct SyncResult {
    pub location_id: i64,
    pub records_added: usize,
    pub purged_records: usize,
    pub last_synced_timestamp: Option<i64>,
}

pub async fn sync_location_internal(state: &AppState, location_id: i64) -> Result<SyncResult, String> {
    let (lat, lon) = {
        let conn = state.conn.lock().await;
        let list = list_locations(&conn).map_err(|e| e.to_string())?;
        let loc = list.into_iter().find(|l| l.id == Some(location_id)).ok_or("Location not found")?;
        (loc.latitude, loc.longitude)
    };

    let now = Utc::now().timestamp();
    let two_years_seconds = 730 * 86400;
    let two_years_ago = now - two_years_seconds;

    let latest_ts = {
        let conn = state.conn.lock().await;
        get_latest_reading_timestamp(&conn, location_id, "automated").map_err(|e| e.to_string())?
    };

    let records_added;
    let mut purged_records = 0;

    match latest_ts {
        None => {
            // Case 1: Initial load -> Fetch past 90 days
            let readings = fetch_forecast_timeseries(&state.client, lat, lon, 90, 1, location_id, "automated", None)
                .await
                .map_err(|e| e.to_string())?;
            let mut conn = state.conn.lock().await;
            records_added = insert_readings_batch(&mut conn, &readings).map_err(|e| e.to_string())?;
        }
        Some(last_ts) if last_ts < two_years_ago => {
            // Case 3: Gap >= 2 Years -> Expired automated history. Purge and fresh 90d baseline
            let conn = state.conn.lock().await;
            purged_records = purge_automated_readings(&conn, Some(location_id), now + 1000).map_err(|e| e.to_string())?;
            drop(conn);

            let readings = fetch_forecast_timeseries(&state.client, lat, lon, 90, 1, location_id, "automated", None)
                .await
                .map_err(|e| e.to_string())?;
            let mut conn = state.conn.lock().await;
            records_added = insert_readings_batch(&mut conn, &readings).map_err(|e| e.to_string())?;
        }
        Some(last_ts) => {
            // Case 2: Gap < 2 Years -> Backfill gap
            let gap_seconds = now - last_ts;
            let past_days = ((gap_seconds as f64 / 86400.0).ceil() as u32).clamp(1, 92);
            let readings = fetch_forecast_timeseries(&state.client, lat, lon, past_days, 1, location_id, "automated", None)
                .await
                .map_err(|e| e.to_string())?;

            let mut conn = state.conn.lock().await;
            records_added = insert_readings_batch(&mut conn, &readings).map_err(|e| e.to_string())?;

            // 2-Year retention purge
            purged_records = purge_automated_readings(&conn, Some(location_id), two_years_ago).map_err(|e| e.to_string())?;
        }
    }

    let final_latest = {
        let conn = state.conn.lock().await;
        get_latest_reading_timestamp(&conn, location_id, "automated").map_err(|e| e.to_string())?
    };

    Ok(SyncResult {
        location_id,
        records_added,
        purged_records,
        last_synced_timestamp: final_latest,
    })
}

pub async fn sync_weather_handler(State(state): State<AppState>) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return ApiResponse::<SyncResult>::err(StatusCode::BAD_REQUEST, "No active city location selected"),
        }
    };

    match sync_location_internal(&state, active_id).await {
        Ok(result) => ApiResponse::ok(result),
        Err(e) => ApiResponse::<SyncResult>::err(StatusCode::INTERNAL_SERVER_ERROR, e),
    }
}

// ----------------------------------------------------------------------------
// Timeseries & Smoothing Handlers
// ----------------------------------------------------------------------------

#[derive(Deserialize)]
pub struct TimeseriesQuery {
    pub range: Option<String>,       // "24h", "7d", "30d", "90d", "2y", "all"
    pub series_id: Option<String>,   // None for automated stream
    pub smoothing: Option<String>,   // "3h", "12h", "24h", "none"
    pub smooth_field: Option<String>,// e.g. "temperature_2m"
}

#[derive(Serialize, Deserialize)]
pub struct TimeseriesResponse {
    pub readings: Vec<WeatherReading>,
    pub smoothed: Option<Vec<SmoothedPoint>>,
}

fn parse_range_to_start_time(range_str: Option<&str>, is_series: bool, now: i64) -> i64 {
    match range_str {
        Some("24h") => now - 24 * 3600,
        Some("7d") => now - 7 * 86400,
        Some("30d") => now - 30 * 86400,
        Some("90d") => now - 90 * 86400,
        Some("2y") => now - 730 * 86400,
        Some("all") => 0,
        _ => {
            if is_series {
                0
            } else {
                now - 30 * 86400 // default 30d for rolling stream
            }
        }
    }
}

pub async fn get_timeseries_handler(
    State(state): State<AppState>,
    Query(params): Query<TimeseriesQuery>,
) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return ApiResponse::<TimeseriesResponse>::err(StatusCode::BAD_REQUEST, "No active location selected"),
        }
    };

    let now = Utc::now().timestamp();
    let is_series = params.series_id.is_some();
    let start_ts = parse_range_to_start_time(params.range.as_deref(), is_series, now);

    let (source_type, sid) = if let Some(ref sid_str) = params.series_id {
        (Some("user_requested"), Some(sid_str.as_str()))
    } else {
        (Some("automated"), None)
    };

    let conn = state.conn.lock().await;
    let readings = match get_readings_by_range(&conn, active_id, start_ts, now + 86400, source_type, sid) {
        Ok(r) => r,
        Err(e) => return ApiResponse::<TimeseriesResponse>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    };

    let smoothed = if let Some(ref sm_str) = params.smoothing {
        let window = match sm_str.as_str() {
            "3h" => 3,
            "12h" => 12,
            "24h" => 24,
            _ => 0,
        };
        if window > 0 {
            let field = params.smooth_field.as_deref().unwrap_or("temperature_2m");
            Some(compute_simple_moving_average(&readings, field, window))
        } else {
            None
        }
    } else {
        None
    };

    ApiResponse::ok(TimeseriesResponse { readings, smoothed })
}

// ----------------------------------------------------------------------------
// Statistics & Math Analysis Handlers
// ----------------------------------------------------------------------------

#[derive(Deserialize)]
pub struct CorrelationQuery {
    pub x: String,
    pub y: String,
    pub range: Option<String>,
    pub series_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct CorrelationResponse {
    pub stats: CorrelationStats,
    pub points: Vec<ScatterPoint>,
}

pub async fn get_correlation_handler(
    State(state): State<AppState>,
    Query(params): Query<CorrelationQuery>,
) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return ApiResponse::<CorrelationResponse>::err(StatusCode::BAD_REQUEST, "No active location selected"),
        }
    };

    let now = Utc::now().timestamp();
    let is_series = params.series_id.is_some();
    let start_ts = parse_range_to_start_time(params.range.as_deref(), is_series, now);

    let (source_type, sid) = if let Some(ref sid_str) = params.series_id {
        (Some("user_requested"), Some(sid_str.as_str()))
    } else {
        (Some("automated"), None)
    };

    let conn = state.conn.lock().await;
    let readings = match get_readings_by_range(&conn, active_id, start_ts, now + 86400, source_type, sid) {
        Ok(r) => r,
        Err(e) => return ApiResponse::<CorrelationResponse>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    };

    match compute_correlation(&readings, &params.x, &params.y) {
        Some((stats, points)) => ApiResponse::ok(CorrelationResponse { stats, points }),
        None => ApiResponse::<CorrelationResponse>::err(StatusCode::BAD_REQUEST, "Insufficient data points for correlation"),
    }
}

#[derive(Deserialize)]
pub struct WindRoseQuery {
    pub range: Option<String>,
    pub series_id: Option<String>,
}

pub async fn get_wind_rose_handler(
    State(state): State<AppState>,
    Query(params): Query<WindRoseQuery>,
) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return ApiResponse::<WindVectorStats>::err(StatusCode::BAD_REQUEST, "No active location selected"),
        }
    };

    let now = Utc::now().timestamp();
    let is_series = params.series_id.is_some();
    let start_ts = parse_range_to_start_time(params.range.as_deref(), is_series, now);

    let (source_type, sid) = if let Some(ref sid_str) = params.series_id {
        (Some("user_requested"), Some(sid_str.as_str()))
    } else {
        (Some("automated"), None)
    };

    let conn = state.conn.lock().await;
    let readings = match get_readings_by_range(&conn, active_id, start_ts, now + 86400, source_type, sid) {
        Ok(r) => r,
        Err(e) => return ApiResponse::<WindVectorStats>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    };

    let stats = compute_wind_vector_stats(&readings);
    ApiResponse::ok(stats)
}

// ----------------------------------------------------------------------------
// Case Studies & Data Portability Handlers
// ----------------------------------------------------------------------------

#[derive(Deserialize)]
pub struct DownloadCaseStudyPayload {
    pub series_id: String,
    pub start_date: String, // "YYYY-MM-DD"
    pub end_date: String,   // "YYYY-MM-DD"
}

pub async fn download_case_study_handler(
    State(state): State<AppState>,
    Json(payload): Json<DownloadCaseStudyPayload>,
) -> Response {
    let (active_id, lat, lon) = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => (loc.id.unwrap_or(0), loc.latitude, loc.longitude),
            _ => return ApiResponse::<usize>::err(StatusCode::BAD_REQUEST, "No active city profile selected"),
        }
    };

    let readings = match fetch_historical_timeseries(
        &state.client,
        lat,
        lon,
        &payload.start_date,
        &payload.end_date,
        active_id,
        Some(&payload.series_id),
    ).await {
        Ok(r) => r,
        Err(e) => return ApiResponse::<usize>::err(StatusCode::BAD_REQUEST, e.to_string()),
    };

    let mut conn = state.conn.lock().await;
    match insert_readings_batch(&mut conn, &readings) {
        Ok(count) => ApiResponse::ok(count),
        Err(e) => ApiResponse::<usize>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

pub async fn list_case_studies_handler(State(state): State<AppState>) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return ApiResponse::<Vec<CaseStudyInfo>>::err(StatusCode::BAD_REQUEST, "No active city profile selected"),
        }
    };

    let now = Utc::now().timestamp();
    let conn = state.conn.lock().await;
    match list_case_studies(&conn, active_id, now) {
        Ok(studies) => ApiResponse::ok(studies),
        Err(e) => ApiResponse::<Vec<CaseStudyInfo>>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

pub async fn delete_case_study_handler(
    State(state): State<AppState>,
    Path(series_id): Path<String>,
) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return ApiResponse::<usize>::err(StatusCode::BAD_REQUEST, "No active city profile selected"),
        }
    };

    let conn = state.conn.lock().await;
    match delete_case_study(&conn, active_id, &series_id) {
        Ok(deleted) => ApiResponse::ok(deleted),
        Err(e) => ApiResponse::<usize>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

#[derive(Deserialize)]
pub struct ExportCsvQuery {
    pub range: Option<String>,
    pub series_id: Option<String>,
}

pub async fn export_csv_handler(
    State(state): State<AppState>,
    Query(params): Query<ExportCsvQuery>,
) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return (StatusCode::BAD_REQUEST, "No active location").into_response(),
        }
    };

    let now = Utc::now().timestamp();
    let is_series = params.series_id.is_some();
    let start_ts = parse_range_to_start_time(params.range.as_deref(), is_series, now);

    let (source_type, sid) = if let Some(ref sid_str) = params.series_id {
        (Some("user_requested"), Some(sid_str.as_str()))
    } else {
        (Some("automated"), None)
    };

    let conn = state.conn.lock().await;
    let readings = match get_readings_by_range(&conn, active_id, start_ts, now + 86400, source_type, sid) {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    };

    let csv_data = export_readings_to_csv(&readings);
    (
        [
            (header::CONTENT_TYPE, HeaderValue::from_static("text/csv")),
            (header::CONTENT_DISPOSITION, HeaderValue::from_static("attachment; filename=\"weather_data.csv\"")),
        ],
        csv_data,
    ).into_response()
}

pub async fn import_csv_handler(
    State(state): State<AppState>,
    body: String,
) -> Response {
    let active_id = {
        let conn = state.conn.lock().await;
        match get_active_location(&conn) {
            Ok(Some(loc)) => loc.id.unwrap_or(0),
            _ => return ApiResponse::<usize>::err(StatusCode::BAD_REQUEST, "No active location selected"),
        }
    };

    let now = Utc::now().timestamp();
    let readings = match import_readings_from_csv(&body, active_id, "user_requested", Some("csv_import"), now) {
        Ok(r) => r,
        Err(e) => return ApiResponse::<usize>::err(StatusCode::BAD_REQUEST, e.to_string()),
    };

    let mut conn = state.conn.lock().await;
    match insert_readings_batch(&mut conn, &readings) {
        Ok(count) => ApiResponse::ok(count),
        Err(e) => ApiResponse::<usize>::err(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

// ----------------------------------------------------------------------------
// Router Builder
// ----------------------------------------------------------------------------

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Locations
        .route("/api/locations", get(list_locations_handler))
        .route("/api/locations/search", get(search_locations_handler))
        .route("/api/locations/select", post(select_location_handler))
        .route("/api/locations/:id", delete(delete_location_handler))
        // Ingestion / Sync
        .route("/api/weather/sync", post(sync_weather_handler))
        // Timeseries
        .route("/api/weather/timeseries", get(get_timeseries_handler))
        // Statistics
        .route("/api/weather/stats/correlation", get(get_correlation_handler))
        .route("/api/weather/stats/wind-rose", get(get_wind_rose_handler))
        // Case Studies
        .route("/api/weather/case-studies/download", post(download_case_study_handler))
        .route("/api/weather/case-studies", get(list_case_studies_handler))
        .route("/api/weather/case-studies/:series_id", delete(delete_case_study_handler))
        // CSV Portability
        .route("/api/weather/export/csv", get(export_csv_handler))
        .route("/api/weather/import/csv", post(import_csv_handler))
        .layer(cors)
        .with_state(state)
}
