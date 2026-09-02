import React, { useState } from 'react';
import { WeatherReading } from '../../types';
import { useLivePearson, useLiveSMA } from '../../hooks/useLiveCalculations';
import { Sliders, Zap, TrendingDown } from 'lucide-react';

interface LiveStatsInspectorProps {
  readings: WeatherReading[];
  defaultField?: keyof WeatherReading;
  defaultX?: keyof WeatherReading;
  defaultY?: keyof WeatherReading;
}

export const LiveStatsInspector: React.FC<LiveStatsInspectorProps> = ({
  readings,
  defaultField = 'temperature_2m',
  defaultX = 'temperature_2m',
  defaultY = 'relative_humidity',
}) => {
  const [smaField, setSmaField] = useState<keyof WeatherReading>(defaultField);
  const [smaWindow, setSmaWindow] = useState<number>(12);

  const [xField, setXField] = useState<keyof WeatherReading>(defaultX);
  const [yField, setYField] = useState<keyof WeatherReading>(defaultY);

  const livePearson = useLivePearson(readings, xField, yField);
  const liveSMA = useLiveSMA(readings, smaField, smaWindow);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-5 shadow-lg backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">
            Real-Time Statistical & Filter Inspector
          </span>
        </div>
        <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded">
          Client-Side 60fps Compute
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Live SMA Smoothing Controller */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Instant SMA Low-Pass Filter</span>
            </span>
            <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded">
              Window: {smaWindow}h
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Target Metric:</span>
              <select
                value={smaField}
                onChange={(e) => setSmaField(e.target.value as keyof WeatherReading)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs outline-none"
              >
                <option value="temperature_2m">Temperature (°C)</option>
                <option value="relative_humidity">Relative Humidity (%)</option>
                <option value="surface_pressure">Surface Pressure (hPa)</option>
                <option value="wind_speed_10m">Wind Speed (km/h)</option>
              </select>
            </div>

            {/* Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1h (Raw)</span>
                <span>24h (Diurnal)</span>
                <span>72h (Synoptic)</span>
              </div>
              <input
                type="range"
                min="1"
                max="72"
                value={smaWindow}
                onChange={(e) => setSmaWindow(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                data-testid="sma-slider"
              />
            </div>
          </div>

          {/* Variance Reduction Readout */}
          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80 mt-auto">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Noise Variance Attenuation:</span>
            </span>
            <span className="text-emerald-300 font-semibold">
              -{liveSMA.varianceReductionPct}%
            </span>
          </div>
        </div>

        {/* 2. Live Pearson r & Regression Sub-Domain Inspector */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Instant Bivariate Correlation Filter
            </span>
            {livePearson.stats && (
              <span className="text-xs font-mono px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded font-semibold">
                r = {livePearson.stats.pearson_r}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">X Metric:</span>
              <select
                value={xField}
                onChange={(e) => setXField(e.target.value as keyof WeatherReading)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs outline-none"
              >
                <option value="temperature_2m">Temperature</option>
                <option value="surface_pressure">Pressure</option>
                <option value="wind_speed_10m">Wind Speed</option>
                <option value="shortwave_radiation">Solar Radiation</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Y Metric:</span>
              <select
                value={yField}
                onChange={(e) => setYField(e.target.value as keyof WeatherReading)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs outline-none"
              >
                <option value="relative_humidity">Humidity</option>
                <option value="surface_pressure">Pressure</option>
                <option value="dewpoint_2m">Dewpoint</option>
                <option value="apparent_temperature">Apparent Temp</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          {livePearson.stats ? (
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2 rounded border border-slate-800 mt-auto">
              <div className="text-slate-400">
                Slope: <b className="text-slate-200">{livePearson.stats.regression_slope}</b>
              </div>
              <div className="text-slate-400">
                Intercept: <b className="text-slate-200">{livePearson.stats.regression_intercept}</b>
              </div>
              <div className="text-slate-400">
                Points: <b className="text-slate-200">{livePearson.stats.sample_size}</b>
              </div>
              <div className="text-slate-400">
                Cov: <b className="text-slate-200">{livePearson.stats.covariance}</b>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-2 mt-auto">
              Insufficient observation points for correlation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStatsInspector;
