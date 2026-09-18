import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import './chartSetup';
import { WindVectorStats } from '../../types';
import { Compass, Navigation } from 'lucide-react';

interface WindRoseChartProps {
  stats: WindVectorStats | null;
  onHoverSector?: (speed: number | null, direction: number | null) => void;
}

const COMPASS_SECTOR_ANGLES: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

export const WindRoseChart: React.FC<WindRoseChartProps> = ({ stats, onHoverSector }) => {
  const chartData = useMemo(() => {
    if (!stats || !stats.wind_rose_bins || stats.wind_rose_bins.length === 0) {
      return {
        labels: Object.keys(COMPASS_SECTOR_ANGLES),
        datasets: [],
      };
    }

    const labels = stats.wind_rose_bins.map((b) => b.direction_label);
    const frequencies = stats.wind_rose_bins.map((b) => b.frequency_pct);
    const speeds = stats.wind_rose_bins.map((b) => b.avg_speed);

    return {
      labels,
      datasets: [
        {
          label: 'Wind Direction Frequency (%)',
          data: frequencies,
          backgroundColor: 'rgba(29, 209, 161, 0.22)',
          borderColor: '#1dd1a1',
          pointBackgroundColor: '#2ed573',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 7,
          borderWidth: 2,
        },
        {
          label: 'Avg Speed (km/h)',
          data: speeds,
          backgroundColor: 'rgba(254, 202, 87, 0.16)',
          borderColor: '#feca57',
          pointBackgroundColor: '#feca57',
          pointBorderColor: '#ffffff',
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 1.5,
          borderDash: [3, 3],
        },
      ],
    };
  }, [stats]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (_event: any, activeElements: any[]) => {
      if (!onHoverSector) return;
      if (activeElements && activeElements.length > 0 && stats) {
        const index = activeElements[0].index;
        const bin = stats.wind_rose_bins[index];
        if (bin) {
          const dir = COMPASS_SECTOR_ANGLES[bin.direction_label] ?? 0;
          onHoverSector(bin.avg_speed, dir);
          return;
        }
      }
      onHoverSector(null, null);
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(51, 65, 85, 0.4)',
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.4)',
        },
        pointLabels: {
          color: '#cbd5e1',
          font: {
            size: 11,
            weight: 'bold',
          },
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#64748b',
          font: { size: 10 },
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

  return (
    <div
      id="tour-wind-canvas"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur"
      data-testid="wind-rose-container"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">
            16-Sector Compass Polar Rose
          </span>
        </div>

        {stats && (
          <div id="tour-wind-legend" className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded">
              <Navigation
                className="w-3.5 h-3.5 transform"
                style={{ transform: `rotate(${stats.resultant_direction}deg)` }}
              />
              <span>Resultant: <b>{stats.resultant_direction}°</b></span>
            </span>
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded">
              Mean Velocity: <b>{stats.mean_speed} km/h</b>
            </span>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="h-[360px] w-full relative">
        {stats && stats.wind_rose_bins && stats.wind_rose_bins.length > 0 ? (
          <Radar data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            Awaiting wind observations to construct polar rose...
          </div>
        )}
      </div>
    </div>
  );
};

export default WindRoseChart;
