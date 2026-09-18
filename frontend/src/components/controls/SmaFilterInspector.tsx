import React, { useState } from 'react';
import { WeatherReading } from '../../types';
import { useLiveSMA } from '../../hooks/useLiveCalculations';
import {
  Sliders,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Activity,
  BookOpen,
} from 'lucide-react';

interface SmaFilterInspectorProps {
  readings: WeatherReading[];
  defaultField?: keyof WeatherReading;
  defaultWindow?: number;
}

const PRESET_WINDOWS = [
  { hours: 1, label: '1h', desc: 'Raw Sensor Jitter' },
  { hours: 6, label: '6h', desc: 'Microscale Suppression' },
  { hours: 12, label: '12h', desc: 'Semi-Diurnal Tidal' },
  { hours: 24, label: '24h', desc: 'Diurnal Cycle Filter' },
  { hours: 48, label: '48h', desc: 'Mesoscale Synoptic' },
  { hours: 72, label: '72h', desc: 'Macro Synoptic Trend' },
];

export const SmaFilterInspector: React.FC<SmaFilterInspectorProps> = ({
  readings,
  defaultField = 'temperature_2m',
  defaultWindow = 12,
}) => {
  const [smaField, setSmaField] = useState<keyof WeatherReading>(defaultField);
  const [smaWindow, setSmaWindow] = useState<number>(defaultWindow);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'workflow' | 'meteorology' | 'math'>('workflow');

  const liveSMA = useLiveSMA(readings, smaField, smaWindow);

  // Classification of filter severity
  const getFilterClassification = (hours: number) => {
    if (hours <= 2) return { label: 'Near Raw Signal', color: '#a0aec0' };
    if (hours <= 12) return { label: 'Micro-Turbulence Attenuation', color: '#48dbfb' };
    if (hours <= 24) return { label: 'Diurnal Cycle Suppression', color: '#1dd1a1' };
    if (hours <= 48) return { label: 'Mesoscale Frontal Isolation', color: '#feca57' };
    return { label: 'Macro Synoptic Air Mass Trend', color: '#ff9f43' };
  };

  const filterClass = getFilterClassification(smaWindow);

  return (
    <div
      id="tour-ts-sma-inspector"
      className="glass-panel rounded-2xl border border-slate-800/80 p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md transition-all duration-200"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#1dd1a1]/15 border border-[#1dd1a1]/30 text-[#1dd1a1]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Instant SMA Low-Pass Filter</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1dd1a1]/10 border border-[#1dd1a1]/30 text-[#1dd1a1] font-semibold">
                DSP Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Frequency domain noise attenuation & rolling trend isolation
            </p>
          </div>
        </div>

        {/* How to Use Guide Toggle Button */}
        <button
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-150 border ${
            isGuideOpen
              ? 'bg-[#1dd1a1]/20 border-[#1dd1a1]/50 text-[#1dd1a1]'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          title="Toggle How to Use Guide"
          data-testid="sma-guide-toggle-btn"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>How to Use</span>
          {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Filter Controls */}
      <div className="flex flex-col gap-4 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
        {/* Metric Selector & Active Window Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Metric:</span>
            <select
              value={smaField}
              onChange={(e) => setSmaField(e.target.value as keyof WeatherReading)}
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#1dd1a1] transition-colors"
            >
              <option value="temperature_2m">Temperature (°C)</option>
              <option value="relative_humidity">Relative Humidity (%)</option>
              <option value="surface_pressure">Surface Pressure (hPa)</option>
              <option value="wind_speed_10m">Wind Speed (km/h)</option>
              <option value="shortwave_radiation">Solar Radiation (W/m²)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg border font-semibold"
              style={{
                color: filterClass.color,
                borderColor: `${filterClass.color}40`,
                backgroundColor: `${filterClass.color}15`,
              }}
            >
              {filterClass.label}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#1dd1a1]/15 border border-[#1dd1a1]/30 text-[#1dd1a1] rounded-lg shadow-sm">
              Window: {smaWindow}h
            </span>
          </div>
        </div>

        {/* Window Slider with Dynamic Track */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Filter Window Length (Rolling Sample Hours):</span>
            <span className="text-white font-bold">{smaWindow} hours</span>
          </div>

          <input
            type="range"
            min="1"
            max="72"
            value={smaWindow}
            onChange={(e) => setSmaWindow(parseInt(e.target.value, 10))}
            className="w-full accent-[#1dd1a1] h-2 bg-slate-800 rounded-lg cursor-pointer transition-all"
            data-testid="sma-slider"
          />

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
            {PRESET_WINDOWS.map((p) => (
              <button
                key={p.hours}
                onClick={() => setSmaWindow(p.hours)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-md text-[10px] font-mono transition-all border ${
                  smaWindow === p.hours
                    ? 'bg-[#1dd1a1]/25 border-[#1dd1a1] text-[#1dd1a1] font-bold shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={p.desc}
              >
                <span>{p.label}</span>
                <span className="text-[9px] opacity-75 hidden sm:inline">{p.desc.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Signal Telemetry & Attenuation Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[#1dd1a1]" />
                <span>Noise Attenuation:</span>
              </span>
              <span className="text-[#1dd1a1] font-bold text-sm">
                -{liveSMA.varianceReductionPct}%
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1dd1a1] to-[#2ed573] transition-all duration-300"
                style={{ width: `${Math.min(100, liveSMA.varianceReductionPct)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>Points Evaluated:</span>
              <b className="text-slate-200">{liveSMA.smoothedPoints.length}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive "How to Use" Guide Panel */}
      {isGuideOpen && (
        <div className="rounded-xl bg-slate-950/80 border border-[#1dd1a1]/30 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-inner">
          {/* Guide Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveGuideTab('workflow')}
              className={`text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                activeGuideTab === 'workflow'
                  ? 'bg-[#1dd1a1]/20 text-[#1dd1a1] font-bold border border-[#1dd1a1]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. How to Use
            </button>
            <button
              onClick={() => setActiveGuideTab('meteorology')}
              className={`text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                activeGuideTab === 'meteorology'
                  ? 'bg-[#1dd1a1]/20 text-[#1dd1a1] font-bold border border-[#1dd1a1]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Meteorological Dynamics
            </button>
            <button
              onClick={() => setActiveGuideTab('math')}
              className={`text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                activeGuideTab === 'math'
                  ? 'bg-[#1dd1a1]/20 text-[#1dd1a1] font-bold border border-[#1dd1a1]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. DSP Math
            </button>
          </div>

          {/* Tab 1: Workflow */}
          {activeGuideTab === 'workflow' && (
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-sans leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1dd1a1]/20 text-[#1dd1a1] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-white">Select Target Metric:</strong> Pick the atmospheric variable you want to isolate (e.g., Temperature, Humidity, or Wind Speed).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1dd1a1]/20 text-[#1dd1a1] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-white">Adjust Window Length (k):</strong> Drag the slider or click one of the quick presets to test different cutoff frequencies.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1dd1a1]/20 text-[#1dd1a1] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-white">Evaluate Noise Attenuation:</strong> Watch the variance reduction readout. Higher windows attenuate turbulent fluctuations to reveal long-term seasonal and frontal trends.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Meteorology */}
          {activeGuideTab === 'meteorology' && (
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-sans leading-relaxed">
              <p>
                Atmospheric sensor readings contain a mixture of <strong className="text-[#1dd1a1]">high-frequency turbulent micro-fluctuations</strong> (boundary layer thermals, wind gusts, sensor quantization noise) and <strong className="text-white">synoptic-scale meteorological trends</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[#48dbfb] font-bold">1h - 6h Window</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Suppresses sensor jitter while preserving the sharpest sunrise/sunset thermal gradients.</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[#1dd1a1] font-bold">24h Window</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Completely cancels the diurnal day-night heating cycle, revealing net advective warming or cooling.</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[#feca57] font-bold">48h - 72h Window</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Isolates continental airmass replacement and planetary Rossby wave passages.</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: DSP Math */}
          {activeGuideTab === 'math' && (
            <div className="flex flex-col gap-2 text-xs text-slate-300 font-mono leading-relaxed">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400 text-[11px]">Simple Moving Average Discrete Convolution:</span>
                <div className="text-[#1dd1a1] font-bold text-sm">
                  SMA_t = (1 / k) · ∑[i=0..k-1] x_(t - i)
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400 text-[11px]">Variance Reduction Percentage:</span>
                <div className="text-[#2ed573] font-bold text-sm">
                  Δσ² = ((σ²_raw - σ²_smooth) / σ²_raw) × 100%
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-1">
                  For white Gaussian noise, an average over k samples attenuates variance by a factor of 1/k.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmaFilterInspector;
