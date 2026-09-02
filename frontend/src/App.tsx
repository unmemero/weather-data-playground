import React from 'react';
import { CloudRain, Compass, Activity, BookOpen, RefreshCw, MapPin } from 'lucide-react';
import { WeatherProvider, useWeather } from './context/WeatherContext';

const MainLayout: React.FC = () => {
  const { activeLocation, timeseriesData, correlationData, windRoseData, isLoading, isSyncing, syncNow } =
    useWeather();

  const readingCount = timeseriesData?.readings?.length || 0;
  const pearsonR = correlationData?.stats?.pearson_r;
  const windResultant = windRoseData?.resultant_direction;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Meteorology Lab & Timeseries Workbook
            </h1>
            <p className="text-xs text-slate-400">Interactive Atmospheric Physics & Statistical Workbench</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeLocation ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-slate-200">{activeLocation.name}</span>
              <span className="text-slate-400">({activeLocation.country})</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">No active station selected</div>
          )}

          <button
            onClick={() => syncNow()}
            disabled={isSyncing || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-xs font-medium text-cyan-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Station'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Activity className="w-5 h-5" />
              <span>Bivariate Correlation</span>
            </div>
            {pearsonR !== undefined && (
              <span className="text-xs px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-300 font-mono">
                r = {pearsonR}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">Pearson r correlation, linear regression, and animated LaTeX equations.</p>
          <div className="text-xs text-slate-500 mt-auto">
            {readingCount > 0 ? `${readingCount} observation points loaded` : 'Awaiting station telemetry...'}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Compass className="w-5 h-5" />
              <span>Wind Vector Analysis</span>
            </div>
            {windResultant !== undefined && (
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 font-mono">
                {windResultant}°
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">Trigonometric polar vector decomposition and 16-sector compass rose.</p>
          <div className="text-xs text-slate-500 mt-auto">
            {windRoseData?.mean_speed ? `Mean speed: ${windRoseData.mean_speed} km/h` : 'Polar math ready'}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <BookOpen className="w-5 h-5" />
              <span>Synoptic Case Studies</span>
            </div>
          </div>
          <p className="text-sm text-slate-400">Historical severe weather events and multi-series timeline comparisons.</p>
          <div className="text-xs text-slate-500 mt-auto">
            ERA5 Reanalysis integration enabled
          </div>
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WeatherProvider>
      <MainLayout />
    </WeatherProvider>
  );
};

export default App;
