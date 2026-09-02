import React, { useState } from 'react';
import {
  CloudRain,
  Compass,
  Activity,
  BookOpen,
  RefreshCw,
  MapPin,
  FileSpreadsheet,
  Layers,
  Sparkles,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { TimeseriesChart, MetricKey } from './components/charts/TimeseriesChart';
import { CorrelationScatterChart } from './components/charts/CorrelationScatterChart';
import { WindRoseChart } from './components/charts/WindRoseChart';
import { CorrelationLatexBox } from './components/latex/CorrelationLatexBox';
import { WindVectorLatexBox } from './components/latex/WindVectorLatexBox';
import { LiveStatsInspector } from './components/controls/LiveStatsInspector';
import { MeteorologyExplanationCard } from './components/education/MeteorologyExplanationCard';
import { CurrentConditionsRibbon } from './components/dashboard/CurrentConditionsRibbon';
import { OnboardingHero } from './components/dashboard/OnboardingHero';
import { CitySearchModal } from './components/modals/CitySearchModal';
import { CaseStudyModal } from './components/modals/CaseStudyModal';
import { CsvModal } from './components/modals/CsvModal';
import { ScatterPoint } from './types';

type ActiveTab = 'timeseries' | 'correlation' | 'wind' | 'education';

const MainLayout: React.FC = () => {
  const {
    locations,
    activeLocation,
    timeseriesData,
    correlationData,
    windRoseData,
    caseStudies,
    selectedRange,
    selectedSeriesId,
    correlationX,
    correlationY,
    isLoading,
    isSyncing,
    error,
    syncNow,
    setRange,
    setCorrelationVariables,
    selectCity,
    selectSeries,
    clearError,
  } = useWeather();

  const [activeTab, setActiveTab] = useState<ActiveTab>('timeseries');

  // Modals
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Live Chart Hover Synchronizers
  const [hoveredScatterPoint, setHoveredScatterPoint] = useState<ScatterPoint | null>(null);
  const [hoveredWindSpeed, setHoveredWindSpeed] = useState<number | null>(null);
  const [hoveredWindDir, setHoveredWindDir] = useState<number | null>(null);

  const readings = timeseriesData?.readings || [];
  const scatterPoints = correlationData?.points || [];
  const correlationStats = correlationData?.stats || null;

  const hasStaleStudies = caseStudies.some((c) => c.is_stale);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Header Toolbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-md">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent leading-tight">
              Meteorology Lab & Timeseries Workbook
            </h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>Interactive Atmospheric Physics Workbench</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">SQLite WAL Stream</span>
            </p>
          </div>
        </div>

        {/* Station Profile & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Station Button */}
          <button
            onClick={() => setIsCityModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              activeLocation
                ? 'bg-slate-900 border-slate-700 hover:border-cyan-500/60 text-slate-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
            }`}
            data-testid="station-selector-btn"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            {activeLocation ? (
              <span className="font-mono">
                {activeLocation.name} <span className="text-slate-500">({activeLocation.country})</span>
              </span>
            ) : (
              <span>Select Weather Station</span>
            )}
          </button>

          {/* Sync Now Button */}
          <button
            onClick={() => syncNow()}
            disabled={isSyncing || isLoading || !activeLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs font-semibold text-cyan-400 transition-colors disabled:opacity-40"
            title="Trigger manual hourly catch-up synchronization & retention purge"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Station'}</span>
          </button>

          {/* Case Studies Button */}
          <button
            onClick={() => setIsCaseStudyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Case Studies</span>
            {caseStudies.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full font-mono font-bold">
                {caseStudies.length}
              </span>
            )}
            {hasStaleStudies && (
              <span title="Stale case studies present">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
              </span>
            )}
          </button>

          {/* CSV Portability Button */}
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-300 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Portability</span>
          </button>
        </div>
      </header>

      {/* 2. Notifications & Historical Banner */}
      {selectedSeriesId && (
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border-b border-amber-500/40 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              Viewing Historical Synoptic Event: <b className="text-white">{selectedSeriesId}</b>
            </span>
          </div>
          <button
            onClick={() => selectSeries(null)}
            className="px-2.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-[11px] font-semibold transition-colors"
          >
            Exit to Live Automated Stream
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/50 border-b border-rose-500/40 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-rose-200">
          <span>{error}</span>
          <button onClick={clearError} className="text-rose-400 hover:text-rose-200">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Empty State or Dashboard Tabs */}
      {!activeLocation && locations.length === 0 && !isLoading ? (
        <main className="flex-1 flex items-center justify-center p-6">
          <OnboardingHero
            onOpenSearch={() => setIsCityModalOpen(true)}
            onSelectPreset={(preset) => selectCity({ location: preset })}
            isLoading={isLoading}
          />
        </main>
      ) : (
        <>
          {/* Navigation Tab Bar */}
          <nav className="border-b border-slate-800 bg-slate-900/40 px-6">
            <div className="max-w-7xl mx-auto flex gap-6">
              <button
                onClick={() => setActiveTab('timeseries')}
                className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'timeseries'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Timeseries & Dual-Y Explorer</span>
              </button>

              <button
                onClick={() => setActiveTab('correlation')}
                className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'correlation'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Bivariate Pearson & Regression</span>
              </button>

              <button
                onClick={() => setActiveTab('wind')}
                className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'wind'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Polar Wind Rose & Vector Math</span>
              </button>

              <button
                onClick={() => setActiveTab('education')}
                className={`py-3 text-xs font-mono font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'education'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Atmospheric Physics Reference</span>
              </button>
            </div>
          </nav>

          {/* Main Tab Panes */}
          <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
            {/* Live Observation Conditions Ribbon */}
            <CurrentConditionsRibbon
              readings={readings}
              cityName={activeLocation?.name}
              timezone={activeLocation?.timezone}
            />

            {/* TAB 1: Timeseries Explorer */}
            {activeTab === 'timeseries' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <TimeseriesChart
                  readings={readings}
                  backendSmoothed={timeseriesData?.smoothed}
                  selectedRange={selectedRange}
                  onRangeChange={setRange}
                />
                <LiveStatsInspector readings={readings} />
              </div>
            )}

            {/* TAB 2: Bivariate Correlation */}
            {activeTab === 'correlation' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                {/* Metric Variable Pickers */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider font-semibold">
                      Correlation Variables:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">X:</span>
                      <select
                        value={correlationX}
                        onChange={(e) => setCorrelationVariables(e.target.value, correlationY)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none"
                      >
                        <option value="temperature_2m">Temperature (2m)</option>
                        <option value="dewpoint_2m">Dewpoint (2m)</option>
                        <option value="surface_pressure">Surface Pressure</option>
                        <option value="wind_speed_10m">Wind Speed</option>
                        <option value="shortwave_radiation">Solar Radiation</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">Y:</span>
                      <select
                        value={correlationY}
                        onChange={(e) => setCorrelationVariables(correlationX, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none"
                      >
                        <option value="relative_humidity">Relative Humidity</option>
                        <option value="surface_pressure">Surface Pressure</option>
                        <option value="apparent_temperature">Apparent Temp</option>
                        <option value="wind_speed_10m">Wind Speed</option>
                      </select>
                    </div>
                  </div>

                  {correlationStats && (
                    <div className="text-xs font-mono text-slate-400">
                      Calculated over <b className="text-slate-200">{correlationStats.sample_size}</b> paired observations
                    </div>
                  )}
                </div>

                {/* Scatter Plot & Trendline */}
                <CorrelationScatterChart
                  stats={correlationStats}
                  points={scatterPoints}
                  xMetric={correlationX as MetricKey}
                  yMetric={correlationY as MetricKey}
                  onHoverPoint={setHoveredScatterPoint}
                />

                {/* Mathematical Equation & Decomposition Box */}
                <CorrelationLatexBox
                  stats={correlationStats}
                  hoveredPoint={hoveredScatterPoint}
                  xLabel={correlationX}
                  yLabel={correlationY}
                />
              </div>
            )}

            {/* TAB 3: Polar Wind Rose */}
            {activeTab === 'wind' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <WindRoseChart
                  stats={windRoseData}
                  onHoverSector={(spd, dir) => {
                    setHoveredWindSpeed(spd);
                    setHoveredWindDir(dir);
                  }}
                />
                <WindVectorLatexBox
                  stats={windRoseData}
                  hoveredSpeed={hoveredWindSpeed}
                  hoveredDirection={hoveredWindDir}
                />
              </div>
            )}

            {/* TAB 4: Educational Atmospheric Physics */}
            {activeTab === 'education' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <MeteorologyExplanationCard />
              </div>
            )}
          </main>
        </>
      )}

      {/* 5. Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 px-6 py-4 mt-auto text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between gap-4">
        <div>
          Meteorology Lab & Timeseries Workbook • Open-Meteo Reanalysis & Ingestion Pipeline
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Retention: 2-Year Rolling Cap</span>
          <span>•</span>
          <span>Cases: Permanent Archive</span>
        </div>
      </footer>

      {/* Modals */}
      <CitySearchModal isOpen={isCityModalOpen} onClose={() => setIsCityModalOpen(false)} />
      <CaseStudyModal isOpen={isCaseStudyModalOpen} onClose={() => setIsCaseStudyModalOpen(false)} />
      <CsvModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} />
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
