import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../src/services/api';

describe('Frontend API Client (Mocked)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listLocations sends GET request and unwraps data', async () => {
    const mockLocations = [
      {
        id: 1,
        name: 'Austin',
        country: 'United States',
        latitude: 30.26,
        longitude: -97.74,
        timezone: 'America/Chicago',
        is_active: true,
        created_at: 1000,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: mockLocations, error: null }),
    } as Response);

    const result = await api.listLocations();
    expect(global.fetch).toHaveBeenCalledWith('/api/locations', expect.anything());
    expect(result).toEqual(mockLocations);
  });

  it('searchLocations includes query parameters in request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: [], error: null }),
    } as Response);

    await api.searchLocations('Austin', 3);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/locations/search?query=Austin&count=3',
      expect.anything()
    );
  });

  it('selectLocation sends POST request with payload', async () => {
    const mockLocation = {
      id: 1,
      name: 'Austin',
      country: 'United States',
      latitude: 30.26,
      longitude: -97.74,
      timezone: 'America/Chicago',
      is_active: true,
      created_at: 1000,
    };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: mockLocation, error: null }),
    } as Response);

    const result = await api.selectLocation({ location_id: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/locations/select',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ location_id: 1 }),
      })
    );
    expect(result).toEqual(mockLocation);
  });

  it('getTimeseries constructs query with smoothing and range', async () => {
    const mockTimeseries = {
      readings: [],
      smoothed: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: mockTimeseries, error: null }),
    } as Response);

    const result = await api.getTimeseries({
      range: '7d',
      smoothing: '12h',
      smooth_field: 'temperature_2m',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/weather/timeseries?range=7d&smoothing=12h&smooth_field=temperature_2m',
      expect.anything()
    );
    expect(result).toEqual(mockTimeseries);
  });

  it('getCorrelation sends x and y variables in query', async () => {
    const mockCorrelation = {
      stats: {
        sample_size: 100,
        mean_x: 25.0,
        mean_y: 60.0,
        std_x: 3.0,
        std_y: 10.0,
        covariance: -25.0,
        pearson_r: -0.85,
        regression_slope: -2.8,
        regression_intercept: 130.0,
      },
      points: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: mockCorrelation, error: null }),
    } as Response);

    const result = await api.getCorrelation({
      x: 'temperature_2m',
      y: 'relative_humidity',
      range: '30d',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/weather/stats/correlation?x=temperature_2m&y=relative_humidity&range=30d',
      expect.anything()
    );
    expect(result.stats.pearson_r).toBe(-0.85);
  });

  it('propagates backend API errors properly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: false, data: null, error: 'No active location selected' }),
    } as Response);

    await expect(api.syncWeather()).rejects.toThrow('No active location selected');
  });

  it('getExportCsvUrl generates correct CSV URL query', () => {
    const url = api.getExportCsvUrl({ range: '30d', series_id: 'freeze_2021' });
    expect(url).toBe('/api/weather/export/csv?range=30d&series_id=freeze_2021');
  });
});
