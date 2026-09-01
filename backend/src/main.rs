use std::sync::Arc;
use std::time::Duration;
use rusqlite::Connection;
use tokio::sync::Mutex;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use backend::db::init_db;
use backend::routes::{create_router, sync_location_internal, AppState};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    println!("Starting Meteorology Workbook Backend...");

    let db_conn = Connection::open("weather.db").expect("Failed to open SQLite database 'weather.db'");
    init_db(&db_conn).expect("Failed to initialize database schema");
    println!("Database initialized successfully with WAL mode.");

    let shared_conn = Arc::new(Mutex::new(db_conn));
    let client = reqwest::Client::new();

    let state = AppState {
        conn: shared_conn.clone(),
        client: client.clone(),
    };

    // Spawn background task for periodic hourly sync and 2-year retention purge
    let background_state = state.clone();
    tokio::spawn(async move {
        // Wait 10 seconds after startup before starting periodic checks
        tokio::time::sleep(Duration::from_secs(10)).await;
        let mut interval = tokio::time::interval(Duration::from_secs(3600));

        loop {
            interval.tick().await;
            let active_id = {
                let conn = background_state.conn.lock().await;
                match backend::db::get_active_location(&conn) {
                    Ok(Some(loc)) => loc.id,
                    _ => None,
                }
            };

            if let Some(loc_id) = active_id {
                tracing::info!("Running scheduled hourly sync for active location ID {}", loc_id);
                if let Err(e) = sync_location_internal(&background_state, loc_id).await {
                    tracing::error!("Scheduled hourly sync failed: {}", e);
                }
            }
        }
    });

    let app = create_router(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind TCP listener");

    println!("Server running on http://{}", addr);

    axum::serve(listener, app)
        .await
        .expect("Failed to start Axum HTTP server");
}
