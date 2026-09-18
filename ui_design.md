# 🎨 Meteorology Workbook: UI Design & Interactive Math Spec

This document details the user interface layout, visual guidelines, multi-series visualization mechanics, and specifications for interactive mathematical visualizations in the Meteorology Workbook application.

---

## 🕶️ Visual Design System
To create a clean, scientific, and immersive environment:
*   **Color Palette (Dark Console):**
    *   `--bg-primary`: Deep charcoal-black (`#0a0d16`)
    *   `--bg-panel`: Frosted dark blue-gray (`rgba(16, 22, 37, 0.6)`)
    *   `--border-color`: Translucent white (`rgba(255, 255, 255, 0.08)`)
    *   `--text-main`: Off-white (`#f3f4f6`)
    *   `--text-muted`: Medium gray (`#9ca3af`)
*   **Scientific Accent Theme (Option 3 - Vivid Coastal Oceanic):**
    *   🌡️ Temperature: Molten Coral (`#ff6b6b`)
    *   💧 Relative Humidity: Cerulean Blue (`#0abde3`)
    *   ❄️ Dewpoint: Bright Ice (`#48dbfb`)
    *   📈 Barometric Pressure: Vivid Jade (`#1dd1a1`)
    *   💨 Wind Speed/Direction: Marigold Amber (`#feca57`)
    *   🌧️ Precipitation: Royal Amethyst (`#a29bfe`)
    *   ☀️ Solar Radiation: Sunburst Orange (`#ff9f43`)
    *   🌱 Soil Moisture/Temp: Fresh Lime-Mint (`#2ed573`)

---

## 📐 Layout Architecture

The application is structured as a responsive single-page workbench divided into three primary zones:

### 1. Header Bar & City Profile Management
*   **Active City Profile Widget:** Displays the currently selected city (e.g. `Austin, TX, US`), local coordinates, and elevation.
*   **Profile Switcher Dropdown:** Fast switching between saved city profiles (e.g. `Austin`, `Phoenix`, `Seattle`) with an "Add New City" search modal.
*   **Sync & Catch-Up Status:** 
    *   Last synced timestamp rounded to the last floor hour.
    *   A pulsing live sync status indicator (e.g. `Auto-Sync: Hourly` / `Backfilling 48h...`).
    *   Manual **"Sync Now"** button.
*   **Local Timezone Tag:** Displays the machine's local timezone (e.g., `Timezone: America/Chicago (Local)`).

### 2. Main Interactive Workstation (Two-Column Split)
*   **Left Column (60% width - Interactive Visualizer):**
    *   **Data Series Selector Bar:** Allows toggling between the **Active Automated Stream (2-Year Window)** and any **Pinned User Case Studies** (e.g., *2021 Texas Winter Storm*, *Summer 2023 Heatwave*).
    *   **Analysis Workspaces:**
        *   **Timeseries Explorer:** Dual-axis charts with 24h, 7d, 30d, 90d, and 2-year range buttons, plus Moving Average smoothing slider.
        *   **Correlation Lab:** Dynamic scatter plot with regression trendline and Pearson $r$.
        *   **Diurnal Study:** 24-hour daily cycle overlays.
        *   **Wind Vector Rose:** Trigonometric polar wind frequency distribution.
*   **Right Column (40% width - Scientific Lab & Case Studies):**
    *   **Dynamic Physical Interpretation Engine:** Explains the meteorology of the active view.
    *   **Interactive Mathematical Formulas (Animated LaTeX):** Live KaTeX equations with hover animations linked to charts.
    *   **Case Study Manager:** Panel to download new historical date ranges, view saved case studies, and inspect dataset freshness (flagging studies collected $>30$ days ago with a `⚠️ Collected >30d ago` badge).

### 3. Bottom Data Console (Collapsible)
*   **Paginated Raw Table:** Displays hourly observations with sortable columns and outlier deletion.
*   **Data Portability Actions:** CSV Export (exports active series as a research-ready CSV file) and CSV Import.

---

## 📈 Multi-Series Visualization & Timeline Merging

### 1. Comparing Distinct Datasets
*   Users can select multiple series simultaneously (e.g. comparing the current August automated stream against a historical August case study from 2011).
*   Each series is plotted with distinct line dash patterns or color gradients to prevent confusion.

### 2. Smart Convergence / Time Stitching
*   If two selected datasets belong to **contiguous or converging time ranges** (e.g., Series A ends on Feb 23 1:00 AM and Series B begins on Feb 24 11:00 PM):
    *   The chart engine automatically stitches them into a **single continuous timeline**.
    *   A subtle vertical marker indicates the transition between datasets without breaking the line plot.

---

## 🧮 Interactive Math Visualizations (Animated LaTeX)

Live LaTeX formulas (rendered via KaTeX/CSS) feature synchronized hover states that link mathematical symbols to chart elements.

### 1. Pearson Correlation ($r$)
$$r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$$

*   **Hovering $\bar{x}$ or $\bar{y}$ (Means):** Term glows in the variable's accent color; dashed mean lines appear on the scatter plot with a popover explaining the arithmetic average.
*   **Hovering $(x_i - \bar{x})$ (Deviations):** Formula term highlights; deviation lines slide from points to the mean on the plot.
*   **Hovering the Numerator (Covariance):** Numerator glows; points in agreeing quadrants light up.

### 2. Wind Vector Decomposition ($U$ & $V$)
$$U = -\text{speed} \times \sin\left(\theta \times \frac{\pi}{180}\right), \quad V = -\text{speed} \times \cos\left(\theta \times \frac{\pi}{180}\right)$$

*   **Hovering $U$:** $U$ glows yellow; animated horizontal arrow overlays the wind rose.
*   **Hovering $V$:** $V$ glows yellow; animated vertical arrow overlays the wind rose.
*   **Hovering $\theta$:** Angle term highlights; radial degree angle indicator lights up on the compass.

---

## 🎨 Styling Integration (Tailwind + SASS)
*   **Tailwind CSS:** Handles structural layout grids (split 60/40 columns), flex containers, responsive breakpoints, margins, paddings, and standard button/modal primitives.
*   **SASS/SCSS:** Handles complex component styling via CSS Modules:
    *   Nested KaTeX formula selectors and hover state styling (`.math-formula .numerator:hover`).
    *   Neon text-shadow drop-shadows and glowing keyframe animations.
    *   Frosted glassmorphism mixins (`backdrop-filter: blur(12px) saturate(140%)`).
