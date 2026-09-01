import React from 'react';
import { CloudRain, Compass, Activity, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
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
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Activity className="w-5 h-5" />
            <span>Bivariate Correlation</span>
          </div>
          <p className="text-sm text-slate-400">Pearson r correlation, linear regression, and animated LaTeX equations.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Compass className="w-5 h-5" />
            <span>Wind Vector Analysis</span>
          </div>
          <p className="text-sm text-slate-400">Trigonometric polar vector decomposition and 16-sector compass rose.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <BookOpen className="w-5 h-5" />
            <span>Synoptic Case Studies</span>
          </div>
          <p className="text-sm text-slate-400">Historical severe weather events and multi-series timeline comparisons.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
