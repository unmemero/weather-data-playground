# ==============================================================================
# Stage 1: Frontend Build (Node.js 22 Alpine)
# ==============================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies with lockfile consistency
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# Copy source and compile production bundle
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Backend Build (Rust Slim)
# ==============================================================================
FROM rust:bookworm AS backend-builder

WORKDIR /app/backend

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend manifests and build release binary
COPY backend/Cargo.toml backend/Cargo.lock* ./
COPY backend/src/ ./src/
COPY backend/tests/ ./tests/

RUN cargo build --release

# ==============================================================================
# Stage 3: Unified Lightweight Runtime Image
# ==============================================================================
FROM debian:bookworm-slim AS runtime

# Install runtime SSL certs and curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user
RUN useradd -m -u 1001 -U -s /bin/sh weatherapp

WORKDIR /app

# Copy compiled backend binary from Stage 2
COPY --from=backend-builder /app/backend/target/release/backend /usr/local/bin/weather-server

# Copy compiled frontend assets from Stage 1 (outside /app so persistent volumes do not shadow it)
COPY --from=frontend-builder /app/frontend/dist /var/www/dist

# Set permissions for non-root runtime
RUN chown -R weatherapp:weatherapp /app /var/www/dist

USER weatherapp

# Default Configuration
ENV PORT=3001 \
    STATIC_DIR=/var/www/dist \
    RUST_LOG=backend=info,tower_http=info

EXPOSE 3001

# Healthcheck testing the live REST API endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/locations || exit 1

ENTRYPOINT ["weather-server"]
