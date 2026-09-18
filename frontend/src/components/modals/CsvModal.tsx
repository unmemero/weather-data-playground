import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { getExportCsvUrl, importCsv } from '../../services/api';
import { FileSpreadsheet, Download, Upload, X, Check, AlertCircle } from 'lucide-react';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvModal: React.FC<CsvModalProps> = ({ isOpen, onClose }) => {
  const { caseStudies, selectedRange, refreshAll } = useWeather();
  const [tab, setTab] = useState<'export' | 'import'>('export');

  // Export State
  const [exportSeries, setExportSeries] = useState<string>('automated');
  const [exportRange, setExportRange] = useState<string>(selectedRange);

  // Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadUrl = getExportCsvUrl({
    range: exportSeries === 'automated' ? exportRange : undefined,
    series_id: exportSeries !== 'automated' ? exportSeries : undefined,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setUploadResult(null);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      setCsvPreview(lines.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async () => {
    if (!csvFile) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const text = await csvFile.text();
      const count = await importCsv(text);
      setUploadResult(count);
      await refreshAll();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to import CSV dataset');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      data-testid="csv-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5 text-[#1dd1a1] font-bold">
            <FileSpreadsheet className="w-5 h-5 text-[#1dd1a1]" />
            <h2 className="text-base text-slate-100 font-bold">CSV Data Portability (Excel / Jupyter)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setTab('export')}
            className={`flex-1 py-3 text-xs font-mono font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'export'
                ? 'border-[#1dd1a1] text-[#1dd1a1] bg-[#1dd1a1]/10 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Timeseries to CSV</span>
          </button>
          <button
            onClick={() => setTab('import')}
            className={`flex-1 py-3 text-xs font-mono font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'import'
                ? 'border-[#0abde3] text-[#48dbfb] bg-[#0abde3]/10 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV Dataset</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {tab === 'export' ? (
            /* Export Tab */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-slate-400">Target Dataset Source:</label>
                <select
                  value={exportSeries}
                  onChange={(e) => setExportSeries(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1dd1a1] transition-colors"
                >
                  <option value="automated">Automated Rolling Telemetry</option>
                  {caseStudies.map((c) => (
                    <option key={c.series_id} value={c.series_id}>
                      Historical Case Study: {c.series_id} ({c.record_count} records)
                    </option>
                  ))}
                </select>
              </div>

              {exportSeries === 'automated' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-slate-400">Time Range Window:</label>
                  <select
                    value={exportRange}
                    onChange={(e) => setExportRange(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1dd1a1] transition-colors"
                  >
                    <option value="24h">Past 24 Hours</option>
                    <option value="7d">Past 7 Days</option>
                    <option value="30d">Past 30 Days</option>
                    <option value="90d">Past 90 Days</option>
                    <option value="2y">Past 2 Years (Full Active Retention)</option>
                    <option value="all">Entire Database Archive</option>
                  </select>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                Exports all 12 meteorological variables (Temperature, Dewpoint, Relative Humidity, Pressure, Wind Speed, Direction, U/V Cartesian vectors, Solar Radiation, UV Index, Precipitation, Soil metrics) alongside ISO 8601 timestamps.
              </p>

              <a
                href={downloadUrl}
                download="weather_timeseries.csv"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#1dd1a1] to-[#0abde3] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-[#1dd1a1]/25 active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV Dataset</span>
              </a>
            </div>
          ) : (
            /* Import Tab */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400">Select .CSV File:</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0abde3]/15 file:text-[#48dbfb] hover:file:bg-[#0abde3]/25 cursor-pointer"
                />
              </div>

              {csvPreview.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400">Preview (First 5 lines):</span>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto space-y-1">
                    {csvPreview.map((line, i) => (
                      <div key={i} className={i === 0 ? 'text-[#48dbfb] font-bold' : ''}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadResult !== null && (
                <div className="flex items-center gap-2 text-xs text-[#1dd1a1] bg-[#1dd1a1]/10 border border-[#1dd1a1]/30 rounded-xl p-3">
                  <Check className="w-4 h-4 text-[#1dd1a1]" />
                  <span>Successfully imported <b>{uploadResult}</b> weather observation rows!</span>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 text-xs text-[#ff6b6b] bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-[#ff6b6b]" />
                  <span>{uploadError}</span>
                </div>
              )}

              <button
                onClick={handleUploadSubmit}
                disabled={!csvFile || isUploading}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#0abde3] to-[#48dbfb] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-[#0abde3]/25 active:scale-[0.98] disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Importing Dataset...' : 'Commit & Upsert into SQLite'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvModal;
