import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import './chartSetup';
import { WeatherReading, SmoothedPoint } from '../../types';
import { calculateClientSMA } from '../../services/processing';
import { Calendar, Eye, Layers } from 'lucide-react';

export type MetricKey =
  | 'temperature_2m'
  | 'apparent_temperature'
  | 'dewpoint_2m'
  | 'relative_humidity'
  | 'surface_pressure'
  | 'wind_speed_10m'
  | 'shortwave_radiation'
  | 'precipitation'
  | 'soil_temperature_0_to_7cm';

export interface MetricConfig {
  label: string;
  unit: string;
  color: string;
  bgFill: string;
}

export const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  temperature_2m: {
    label: 'Temperature (2m)',
    unit: '°C',
    color: '#f43f5e', // Rose
    bgFill: 'rgba(244, 63, 94, 0.05)',
  },
  apparent_temperature: {
    label: 'Apparent Temp (Heat Index/Wind Chill)',
    unit: '°C',
    color: '#fb7185',
    bgFill: 'rgba(251, 113, 133, 0.05)',
  },
  dewpoint_2m: {
    label: 'Dewpoint (2m)',
    unit: '°C',
    color: '#06b6d4', // Cyan
    bgFill: 'rgba(6, 182, 212, 0.05)',
  },
  relative_humidity: {
    label: 'Relative Humidity',
    unit: '%',
    color: '#38bdf8', // Sky
    bgFill: 'rgba(56, 189, 248, 0.05)',
  },
  surface_pressure: {
    label: 'Surface Pressure',
    unit: 'hPa',
    color: '#a855f7', // Purple
    bgFill: 'rgba(168, 85, 247, 0.05)',
  },
  wind_speed_10m: {
    label: 'Wind Speed (10m)',
    unit: 'km/h',
    color: '#10b981', // Emerald
    bgFill: 'rgba(16, 185, 129, 0.05)',
  },
  shortwave_radiation: {
    label: 'Solar Radiation (GHI)',
    unit: 'W/m²',
    color: '#f59e0b', // Amber
    bgFill: 'rgba(245, 158, 11, 0.05)',
  },
  precipitation: {
    label: 'Precipitation Rate',
    unit: 'mm',
    color: '#3b82f6', // Blue
    bgFill: 'rgba(59, 130, 246, 0.05)',
  },
  soil_temperature_0_to_7cm: {
    label: 'Soil Temperature (0-7cm)',
    unit: '°C',
    color: '#d97706',
    bgFill: 'rgba(217, 119, 6, 0.05)',
  },
};

interface TimeseriesChartProps {
  readings: WeatherReading[];
  backendSmoothed?: SmoothedPoint[] | null;
  selectedRange?: string;
  onRangeChange?: (range: any) => void;
}

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  readings,
  backendSmoothed,
  selectedRange = '7d',
  onRangeChange,
}) => {
  const [primaryMetric, setPrimaryMetric] = useState<MetricKey>('temperature_2m');
  const [secondaryMetric, setSecondaryMetric] = useState<MetricKey | 'none'>('relative_humidity');
  const [smaWindow, setSmaWindow] = useState<number>(12);
  const [showSMA, setShowSMA] = useState<boolean>(true);

  // Compute local SMA if backend smoothed points aren't available
  const smoothedData = useMemo(() => {
    if (!showSMA || readings.length === 0) return [];
    if (backendSmoothed && backendSmoothed.length > 0) {
      return backendSmoothed;
    }
    return calculateClientSMA(readings, primaryMetric, smaWindow);
  }, [readings, primaryMetric, smaWindow, showSMA, backendSmoothed]);

  const chartData = useMemo(() => {
    const labels = readings.map((r) => {
      const date = new Date(r.timestamp * 1000);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      });
    });

    const primaryCfg = METRIC_CONFIGS[primaryMetric];
    const datasets: any[] = [
      {
        label: `${primaryCfg.label} (${primaryCfg.unit})`,
        data: readings.map((r) => r[primaryMetric]),
        borderColor: primaryCfg.color,
        backgroundColor: primaryCfg.bgFill,
        yAxisID: 'yLeft',
        borderWidth: 2,
        pointRadius: readings.length > 200 ? 0 : 2,
        pointHoverRadius: 5,
        tension: 0.2,
        fill: true,
      },
    ];

    // Secondary Y-Axis Line
    if (secondaryMetric !== 'none') {
      const secCfg = METRIC_CONFIGS[secondaryMetric];
      datasets.push({
        label: `${secCfg.label} (${secCfg.unit})`,
        data: readings.map((r) => r[secondaryMetric]),
        borderColor: secCfg.color,
        backgroundColor: secCfg.bgFill,
        yAxisID: 'yRight',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: readings.length > 200 ? 0 : 1.5,
        pointHoverRadius: 4,
        tension: 0.2,
        fill: false,
      });
    }

    // SMA Smoothed Curve
    if (showSMA && smoothedData.length > 0) {
      datasets.push({
        label: `SMA (${smaWindow}h) Smoothed`,
        data: smoothedData.map((s) => s.smoothed_value),
        borderColor: '#fbbf24', // Amber gold
        yAxisID: 'yLeft',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: false,
      });
    }

    return { labels, datasets };
  }, [readings, primaryMetric, secondaryMetric, showSMA, smoothedData, smaWindow]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          maxTicksLimit: 12,
          color: '#64748b',
        },
      },
      yLeft: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: `${METRIC_CONFIGS[primaryMetric].label} (${METRIC_CONFIGS[primaryMetric].unit})`,
          color: METRIC_CONFIGS[primaryMetric].color,
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
      },
      yRight: {
        type: 'linear',
        display: secondaryMetric !== 'none',
        position: 'right',
        title: {
          display: secondaryMetric !== 'none',
          text:
            secondaryMetric !== 'none'
              ? `${METRIC_CONFIGS[secondaryMetric].label} (${METRIC_CONFIGS[secondaryMetric].unit})`
              : '',
          color: secondaryMetric !== 'none' ? METRIC_CONFIGS[secondaryMetric].color : '#64748b',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
        },
      },
    },
  };

  const ranges = ['24h', '7d', '30d', '90d', '2y', 'all'];

  return (
    <div
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur"
      data-testid="timeseries-chart-container"
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        {/* Metric Selectors */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Left Y:</span>
            </span>
            <select
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value as MetricKey)}
              className="bg-transparent text-rose-300 font-semibold outline-none cursor-pointer"
            >
              {Object.entries(METRIC_CONFIGS).map(([k, v]) => (
                <option key={k} value={k} className="bg-slate-900 text-slate-200">
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Right Y:</span>
            </span>
            <select
              value={secondaryMetric}
              onChange={(e) => setSecondaryMetric(e.target.value as MetricKey | 'none')}
              className="bg-transparent text-sky-300 font-semibold outline-none cursor-pointer"
            >
              <option value="none" className="bg-slate-900 text-slate-400">
                (Disabled)
              </option>
              {Object.entries(METRIC_CONFIGS).map(([k, v]) => (
                <option key={k} value={k} className="bg-slate-900 text-slate-200">
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* SMA Toggle & Window */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                showSMA ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>SMA Curve</span>
            </button>
            {showSMA && (
              <select
                value={smaWindow}
                onChange={(e) => setSmaWindow(parseInt(e.target.value, 10))}
                className="bg-slate-900 text-amber-300 text-[11px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
              >
                <option value={3}>3h</option>
                <option value={6}>6h</option>
                <option value={12}>12h</option>
                <option value={24}>24h</option>
                <option value={48}>48h</option>
              </select>
            )}
          </div>
        </div>

        {/* Range Buttons */}
        {onRangeChange && (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  selectedRange === r
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chart Canvas Container */}
      <div className="h-[380px] w-full relative">
        {readings.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            No timeseries observations available for selected range.
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeseriesChart;
