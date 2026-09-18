import React, { useState } from 'react';
import { WeatherReading } from '../../types';
import { useLivePearson } from '../../hooks/useLiveCalculations';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GitCommit,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface CorrelationFilterInspectorProps {
  readings: WeatherReading[];
  defaultX?: keyof WeatherReading;
  defaultY?: keyof WeatherReading;
}

export const CorrelationFilterInspector: React.FC<CorrelationFilterInspectorProps> = ({
  readings,
  defaultX = 'temperature_2m',
  defaultY = 'relative_humidity',
}) => {
  const [xField, setXField] = useState<keyof WeatherReading>(defaultX);
  const [yField, setYField] = useState<keyof WeatherReading>(defaultY);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'workflow' | 'meteorology' | 'math'>('workflow');

  const livePearson = useLivePearson(readings, xField, yField);

  // Classify correlation strength and nature
  const getCorrelationStrength = (r: number | null | undefined) => {
    if (r === null || r === undefined) return { label: 'Insufficient Data', color: '#94a3b8' };
    const absR = Math.abs(r);
    if (absR >= 0.7) {
      return {
        label: r > 0 ? 'Strong Positive Coupling' : 'Strong Inverse Coupling',
        color: r > 0 ? '#1dd1a1' : '#ff6b6b',
      };
    }
    if (absR >= 0.35) {
      return {
        label: r > 0 ? 'Moderate Positive Association' : 'Moderate Inverse Association',
        color: '#feca57',
      };
    }
    return { label: 'Weak / Orthogonal (Uncoupled)', color: '#a0aec0' };
  };

  const strength = getCorrelationStrength(livePearson.stats?.pearson_r);
  const rVal = livePearson.stats?.pearson_r;
  const rSquared = rVal !== null && rVal !== undefined ? Math.round(rVal * rVal * 100) : null;

  return (
    <div
      id="tour-ts-corr-inspector"
      className="glass-panel rounded-2xl border border-slate-800/80 p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md transition-all duration-200"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#ff6b6b]/15 border border-[#ff6b6b]/30 text-[#ff6b6b]">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Instant Bivariate Correlation Filter</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] font-semibold">
                Regression Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Bivariate covariance, least-squares slope & Pearson coefficient
            </p>
          </div>
        </div>

        {/* How to Use Guide Toggle Button */}
        <button
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-150 border ${
            isGuideOpen
              ? 'bg-[#ff6b6b]/20 border-[#ff6b6b]/50 text-[#ff6b6b]'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          title="Toggle How to Use Guide"
          data-testid="corr-guide-toggle-btn"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>How to Use</span>
          {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Controls & Live Statistics Readout */}
      <div className="flex flex-col gap-4 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
        {/* Metric Variable Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#48dbfb]" />
              <span className="uppercase text-[10px] tracking-wider font-semibold">Independent Variable (X):</span>
            </span>
            <select
              value={xField}
              onChange={(e) => setXField(e.target.value as keyof WeatherReading)}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#48dbfb] transition-colors"
            >
              <option value="temperature_2m">Temperature (°C)</option>
              <option value="surface_pressure">Surface Pressure (hPa)</option>
              <option value="wind_speed_10m">Wind Speed (km/h)</option>
              <option value="shortwave_radiation">Solar Radiation (W/m²)</option>
              <option value="dewpoint_2m">Dewpoint (°C)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff6b6b]" />
              <span className="uppercase text-[10px] tracking-wider font-semibold">Dependent Variable (Y):</span>
            </span>
            <select
              value={yField}
              onChange={(e) => setYField(e.target.value as keyof WeatherReading)}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#ff6b6b] transition-colors"
            >
              <option value="relative_humidity">Relative Humidity (%)</option>
              <option value="surface_pressure">Surface Pressure (hPa)</option>
              <option value="dewpoint_2m">Dewpoint (°C)</option>
              <option value="apparent_temperature">Apparent Temp (°C)</option>
              <option value="wind_speed_10m">Wind Speed (km/h)</option>
            </select>
          </div>
        </div>

        {/* Live Pearson Metric Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5"
              style={{
                color: strength.color,
                borderColor: `${strength.color}40`,
                backgroundColor: `${strength.color}15`,
              }}
            >
              {rVal !== null && rVal !== undefined && (
                rVal > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : rVal < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />
              )}
              <span>{strength.label}</span>
            </span>

            {rSquared !== null && (
              <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                R² = <b className="text-slate-200">{rSquared}%</b> variance
              </span>
            )}
          </div>

          {livePearson.stats && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ff6b6b]/15 border border-[#ff6b6b]/30 rounded-lg shadow-sm">
              <span className="text-slate-400 text-[11px]">Pearson:</span>
              <span className="text-sm font-bold text-[#ff6b6b]">
                r = {livePearson.stats.pearson_r}
              </span>
            </div>
          )}
        </div>

        {/* Linear Regression Matrix */}
        {livePearson.stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Slope (β₁):</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5">
                {livePearson.stats.regression_slope}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Intercept (β₀):</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5">
                {livePearson.stats.regression_intercept}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Covariance:</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5">
                {livePearson.stats.covariance}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Sample (N):</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>{livePearson.stats.sample_size}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono italic py-2">
            Insufficient paired observations for linear regression.
          </div>
        )}
      </div>

      {/* Interactive "How to Use" Guide Panel */}
      {isGuideOpen && (
        <div className="rounded-xl bg-slate-950/80 border border-[#ff6b6b]/30 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-inner">
          {/* Guide Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveGuideTab('workflow')}
              className={`text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                activeGuideTab === 'workflow'
                  ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] font-bold border border-[#ff6b6b]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. How to Use
            </button>
            <button
              onClick={() => setActiveGuideTab('meteorology')}
              className={`text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                activeGuideTab === 'meteorology'
                  ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] font-bold border border-[#ff6b6b]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Meteorological Coupling
            </button>
            <button
              onClick={() => setActiveGuideTab('math')}
              className={`text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                activeGuideTab === 'math'
                  ? 'bg-[#ff6b6b]/20 text-[#ff6b6b] font-bold border border-[#ff6b6b]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Regression Math
            </button>
          </div>

          {/* Tab 1: Workflow */}
          {activeGuideTab === 'workflow' && (
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-sans leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ff6b6b]/20 text-[#ff6b6b] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-white">Select Driver (X) & Response (Y):</strong> Choose your independent causal variable (e.g. Solar Radiation or Temperature) and the dependent atmospheric response (e.g. Relative Humidity).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ff6b6b]/20 text-[#ff6b6b] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-white">Read Pearson r:</strong> Check whether $r$ is close to $+1.0$ (proportional increase), $-1.0$ (inverse relationship), or $0.0$ (independent variables).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ff6b6b]/20 text-[#ff6b6b] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-white">Inspect Slope (β₁) & R²:</strong> The slope reveals the physical rate of change ($ΔY / ΔX$), while $R^2$ gives the percentage of variation in $Y$ explained by $X$.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Meteorology */}
          {activeGuideTab === 'meteorology' && (
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-sans leading-relaxed">
              <p>
                In atmospheric thermodynamics, many variables share strong physical couplings governed by saturation vapor pressure and radiative transfer:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[#ff6b6b] font-bold">Temp vs. Relative Humidity (r ≈ -0.7 to -0.9)</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    Clausius-Clapeyron relation: Warmer air has exponentially higher saturation capacity ($e_s(T)$), so RH drops as temperature climbs even when total vapor content is constant.
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[#1dd1a1] font-bold">Solar Radiation vs. Temperature (r ≈ +0.5 to +0.8)</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    Shortwave insolation directly heats the planetary boundary layer, producing a positively coupled thermal response with a 1-2 hour thermal inertia lag.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Math */}
          {activeGuideTab === 'math' && (
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-mono leading-relaxed">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400 text-[11px]">Pearson Product-Moment Correlation (r):</span>
                <div className="text-[#ff6b6b] font-bold text-sm">
                  r = ∑((x - x̄)(y - ȳ)) / [ √(∑(x - x̄)²) · √(∑(y - ȳ)²) ]
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400 text-[11px]">Ordinary Least Squares Linear Regression:</span>
                <div className="text-slate-200 font-bold text-xs">
                  ŷ = β₁ · x + β₀ &nbsp;|&nbsp; β₁ = Cov(X,Y) / Var(X)
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-1">
                  $R^2 = r^2$ indicates the proportion of total variance in the dependent variable explained by the linear model.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrelationFilterInspector;
