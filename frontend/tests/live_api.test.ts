import { describe, it, expect } from 'vitest';
import { ApiResponse, Location, TimeseriesResponse, CorrelationResponse } from '../src/types';

const LIVE_BACKEND_URL = 'http://127.0.0.1:3001/api';

describe('Live Backend Communication Integration Test', () => {
  it('communicates with live backend: search, select, timeseries, and correlation', async () => {
    // 1. Search for Austin
    const searchRes = await fetch(`${LIVE_BACKEND_URL}/locations/search?query=Austin&count=2`);
    expect(searchRes.ok).toBe(true);
    const searchJson: ApiResponse<Location[]> = await searchRes.json();
    expect(searchJson.success).toBe(true);
    const searchResults = searchJson.data!;
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].name).toBe('Austin');

    // 2. Select Austin
    const selectRes = await fetch(`${LIVE_BACKEND_URL}/locations/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: searchResults[0] }),
    });
    expect(selectRes.ok).toBe(true);
    const selectJson: ApiResponse<Location> = await selectRes.json();
    expect(selectJson.success).toBe(true);
    expect(selectJson.data?.name).toBe('Austin');
    expect(selectJson.data?.is_active).toBe(true);

    // 3. Fetch Timeseries (7d)
    const tsRes = await fetch(`${LIVE_BACKEND_URL}/weather/timeseries?range=7d&smoothing=12h&smooth_field=temperature_2m`);
    expect(tsRes.ok).toBe(true);
    const tsJson: ApiResponse<TimeseriesResponse> = await tsRes.json();
    expect(tsJson.success).toBe(true);
    expect(tsJson.data?.readings.length).toBeGreaterThan(0);
    expect(tsJson.data?.smoothed?.length).toBeGreaterThan(0);

    // 4. Fetch Correlation (Temp vs Humidity)
    const corrRes = await fetch(`${LIVE_BACKEND_URL}/weather/stats/correlation?x=temperature_2m&y=relative_humidity&range=30d`);
    expect(corrRes.ok).toBe(true);
    const corrJson: ApiResponse<CorrelationResponse> = await corrRes.json();
    expect(corrJson.success).toBe(true);
    expect(corrJson.data?.stats.pearson_r).toBeDefined();
    expect(Math.abs(corrJson.data!.stats.pearson_r)).toBeLessThanOrEqual(1.0);
  });
});
