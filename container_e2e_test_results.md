# Live Container End-to-End (E2E) Test Log

**Target Environment:** Docker Unified Container on `http://localhost:3001`  
**Execution Date:** 2026-09-02  
**Database:** SQLite WAL Mode (`weather.db` inside container volume `/app`)

---

## 📋 Test Matrix & Verified Results

| # | Task | Target Endpoint / Action | Status | Response / Validation Metrics |
|---|---|---|:---:|---|
| **01** | Container SPA Delivery | `GET /` | ✅ PASS | HTTP 200 OK. Delivered SPA HTML, KaTeX stylesheet link, and production JS bundle (`index-zuMCrKkK.js`). |
| **02** | Initial Location State | `GET /api/locations` | ✅ PASS | Verified clean database initialization returning empty array `[]`. |
| **03** | Geocoding Search Query | `GET /api/locations/search?query=Austin` | ✅ PASS | Returned 3 geocoded station matches from Open-Meteo with coordinates & elevation. |
| **04** | Station Select & Ingestion | `POST /api/locations/select` | ✅ PASS | Created Austin station (ID: 1, active: true) & automatically backfilled 90-day baseline telemetry. |
| **05** | Active Station Verification | `GET /api/locations` | ✅ PASS | Verified Austin listed as the active station profile. |
| **06** | Manual Catch-Up Sync | `POST /api/weather/sync` | ✅ PASS | Catch-up sync succeeded: `records_added: 48, purged_records: 0, last_synced_timestamp: 1788303600`. |
| **07** | Timeseries Extraction (7d) | `GET /api/weather/timeseries?range=7d` | ✅ PASS | Extracted 163 hourly readings with complete 12 weather fields and decomposed $U=3.59, V=6.47$ wind vectors. |
| **08** | SMA Low-Pass Filter | `GET /api/weather/timeseries?range=7d&smoothing=12h` | ✅ PASS | Computed 163 smoothed rolling average points (e.g., Raw: 39.7°C -> 12h Smoothed: 33.03°C). |
| **09** | Bivariate Pearson Engine | `GET /api/weather/stats/correlation?x=temperature_2m&y=relative_humidity&range=30d` | ✅ PASS | Calculated over $n=715$ pairs: $r = -0.929$, slope $m = -3.975$, intercept $c = 184.479$, points: 715. |
| **10** | Polar Wind Rose & Flow | `GET /api/weather/stats/wind-rose?range=30d` | ✅ PASS | Resultant flow direction $166.4^\circ$ (S/SSE flow, mean speed $9.48\text{ km/h}$), 16 compass bins computed. |
| **11** | ERA5 Case Study Fetch | `POST /api/weather/case-studies/download` | ✅ PASS | Downloaded 120 hourly historical records for the 2021 Texas Winter Freeze (`2021-02-12` to `2021-02-16`). |
| **12** | List Pinned Case Studies | `GET /api/weather/case-studies` | ✅ PASS | Listed `texas_freeze_2021` (120 records, `is_stale: false`). |
| **13** | Case Study Timeseries | `GET /api/weather/timeseries?series_id=texas_freeze_2021` | ✅ PASS | Extracted 120 historical hours with sub-zero values ($T = -0.9^\circ\text{C}, T_{\text{app}} = -6.5^\circ\text{C}$). |
| **14** | Case Study Frontal Dipole | `GET /api/weather/stats/correlation?x=temperature_2m&y=surface_pressure&series_id=texas_freeze_2021` | ✅ PASS | Verified cold frontal pressure-temperature dipole: $r = -0.693$ over 120 arctic hours. |
| **15** | RFC 4180 CSV Export | `GET /api/weather/export/csv?series_id=texas_freeze_2021` | ✅ PASS | Streamed 121 CSV lines (header + 120 observation rows) formatted for Excel and Jupyter. |
| **16** | CSV Batch Import & Upsert| `POST /api/weather/import/csv` | ✅ PASS | Uploaded exported CSV body; successfully parsed and upserted 120 records into SQLite database. |
| **17** | Case Study Deletion | `DELETE /api/weather/case-studies/texas_freeze_2021` | ✅ PASS | Deleted case study series and purged 120 historical records from database. |
| **18** | Multi-Station Switch | `POST /api/locations/select` (London, UK) | ✅ PASS | Created London station profile (ID: 2, active: true); previous active station set to inactive. |
| **19** | Station Cascade Delete | `DELETE /api/locations/:id` | ✅ PASS | Deleted both stations; foreign key cascade cleaned all weather records; returned empty array `[]`. |
| **20** | Live Station Re-Setup | `POST /api/locations/select` (Austin, TX) | ✅ PASS | Configured fresh station profile ready for active interactive use. |

---

## 🏆 Final Summary

* **Total Live Integration Tests:** 20 / 20 PASSED (100% Success Rate)
* **Live Docker Container Status:** Healthy & Responding on `http://localhost:3001`
