import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeseriesChart } from '../src/components/charts/TimeseriesChart';
import { CorrelationScatterChart } from '../src/components/charts/CorrelationScatterChart';
import { WindRoseChart } from '../src/components/charts/WindRoseChart';
import { WeatherReading, CorrelationStats, ScatterPoint, WindVectorStats } from '../src/types';

// Mock react-chartjs-2 to test component rendering and interactions without jsdom canvas engine errors
vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: any) => (
    <div data-testid="mock-line-chart" data-datasets-count={data.datasets?.length}>
      Mock Line Chart ({data.datasets?.length} datasets)
    </div>
  ),
  Radar: ({ data }: any) => (
    <div data-testid="mock-radar-chart" data-datasets-count={data.datasets?.length}>
      Mock Radar Chart ({data.datasets?.length} datasets)
    </div>
  ),
  Scatter: ({ data }: any) => (
    <div data-testid="mock-scatter-chart" data-datasets-count={data.datasets?.length}>
      Mock Scatter Chart ({data.datasets?.length} datasets)
    </div>
  ),
}));

describe('Scientific Visualization Charts Suite', () => {
  const mockReadings: WeatherReading[] = [
    {
      id: 1,
      location_id: 1,
      timestamp: 1788200000,
      time_iso: '2026-08-30T00:00',
      source_type: 'automated',
      series_id: null,
      ingested_at: 1788200000,
      temperature_2m: 24.5,
      apparent_temperature: 26.0,
      dewpoint_2m: 18.0,
      relative_humidity: 70,
      surface_pressure: 1012.5,
      wind_speed_10m: 12.0,
      wind_direction_10m: 180,
      wind_u: 0.0,
      wind_v: 12.0,
      shortwave_radiation: 0,
      uv_index: 0,
      precipitation: 0,
      soil_temperature_0_to_7cm: null,
      soil_moisture_0_to_7cm: null,
    },
    {
      id: 2,
      location_id: 1,
      timestamp: 1788203600,
      time_iso: '2026-08-30T01:00',
      source_type: 'automated',
      series_id: null,
      ingested_at: 1788203600,
      temperature_2m: 29.0,
      apparent_temperature: 31.5,
      dewpoint_2m: 17.5,
      relative_humidity: 55,
      surface_pressure: 1011.8,
      wind_speed_10m: 14.5,
      wind_direction_10m: 170,
      wind_u: -2.5,
      wind_v: 14.3,
      shortwave_radiation: 500,
      uv_index: 5,
      precipitation: 0,
      soil_temperature_0_to_7cm: null,
      soil_moisture_0_to_7cm: null,
    },
  ];

  describe('TimeseriesChart', () => {
    it('renders toolbar, metric selectors, range buttons, and chart container', () => {
      render(
        <TimeseriesChart
          readings={mockReadings}
          selectedRange="7d"
          onRangeChange={() => {}}
        />
      );

      expect(screen.getByTestId('timeseries-chart-container')).toBeInTheDocument();
      expect(screen.getByText(/Left Y:/i)).toBeInTheDocument();
      expect(screen.getByText(/Right Y:/i)).toBeInTheDocument();
      expect(screen.getByText(/SMA Curve/i)).toBeInTheDocument();
      expect(screen.getByText('7D')).toBeInTheDocument();
      expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    });

    it('toggles SMA smoothing visibility when button clicked', () => {
      render(<TimeseriesChart readings={mockReadings} />);
      const smaToggle = screen.getByText(/SMA Curve/i);

      // Initially showSMA is true -> 3 datasets (Left Y, Right Y, SMA)
      expect(screen.getByTestId('mock-line-chart')).toHaveAttribute(
        'data-datasets-count',
        '3'
      );

      fireEvent.click(smaToggle);

      // Now showSMA is false -> 2 datasets (Left Y, Right Y)
      expect(screen.getByTestId('mock-line-chart')).toHaveAttribute(
        'data-datasets-count',
        '2'
      );
    });
  });

  describe('CorrelationScatterChart', () => {
    const mockStats: CorrelationStats = {
      sample_size: 150,
      mean_x: 28.0,
      mean_y: 62.0,
      std_x: 4.5,
      std_y: 18.0,
      covariance: -72.0,
      pearson_r: -0.889,
      regression_slope: -3.555,
      regression_intercept: 161.54,
    };

    const mockPoints: ScatterPoint[] = [
      { x: 24.5, y: 70, timestamp: 1788200000, time_iso: '2026-08-30T00:00' },
      { x: 29.0, y: 55, timestamp: 1788203600, time_iso: '2026-08-30T01:00' },
    ];

    it('renders scatter chart with Pearson r and R-squared variance metrics', () => {
      render(
        <CorrelationScatterChart
          stats={mockStats}
          points={mockPoints}
          xMetric="temperature_2m"
          yMetric="relative_humidity"
        />
      );

      expect(screen.getByTestId('correlation-scatter-container')).toBeInTheDocument();
      expect(screen.getByText(/Bivariate Scatter & Linear Regression Plot/i)).toBeInTheDocument();
      expect(screen.getByText(/-0.889/i)).toBeInTheDocument();
      expect(screen.getByText(/R² \(Variance Explained\):/i)).toBeInTheDocument();
      expect(screen.getByTestId('mock-line-chart')).toHaveAttribute(
        'data-datasets-count',
        '2' // scatter points + regression line
      );
    });
  });

  describe('WindRoseChart', () => {
    const mockWindStats: WindVectorStats = {
      mean_speed: 11.2,
      mean_u: -1.8,
      mean_v: 9.4,
      resultant_direction: 169.2,
      wind_rose_bins: [
        {
          direction_label: 'S',
          angle_min: 168.8,
          angle_max: 191.3,
          frequency_pct: 35.0,
          avg_speed: 12.4,
        },
        {
          direction_label: 'SSE',
          angle_min: 146.3,
          angle_max: 168.8,
          frequency_pct: 25.0,
          avg_speed: 10.8,
        },
      ],
    };

    it('renders polar radar chart with resultant direction and mean velocity badges', () => {
      render(<WindRoseChart stats={mockWindStats} />);

      expect(screen.getByTestId('wind-rose-container')).toBeInTheDocument();
      expect(screen.getByText(/16-Sector Compass Polar Rose/i)).toBeInTheDocument();
      expect(screen.getByText(/169.2°/i)).toBeInTheDocument();
      expect(screen.getByText(/Mean Velocity:/i)).toBeInTheDocument();
      expect(screen.getByText(/11.2 km\/h/i)).toBeInTheDocument();
      expect(screen.getByTestId('mock-radar-chart')).toBeInTheDocument();
    });
  });
});
