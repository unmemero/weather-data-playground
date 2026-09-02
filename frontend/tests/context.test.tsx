import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WeatherProvider, useWeather } from '../src/context/WeatherContext';
import * as api from '../src/services/api';

vi.mock('../src/services/api', () => ({
  listLocations: vi.fn(),
  selectLocation: vi.fn(),
  getTimeseries: vi.fn(),
  getCorrelation: vi.fn(),
  getWindRose: vi.fn(),
  listCaseStudies: vi.fn(),
  syncWeather: vi.fn(),
  deleteLocation: vi.fn(),
  downloadCaseStudy: vi.fn(),
  deleteCaseStudy: vi.fn(),
}));

describe('WeatherContext State Management (Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockActiveLocation = {
    id: 1,
    name: 'Austin',
    country: 'United States',
    latitude: 30.26,
    longitude: -97.74,
    timezone: 'America/Chicago',
    is_active: true,
    created_at: 1000,
  };

  const mockTimeseries = {
    readings: [
      {
        id: 1,
        location_id: 1,
        timestamp: 10000,
        time_iso: '2026-08-30T12:00',
        source_type: 'automated',
        series_id: null,
        ingested_at: 10000,
        temperature_2m: 30.5,
        apparent_temperature: 33.0,
        dewpoint_2m: 20.0,
        relative_humidity: 60,
        surface_pressure: 1012.0,
        wind_speed_10m: 12.0,
        wind_direction_10m: 180,
        wind_u: 0.0,
        wind_v: 12.0,
        shortwave_radiation: 600.0,
        uv_index: 6.0,
        precipitation: 0.0,
        soil_temperature_0_to_7cm: 28.0,
        soil_moisture_0_to_7cm: 0.22,
      },
    ],
  };

  it('initializes and loads weather telemetry for active location', async () => {
    vi.mocked(api.listLocations).mockResolvedValue([mockActiveLocation]);
    vi.mocked(api.getTimeseries).mockResolvedValue(mockTimeseries);
    vi.mocked(api.getCorrelation).mockResolvedValue({
      stats: {
        sample_size: 1,
        mean_x: 30.5,
        mean_y: 60.0,
        std_x: 0.0,
        std_y: 0.0,
        covariance: 0.0,
        pearson_r: -0.9,
        regression_slope: -2.0,
        regression_intercept: 120.0,
      },
      points: [],
    });
    vi.mocked(api.getWindRose).mockResolvedValue({
      mean_speed: 12.0,
      mean_u: 0.0,
      mean_v: 12.0,
      resultant_direction: 180.0,
      wind_rose_bins: [],
    });
    vi.mocked(api.listCaseStudies).mockResolvedValue([]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WeatherProvider>{children}</WeatherProvider>
    );

    const { result } = renderHook(() => useWeather(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeLocation).toEqual(mockActiveLocation);
      expect(result.current.timeseriesData).toEqual(mockTimeseries);
      expect(result.current.correlationData?.stats.pearson_r).toBe(-0.9);
      expect(result.current.windRoseData?.resultant_direction).toBe(180.0);
    });
  });

  it('allows changing time range and re-fetching data', async () => {
    vi.mocked(api.listLocations).mockResolvedValue([mockActiveLocation]);
    vi.mocked(api.getTimeseries).mockResolvedValue(mockTimeseries);
    vi.mocked(api.getCorrelation).mockResolvedValue(null as any);
    vi.mocked(api.getWindRose).mockResolvedValue(null as any);
    vi.mocked(api.listCaseStudies).mockResolvedValue([]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WeatherProvider>{children}</WeatherProvider>
    );

    const { result } = renderHook(() => useWeather(), { wrapper });

    await waitFor(() => expect(result.current.activeLocation).not.toBeNull());

    await act(async () => {
      result.current.setRange('30d');
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toBe('30d');
      expect(api.getTimeseries).toHaveBeenCalledWith(
        expect.objectContaining({ range: '30d' })
      );
    });
  });
});
