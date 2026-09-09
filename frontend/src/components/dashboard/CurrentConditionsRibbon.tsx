import React from 'react';
import { WeatherReading } from '../../types';
import {
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  Sun,
  TrendingUp,
  TrendingDown,
  Minus,
  Navigation,
} from 'lucide-react';
import { ScientificTooltip } from '../education/ScientificTooltip';

interface CurrentConditionsRibbonProps {
  readings: WeatherReading[];
  cityName?: string;
  timezone?: string;
}

export const CurrentConditionsRibbon: React.FC<CurrentConditionsRibbonProps> = ({
  readings,
  cityName,
  timezone,
}) => {
  if (!readings || readings.length === 0) {
    return null;
  }

  // Pick the latest observation (or the reading closest to current epoch)
  const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp);
  const latest = sorted[0];

  // Calculate 3-hour pressure tendency (dP/3h)
  const threeHoursAgoEpoch = latest.timestamp - 3 * 3600;
  const pastReading = sorted.find((r) => r.timestamp <= threeHoursAgoEpoch) || sorted[sorted.length - 1];
  const deltaP =
    latest.surface_pressure !== null && pastReading.surface_pressure !== null
      ? +(latest.surface_pressure - pastReading.surface_pressure).toFixed(1)
      : 0;

  const getPressureTendencyIcon = (dp: number) => {
    if (dp > 0.5) return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
    if (dp < -0.5) return <TrendingDown className="w-3.5 h-3.5 text-rose-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getPressureTendencyText = (dp: number) => {
    if (dp > 0.5) return `+${dp} hPa / 3h (Rising)`;
    if (dp < -0.5) return `${dp} hPa / 3h (Falling)`;
    return `${dp >= 0 ? '+' : ''}${dp} hPa / 3h (Steady)`;
  };

  const getHumidityCategory = (rh: number | null) => {
    if (rh === null) return 'N/A';
    if (rh < 30) return 'Arid / Dry';
    if (rh <= 60) return 'Comfortable';
    if (rh <= 80) return 'Humid';
    return 'Near Saturation';
  };

  const getCardinalDirection = (deg: number | null): string => {
    if (deg === null) return 'N/A';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(((deg % 360) / 22.5)) % 16;
    return directions[idx];
  };

  return (
    <div
      className="relative z-30 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur flex flex-col gap-4"
      data-testid="current-conditions-ribbon"
    >
      {/* Station Title & Observation Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider font-semibold">
            Latest Telemetry Observation:
          </span>
          <span className="text-cyan-300 font-bold">{cityName || 'Active Station'}</span>
          {timezone && <span className="text-slate-500">({timezone})</span>}
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Timestamp: <b className="text-slate-200">{latest.time_iso.replace('T', ' ')}</b>
        </div>
      </div>

      {/* Grid of 5 Atmospheric Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Temperature & Apparent Feel */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between min-h-[120px] hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>Ambient Temp</span>
            </span>
            <ScientificTooltip
              title="Ambient & Apparent Temperature"
              content="2m dry-bulb air temperature alongside apparent perceived temperature factoring humidity and wind chill."
              formula="T_{\text{apparent}} = T + 0.33 e - 0.70 v - 4.0"
              citation="Ahrens (2018)"
              position="bottom"
              align="left"
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {latest.temperature_2m !== null ? `${latest.temperature_2m.toFixed(1)}°C` : 'N/A'}
            </span>
            {latest.apparent_temperature !== null && (
              <span className="text-xs font-mono text-slate-400">
                Feels {latest.apparent_temperature.toFixed(1)}°C
              </span>
            )}
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            Dewpoint: {latest.dewpoint_2m !== null ? `${latest.dewpoint_2m.toFixed(1)}°C` : 'N/A'}
          </div>
        </div>

        {/* 2. Relative Humidity */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between min-h-[120px] hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Relative Humidity</span>
            </span>
            <ScientificTooltip
              title="Relative Humidity (RH)"
              content="Ratio of actual vapor pressure to saturation vapor pressure at current temperature."
              formula="\text{RH} = \frac{e(T_d)}{e_s(T)} \times 100\%"
              citation="Ahrens (2018)"
              position="bottom"
              align="left"
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-sky-400">
              {latest.relative_humidity !== null ? `${Math.round(latest.relative_humidity)}%` : 'N/A'}
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-400">
            Status: <span className="text-slate-300 font-semibold">{getHumidityCategory(latest.relative_humidity)}</span>
          </div>
        </div>

        {/* 3. Surface Pressure & Tendency */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between min-h-[120px] hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Surface Pressure</span>
            </span>
            <ScientificTooltip
              title="Barometric Pressure & Tendency"
              content="Local atmospheric weight at station surface level and 3-hour pressure trend indicative of synoptic fronts."
              formula="\Delta P = P(t) - P(t - 3\text{h})"
              citation="Holton & Hakim (2012)"
              position="bottom"
              align="center"
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {latest.surface_pressure !== null ? `${latest.surface_pressure.toFixed(1)}` : 'N/A'}
            </span>
            <span className="text-xs font-mono text-slate-500">hPa</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-400 flex items-center gap-1">
            {getPressureTendencyIcon(deltaP)}
            <span>{getPressureTendencyText(deltaP)}</span>
          </div>
        </div>

        {/* 4. Wind Speed & Vector Azimuth */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between min-h-[120px] hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wind Velocity</span>
            </span>
            <ScientificTooltip
              title="10m Wind Speed & Azimuth Vector"
              content="Horizontal wind flow speed and meteorological azimuth (direction from which the wind originates)."
              formula="U = -\text{spd} \cdot \sin\theta, \; V = -\text{spd} \cdot \cos\theta"
              citation="Wallace & Hobbs (2006)"
              position="bottom"
              align="right"
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {latest.wind_speed_10m !== null ? `${latest.wind_speed_10m.toFixed(1)}` : 'N/A'}
            </span>
            <span className="text-xs font-mono text-slate-500">km/h</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
            {latest.wind_direction_10m !== null && (
              <Navigation
                className="w-3 h-3 text-emerald-400"
                style={{ transform: `rotate(${latest.wind_direction_10m}deg)` }}
              />
            )}
            <span>
              {getCardinalDirection(latest.wind_direction_10m)} (
              {latest.wind_direction_10m !== null ? `${Math.round(latest.wind_direction_10m)}°` : 'N/A'}
              )
            </span>
          </div>
        </div>

        {/* 5. Solar Radiation & UV Index */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between min-h-[120px] hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Solar Forcing</span>
            </span>
            <ScientificTooltip
              title="Global Horizontal Solar Irradiance"
              content="Shortwave solar radiative flux at the surface driving boundary layer turbulent heat fluxes."
              formula="R_{\text{net}} = S_\downarrow (1 - \alpha) + L_{\text{net}}"
              citation="Stull (1988)"
              position="bottom"
              align="right"
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {latest.shortwave_radiation !== null ? `${Math.round(latest.shortwave_radiation)}` : '0'}
            </span>
            <span className="text-xs font-mono text-slate-500">W/m²</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-400">
            UV Index: <span className="text-amber-300 font-semibold">{latest.uv_index !== null ? latest.uv_index.toFixed(1) : '0.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentConditionsRibbon;
