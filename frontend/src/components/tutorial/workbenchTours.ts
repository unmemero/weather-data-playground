import { TourStep } from './PortalTour';

export interface WorkbenchTourConfig {
  id: string;
  title: string;
  badge: string;
  accentColor: string;
  guideButtonLabel?: string;
  steps: TourStep[];
}

export const WORKBENCH_TOURS: Record<string, WorkbenchTourConfig> = {
  timeseries: {
    id: 'timeseries',
    title: 'Timeseries Explorer',
    badge: 'Temporal Telemetry',
    accentColor: '#ff9f43', // Sunburst Amber
    guideButtonLabel: 'Timeseries Guide',
    steps: [
      {
        id: 'ts-metrics',
        targetId: 'tour-ts-metrics',
        title: 'Dual-Axis Variable Selectors',
        badge: 'Sensors',
        category: 'Variable Assignment',
        description:
          'Assign different atmospheric parameters to the Left Y and Right Y axes. This allows direct visual comparison of metrics with completely different units—such as Temperature (°C) against Relative Humidity (%) or Solar Radiation (W/m²).',
        tip: 'Look for inverse phase shifts, such as relative humidity dropping as air temperature peaks during solar noon.',
        preferredPlacement: 'bottom',
      },
      {
        id: 'ts-sma',
        targetId: 'tour-ts-sma',
        title: 'Rolling SMA Low-Pass Filter',
        badge: 'Signal Processing',
        category: 'Noise Reduction',
        description:
          'Select a Simple Moving Average window (6h, 12h, 24h, or 48h). The SMA curve filters out high-frequency sensor noise and micro-turbulent spikes, clearly exposing macroscopic synoptic front passages.',
        tip: 'A 24-hour SMA window perfectly smooths day/night diurnal fluctuations, revealing the multi-day background airmass trend.',
        preferredPlacement: 'bottom',
      },
      {
        id: 'ts-range',
        targetId: 'tour-ts-range',
        title: 'Temporal Window Controller',
        badge: 'Database Window',
        category: 'Time Ranges',
        description:
          'Filter the active timeseries query across 24 Hours, 7 Days, 30 Days, 90 Days, 2-Year rolling retention caps, or all available SQLite archives. Data redraws with zero reload latency.',
        tip: 'Use 7D for synoptic frontal passages, or 90D/2Y to analyze seasonal shifts and climate extremes.',
        preferredPlacement: 'bottom',
      },
      {
        id: 'ts-canvas',
        targetId: 'tour-ts-canvas',
        title: 'Interactive Multi-Metric Canvas',
        badge: 'Data Visualizer',
        category: 'Chart Canvas',
        description:
          'High-precision HTML5 Canvas chart with dual vertical scales, cubic spline smoothing, and hover synchronization. Hovering over any point reveals exact timestamps and cross-metric telemetry.',
        tip: 'Click any variable in the chart legend to quickly show or hide that specific curve.',
        preferredPlacement: 'top',
      },
      {
        id: 'ts-sma-inspector',
        targetId: 'tour-ts-sma-inspector',
        title: 'Instant SMA Low-Pass Filter',
        badge: 'DSP Engine',
        category: 'Noise Attenuation',
        description:
          'Applies real-time client-side Simple Moving Average smoothing across any selected metric. Use the quick presets (1h raw to 72h synoptic) to eliminate micro-turbulent noise or filter diurnal heating cycles.',
        tip: 'Click "How to Use" on the inspector card to reveal the complete 3-step workflow, meteorological dynamics, and DSP math.',
        preferredPlacement: 'top',
      },
      {
        id: 'ts-corr-inspector',
        targetId: 'tour-ts-corr-inspector',
        title: 'Instant Bivariate Correlation Filter',
        badge: 'Regression Engine',
        category: 'Statistical Kinematics',
        description:
          'Calculates instantaneous Pearson correlation (r), coefficient of determination (R²), covariance, and ordinary least-squares regression slopes (β₁) between any two atmospheric parameters at 60fps.',
        tip: 'Check "How to Use" to explore real-world atmospheric thermodynamic couplings like Temperature vs Relative Humidity (r ≈ -0.8).',
        preferredPlacement: 'top',
      },
    ],
  },


  correlation: {
    id: 'correlation',
    title: 'Pearson Bivariate Correlation',
    badge: 'Statistical Kinematics',
    accentColor: '#ff6b6b', // Molten Coral
    guideButtonLabel: 'Pearson Guide',
    steps: [
      {
        id: 'corr-selectors',
        targetId: 'tour-corr-selectors',
        title: 'Independent (X) & Dependent (Y) Selectors',
        badge: 'Variables',
        category: 'Bivariate Pairing',
        description:
          'Select any two atmospheric metrics to test for statistical interdependence and empirical coupling—such as Ambient Temperature vs. Relative Humidity, or Surface Pressure vs. Wind Velocity.',
        tip: 'Choose parameters you hypothesize have a physical relationship to test if observation data confirms the theory.',
        preferredPlacement: 'bottom',
      },
      {
        id: 'corr-canvas',
        targetId: 'tour-corr-canvas',
        title: 'Scatter Plot & OLS Best-Fit Regression',
        badge: 'Scatter Canvas',
        category: 'Linear Modeling',
        description:
          'Each point represents an hourly paired observation (X, Y). The solid line represents the Ordinary Least Squares (OLS) best-fit regression line, while the shaded envelope displays the statistical confidence interval.',
        tip: 'Hover over any individual scatter point to inspect its timestamp, coordinate pair, and vertical residual deviation.',
        preferredPlacement: 'top',
      },
      {
        id: 'corr-latex',
        targetId: 'tour-corr-latex',
        title: 'Pearson Formula & Significance Breakdown',
        badge: 'Math Engine',
        category: 'LaTeX Formulas',
        description:
          'Displays the rigorous mathematical formula for Pearson\'s r, alongside the computed correlation coefficient r, coefficient of determination R², sample covariance, and p-value significance.',
        tip: 'An |r| > 0.7 indicates strong correlation, while p < 0.001 confirms the observed relationship is statistically significant.',
        preferredPlacement: 'top',
      },
    ],
  },

  wind: {
    id: 'wind',
    title: 'Polar Wind Rose',
    badge: 'Vector Kinematics',
    accentColor: '#1dd1a1', // Mint Seafoam
    guideButtonLabel: 'Wind Rose Guide',
    steps: [
      {
        id: 'wind-canvas',
        targetId: 'tour-wind-canvas',
        title: '16-Sector Polar Compass Dial',
        badge: 'Directional Dial',
        category: 'Spatial Binning',
        description:
          'Wind directions are binned into 16 cardinal and intercardinal compass sectors (N, NNE, NE, etc.). The length of each wedge indicates the percentage of total observation time wind blew from that direction.',
        tip: 'Hover over any colored wedge segment to inspect the exact frequency percentage and prevailing speed tier.',
        preferredPlacement: 'top',
      },
      {
        id: 'wind-legend',
        targetId: 'tour-wind-legend',
        title: 'Beaufort Speed Tiers & Frequency Rings',
        badge: 'Velocity Scales',
        category: 'Wind Speeds',
        description:
          'Concentric circles indicate cumulative frequency percentages (5%, 10%, 15%), while the color gradient categorizes wind velocity from light air (< 5 km/h) up to gale force (> 40 km/h).',
        tip: 'Compare the longest wedge against the color bar to immediately identify whether dominant winds are gentle breezes or storm gusts.',
        preferredPlacement: 'bottom',
      },
      {
        id: 'wind-latex',
        targetId: 'tour-wind-latex',
        title: 'Cartesian Vector Decomposition (u, v)',
        badge: 'Vector Math',
        category: 'Meteorological Trigonometry',
        description:
          'Meteorological wind is decomposed from polar coordinates (speed S, direction θ) into Cartesian orthogonal components: zonal wind u (East-West) and meridional wind v (North-South).',
        tip: 'Negative u represents easterly winds; negative v represents northerly winds (blowing from North toward South).',
        preferredPlacement: 'top',
      },
    ],
  },

  education: {
    id: 'education',
    title: 'Atmospheric Physics Reference',
    badge: 'Thermodynamic Theory',
    accentColor: '#feca57', // Solar Gold
    steps: [
      {
        id: 'physics-suite',
        targetId: 'tour-physics-suite',
        title: 'Atmospheric Physics Theory Suite',
        badge: 'Theory Overview',
        category: 'Physical Meteorology',
        description:
          'This workbench connects raw field telemetry with fundamental thermodynamic laws, atmospheric fluid dynamics, and solar radiative transfer equations governing Earth\'s boundary layer.',
        tip: 'Use these equations to verify real-world observations against theoretical thermodynamic principles.',
        preferredPlacement: 'bottom',
      },
      {
        id: 'physics-clausius',
        targetId: 'tour-physics-clausius',
        title: 'Clausius-Clapeyron & Moisture Capacity',
        badge: 'Phase Equilibrium',
        category: 'Moisture Thermodynamics',
        description:
          'Models saturation vapor pressure as an exponential function of temperature. Explains why relative humidity plummets during peak afternoon heating even when absolute moisture is constant.',
        tip: 'Tetens parameterization calculates es(T); when ambient temperature approaches dew point, relative humidity reaches 100%.',
        preferredPlacement: 'top',
      },
      {
        id: 'physics-kinematics',
        targetId: 'tour-physics-kinematics',
        title: 'Kinematics & Vector Wind Averaging',
        badge: 'Vector Kinematics',
        category: 'Dynamic Meteorology',
        description:
          'Overcomes the 0°/360° modular compass singularity by decomposing polar wind velocity into Cartesian zonal (U, East-West) and meridional (V, North-South) vectors to conserve true atmospheric momentum.',
        tip: 'Direct arithmetic averaging of azimuth angles near North creates false reversed vectors (e.g. 350° and 10° averaging to 180° South). Vector averaging guarantees physical fidelity.',
        preferredPlacement: 'top',
      },
      {
        id: 'physics-fronts',
        targetId: 'tour-physics-fronts',
        title: 'Baroclinic Fronts & Hydrostatic Dipoles',
        badge: 'Hydrostatic Balance',
        category: 'Synoptic Dynamics',
        description:
          'Integrates density under hydrostatic balance (dP = -ρ g dz) to explain why polar outbreaks surge barometric pressure while ambient temperatures collapse.',
        tip: 'Cold arctic air has higher density than warm air, creating distinct inverse pressure-temperature dipoles during cold frontal passages.',
        preferredPlacement: 'top',
      },
      {
        id: 'physics-radiation',
        targetId: 'tour-physics-radiation',
        title: 'Solar Radiation & Energy Budget Balance',
        badge: 'Radiative Transfer',
        category: 'Solar Forcing',
        description:
          'Models surface energy equilibrium (Rnet = H + LE + G). Explains the characteristic 2-3 hour hysteresis phase lag between peak solar noon insolation and maximum ambient temperature.',
        tip: 'Notice how temperature continues climbing after solar noon until outgoing sensible, latent, and ground fluxes surpass incoming shortwave irradiance.',
        preferredPlacement: 'top',
      },
    ],
  },

  data: {
    id: 'data',
    title: 'Raw Data & Telemetry',
    badge: 'Data Warehouse',
    accentColor: '#a29bfe', // Royal Amethyst
    guideButtonLabel: 'Raw Data Guide',
    steps: [
      {
        id: 'data-toolbar',
        targetId: 'tour-data-toolbar',
        title: 'Search & Column Filtering Controls',
        badge: 'Query Engine',
        category: 'Search & Pagination',
        description:
          'Filter through thousands of synchronized meteorological records by timestamp, date range, or threshold values. Supports instant keyword matching and pagination.',
        tip: 'Type a specific date (e.g. "2026-09") to immediately isolate historical storm sequences.',
        preferredPlacement: 'bottom',
      },
      {
        id: 'data-table',
        targetId: 'tour-data-table',
        title: 'High-Throughput Telemetry Table',
        badge: 'SQLite Records',
        category: 'Observation Rows',
        description:
          'Tabular view of all validated sensor records ingested from Open-Meteo into the local SQLite database. Displays timestamps, temperatures, humidity, barometric pressure, and wind vectors.',
        tip: 'Click any column header to toggle ascending or descending sorting on that specific parameter.',
        preferredPlacement: 'top',
      },
      {
        id: 'data-export',
        targetId: 'tour-data-export',
        title: 'Direct CSV Export & Data Portability',
        badge: 'Export Tools',
        category: 'Data Extraction',
        description:
          'Export the currently filtered table records directly to standard CSV format for external analysis in Python, pandas, R, MATLAB, or spreadsheets.',
        tip: 'Exported CSVs maintain strict ISO 8601 UTC timestamps and SI scientific units.',
        preferredPlacement: 'bottom',
      },
    ],
  },
};
