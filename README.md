# 🌦️ Meteorology Lab & Timeseries Workbook

A high-precision, interactive atmospheric physics workbench and timeseries analysis platform. Built with a high-throughput **Rust Axum** backend, **SQLite WAL-mode** storage engine, and a reactive **React 18 + Vite + TypeScript + KaTeX + Chart.js** frontend.

---

## 📐 Mathematical & Atmospheric Physics Formulations

### 1. Saturation Vapor Pressure & Relative Humidity (Clausius-Clapeyron)
The exponential expansion of water vapor capacity as a function of temperature ($T$ in °C) is parameterized via the **Tetens Equation**:

$$e_s(T) \approx 6.112 \cdot \exp\left(\frac{17.67 \cdot T}{T + 243.5}\right) \quad [\text{hPa}]$$

Given actual vapor pressure $e(T_d)$ calculated at dewpoint $T_d$, Relative Humidity ($\text{RH}$) is defined as:

$$\text{RH} = \frac{e(T_d)}{e_s(T)} \times 100\%$$

*Physics Interpretation: During midday solar heating, ambient $T$ rises rapidly while absolute moisture $e(T_d)$ remains steady, causing $e_s(T)$ to expand exponentially and producing a strong negative correlation ($r \approx -0.90$) between Temperature and Relative Humidity (Ahrens, 2018).*

---

### 2. Meteorological Wind Vector Kinematics & Resultant Direction
To eliminate the $0^\circ / 360^\circ$ compass modular singularity where scalar angular averaging fails, horizontal wind velocity is decomposed into Cartesian components:

$$U = -\text{speed} \cdot \sin(\theta), \quad V = -\text{speed} \cdot \cos(\theta)$$

For a sample of $n$ observations with mean vector components $\bar{U} = \frac{1}{n}\sum U_i$ and $\bar{V} = \frac{1}{n}\sum V_i$, the true physical resultant wind flow direction $\bar{\Phi}$ is computed vectorially:

$$\bar{\Phi} = \text{atan2}(-\bar{U}, -\bar{V}) \pmod{360^\circ}$$

---

### 3. Pearson Product-Moment Correlation & Least-Squares Regression
Linear dependency between atmospheric dimensions $X$ and $Y$ over $n$ paired observations:

$$r = \frac{\sum_{i=1}^n (X_i - \bar{X})(Y_i - \bar{Y})}{\sqrt{\sum_{i=1}^n (X_i - \bar{X})^2} \cdot \sqrt{\sum_{i=1}^n (Y_i - \bar{Y})^2}} = \frac{\text{Cov}(X, Y)}{\sigma_X \sigma_Y}$$

The least-squares linear trendline $\hat{Y} = m X + c$ with variance explained $R^2$:

$$m = \frac{\text{Cov}(X, Y)}{\sigma_X^2}, \quad c = \bar{Y} - m \bar{X}, \quad R^2 = r^2$$

---

### 4. Rolling Simple Moving Average (SMA Low-Pass Filter)
Smoothing over window $W$:

$$\text{SMA}_t = \frac{1}{W} \sum_{k=0}^{W-1} X_{t-k}$$

$$\text{Variance Attenuation Ratio} = \frac{\sigma_{\text{smoothed}}^2}{\sigma_{\text{raw}}^2}$$

---

## 🚀 Quickstart Guide

### Option 1: Run with Docker Compose (Recommended)
Launch the unified multi-stage container with persistent SQLite volume:

```bash
# Build and run in detached mode
docker compose up --build -d

# View live application logs
docker compose logs -f
```

* Dashboard UI & REST API: **[`http://localhost:3001`](http://localhost:3001)**
* Healthcheck: `curl http://localhost:3001/api/locations`

---

### Option 2: Run Locally for Development

#### 1. Backend (Rust 1.85+)
```bash
cd backend
cargo run
# Server starts on http://0.0.0.0:3001 with SQLite WAL mode enabled
```

#### 2. Frontend (Node.js 22+ / Vite)
```bash
cd frontend
npm install
npm run dev
# Dev server starts on http://localhost:5173 (proxies /api to 3001)
```

---

## 🧪 Test Suites & Verification

### Complete Test Matrix Execution:

```bash
# Run all frontend tests (47 tests across 11 test suites)
cd frontend
npm test

# Run production bundle compilation check
npm run build

# Run all backend tests (16 tests across DB, Ingest, Stats, and API)
cd ../backend
cargo test

# Run Rust linter & security audit
cargo clippy --all-targets
cargo audit
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/locations` | List all saved weather stations | — |
| `GET` | `/api/locations/search` | Geocoding search from Open-Meteo | `query` (string), `count` (optional, default 5) |
| `POST` | `/api/locations/select` | Switch active station & backfill 90-day baseline | JSON: `{ "location_id": 1 }` or `{ "location": { ... } }` |
| `DELETE` | `/api/locations/:id` | Delete station and cascade readings | — |
| `POST` | `/api/weather/sync` | Trigger hourly catch-up & 2-year retention purge | — |
| `GET` | `/api/weather/timeseries` | Fetch hourly telemetry readings | `range` (`24h`,`7d`,`30d`,`90d`,`2y`,`all`), `series_id`, `sma_window` |
| `GET` | `/api/weather/stats/correlation` | Bivariate regression & covariance | `x_var`, `y_var`, `range`, `series_id` |
| `GET` | `/api/weather/stats/wind-rose` | 16-sector compass polar frequencies & vector $U,V$ | `range`, `series_id` |
| `POST` | `/api/weather/case-studies/download` | Fetch ERA5 historical archive back to 1940 | JSON: `{ "series_id": "texas_freeze_2021", "start_date": "2021-02-12", "end_date": "2021-02-16" }` |
| `GET` | `/api/weather/case-studies` | List pinned case studies & 30-day staleness | — |
| `DELETE` | `/api/weather/case-studies/:series_id`| Delete historical case study | — |
| `GET` | `/api/weather/export/csv` | RFC 4180 CSV export formatted for Pandas/Excel | `range`, `series_id` |
| `POST` | `/api/weather/import/csv` | Import CSV dataset with batch SQLite upsert | CSV plaintext body |

---

## 📚 Academic References

1. **Ahrens, C. D. (2018).** *Meteorology Today: An Introduction to Weather, Climate, and the Environment* (12th ed.). Cengage Learning. Chapter 4: Atmospheric Moisture.
2. **Wallace, J. M., & Hobbs, P. V. (2006).** *Atmospheric Science: An Introductory Survey* (2nd ed.). Academic Press. Chapter 8: The Planetary Boundary Layer.
3. **Holton, J. R., & Hakim, G. J. (2012).** *An Introduction to Dynamic Meteorology* (5th ed.). Elsevier Academic Press. Chapter 3: Hydrostatic Balance.
4. **Stull, R. B. (1988).** *An Introduction to Boundary Layer Meteorology.* Kluwer Academic Publishers. Chapter 7: Surface Energy Balance.
