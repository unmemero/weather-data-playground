import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { useLivePearson, useLiveSMA } from '../src/hooks/useLiveCalculations';
import { LiveStatsInspector } from '../src/components/controls/LiveStatsInspector';
import { WeatherReading } from '../src/types';

describe('Client-Side Live Calculations & Filter Engine', () => {
  const mockReadings: WeatherReading[] = [
    {
      id: 1,
      location_id: 1,
      timestamp: 1000,
      time_iso: '2026-08-30T00:00',
      source_type: 'automated',
      series_id: null,
      ingested_at: 1000,
      temperature_2m: 20.0,
      apparent_temperature: 22.0,
      dewpoint_2m: 15.0,
      relative_humidity: 80,
      surface_pressure: 1015.0,
      wind_speed_10m: 10.0,
      wind_direction_10m: 180,
      wind_u: 0.0,
      wind_v: 10.0,
      shortwave_radiation: 0,
      uv_index: 0,
      precipitation: 0,
      soil_temperature_0_to_7cm: null,
      soil_moisture_0_to_7cm: null,
    },
    {
      id: 2,
      location_id: 1,
      timestamp: 2000,
      time_iso: '2026-08-30T01:00',
      source_type: 'automated',
      series_id: null,
      ingested_at: 2000,
      temperature_2m: 25.0,
      apparent_temperature: 27.0,
      dewpoint_2m: 16.0,
      relative_humidity: 65,
      surface_pressure: 1014.0,
      wind_speed_10m: 12.0,
      wind_direction_10m: 180,
      wind_u: 0.0,
      wind_v: 12.0,
      shortwave_radiation: 200,
      uv_index: 2,
      precipitation: 0,
      soil_temperature_0_to_7cm: null,
      soil_moisture_0_to_7cm: null,
    },
    {
      id: 3,
      location_id: 1,
      timestamp: 3000,
      time_iso: '2026-08-30T02:00',
      source_type: 'automated',
      series_id: null,
      ingested_at: 3000,
      temperature_2m: 30.0,
      apparent_temperature: 33.0,
      dewpoint_2m: 17.0,
      relative_humidity: 50,
      surface_pressure: 1013.0,
      wind_speed_10m: 15.0,
      wind_direction_10m: 190,
      wind_u: -2.6,
      wind_v: 14.7,
      shortwave_radiation: 600,
      uv_index: 6,
      precipitation: 0,
      soil_temperature_0_to_7cm: null,
      soil_moisture_0_to_7cm: null,
    },
    {
      id: 4,
      location_id: 1,
      timestamp: 4000,
      time_iso: '2026-08-30T03:00',
      source_type: 'automated',
      series_id: null,
      ingested_at: 4000,
      temperature_2m: 35.0,
      apparent_temperature: 38.0,
      dewpoint_2m: 18.0,
      relative_humidity: 35,
      surface_pressure: 1012.0,
      wind_speed_10m: 14.0,
      wind_direction_10m: 180,
      wind_u: 0.0,
      wind_v: 14.0,
      shortwave_radiation: 800,
      uv_index: 8,
      precipitation: 0,
      soil_temperature_0_to_7cm: null,
      soil_moisture_0_to_7cm: null,
    },
  ];

  describe('useLivePearson hook', () => {
    it('calculates Pearson r, regression slope, and line bounds', () => {
      const { result } = renderHook(() =>
        useLivePearson(mockReadings, 'temperature_2m', 'relative_humidity')
      );

      expect(result.current.stats).not.toBeNull();
      expect(result.current.stats?.sample_size).toBe(4);
      expect(result.current.stats?.pearson_r).toBe(-1); // Perfect inverse line (20->80, 25->65, 30->50, 35->35)
      expect(result.current.stats?.regression_slope).toBe(-3);
      expect(result.current.stats?.regression_intercept).toBe(140);
      expect(result.current.regressionLine).toEqual({
        x1: 20,
        y1: 80,
        x2: 35,
        y2: 35,
      });
    });

    it('recalculates on custom range zoom window', () => {
      const { result } = renderHook(() =>
        useLivePearson(mockReadings, 'temperature_2m', 'relative_humidity', {
          startTs: 2000,
          endTs: 3000,
        })
      );

      expect(result.current.stats?.sample_size).toBe(2);
      expect(result.current.points.length).toBe(2);
      expect(result.current.points[0].x).toBe(25);
      expect(result.current.points[1].x).toBe(30);
    });
  });

  describe('useLiveSMA hook', () => {
    it('computes rolling average and calculates variance reduction percentage', () => {
      const { result } = renderHook(() =>
        useLiveSMA(mockReadings, 'temperature_2m', 3)
      );

      expect(result.current.smoothedPoints.length).toBe(4);
      expect(result.current.currentWindow).toBe(3);
      expect(result.current.varianceReductionPct).toBeGreaterThan(0);
    });
  });

  describe('LiveStatsInspector Component', () => {
    it('renders slider and dropdowns, allowing dynamic window adjustment', () => {
      render(<LiveStatsInspector readings={mockReadings} />);

      expect(screen.getByText(/Real-Time Statistical & Filter Inspector/i)).toBeInTheDocument();
      expect(screen.getByText(/Instant SMA Low-Pass Filter/i)).toBeInTheDocument();
      expect(screen.getByText(/Window: 12h/i)).toBeInTheDocument();

      const slider = screen.getByTestId('sma-slider');
      fireEvent.change(slider, { target: { value: '24' } });

      expect(screen.getByText(/Window: 24h/i)).toBeInTheDocument();
      expect(screen.getByText(/r = -1/i)).toBeInTheDocument();
    });
  });
});
