# 📊 Meteorology Timeseries Data Analysis & Visualization Workbook

An educational, interactive web platform and research workbench designed to teach the fundamentals of scientific data analysis and atmospheric physics using real-world meteorological telemetry. 

Powered by a high-throughput **Rust Axum** backend, **SQLite WAL-mode** storage engine, and a reactive **React 18 + Vite + TypeScript + KaTeX + Chart.js** frontend, the platform features a **Dual-Mode Architecture** bridging zero-jargon inquiry-based learning directly into professional atmospheric analytics.

---

## 🧭 Dual-Mode Architecture

The platform provides two seamless operational modes switched via the top header bar, persisting user state across sessions:

1. **🎯 Guided Challenges Mode (Learning & Discovery):**
   * Designed for users without prior statistical or meteorological background.
   * Inquiry-driven, hands-on scientific missions framed around real-world weather questions.
   * Utilizes the **4-Step Learning Loop**:
     $$\text{Real-World Question} \;\longrightarrow\; \text{Zero-Jargon Analogy} \;\longrightarrow\; \text{Interactive Prediction \& Experiment} \;\longrightarrow\; \text{"Aha!" Discovery \& Badge}$$
   * Integrates the **Jargon Buster** tooltip system, plain-English mental models, and an unlockable **Science Notebook**.

2. **🔬 Research Workbench Mode (Professional Analysis):**
   * A full 5-tab analytical instrument console designed for open exploration, multi-station comparisons, and custom data processing.
   * Provides deep time-series manipulation, bivariate regression modeling, polar wind vector decomposition, pedagogical atmospheric physics references, and raw telemetry data portability.

---

## 🎯 Guided Challenges & Inquiry-Based Missions

### Mission 1: "Can You Erase Day & Night?" (Signal Smoothing & Low-Pass Filtering)
* **Real-World Question:** When looking at temperature over days, wild roller-coaster zig-zags make it hard to see whether a week is getting hotter or colder. Can we mathematically "erase" day and night to uncover the hidden trend?
* **Jargon Buster Concept:**
  * *Diurnal Cycle:* The daily heartbeat of the planet driven by solar heating and nighttime radiational cooling.
  * *Rolling Moving Average:* "Squinting your eyes" at jagged data to blur out micro-spikes.
  * *Low-Pass Filter:* A gate that blocks high-frequency fast wiggles (day/night) while letting long-term background trends pass through.
* **Interactive Experimentation:**
  * Interactive prediction prompt testing user intuition before sliding the filter.
  * Interactive SMA Window slider ($1\text{h} \to 48\text{h}$) with real-time SVG dual-curve overlay (Raw Coral Curve vs. Smoothed Amber Line).
  * Dynamic **Variance Attenuation Meter** showing how a $24\text{h}$ window reduces temperature variance by $\approx 78\%$, perfectly neutralizing the solar diurnal cycle.
* **Achievement Milestone:** Unlocks the **🛡️ Signal Master** Science Badge.

### Mission 2: "Best Friends, Bitter Enemies, or Total Strangers?" (Bivariate Correlation & Scatter Plots)
* **Real-World Question:** When afternoon temperatures spike, does relative humidity go up, drop like a rock, or do whatever it wants?
* **Jargon Buster Concept:**
  * *Air Sponge (Clausius-Clapeyron):* Warm air acts like a rapidly expanding sponge; as it warms, its water-holding capacity grows exponentially, making the air feel "thirstier" (dropping relative humidity) even if no water was removed.
  * *Scatter Plot:* A coordinate field where each dot represents a single simultaneous observation of two variables.
  * *Pearson $r$:* A correlation scoreboard from $-1.0$ (bitter enemies) to $+1.0$ (inseparable best friends).
* **Interactive Experimentation:**
  * Interactive prediction prompt on temperature vs. relative humidity relationship.
  * Bivariate variable selector pairs (Temp vs. Humidity, Pressure vs. Wind Speed, Solar Radiation vs. Temperature).
  * Real-time scatter plot with least-squares linear trendline ($y = mx + c$) and quadrant deviation markers.
  * Dynamic **$r$ Scoreboard Meter** illustrating strong negative correlation ($r \approx -0.85$).
* **Achievement Milestone:** Unlocks the **🔍 Pattern Hunter** Science Badge.

### Mission 3: "The Broken Compass" (Vector Decomposition & Circular Angular Math)
* **Real-World Question:** If the wind blows from $350^\circ$ (NNW) at hour 1 and $10^\circ$ (NNE) at hour 2, what was the average wind direction?
* **Jargon Buster Concept:**
  * *The Modular Compass Trap:* Standard scalar arithmetic fails on circles:
    $$\frac{350^\circ + 10^\circ}{2} = 180^\circ \quad (\text{Pointing South instead of North!})$$
  * *Cartesian Vector Decomposition:* Breaking directional force into two perpendicular wind legs: $U$ (East-West zonal flow) and $V$ (North-South meridional flow).
  * *Mass Flux Conservation:* Atmospheric winds represent actual physical air parcels with momentum that cancel out vectorially.
* **Interactive Experimentation:**
  * Interactive dual-compass dial contrasting the broken arithmetic average ($180^\circ$ South) with true trigonometric vector resultant averaging ($0^\circ$ North).
  * Step-by-step vector decomposition breakdown displaying $U$ and $V$ trigonometric projections.
* **Achievement Milestone:** Unlocks the **🧭 Vector Navigator** Science Badge.

### Mission 4: "Autopsy of an Arctic Freeze" (Synoptic Cold Front Forensics)
* **Real-World Question:** How can meteorologists detect the exact arrival minute of a violent arctic front using nothing but surface barometric pressure, wind direction, and temperature?
* **Jargon Buster Concept:**
  * *Synoptic Cold Front:* A heavy, dense wedge of arctic air bulldozing under warm air, creating a distinctive pressure trough, rapid wind shift, and temperature collapse.
  * *Pressure Trough (Inflection Point):* Barometric pressure falls steadily ahead of the front, reaches a local minimum at front arrival, and sharply surges as dense cold air floods the station.
* **Interactive Experimentation:**
  * Curated case study of the catastrophic **February 2021 Texas Arctic Freeze**.
  * Interactive **Timeline Scrubber** stepping through hourly observations.
  * Synchronized multi-metric forensic readouts highlighting the simultaneous barometric inflection point, $90^\circ+$ clockwise wind shift, and precipitous temperature crash.
* **Achievement Milestone:** Unlocks the **❄️ Forensic Meteorologist** Science Badge.

---

## 💡 Zero-Jargon Educational Toolkit

### 1. Jargon Buster Tooltip System
* Reusable, accessible tooltips with subtle dotted underlines across all guided challenges and workbench inspectors.
* Hovering opens a frosted glass card providing:
  * Plain-English everyday analogy (e.g. *Air Sponge*, *Squinting Eyes*, *Modular Trap*).
  * Scientific definition translated into plain terms.
  * Direct cross-reference to formal mathematical formulations.

### 2. Slide-Out Science Notebook
* Slide-out modal accessible from anywhere in Guided Challenges Mode.
* Features 4 structured reference sections:
  1. **🏆 Unlocked Badges & Milestones:** Visual achievement showcase celebrating mastered concepts.
  2. **🧠 Plain-English Mental Models:** Permanent library of core physical intuitions (*Air Sponge*, *Noise Squint*, *Compass Trap*, *Atmospheric Bulldozer*).
  3. **📏 Rules of Thumb Cheat Sheet:** Quick-reference heuristics for interpreting atmospheric telemetry.
  4. **📐 Formal Physics & Math:** Rigorous KaTeX formulas (Tetens saturation vapor pressure, Cartesian vector averaging, Pearson covariance, SMA attenuation) for advanced study.

---

## 🔬 Research Workbenches (Pro Analytical Console)

### 1. Timeseries Explorer & Dual-Y Scaling
* **Dual-Y Axis Plotting:** Overlay any two parameters (e.g., Temperature and Barometric Pressure) on synchronized left/right Y-axes with distinct domain accent colors.
* **SMA Moving Average Filter:** Interactive window slider ($3\text{h}, 6\text{h}, 12\text{h}, 24\text{h}, 48\text{h}$) to isolate diurnal cycles and synoptic weather systems.
* **Preset Time Ranges:** Instant toggling across `24h`, `7d`, `30d`, `90d`, `2y`, and `all`.
* **Split Statistical & Filter Inspectors:**
  * **Instant SMA Low-Pass Filter Inspector:** Live variance reduction percentage, smoothing attenuation meter, and 3-tab "How to Use" guide (Workflow, Meteorology, Math).
  * **Bivariate Correlation Filter Inspector:** Live Pearson $r$ meter, correlation classification, and 3-tab "How to Use" guide.

### 2. Pearson Correlation & Regression Lab
* **Dynamic Metric Selectors:** Pair any independent ($X$) and dependent ($Y$) variables.
* **Real-Time Linear Regression:** Computes slope ($m$), intercept ($c$), and coefficient of determination ($R^2$).
* **Quadrant Deviation Analysis:** Visualizes positive and negative covariance quadrants.
* **Synchronized Formula Hover:** KaTeX equation terms highlight corresponding elements on the scatter plot.

### 3. Polar Wind Rose & Kinematic Vector Lab
* **16-Sector Compass Rose:** Polar histogram binning wind observations into 16 cardinal compass sectors ($22.5^\circ$ bins).
* **Speed Class Distribution:** Layered color segments representing Beaufort-aligned wind velocity tiers ($<5$, $5\text{--}15$, $15\text{--}25$, $>25\text{ km/h}$).
* **Kinematics & Vector Averaging:** Computes mean resultant wind direction $\bar{\Phi}$ and scalar speed vs. vector magnitude ratios.

### 4. Atmospheric Physics Reference Suite
* Deep-dive educational modules with interactive KaTeX formulas, physical explanations, and formal citations:
  1. *Clausius-Clapeyron & Moisture Capacity* (Tetens parameterization, RH phase lag).
  2. *Kinematics & Vector Wind Averaging* (Trigonometric Cartesian decomposition).
  3. *Baroclinic Fronts & Pressure Tendency* (Cold front dynamics, hydrostatic balance).
  4. *Solar Forcing & Boundary Layer Thermodynamics* (Thermal lag, surface energy balance).

### 5. Raw Data & Portability Console
* **Paginated Telemetry Table:** Sortable hourly records with precision metrics.
* **RFC 4180 CSV Export:** Exports filtered time ranges formatted for Pandas, R, and Excel.
* **CSV Import Engine:** Batch SQLite upsert allowing users to import external station logs.

---

## 🧭 Interactive Step-by-Step Guided Tours

* **Global Lab Guide (Cyan Theme):** High-level walkthrough introducing city selection, sync controls, case studies, and workbench navigation.
* **Dedicated Workbench Guides (Amber Theme):** Context-sensitive tours for each individual workbench explaining:
  * Timeseries Guide: Dual-axis assignment, SMA smoothing, and temporal trends.
  * Pearson Correlation Guide: Variable assignment, scatter interpretation, and regression.
  * Polar Wind Rose Guide: Compass binning, speed classes, and Kinematics vector decomposition.
  * Atmospheric Physics Guide: Deep-dive physics modules and literature citations.
  * Raw Data Guide: Sorting, filtering, and CSV portability.
* **Design Excellence:** Clean SVG spotlight cutout masks highlighting target elements without distracting radar pulse animations.

---

## ⚙️ Backend Architecture & High-Performance Compute

* **Rust Axum HTTP Server:** Asynchronous, memory-safe backend handling telemetry ingestion, scheduled hourly syncs, and statistical processing.
* **SQLite Storage Engine:** WAL-mode database supporting high-concurrency read/write operations with indexed timeseries lookups.
* **Native Statistical Compute:** Sub-millisecond execution of moving averages, Pearson correlations, regression lines, and trigonometric vector decompositions directly in Rust.
* **Open-Meteo Integration:** Free, keyless API integration fetching both automated forecast streams and historical ERA5 reanalysis archives back to 1940.
* **Data Lifecycle Policies:** 2-year automated stream retention with automatic purge, and indefinite retention for pinned historical case studies with a $>30\text{-day}$ staleness indicator.

---

## 🛠️ Complete Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Backend API** | Rust 1.85+ (Axum, Tokio, Tower-HTTP) | High-speed REST API, background scheduler, and native statistical calculations |
| **Database** | SQLite 3 (WAL mode, Rusqlite) | Localized relational storage for multi-station telemetry and pinned case studies |
| **External API** | Open-Meteo Forecast & ERA5 Archive | Keyless meteorological timeseries and geocoding services |
| **Frontend Framework** | React 18 + TypeScript + Vite | Component-driven reactive UI with dual-mode architecture |
| **Styling & Theming** | Tailwind CSS + Custom CSS Variables | Vivid Coastal Oceanic palette, glassmorphism, responsive mobile drawer |
| **Data Visualization** | Chart.js 4 + react-chartjs-2 + SVG | Dual-axis line charts, bivariate scatter plots, polar wind roses, and interactive dials |
| **Math Rendering** | KaTeX | Fast LaTeX formula typesetting with interactive hover synchronization |
| **Containerization** | Docker + Docker Compose | Multi-stage production container with persistent SQLite volume |

---

## 📚 References
For complete academic citations, textbook chapters, and meteorological API sources, see [`references.md`](file:///home/pills/Documents/projects/weather/references.md).
