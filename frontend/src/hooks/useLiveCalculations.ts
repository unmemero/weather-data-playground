import { useMemo } from 'react';
import { CorrelationStats, ScatterPoint, SmoothedPoint, WeatherReading } from '../types';
import { calculateClientPearson, calculateClientSMA, filterReadingsByRange } from '../services/processing';

export interface LivePearsonResult {
  stats: CorrelationStats | null;
  points: ScatterPoint[];
  regressionLine: { x1: number; y1: number; x2: number; y2: number } | null;
}

/**
 * Custom hook for live Pearson r and linear regression recalculation
 * across interactive zoom/pan ranges or variable selections.
 */
export function useLivePearson(
  readings: WeatherReading[] | undefined | null,
  xField: keyof WeatherReading,
  yField: keyof WeatherReading,
  customRange?: { startTs: number; endTs: number } | null
): LivePearsonResult {
  return useMemo(() => {
    if (!readings || readings.length === 0) {
      return { stats: null, points: [], regressionLine: null };
    }

    // Filter by custom zoom/pan window if provided
    const targetReadings = customRange
      ? filterReadingsByRange(readings, customRange.startTs, customRange.endTs)
      : readings;

    const stats = calculateClientPearson(targetReadings, xField, yField);

    const points: ScatterPoint[] = [];
    for (const r of targetReadings) {
      const x = r[xField];
      const y = r[yField];
      if (
        typeof x === 'number' &&
        !isNaN(x) &&
        typeof y === 'number' &&
        !isNaN(y)
      ) {
        points.push({
          x,
          y,
          timestamp: r.timestamp,
          time_iso: r.time_iso,
        });
      }
    }

    let regressionLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
    if (stats && points.length >= 2) {
      const xValues = points.map((p) => p.x);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const y1 = stats.regression_slope * minX + stats.regression_intercept;
      const y2 = stats.regression_slope * maxX + stats.regression_intercept;
      regressionLine = {
        x1: minX,
        y1: Math.round(y1 * 100) / 100,
        x2: maxX,
        y2: Math.round(y2 * 100) / 100,
      };
    }

    return { stats, points, regressionLine };
  }, [readings, xField, yField, customRange?.startTs, customRange?.endTs]);
}

export interface LiveSMAResult {
  smoothedPoints: SmoothedPoint[];
  currentWindow: number;
  varianceReductionPct: number;
}

/**
 * Custom hook for instantaneous rolling Simple Moving Average smoothing preview.
 */
export function useLiveSMA(
  readings: WeatherReading[] | undefined | null,
  field: keyof WeatherReading,
  windowHours: number
): LiveSMAResult {
  return useMemo(() => {
    if (!readings || readings.length === 0) {
      return { smoothedPoints: [], currentWindow: windowHours, varianceReductionPct: 0 };
    }

    const smoothedPoints = calculateClientSMA(readings, field, windowHours);

    // Calculate variance reduction metric between raw and smoothed
    const rawVals = smoothedPoints
      .map((p) => p.raw_value)
      .filter((v): v is number => v !== null);
    const smoothVals = smoothedPoints
      .map((p) => p.smoothed_value)
      .filter((v): v is number => v !== null);

    let varianceReductionPct = 0;
    if (rawVals.length > 1 && smoothVals.length > 1) {
      const rawMean = rawVals.reduce((a, b) => a + b, 0) / rawVals.length;
      const smoothMean = smoothVals.reduce((a, b) => a + b, 0) / smoothVals.length;

      const rawVar = rawVals.reduce((a, b) => a + (b - rawMean) ** 2, 0) / rawVals.length;
      const smoothVar = smoothVals.reduce((a, b) => a + (b - smoothMean) ** 2, 0) / smoothVals.length;

      if (rawVar > 0) {
        varianceReductionPct = Math.max(0, Math.round(((rawVar - smoothVar) / rawVar) * 100));
      }
    }

    return {
      smoothedPoints,
      currentWindow: windowHours,
      varianceReductionPct,
    };
  }, [readings, field, windowHours]);
}
