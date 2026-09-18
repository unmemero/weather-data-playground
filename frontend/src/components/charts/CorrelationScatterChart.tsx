import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import './chartSetup';
import {
  Chart as ChartJS,
  ScatterController,
  LineController,
  PointElement,
  LineElement,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { CorrelationStats, ScatterPoint } from '../../types';
import { METRIC_CONFIGS, MetricKey } from './TimeseriesChart';
import { Target } from 'lucide-react';

ChartJS.register(
  ScatterController,
  LineController,
  PointElement,
  LineElement,
  LinearScale,
  Tooltip,
  Legend
);


interface CorrelationScatterChartProps {
  stats: CorrelationStats | null;
  points: ScatterPoint[];
  xMetric: MetricKey;
  yMetric: MetricKey;
  onHoverPoint?: (point: ScatterPoint | null) => void;
}

export const CorrelationScatterChart: React.FC<CorrelationScatterChartProps> = ({
  stats,
  points,
  xMetric,
  yMetric,
  onHoverPoint,
}) => {
  const xCfg = METRIC_CONFIGS[xMetric] || { label: xMetric, unit: '', color: '#48dbfb' };
  const yCfg = METRIC_CONFIGS[yMetric] || { label: yMetric, unit: '', color: '#ff6b6b' };

  const chartData = useMemo(() => {
    // 1. Scatter Points Dataset
    const scatterDataset: any = {
      type: 'scatter' as const,
      label: `Observations (${points.length})`,
      data: points.map((p) => ({ x: p.x, y: p.y })),
      backgroundColor: 'rgba(72, 219, 251, 0.45)',
      borderColor: '#48dbfb',
      pointRadius: 4,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#feca57',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
    };

    const datasets: any[] = [scatterDataset];

    // 2. Linear Regression Trendline Dataset
    if (stats && points.length >= 2) {
      const xVals = points.map((p) => p.x);
      const minX = Math.min(...xVals);
      const maxX = Math.max(...xVals);

      const y1 = stats.regression_slope * minX + stats.regression_intercept;
      const y2 = stats.regression_slope * maxX + stats.regression_intercept;

      datasets.push({
        type: 'line' as const,
        label: `Regression Trendline (r = ${stats.pearson_r})`,
        data: [
          { x: minX, y: Math.round(y1 * 100) / 100 },
          { x: maxX, y: Math.round(y2 * 100) / 100 },
        ],
        borderColor: stats.pearson_r >= 0 ? '#1dd1a1' : '#ff6b6b',
        borderWidth: 2.5,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      });
    }

    return { datasets };
  }, [points, stats]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (_event: any, activeElements: any[]) => {
      if (!onHoverPoint) return;
      if (activeElements && activeElements.length > 0) {
        const first = activeElements[0];
        if (first.datasetIndex === 0) {
          const pt = points[first.index];
          onHoverPoint(pt || null);
          return;
        }
      }
      onHoverPoint(null);
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: `${xCfg.label} (${xCfg.unit})`,
          color: xCfg.color,
          font: { size: 12, weight: 'bold' },
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: `${yCfg.label} (${yCfg.unit})`,
          color: yCfg.color,
          font: { size: 12, weight: 'bold' },
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
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
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const p = context.raw;
            return ` (${xCfg.label}: ${p.x}${xCfg.unit}, ${yCfg.label}: ${p.y}${yCfg.unit})`;
          },
        },
      },
    },
  };

  const r2 = stats ? Math.round(stats.pearson_r * stats.pearson_r * 1000) / 1000 : null;

  return (
    <div
      id="tour-corr-canvas"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur"
      data-testid="correlation-scatter-container"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#0abde3]" />
          <span className="text-sm font-semibold text-slate-200">
            Bivariate Scatter & Linear Regression Plot
          </span>
        </div>

        {stats && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2 py-0.5 bg-[#0abde3]/10 border border-[#0abde3]/30 text-[#48dbfb] rounded font-medium">
              Pearson r: <b>{stats.pearson_r}</b>
            </span>
            <span className="px-2 py-0.5 bg-[#a29bfe]/10 border border-[#a29bfe]/30 text-[#a29bfe] rounded font-medium">
              R² (Variance Explained): <b>{r2}</b>
            </span>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="h-[360px] w-full relative">
        {points.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            Insufficient paired observations for correlation analysis.
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationScatterChart;
