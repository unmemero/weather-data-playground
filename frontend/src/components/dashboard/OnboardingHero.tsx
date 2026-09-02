import React from 'react';
import { CloudRain, Search, Sparkles, MapPin, Layers, Activity, Compass, BookOpen } from 'lucide-react';
import { Location } from '../../types';

interface OnboardingHeroProps {
  onOpenSearch: () => void;
  onSelectPreset: (loc: Location) => void;
  isLoading?: boolean;
}

const PRESET_STATIONS: Location[] = [
  {
    id: null,
    name: 'Austin',
    admin1: 'Texas',
    country: 'United States',
    latitude: 30.26,
    longitude: -97.74,
    timezone: 'America/Chicago',
    is_active: false,
    created_at: 0,
  },
  {
    id: null,
    name: 'London',
    admin1: 'England',
    country: 'United Kingdom',
    latitude: 51.50,
    longitude: -0.12,
    timezone: 'Europe/London',
    is_active: false,
    created_at: 0,
  },
  {
    id: null,
    name: 'Tokyo',
    admin1: 'Tokyo',
    country: 'Japan',
    latitude: 35.68,
    longitude: 139.69,
    timezone: 'Asia/Tokyo',
    is_active: false,
    created_at: 0,
  },
  {
    id: null,
    name: 'Reykjavik',
    admin1: 'Capital Region',
    country: 'Iceland',
    latitude: 64.14,
    longitude: -21.94,
    timezone: 'Atlantic/Reykjavik',
    is_active: false,
    created_at: 0,
  },
];

export const OnboardingHero: React.FC<OnboardingHeroProps> = ({
  onOpenSearch,
  onSelectPreset,
  isLoading,
}) => {
  return (
    <div
      className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur flex flex-col items-center text-center max-w-4xl mx-auto my-auto gap-8 animate-in fade-in duration-300"
      data-testid="onboarding-hero"
    >
      {/* Icon & Title */}
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 rounded-3xl text-cyan-400 shadow-xl ring-8 ring-cyan-500/5">
          <CloudRain className="w-12 h-12" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
            Welcome to Meteorology Lab & Timeseries Workbook
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Select or search for a weather station to initialize your high-precision atmospheric observation stream. The system will automatically backfill a 90-day baseline and synchronize live telemetry.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        <button
          onClick={onOpenSearch}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold rounded-2xl text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>Search & Configure Weather Station</span>
        </button>
      </div>

      {/* Quick-Start Presets */}
      <div className="flex flex-col items-center gap-3 w-full">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Or Quick-Start With a Benchmark Station:</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
          {PRESET_STATIONS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onSelectPreset(preset)}
              disabled={isLoading}
              className="flex items-center gap-2.5 p-3.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl text-left transition-all group disabled:opacity-50"
            >
              <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 truncate">
                  {preset.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-6 border-t border-slate-800/80 text-left">
        <div className="flex flex-col gap-1 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Dual-Y Timeseries</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Multi-metric plotting with live SMA low-pass filter curve.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Pearson & Regression</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Scatter plot with interactive LaTeX deviation products.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Polar Wind Rose</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            16-cardinal sector binning and resultant vector flow angle.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ERA5 Case Studies</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Permanent archive of severe synoptic weather events.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingHero;
