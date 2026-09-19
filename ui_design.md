# 🎨 Meteorology Workbook: UI Design & Design System Specification

This document details the visual design system, layout architecture, multi-mode user experience, interactive mathematical animations, and guided tour systems for the Meteorology Workbook application.

---

## 🕶️ Visual Design System

### 1. Color Palette (Dark Scientific Console)
*   `--bg-primary`: Deep charcoal-black (`#0a0d16`)
*   `--bg-panel`: Frosted dark blue-gray (`rgba(16, 22, 37, 0.6)`)
*   `--border-color`: Translucent white (`rgba(255, 255, 255, 0.08)`)
*   `--text-main`: Off-white (`#f3f4f6`)
*   `--text-muted`: Medium gray (`#9ca3af`)

### 2. Scientific Accent Theme (Vivid Coastal Oceanic)
*   🌡️ **Temperature:** Molten Coral (`#ff6b6b`)
*   💧 **Relative Humidity:** Cerulean Blue (`#0abde3`)
*   ❄️ **Dewpoint:** Bright Ice (`#48dbfb`)
*   📈 **Barometric Pressure:** Vivid Jade (`#1dd1a1`)
*   💨 **Wind Speed & Azimuth:** Marigold Amber (`#feca57`)
*   🌧️ **Precipitation:** Royal Amethyst (`#a29bfe`)
*   ☀️ **Solar Radiation:** Sunburst Orange (`#ff9f43`)
*   🌱 **Soil Moisture & Temp:** Fresh Lime-Mint (`#2ed573`)

### 3. Surface & Glassmorphism Tokens
*   `glass-panel`: `backdrop-filter: blur(16px) saturate(140%); background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255, 255, 255, 0.08);`
*   `glass-panel-subtle`: `backdrop-filter: blur(10px); background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05);`
*   `glass-card-interactive`: Card primitive with subtle transition on hover (`transform: translateY(-1px); border-color: rgba(72, 219, 251, 0.4); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);`).

---

## 📐 Layout Architecture

The application layout consists of a persistent top header with a mode switcher, dynamically rendering one of two primary views:
1. **Guided Challenges Learning Stage** (`appMode === 'challenges'`)
2. **Research Workbench Multi-Pane Console** (`appMode === 'workbench'`)

```
+-----------------------------------------------------------------------------------------+
| [Logo] Meteorology Lab  [ 🎯 Guided Challenges | 🔬 Workbench ]  [Station] [Sync] [Tours] |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  MODE 1: GUIDED CHALLENGES (Default)                                                    |
|  +-----------------------------------------------------------------------------------+  |
|  | [Mission 1: Day & Night]  [Mission 2: Correlation]  [Mission 3: Compass] [Freeze] |  |
|  +-----------------------------------------------------------------------------------+  |
|  | Challenge Stage:                                              [ 📖 Science Notebook ]|
|  | - Scientific Question & Context                                                     |
|  | - Jargon Buster Concepts (Dotted Tooltips)                                          |
|  | - Interactive Prediction Prompt (Radio Options)                                     |
|  | - Interactive Visual Experiment (SVG Graphs, Sliders, Dials)                        |
|  | - Real-Time Outcome Feedback & Science Badge Reward                                 |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  MODE 2: RESEARCH WORKBENCH                                                             |
|  +---------------+-------------------------------------------------------------------+  |
|  | Sidebar       | [Current Conditions Ribbon]                                        |  |
|  | - Timeseries  | [Active Tab Context Bar + Workbench Guide Button]                   |  |
|  | - Correlation | +-----------------------------------------------------------------+ |  |
|  | - Wind Rose   | | Active Workbench Viewport (Charts, Controls, Math)             | |  |
|  | - Physics     | +-----------------------------------------------------------------+ |  |
|  | - Raw Data    | | [Split Live Filter Inspectors: SMA Filter | Correlation Filter]  | |  |
|  |               | +-----------------------------------------------------------------+ |  |
|  +---------------+-------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 🎯 Mode 1: Guided Challenges UI Specification

### 1. Mission Selector Ribbon
* Horizontally scrollable navigation bar displaying all 4 missions.
* Each mission pill shows:
  * Mission number & icon (`🎯`, `🔍`, `🧭`, `❄️`).
  * Short title and conceptual domain.
  * Active state highlighted with vibrant cyan gradient (`from-[#0abde3]/20 to-[#48dbfb]/15`) and glowing border.
  * Completion badge indicator when the user solves the challenge.

### 2. Challenge Stage Layout
* **Header & Question Banner:** Large typography framing the real-world scientific mystery in plain English.
* **Concept Clarification Strip:** Introduces 2–3 plain-English mental models using Jargon Buster chips.
* **Prediction Prompt Card:**
  * Encourages scientific hypothesizing before running the experiment.
  * Selectable multiple-choice radio cards with instant feedback upon submission.
* **Interactive Sandbox & Visualizer:**
  * Mission 1: SVG raw vs. smoothed timeseries graph with real-time SMA slider ($1\text{h} \to 48\text{h}$) and dynamic Variance Reduction gauge.
  * Mission 2: Bivariate scatter plot with dynamic least-squares line, quadrant highlights, and live Pearson $r$ meter.
  * Mission 3: Side-by-side compass rose comparison contrasting broken arithmetic average with Cartesian vector decomposition.
  * Mission 4: Timeline scrubber scrubbing through the Feb 2021 Texas Freeze with synchronized barometric pressure, wind direction, and temperature readouts.
* **Aha! Discovery Card & Badge Celebration:**
  * Explains the mathematical and physical truth behind the results.
  * Awards an achievement badge with celebration animation.

### 3. Slide-Out Science Notebook
* Slide-out modal / drawer toggled via the floating "Science Notebook" button.
* 4 Tabbed / Stacked Sections:
  1. **Earned Badges:** 4 milestone badge cards showing unlocked vs. locked status.
  2. **Plain-English Mental Models:** Permanent reference for everyday analogies (*Air Sponge*, *Squinting Eyes*, *Modular Trap*, *Atmospheric Bulldozer*).
  3. **Rules of Thumb:** Quick heuristic lookup for field meteorology and data cleaning.
  4. **Formal Physics Formulations:** Precise KaTeX mathematical formulas with definitions.

### 4. Jargon Buster Tooltip System
* Rendered on any scientific or statistical term with a subtle dotted underline (`border-b border-dotted border-[#48dbfb]/60 cursor-help`).
* Hovering reveals a frosted glass popover card:
  * Term name & phonetic pronunciation.
  * **Everyday Analogy** (e.g. *Air Sponge* for saturation vapor pressure).
  * Plain-English explanation without prerequisite jargon.
  * Formal scientific term and KaTeX formula link.

---

## 🔬 Mode 2: Research Workbench UI Specification

### 1. Header Bar & Profile Controls
* **Mode Switcher Toggle:** Pill-shaped segmented control (`[ 🎯 Guided Challenges ] [ 🔬 Workbench ]`) with active indicator and glowing state.
* **Station Selector Button:** Opens search modal with live geocoding suggestions; displays active city name, country, and timezone.
* **Sync Button:** Triggers manual catch-up; displays spinning animation while backfilling missing hours.
* **Case Studies Modal Trigger:** Displays count of saved historical events and warning badge if any case study is $>30$ days old.
* **CSV Portability Button:** Opens modal for RFC 4180 CSV export and file upload import.
* **Lab Guide Button:** Launches the global walkthrough tour.

### 2. Collapsible Navigation Sidebar
* Grouped into 3 logical categories:
  * *Observational Telemetry:* Timeseries Explorer.
  * *Physical & Statistical Models:* Pearson Correlation, Polar Wind Rose.
  * *Reference & Archives:* Atmospheric Physics, Raw Data & Ingest.
* Search filter box (`Cmd/Ctrl + K`) filtering views by title, subtitle, or keywords in real time.
* Collapse toggle minimizing the sidebar into a compact 64px icon rail.
* Mobile-responsive slide-out navigation drawer with backdrop blur.

### 3. Active Workbench Context Bar
* Sits directly above the active workbench pane.
* Displays:
  * Workbench title and category domain badge.
  * Domain accent color indicator.
  * Dedicated **Workbench Guide Button** (e.g. `Timeseries Guide`, `Raw Data Guide`) styled in gold/amber.

### 4. Split Live Statistical & Filter Inspectors
Rendered side-by-side in the Timeseries view:
* **`SmaFilterInspector` (Signal Processing):**
  * Live variance reduction meter ($\sigma^2_{\text{smooth}} / \sigma^2_{\text{raw}}$).
  * Attenuation percentage badge.
  * Interactive 3-tab "How to Use" guide:
    * *Workflow:* Step-by-step instructions on tuning the SMA window.
    * *Meteorology:* Explains diurnal vs. synoptic scale filtering.
    * *Math:* KaTeX rolling mean equation and variance attenuation formula.
* **`CorrelationFilterInspector` (Bivariate Dependency):**
  * Real-time Pearson $r$ meter with dynamic gauge and color scale.
  * Strength and direction badge (Strong Negative, Weak Positive, Uncorrelated).
  * Sample size counter ($N$ paired observations).
  * Interactive 3-tab "How to Use" guide (Workflow, Meteorology, Math).

---

## 🧭 Guided Tour Spotlight System

### 1. Overlay Mechanics
* Rendered via full-screen SVG mask creating an exact rectangular/pill cutout over the active target element (`id="tour-..."`).
* Clean, non-distracting highlight border with smooth transition between steps.
* Radar pulse/ping animations disabled to maintain visual calm and scientific clarity.

### 2. Floating Guidance Popover
* Anchored relative to the target element (top, bottom, left, right) with viewport collision detection.
* Contains:
  * Step counter pill (e.g. `Step 2 of 5`).
  * Step title and domain category badge.
  * Clear, concise pedagogical description.
  * Pro-tip alert box with a lightbulb icon.
  * Navigation controls: `[ Previous ]`, `[ Next ]` / `[ Finish ]`, and `[ Close ]`.

### 3. Theming Separation
* **Lab Guide:** Primary Cyan / Bright Ice theme (`#48dbfb`), guiding global platform features.
* **Workbench Guides:** Warm Amber / Gold theme (`#feca57` / `#ff9f43`), dedicated to deep-dive analytical instruments.

---

## 🧮 Interactive Math Visualizations (Animated LaTeX)

Live LaTeX formulas (rendered via KaTeX) feature synchronized hover states that link mathematical symbols directly to active chart elements:

### 1. Pearson Correlation ($r$)
$$r = \frac{\sum (X_i - \bar{X})(Y_i - \bar{Y})}{\sqrt{\sum (X_i - \bar{X})^2 \sum (Y_i - \bar{Y})^2}}$$
* Hovering $\bar{X}$ or $\bar{Y}$ highlights the mean values on the scatter plot axes.
* Hovering the numerator highlights points in agreeing quadrants.

### 2. Wind Vector Decomposition ($U$ & $V$)
$$U = -\text{speed} \cdot \sin(\theta), \quad V = -\text{speed} \cdot \cos(\theta)$$
* Hovering $U$ displays a glowing horizontal projection arrow on the polar rose.
* Hovering $V$ displays a glowing vertical projection arrow on the polar rose.
* Hovering $\theta$ highlights the radial azimuth angle indicator.
