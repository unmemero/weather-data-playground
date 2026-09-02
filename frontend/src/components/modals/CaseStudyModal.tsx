import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { BookOpen, Calendar, Download, Trash2, X, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PresetEvent {
  title: string;
  seriesId: string;
  startDate: string;
  endDate: string;
  description: string;
}

const PRESET_EVENTS: PresetEvent[] = [
  {
    title: '2021 Texas Winter Storm (Uri)',
    seriesId: 'texas_freeze_2021',
    startDate: '2021-02-12',
    endDate: '2021-02-16',
    description: 'Extreme arctic outbreak with temperatures dropping to -15°C across central Texas.',
  },
  {
    title: '2021 Pacific Northwest Heat Dome',
    seriesId: 'pnw_heat_dome_2021',
    startDate: '2021-06-25',
    endDate: '2021-06-30',
    description: 'Historic high-pressure block causing record temperatures exceeding 42°C.',
  },
  {
    title: '2012 Superstorm Sandy Extratropical Transition',
    seriesId: 'superstorm_sandy_2012',
    startDate: '2012-10-28',
    endDate: '2012-10-31',
    description: 'Severe coastal baroclinic low with record central pressure drop (940 hPa).',
  },
];

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ isOpen, onClose }) => {
  const {
    caseStudies,
    selectedSeriesId,
    selectSeries,
    downloadCaseStudy,
    deleteCaseStudy,
    isLoading,
  } = useWeather();

  const [seriesId, setSeriesId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (id: string, start: string, end: string) => {
    setDownloadError(null);
    try {
      await downloadCaseStudy(id, start, end);
      onClose();
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to download ERA5 historical case study.');
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesId || !startDate || !endDate) return;
    handleDownload(seriesId.trim().toLowerCase().replace(/\s+/g, '_'), startDate, endDate);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      data-testid="case-study-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-base text-slate-100 font-bold">
              Synoptic Case Studies & Historical Archives
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Active Overlay Status */}
          {selectedSeriesId && (
            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Currently Viewing Historical Case Study: <b>{selectedSeriesId}</b></span>
              </div>
              <button
                onClick={() => selectSeries(null)}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded-lg font-medium transition-colors"
              >
                Return to Live Stream
              </button>
            </div>
          )}

          {/* 1. Pinned Case Studies */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Saved Case Studies ({caseStudies.length})
            </span>

            {caseStudies.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center">
                No case studies pinned yet. Download a preset severe weather event below.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {caseStudies.map((study) => {
                  const isSelected = selectedSeriesId === study.series_id;
                  const startStr = new Date(study.start_timestamp * 1000).toLocaleDateString();
                  const endStr = new Date(study.end_timestamp * 1000).toLocaleDateString();

                  return (
                    <div
                      key={study.series_id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-950/20 border-amber-500/50 shadow-inner'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <span>{study.series_id}</span>
                          {study.is_stale && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] rounded font-mono">
                              <AlertCircle className="w-3 h-3" />
                              <span>Stale &gt;30d</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                          <span>
                            {startStr} – {endStr}
                          </span>
                          <span>•</span>
                          <span className="text-amber-400">{study.record_count} hourly records</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            selectSeries(isSelected ? null : study.series_id);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Inspect'}
                        </button>
                        <button
                          onClick={() => deleteCaseStudy(study.series_id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Case Study"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Preset Severe Weather Case Studies */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preset Benchmark Synoptic Events</span>
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_EVENTS.map((preset) => (
                <div
                  key={preset.seriesId}
                  className="p-3.5 bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 rounded-xl flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold text-slate-200">{preset.title}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{preset.description}</p>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {preset.startDate} to {preset.endDate}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload(preset.seriesId, preset.startDate, preset.endDate)
                    }
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ERA5</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Custom Date Range Download */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Download Custom Historical Archive (ERA5 1940-Present)
            </span>

            <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                placeholder="Series ID (e.g. storm_2020)"
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Fetch Event</span>
              </button>
            </form>

            {downloadError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
                {downloadError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyModal;
