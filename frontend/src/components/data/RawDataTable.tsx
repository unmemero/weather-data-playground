import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
} from 'lucide-react';
import { WeatherReading } from '../../types';

interface RawDataTableProps {
  readings: WeatherReading[];
  cityName?: string;
  seriesId?: string | null;
}

type SortField =
  | 'time_iso'
  | 'temperature_2m'
  | 'apparent_temperature'
  | 'dewpoint_2m'
  | 'relative_humidity'
  | 'surface_pressure'
  | 'wind_speed_10m'
  | 'wind_direction_10m'
  | 'shortwave_radiation'
  | 'uv_index'
  | 'precipitation';

type SortDirection = 'asc' | 'desc';

export const RawDataTable: React.FC<RawDataTableProps> = ({
  readings,
  cityName,
  seriesId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('time_iso');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'automated' | 'case_study'>('all');

  // Handle column header sort clicks
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter readings
  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      // Source filter
      if (sourceFilter === 'automated' && r.source_type !== 'automated') return false;
      if (sourceFilter === 'case_study' && r.source_type === 'automated') return false;

      // Search term filter across date, time, series_id
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTime = r.time_iso.toLowerCase().includes(query);
        const matchesSeries = r.series_id?.toLowerCase().includes(query) || false;
        const matchesSource = r.source_type.toLowerCase().includes(query);
        const matchesTemp = r.temperature_2m !== null && r.temperature_2m.toString().includes(query);
        return matchesTime || matchesSeries || matchesSource || matchesTemp;
      }
      return true;
    });
  }, [readings, searchTerm, sourceFilter]);

  // Sort readings
  const sortedReadings = useMemo(() => {
    const list = [...filteredReadings];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      const diff = (aVal as number) - (bVal as number);
      return sortDirection === 'asc' ? diff : -diff;
    });
    return list;
  }, [filteredReadings, sortField, sortDirection]);

  // Pagination calculation
  const totalRecords = sortedReadings.length;
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedReadings = useMemo(() => {
    if (pageSize === -1) return sortedReadings;
    const start = (activePage - 1) * pageSize;
    return sortedReadings.slice(start, start + pageSize);
  }, [sortedReadings, activePage, pageSize]);

  // Client-side CSV Export
  const handleExportCsv = () => {
    if (sortedReadings.length === 0) return;

    const headers = [
      'timestamp',
      'time_iso',
      'source_type',
      'series_id',
      'temperature_2m',
      'apparent_temperature',
      'dewpoint_2m',
      'relative_humidity',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'shortwave_radiation',
      'uv_index',
      'precipitation',
    ];

    const rows = sortedReadings.map((r) => [
      r.timestamp,
      `"${r.time_iso}"`,
      `"${r.source_type}"`,
      `"${r.series_id || ''}"`,
      r.temperature_2m ?? '',
      r.apparent_temperature ?? '',
      r.dewpoint_2m ?? '',
      r.relative_humidity ?? '',
      r.surface_pressure ?? '',
      r.wind_speed_10m ?? '',
      r.wind_direction_10m ?? '',
      r.shortwave_radiation ?? '',
      r.uv_index ?? '',
      r.precipitation ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${cityName || 'weather'}_raw_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#48dbfb]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#48dbfb]" />
    );
  };

  return (
    <div
      className="bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col shadow-xl backdrop-blur overflow-hidden"
      data-testid="raw-data-table-container"
    >
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0abde3]/10 border border-[#0abde3]/30 text-[#48dbfb] rounded-lg">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-200">Raw Observations & Telemetry</h2>
              <span
                data-testid="record-count-badge"
                className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[#48dbfb] font-mono font-medium"
              >
                {totalRecords.toLocaleString()} {totalRecords === 1 ? 'record' : 'records'}
              </span>
              {seriesId && (
                <span className="text-xs px-2 py-0.5 rounded bg-[#a29bfe]/10 border border-[#a29bfe]/30 text-[#a29bfe] font-mono">
                  Series: {seriesId}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tabular view of surface meteorological variables, radiation, and vector parameters
            </p>
          </div>
        </div>

        {/* Search, Filter & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search date, time, value..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#0abde3] transition-colors w-48 font-mono"
            />
          </div>

          {/* Source Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              data-testid="source-filter-select"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-300 focus:outline-none text-xs cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="automated">Automated Sync</option>
              <option value="case_study">Case Studies</option>
            </select>
          </div>

          {/* CSV Download Button */}
          <button
            onClick={handleExportCsv}
            disabled={totalRecords === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#0abde3] to-[#48dbfb] hover:opacity-90 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-lg text-xs font-mono font-bold transition-all shadow-sm"
            title="Download currently filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Scroll Container */}
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="sticky top-0 bg-slate-950/95 text-slate-400 border-b border-slate-800 z-10 backdrop-blur">
            <tr>
              <th
                onClick={() => handleSort('time_iso')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap sticky left-0 bg-slate-950/95 border-r border-slate-800"
              >
                <div className="flex items-center gap-1.5">
                  <span>Timestamp (ISO)</span>
                  {renderSortIcon('time_iso')}
                </div>
              </th>
              <th
                onClick={() => handleSort('temperature_2m')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Temp (°C)</span>
                  {renderSortIcon('temperature_2m')}
                </div>
              </th>
              <th
                onClick={() => handleSort('apparent_temperature')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Apparent (°C)</span>
                  {renderSortIcon('apparent_temperature')}
                </div>
              </th>
              <th
                onClick={() => handleSort('dewpoint_2m')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Dewpoint (°C)</span>
                  {renderSortIcon('dewpoint_2m')}
                </div>
              </th>
              <th
                onClick={() => handleSort('relative_humidity')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Humidity (%)</span>
                  {renderSortIcon('relative_humidity')}
                </div>
              </th>
              <th
                onClick={() => handleSort('surface_pressure')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Pressure (hPa)</span>
                  {renderSortIcon('surface_pressure')}
                </div>
              </th>
              <th
                onClick={() => handleSort('wind_speed_10m')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Wind Speed (km/h)</span>
                  {renderSortIcon('wind_speed_10m')}
                </div>
              </th>
              <th
                onClick={() => handleSort('wind_direction_10m')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Wind Dir (°)</span>
                  {renderSortIcon('wind_direction_10m')}
                </div>
              </th>
              <th
                onClick={() => handleSort('shortwave_radiation')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Solar (W/m²)</span>
                  {renderSortIcon('shortwave_radiation')}
                </div>
              </th>
              <th
                onClick={() => handleSort('uv_index')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>UV Index</span>
                  {renderSortIcon('uv_index')}
                </div>
              </th>
              <th
                onClick={() => handleSort('precipitation')}
                className="py-2.5 px-3 cursor-pointer group hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Precip (mm)</span>
                  {renderSortIcon('precipitation')}
                </div>
              </th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap text-slate-500">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {paginatedReadings.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500 font-mono">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  No weather observations matching criteria.
                </td>
              </tr>
            ) : (
              paginatedReadings.map((reading) => (
                <tr
                  key={`${reading.location_id}-${reading.timestamp}-${reading.series_id || 'base'}`}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-3 whitespace-nowrap text-slate-300 sticky left-0 bg-slate-900/95 border-r border-slate-800 font-medium">
                    {reading.time_iso.replace('T', ' ')}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap font-medium text-[#ff6b6b]">
                    {reading.temperature_2m !== null ? reading.temperature_2m.toFixed(1) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-slate-400">
                    {reading.apparent_temperature !== null ? reading.apparent_temperature.toFixed(1) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-[#48dbfb]">
                    {reading.dewpoint_2m !== null ? reading.dewpoint_2m.toFixed(1) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-[#0abde3]">
                    {reading.relative_humidity !== null ? `${reading.relative_humidity}%` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-[#1dd1a1]">
                    {reading.surface_pressure !== null ? reading.surface_pressure.toFixed(1) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-[#feca57]">
                    {reading.wind_speed_10m !== null ? reading.wind_speed_10m.toFixed(1) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-slate-400">
                    {reading.wind_direction_10m !== null ? `${Math.round(reading.wind_direction_10m)}°` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-[#ff9f43]">
                    {reading.shortwave_radiation !== null ? reading.shortwave_radiation.toFixed(0) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-[#feca57]">
                    {reading.uv_index !== null ? reading.uv_index.toFixed(1) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap text-[#a29bfe]">
                    {reading.precipitation !== null ? reading.precipitation.toFixed(1) : '0.0'}
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {reading.source_type === 'automated' ? (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#1dd1a1]/15 border border-[#1dd1a1]/30 text-[#1dd1a1] font-medium font-mono">
                        Auto
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#a29bfe]/15 border border-[#a29bfe]/30 text-[#a29bfe] font-medium font-mono">
                        {reading.series_id ? `Case: ${reading.series_id}` : 'Manual'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            data-testid="page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs focus:outline-none"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={-1}>All ({totalRecords})</option>
          </select>
          <span className="text-slate-500 ml-2">
            Showing {totalRecords === 0 ? 0 : (activePage - 1) * (pageSize === -1 ? totalRecords : pageSize) + 1} to{' '}
            {pageSize === -1 ? totalRecords : Math.min(activePage * pageSize, totalRecords)} of {totalRecords} records
          </span>
        </div>

        {/* Pagination Navigation */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={activePage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 text-xs text-slate-300">
              Page {activePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={activePage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawDataTable;
