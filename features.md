# 📊 Meteorology Timeseries Data Analysis & Visualization Workbook

An educational, interactive web workbook designed to teach the fundamentals of scientific data analysis using real-world meteorological data. By pulling data from the free, keyless Open-Meteo API and storing it locally, the application guides the user through interpreting timeseries charts, calculating statistical correlations, understanding smoothing filters, and solving directional vector problems.

---


## 🚀 Core Educational Features

### 1. Interactive Correlation Explorer (Bivariate Analysis)
*   **Dynamic Scatter Plotting:** Choose any independent ($X$) and dependent ($Y$) meteorological variable (e.g., Temperature vs. Relative Humidity, or Wind Speed vs. Barometric Pressure).
*   **Regression & Trendlines:** Draws a linear regression line ($y = mx + c$) and computes the Pearson correlation coefficient ($r$) in real time.
*   **Interactive Math Visualizations:** Dynamic LaTeX formulas that react to user interaction (detailed in `ui_design.md`).
*   **Physical Interpretation Engine:** A dynamic explanation box that updates to explain the meteorology behind the selected variables:
    *   *Temp vs. Humidity ($r \approx -0.8$):* Explains how warm air expands its moisture-carrying capacity, dropping relative humidity even when absolute water content is constant.
    *   *Pressure vs. Wind Speed ($r \approx -0.6$):* Explains pressure gradients and how air rushing from high to low pressure zones creates high wind speeds.

### 2. Timeseries Filtering & Smoothing Lab (Signal Processing)
*   **Dual-Y Axis Explorer:** Overlay two parameters (e.g., Temperature and Barometric Pressure) on a single timeseries timeline to visually inspect relationships over 24 hours, 7 days, or 30 days.
*   **Moving Average Slider:** Smooth raw hourly observations using a 3-hour, 12-hour, or 24-hour Simple Moving Average (SMA).
*   **diurnal vs. Synoptic Analysis:** Teaches the user how a 24-hour moving average filter works as a "low-pass filter," smoothing out day/night (diurnal) oscillations to reveal macro-scale (synoptic) weather systems like arriving warm or cold air masses.

### 3. Wind Vector & Polar Analysis (Trigonometric Math)
*   **The Arithmetic Fail Tutorial:** Explains why simple averaging fails for angles (e.g., the average of $350^\circ$ and $10^\circ$ is mathematically $180^\circ$, which points South, instead of North $0^\circ$/$360^\circ$).
*   **Vector Converter:** Shows the steps to resolve wind speed and direction into $U$ (zonal, East-West) and $V$ (meridional, North-South) wind vectors using trigonometry:
    $$U = -\text{speed} \times \sin\left(\text{direction} \times \frac{\pi}{180}\right)$$
    $$V = -\text{speed} \times \cos\left(\text{direction} \times \frac{\pi}{180}\right)$$
*   **Wind Rose Plot:** Renders a polar histogram showing the frequency distribution of wind speeds from different compass directions.

### 4. Synoptic Event Case Studies (Guided Interpretations)
*   **Pre-packaged Historical Events:** Instant loader containing clean, historical hourly data for dramatic meteorological occurrences:
    *   *The Cold Front Passage:* Graph showing temperature crashing, pressure hitting a local minimum, and wind direction shifting abruptly (typically $90^\circ+$) at the moment of front arrival.
    *   *The Heatwave Thermal Lag:* Graph of Solar Radiation vs. Temperature showing the physical lag between peak solar energy (noon) and peak daily temperature (typically 3–4 PM) due to the ground's thermal inertia.
*   **Interactive Highlights:** Highlights key regions on the charts corresponding to these physical events with explanatory overlays.

### 5. Backend API Data Ingest & Database (Rust + SQLite)
*   **Rust Ingestion Engine:** A high-performance Rust service that handles periodic weather data fetches from the Open-Meteo API for target coordinates.
*   **Local Timeseries Archive (SQLite):** Stores historical hourly records on the server side using a lightweight SQLite database managed via Rust (`rusqlite` or `sqlx`).
*   **High-Speed Statistical Compute:** Performs intensive mathematical calculations (moving averages, Pearson correlations, regression lines, wind vector trigonometry) natively in Rust before sending results to the frontend, ensuring sub-millisecond calculation times even for large datasets.
*   **CSV Portability:** Natively reads and writes standard CSV files from the Rust backend for external study.

---

## 🛠️ Proposed Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend API** | Rust (Axum or Actix-web) | Fast, memory-safe server for data fetching, file ingestion, and high-performance timeseries math calculations. |
| **Database** | SQLite | Serverless, localized SQL database for storing structural weather logs and custom observations. |
| **Frontend Framework** | React (Vite-based build) | Component-driven UI for reactive state management, modular analysis tabs, and clean dashboard updates. |
| **Styling** | Tailwind CSS + SASS (SCSS) | Tailwind for structural layout grids and components; SASS/SCSS for complex nested math formula custom animations, hovering glows, and specific card blur filters. |
| **Data Viz** | Chart.js (or react-chartjs-2) | High-performance canvas-based interactive charts for scatter and dual-axis timeseries graphs. |
| **Math Rendering** | KaTeX (via CDN / npm) | Super-fast LaTeX math equation rendering with custom HTML/CSS hover wrappers for interactive components. |

---

## 📚 Scientific & Educational References
For complete citations, academic papers, and API documentation sources behind these meteorological models and data literacy frameworks, see [`references.md`](file:///home/pills/Documents/projects/weather/references.md).
