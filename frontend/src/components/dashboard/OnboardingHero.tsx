import React from 'react';
import { Search, Sparkles, MapPin, Layers, Activity, Compass, BookOpen } from 'lucide-react';
import { Location } from '../../types';
import { MeteorologyLogo } from '../common/MeteorologyLogo';

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
      <div className="flex flex-col items-center gap-5">
        <MeteorologyLogo size={68} />
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-[#48dbfb] to-[#1dd1a1] bg-clip-text text-transparent">
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
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0abde3] to-[#48dbfb] hover:brightness-110 text-slate-950 font-bold rounded-2xl text-sm shadow-xl shadow-[#0abde3]/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>Search & Configure Weather Station</span>
        </button>
      </div>

      {/* Quick-Start Presets */}
      <div className="flex flex-col items-center gap-3 w-full">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#feca57]" />
          <span>Or Quick-Start With a Benchmark Station:</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
          {PRESET_STATIONS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onSelectPreset(preset)}
              disabled={isLoading}
              className="flex items-center gap-2.5 p-3.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-[#0abde3]/40 rounded-xl text-left transition-all group disabled:opacity-50"
            >
              <div className="p-1.5 bg-[#0abde3]/10 text-[#48dbfb] rounded-lg group-hover:bg-[#0abde3]/20 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-[#48dbfb] transition-colors truncate">
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
          <div className="flex items-center gap-1.5 text-[#48dbfb] text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Dual-Y Timeseries</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Multi-metric plotting with live SMA low-pass filter curve.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-1.5 text-[#ff6b6b] text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Pearson & Regression</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Scatter plot with interactive LaTeX deviation products.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-1.5 text-[#1dd1a1] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Polar Wind Rose</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            16-cardinal sector binning and resultant vector flow angle.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="flex items-center gap-1.5 text-[#feca57] text-xs font-semibold">
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
