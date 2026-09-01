use std::sync::Arc;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use http_body_util::BodyExt;
use rusqlite::Connection;
use tokio::sync::Mutex;
use tower::ServiceExt;

use backend::db::{init_db, CaseStudyInfo};
use backend::models::{Location, WindVectorStats};
use backend::routes::{
    create_router, ApiResponse, AppState, CorrelationResponse, SyncResult,
    TimeseriesResponse,
};

fn setup_test_app() -> axum::Router {
    let conn = Connection::open_in_memory().expect("Failed to create in-memory SQLite");
    init_db(&conn).expect("Failed to init db schema");
    let state = AppState {
        conn: Arc::new(Mutex::new(conn)),
        client: reqwest::Client::new(),
    };
    create_router(state)
}

#[tokio::test]
async fn test_api_full_weather_flow() {
    let app = setup_test_app();

    // 1. Initial list -> empty
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/locations")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<Vec<Location>> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    assert_eq!(json.data.unwrap().len(), 0);

    // 2. Search locations
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/locations/search?query=Austin&count=2")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<Vec<Location>> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    let search_results = json.data.unwrap();
    assert!(!search_results.is_empty());
    assert_eq!(search_results[0].name, "Austin");

    // 3. Select location (adds Austin and syncs initial 90d baseline)
    let select_payload = serde_json::json!({
        "location": search_results[0]
    });

    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/locations/select")
                .header("Content-Type", "application/json")
                .body(Body::from(select_payload.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<Location> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    let active_loc = json.data.unwrap();
    assert_eq!(active_loc.name, "Austin");
    assert!(active_loc.is_active);
    let loc_id = active_loc.id.unwrap();

    // 4. Trigger Sync
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/weather/sync")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<SyncResult> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);

    // 5. Query Timeseries with 12h smoothing
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/weather/timeseries?range=7d&smoothing=12h&smooth_field=temperature_2m")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<TimeseriesResponse> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    let ts_data = json.data.unwrap();
    assert!(!ts_data.readings.is_empty());
    assert!(ts_data.smoothed.is_some());

    // 6. Query Correlation
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/weather/stats/correlation?x=temperature_2m&y=relative_humidity_2m&range=7d")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<CorrelationResponse> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    let corr = json.data.unwrap();
    assert!(corr.stats.pearson_r.abs() <= 1.0);
    assert!(!corr.points.is_empty());

    // 7. Query Wind Rose
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/weather/stats/wind-rose?range=7d")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<WindVectorStats> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    let wind_stats = json.data.unwrap();
    assert_eq!(wind_stats.wind_rose_bins.len(), 16);

    // 8. Download Historical Case Study
    let case_study_payload = serde_json::json!({
        "series_id": "texas_freeze_2021",
        "start_date": "2021-02-12",
        "end_date": "2021-02-15"
    });

    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/weather/case-studies/download")
                .header("Content-Type", "application/json")
                .body(Body::from(case_study_payload.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<usize> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    assert_eq!(json.data.unwrap(), 96); // 4 days * 24 hours = 96 readings

    // 9. List Case Studies
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/weather/case-studies")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<Vec<CaseStudyInfo>> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);
    let studies = json.data.unwrap();
    assert_eq!(studies.len(), 1);
    assert_eq!(studies[0].series_id, "texas_freeze_2021");

    // 10. Export to CSV
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/weather/export/csv?series_id=texas_freeze_2021")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let csv_body = response.into_body().collect().await.unwrap().to_bytes();
    let csv_text = String::from_utf8(csv_body.to_vec()).unwrap();
    assert!(csv_text.starts_with("timestamp,time_iso,temperature_2m"));
    assert!(csv_text.contains("2021-02-12"));

    // 11. Import from CSV
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/weather/import/csv")
                .header("Content-Type", "text/csv")
                .body(Body::from(csv_text))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: ApiResponse<usize> = serde_json::from_slice(&body).unwrap();
    assert!(json.success);

    // 12. Delete Case Study
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri("/api/weather/case-studies/texas_freeze_2021")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    // 13. Delete Location
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri(format!("/api/locations/{}", loc_id))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}
