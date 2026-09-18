import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RefreshCw,
  MapPin,
  FileSpreadsheet,
  Sparkles,
  AlertTriangle,
  XCircle,
  Menu,
  Compass,
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
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuroraParticleCanvas } from './components/common/AuroraParticleCanvas';
import { MeteorologyLogo } from './components/common/MeteorologyLogo';
import { NavigationSidebar, ActiveTab } from './components/navigation/NavigationSidebar';
import { RawDataTable } from './components/data/RawDataTable';
import { PortalTour } from './components/tutorial/PortalTour';
import { ScatterPoint } from './types';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals & Interactive Tour
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-launch interactive onboarding tour on user's first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('weather_lab_tour_v1');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourClose = (completed: boolean) => {
    setIsTourOpen(false);
    if (completed) {
      localStorage.setItem('weather_lab_tour_v1', 'true');
    }
  };

  // Live Chart Hover Synchronizers
  const [hoveredScatterPoint, setHoveredScatterPoint] = useState<ScatterPoint | null>(null);
  const [hoveredWindSpeed, setHoveredWindSpeed] = useState<number | null>(null);
  const [hoveredWindDir, setHoveredWindDir] = useState<number | null>(null);

  const readings = timeseriesData?.readings || [];
  const scatterPoints = correlationData?.points || [];
  const correlationStats = correlationData?.stats || null;

  const hasStaleStudies = caseStudies.some((c) => c.is_stale);

  return (
    <div className="min-h-screen atmospheric-canvas text-slate-100 flex flex-col font-sans selection:bg-[#0abde3]/40 selection:text-white relative">
      {/* Dynamic Aurora Flow & Micro-Aerosol Stardust Canvas */}
      <AuroraParticleCanvas />

      {/* 1. Header Toolbar */}
      <header className="border-b border-white/[0.08] glass-panel sticky top-0 z-40 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle with Mobile Nav Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
            title="Open Workbenches Navigation"
            aria-label="Open Workbenches Navigation"
          >
            <Menu className="w-4 h-4 text-[#48dbfb]" />
          </button>

          <MeteorologyLogo size={40} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#48dbfb] bg-clip-text text-transparent leading-none">
                Meteorology Lab & Timeseries Workbook
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0abde3]/15 border border-[#0abde3]/30 text-[#48dbfb] font-semibold tracking-wider uppercase hidden sm:inline-block">
                v2.4 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-1">
              <span className="hidden sm:inline">Atmospheric Physics & Timeseries Workbench</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-[#1dd1a1] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1dd1a1] shadow-[0_0_8px_#1dd1a1] animate-pulse" />
                SQLite WAL Stream
              </span>
            </p>
          </div>
        </div>

        {/* Station Profile & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Station Button */}
          <button
            id="tour-station-selector"
            onClick={() => setIsCityModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 shadow-sm backdrop-blur-md ${
              activeLocation
                ? 'bg-slate-900/80 hover:bg-slate-800/90 border-white/10 hover:border-[#48dbfb]/40 text-slate-200 hover:shadow-[0_0_16px_rgba(72,219,251,0.15)]'
                : 'bg-[#ff6b6b]/15 border-[#ff6b6b]/40 text-[#ff6b6b] hover:bg-[#ff6b6b]/25 shadow-[0_0_12px_rgba(255,107,107,0.2)]'
            }`}
            data-testid="station-selector-btn"
          >
            <MapPin className="w-3.5 h-3.5 text-[#48dbfb]" />
            {activeLocation ? (
              <span className="font-mono">
                {activeLocation.name} <span className="text-slate-500 font-normal">({activeLocation.country})</span>
              </span>
            ) : (
              <span>Select Station</span>
            )}
          </button>

          {/* Sync Now Button */}
          <button
            onClick={() => syncNow()}
            disabled={isSyncing || isLoading || !activeLocation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-[#0abde3]/50 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all duration-150 disabled:opacity-40 shadow-sm hover:shadow-[0_0_16px_rgba(10,189,227,0.2)] backdrop-blur-md"
            title="Trigger manual hourly catch-up synchronization & retention purge"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0abde3] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Station'}</span>
          </button>

          {/* Case Studies Button */}
          <button
            id="tour-case-studies"
            onClick={() => setIsCaseStudyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-[#feca57]/50 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all duration-150 shadow-sm hover:shadow-[0_0_16px_rgba(254,202,87,0.2)] backdrop-blur-md"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#feca57]" />
            <span>Case Studies</span>
            {caseStudies.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#feca57]/20 border border-[#feca57]/30 text-[#feca57] text-[10px] rounded-full font-mono font-bold">
                {caseStudies.length}
              </span>
            )}
            {hasStaleStudies && (
              <span title="Stale case studies present">
                <AlertTriangle className="w-3 h-3 text-[#ff6b6b]" />
              </span>
            )}
          </button>

          {/* CSV Portability Button */}
          <button
            id="tour-csv-tools"
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-[#1dd1a1]/50 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all duration-150 shadow-sm hover:shadow-[0_0_16px_rgba(29,209,161,0.2)] backdrop-blur-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1dd1a1]" />
            <span>CSV Portability</span>
          </button>

          {/* Guided Lab Tour Replay Button */}
          <button
            id="tour-guide-btn"
            onClick={() => setIsTourOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#48dbfb]/15 to-[#0abde3]/15 hover:from-[#48dbfb]/25 hover:to-[#0abde3]/30 border border-[#48dbfb]/40 hover:border-[#48dbfb] rounded-xl text-xs font-semibold text-[#48dbfb] hover:text-white transition-all duration-150 shadow-sm hover:shadow-[0_0_16px_rgba(72,219,251,0.25)] backdrop-blur-md"
            title="Explore Interactive Lab Tour & Walkthrough"
            data-testid="lab-guide-btn"
          >
            <Compass className="w-3.5 h-3.5 text-[#48dbfb]" />
            <span className="hidden sm:inline">Lab Guide</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workbench Workspace (Sidebar + Scrollable Content) */}
      {!activeLocation && locations.length === 0 && !isLoading ? (
        <main className="flex-1 flex items-center justify-center p-6">
          <OnboardingHero
            onOpenSearch={() => setIsCityModalOpen(true)}
            onSelectPreset={(preset) => selectCity({ location: preset })}
            isLoading={isLoading}
          />
        </main>
      ) : (
        <div className="flex-1 flex min-h-[calc(100vh-61px)] relative">
          {/* Responsive Searchable Navigation Sidebar */}
          <NavigationSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            isMobileOpen={isMobileNavOpen}
            onCloseMobile={() => setIsMobileNavOpen(false)}
            recordCount={readings.length}
          />

          {/* Main Content Viewport */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Historical Synoptic Event Banner */}
            {selectedSeriesId && (
              <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border-b border-amber-500/40 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-300">
                  <Sparkles className="w-4 h-4 text-[#feca57]" />
                  <span>
                    Viewing Historical Synoptic Event: <b className="text-white">{selectedSeriesId}</b>
                  </span>
                </div>
                <button
                  onClick={() => selectSeries(null)}
                  className="px-2.5 py-0.5 bg-[#feca57]/20 hover:bg-[#feca57]/30 text-[#feca57] border border-[#feca57]/40 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Exit to Live Automated Stream
                </button>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="bg-rose-950/50 border-b border-rose-500/40 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-rose-200">
                <span>{error}</span>
                <button onClick={clearError} className="text-[#ff6b6b] hover:text-rose-200">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main Workbench Panes */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6">
              <div id="tour-conditions-ribbon">
                <ErrorBoundary fallbackTitle="Live Conditions Error">
                  {/* Live Observation Conditions Ribbon */}
                  <CurrentConditionsRibbon
                    readings={readings}
                    cityName={activeLocation?.name}
                    timezone={activeLocation?.timezone}
                  />
                </ErrorBoundary>
              </div>

              <ErrorBoundary fallbackTitle="Workbook Tab View Error">
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
                    <div className="glass-panel-subtle rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-400 uppercase tracking-wider font-semibold">
                          Correlation Variables:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#48dbfb] font-bold">X:</span>
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
                          <span className="text-[#ff6b6b] font-bold">Y:</span>
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

                {/* TAB 5: Raw Telemetry Data Table */}
                {activeTab === 'data' && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                    <RawDataTable
                      readings={readings}
                      cityName={activeLocation?.name}
                      seriesId={selectedSeriesId}
                    />
                  </div>
                )}
              </ErrorBoundary>
            </main>

            {/* 3. Footer */}
            <footer className="border-t border-white/[0.08] glass-panel-subtle px-6 py-4 mt-auto text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-400">Meteorology Lab Workbook</span>
                <span>•</span>
                <span>
                  Data: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-[#48dbfb] hover:text-[#0abde3] underline underline-offset-2">Open-Meteo</a>
                </span>
                <span>•</span>
                <span>
                  UI based on{' '}
                  <a
                    href="https://codepen.io/gestok/pen/YzLBVOp"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
                  >
                    Glassmorphism (George Chond)
                  </a>
                  ,{' '}
                  <a
                    href="https://codepen.io/Ahmod-Musa/pen/emNqPQd"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
                  >
                    Aurora (Ahmod Musa)
                  </a>
                  {' & '}
                  <a
                    href="https://codepen.io/TheMOZZARELLA/pen/ZYzpWPw"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
                  >
                    Particles (TheMOZZARELLA)
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>Retention: 2-Year Rolling Cap</span>
                <span>•</span>
                <span>Cases: Permanent Archive</span>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Interactive Guided Portal Onboarding Tour */}
      <PortalTour isOpen={isTourOpen} onClose={handleTourClose} />

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
