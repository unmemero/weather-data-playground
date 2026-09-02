import { describe, it, expect } from 'vitest';
import {
  normalizeMinMax,
  calculateMetricExtent,
  stitchTimeseries,
  filterReadingsByRange,
  calculateClientPearson,
  calculateClientSMA,
  downsampleByInterval,
} from '../src/services/processing';
import { WeatherReading } from '../src/types';

describe('Frontend Data Processing Lab', () => {
  const createMockReading = (
    timestamp: number,
    temp: number | null,
    humidity: number | null,
    source = 'automated',
    seriesId: string | null = null
  ): WeatherReading => ({
    id: timestamp,
    location_id: 1,
    timestamp,
    time_iso: new Date(timestamp * 1000).toISOString(),
    source_type: source,
    series_id: seriesId,
    ingested_at: timestamp,
    temperature_2m: temp,
    apparent_temperature: temp !== null ? temp + 2 : null,
    dewpoint_2m: temp !== null ? temp - 5 : null,
    relative_humidity: humidity,
    surface_pressure: 1013.2,
    wind_speed_10m: 10.0,
    wind_direction_10m: 180,
    wind_u: 0.0,
    wind_v: 10.0,
    shortwave_radiation: 0,
    uv_index: 0,
    precipitation: 0,
    soil_temperature_0_to_7cm: null,
    soil_moisture_0_to_7cm: null,
  });

  describe('normalizeMinMax', () => {
    it('scales numeric arrays to [0, 1] range', () => {
      const input = [10, 20, 30, 40, 50];
      const result = normalizeMinMax(input);
      expect(result.min).toBe(10);
      expect(result.max).toBe(50);
      expect(result.normalized).toEqual([0, 0.25, 0.5, 0.75, 1]);
    });

    it('preserves null values at identical indices', () => {
      const input = [10, null, 50];
      const result = normalizeMinMax(input);
      expect(result.normalized).toEqual([0, null, 1]);
    });

    it('handles flat/constant series without division by zero', () => {
      const input = [25, 25, 25];
      const result = normalizeMinMax(input);
      expect(result.normalized).toEqual([0.5, 0.5, 0.5]);
    });
  });

  describe('calculateMetricExtent', () => {
    it('calculates domain bounds with padding', () => {
      const readings = [
        createMockReading(1000, 20, 50),
        createMockReading(2000, 30, 80),
      ];
      const extent = calculateMetricExtent(readings, 'temperature_2m', 0.1);
      expect(extent.min).toBeLessThan(20);
      expect(extent.max).toBeGreaterThan(30);
    });

    it('returns default extent for empty datasets', () => {
      const extent = calculateMetricExtent([], 'temperature_2m');
      expect(extent).toEqual({ min: 0, max: 100, range: 100 });
    });
  });

  describe('stitchTimeseries', () => {
    it('combines automated and case study records in ascending order', () => {
      const automated = [
        createMockReading(1000, 25, 60, 'automated'),
        createMockReading(3000, 28, 50, 'automated'),
      ];
      const caseStudy = [
        createMockReading(2000, -2, 85, 'user_requested', 'freeze_2021'),
      ];

      const stitched = stitchTimeseries(automated, caseStudy);
      expect(stitched.length).toBe(3);
      expect(stitched.map((r) => r.timestamp)).toEqual([1000, 2000, 3000]);
    });

    it('overrides overlapping automated records with case study data', () => {
      const automated = [createMockReading(1000, 25, 60, 'automated')];
      const caseStudy = [
        createMockReading(1000, -5, 90, 'user_requested', 'freeze_2021'),
      ];

      const stitched = stitchTimeseries(automated, caseStudy);
      expect(stitched.length).toBe(1);
      expect(stitched[0].temperature_2m).toBe(-5);
      expect(stitched[0].series_id).toBe('freeze_2021');
    });
  });

  describe('filterReadingsByRange', () => {
    it('filters readings within inclusive range', () => {
      const readings = [
        createMockReading(1000, 20, 50),
        createMockReading(2000, 25, 60),
        createMockReading(3000, 30, 70),
        createMockReading(4000, 35, 80),
      ];

      const filtered = filterReadingsByRange(readings, 2000, 3000);
      expect(filtered.map((r) => r.timestamp)).toEqual([2000, 3000]);
    });
  });

  describe('calculateClientPearson', () => {
    it('computes negative Pearson r for inverse temperature-humidity data', () => {
      const readings = [
        createMockReading(1000, 15, 90),
        createMockReading(2000, 20, 80),
        createMockReading(3000, 25, 65),
        createMockReading(4000, 30, 50),
        createMockReading(5000, 35, 35),
      ];

      const stats = calculateClientPearson(
        readings,
        'temperature_2m',
        'relative_humidity'
      );
      expect(stats).not.toBeNull();
      expect(stats!.sample_size).toBe(5);
      expect(stats!.pearson_r).toBeLessThan(-0.95);
      expect(stats!.regression_slope).toBeLessThan(0);
    });

    it('returns null for insufficient data points', () => {
      const readings = [createMockReading(1000, 20, 50)];
      const stats = calculateClientPearson(
        readings,
        'temperature_2m',
        'relative_humidity'
      );
      expect(stats).toBeNull();
    });
  });

  describe('calculateClientSMA', () => {
    it('computes rolling moving average over given window', () => {
      const readings = [
        createMockReading(1000, 10, 50),
        createMockReading(2000, 20, 50),
        createMockReading(3000, 30, 50),
      ];

      const smoothed = calculateClientSMA(readings, 'temperature_2m', 3);
      expect(smoothed.length).toBe(3);
      expect(smoothed[0].smoothed_value).toBe(10); // (10)/1
      expect(smoothed[1].smoothed_value).toBe(15); // (10+20)/2
      expect(smoothed[2].smoothed_value).toBe(20); // (10+20+30)/3
    });
  });

  describe('downsampleByInterval', () => {
    it('downsamples hourly readings by interval hours', () => {
      const readings = [
        createMockReading(0, 20, 50),
        createMockReading(3600, 21, 50),
        createMockReading(7200, 22, 50),
        createMockReading(10800, 23, 50),
      ];

      const downsampled = downsampleByInterval(readings, 2);
      expect(downsampled.map((r) => r.timestamp)).toEqual([0, 7200]);
    });
  });
});
