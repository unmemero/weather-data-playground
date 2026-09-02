# 📚 Scientific References & Educational Sources

This document compiles the scientific literature, pedagogical models, and API documentation that inform the educational content and mathematical foundations of the Meteorology Timeseries Workbook.

---

## 🌐 1. Weather API Documentation & Data Sources

### Open-Meteo Weather API (Complete Technical Reference)
*   **Documentation:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
*   **Historical Archive Docs:** [https://open-meteo.com/en/docs/historical-weather-api](https://open-meteo.com/en/docs/historical-weather-api)
*   **Geocoding Docs:** [https://open-meteo.com/en/docs/geocoding-api](https://open-meteo.com/en/docs/geocoding-api)
*   **Citation:** Zippenfenig, P. (2023). *Open-Meteo: Open-Source Weather Forecast and Historical Weather API*. Open-Meteo GmbH. License: CC BY 4.0.

#### 1. Core Endpoints
1.  **Forecast & Recent Past API (`https://api.open-meteo.com/v1/forecast`):**
    *   Retrieves real-time current weather (`current`), 15-minute intervals (`minutely_15`), hourly (`hourly`), and daily aggregations (`daily`) for up to 16 days of forecast.
    *   Supports `past_days` (up to 92 days of immediate historical observations in a single call).
2.  **Historical Archive API (`https://archive-api.open-meteo.com/v1/archive`):**
    *   Gap-free, continuous hourly timeseries from **1940 to present** (5-day delay) sourced from global climate reanalysis models (ECMWF ERA5 at 0.25° resolution and ERA5-Land at 0.1° resolution).
    *   Query via `start_date=YYYY-MM-DD` and `end_date=YYYY-MM-DD`.
3.  **Geocoding Search API (`https://geocoding-api.open-meteo.com/v1/search`):**
    *   Resolves location strings (e.g., city, country) into `latitude`, `longitude`, `elevation`, `timezone`, and `country_code`.

#### 2. Key Parameters & Columnar Data Format
*   **Required Coordinates:** `latitude`, `longitude`
*   **Time Selection:** `past_days`, `forecast_days`, `start_date`, `end_date`, `timezone` (e.g. `auto` or `UTC`).
*   **Supported Atmospheric Variables:**
    *   *Thermal:* `temperature_2m`, `apparent_temperature`, `dewpoint_2m`.
    *   *Moisture & Rain:* `relative_humidity_2m`, `precipitation`, `rain`, `showers`, `snowfall`, `snow_depth`, `vapour_pressure_deficit`.
    *   *Pressure:* `surface_pressure`, `pressure_msl` (sea-level pressure).
    *   *Wind Dynamics:* `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`.
    *   *Radiation & Sun:* `shortwave_radiation`, `direct_radiation`, `diffuse_radiation`, `uv_index`, `sunshine_duration`.
    *   *Terrestrial & Soil:* `soil_temperature_0_to_7cm`, `soil_temperature_7_to_28cm`, `soil_moisture_0_to_7cm`.
*   **Response Structure (Columnar Timeseries Arrays):**
    ```json
    {
      "latitude": 40.71,
      "longitude": -74.01,
      "elevation": 10.0,
      "hourly": {
        "time": ["2026-08-30T00:00", "2026-08-30T01:00", ...],
        "temperature_2m": [22.4, 21.8, ...],
        "relative_humidity_2m": [65, 68, ...],
        "surface_pressure": [1013.2, 1012.8, ...]
      }
    }
    ```
*   **Rate Limits:** 10,000 calls/day, 5,000 calls/hour, 600 calls/minute per IP address. No API key required for non-commercial research and education.

---

## 🧪 2. Atmospheric Science & Meteorological Theory

### A. Moisture & Diurnal Cycles (The "Sponge" Analogy)
*   **Concept:** Temperature-driven changes in saturation vapor pressure ($e_s$) and the resulting inverse relationship between daily temperature and Relative Humidity ($\text{RH}$).
*   **Reference:** Ahrens, C. D., & Henson, R. (2021). *Meteorology Today: An Introduction to Weather, Climate, and the Environment* (13th ed.). Cengage Learning.
    *   *Chapter 4: Moisture and Atmospheric Stability* (Covers Clausius-Clapeyron relation, vapor pressure, and diurnal humidity cycles).

### B. Surface Energy Balance & Thermal Lag
*   **Concept:** The physical phase shift between peak incoming solar radiation (solar noon) and peak daily air temperature ($3:00\text{--}4:00\text{ PM}$) caused by ground heat capacity and net radiation balance.
*   **Reference:** Wallace, J. M., & Hobbs, P. V. (2006). *Atmospheric Science: An Introductory Survey* (2nd ed.). Academic Press / Elsevier.
    *   *Section 4.3: Terrestrial Radiation and Surface Energy Balance*.

### C. Surface Wind Vector Decomposition ($U$ and $V$)
*   **Concept:** Why scalar arithmetic fails when averaging compass angles ($0^\circ\text{--}360^\circ$) and the trigonometric resolution of wind speed/direction into zonal ($U$) and meridional ($V$) components.
*   **Reference:** World Meteorological Organization (WMO). (2021). *Guide to Instruments and Methods of Observation (WMO-No. 8)*, Volume I – Measurement of Meteorological Variables.
    *   *Chapter 5: Measurement of Surface Wind*.

### D. Barometric Pressure Tendency & Synoptic Fronts
*   **Concept:** Measuring the 3-hour barometric pressure change ($\Delta P$) to identify approaching cyclone troughs, cold front passages, and local wind accelerations.
*   **Reference:** World Meteorological Organization (WMO). (2021). *WMO-No. 8: Guide to Instruments and Methods of Observation*.
    *   *Chapter 3: Measurement of Atmospheric Pressure (Section 3.6: Pressure Tendency)*.

---

## 🎓 3. Educational Pedagogy & Data Literacy

### A. Interactive Data Exploration in Geosciences
*   **Finding:** Hands-on manipulation of real timeseries datasets using interactive web tools enhances pattern recognition and statistical intuition more effectively than static charts.
*   **Reference:** Charlevoix, D. J., & Morris, J. T. (2018). *Fostering Data Literacy in Atmospheric Science Education*. Bulletin of the American Meteorological Society (BAMS), 99(11), 2321–2330.

### B. NOAA Data Inquiry Framework
*   **Concept:** Guiding students from simple timeseries observations to multi-variable correlation and anomaly detection using stepped inquiry levels.
*   **Reference:** National Oceanic and Atmospheric Administration (NOAA) Education. (2023). *Data in the Classroom: Atmospheric and Weather Patterns*. U.S. Department of Commerce. [https://dataintheclassroom.noaa.gov](https://dataintheclassroom.noaa.gov)
