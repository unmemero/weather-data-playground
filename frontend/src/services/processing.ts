import { CorrelationStats, SmoothedPoint, WeatherReading } from '../types';

/**
 * Normalizes an array of values into a [0, 1] range for visual alignment across different units.
 */
export function normalizeMinMax(values: (number | null)[]): {
  normalized: (number | null)[];
  min: number;
  max: number;
} {
  const valid = values.filter((v): v is number => v !== null && !isNaN(v));
  if (valid.length === 0) {
    return { normalized: values.map(() => null), min: 0, max: 0 };
  }

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min;

  if (range === 0) {
    return {
      normalized: values.map((v) => (v === null ? null : 0.5)),
      min,
      max,
    };
  }

  const normalized = values.map((v) => (v === null ? null : (v - min) / range));
  return { normalized, min, max };
}

/**
 * Calculates domain bounds (min, max, recommended step) for dual-Y axis scales.
 */
export function calculateMetricExtent(
  readings: WeatherReading[],
  field: keyof WeatherReading,
  paddingPercent = 0.05
): { min: number; max: number; range: number } {
  const values = readings
    .map((r) => r[field])
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));

  if (values.length === 0) {
    return { min: 0, max: 100, range: 100 };
  }

  let min = Math.min(...values);
  let max = Math.max(...values);
  let range = max - min;

  if (range === 0) {
    min = min - 1;
    max = max + 1;
    range = 2;
  } else {
    const pad = range * paddingPercent;
    min = Math.floor((min - pad) * 10) / 10;
    max = Math.ceil((max + pad) * 10) / 10;
    range = max - min;
  }

  return { min, max, range };
}

/**
 * Stitches automated rolling records and case study records into a contiguous, sorted timeseries.
 * If timestamps collide, the case study reading takes precedence.
 */
export function stitchTimeseries(
  automated: WeatherReading[],
  caseStudy: WeatherReading[]
): WeatherReading[] {
  const map = new Map<number, WeatherReading>();

  // Insert automated records first
  for (const r of automated) {
    map.set(r.timestamp, r);
  }

  // Overlay case study records (overwrites any collision)
  for (const r of caseStudy) {
    map.set(r.timestamp, r);
  }

  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Slices readings to an inclusive [startTs, endTs] range.
 */
export function filterReadingsByRange(
  readings: WeatherReading[],
  startTs: number,
  endTs: number
): WeatherReading[] {
  return readings.filter((r) => r.timestamp >= startTs && r.timestamp <= endTs);
}

/**
 * Computes live Pearson r and linear regression parameters on client-side subsets.
 */
export function calculateClientPearson(
  readings: WeatherReading[],
  xField: keyof WeatherReading,
  yField: keyof WeatherReading
): CorrelationStats | null {
  const pairs: [number, number][] = [];

  for (const r of readings) {
    const x = r[xField];
    const y = r[yField];
    if (
      typeof x === 'number' &&
      !isNaN(x) &&
      typeof y === 'number' &&
      !isNaN(y)
    ) {
      pairs.push([x, y]);
    }
  }

  const n = pairs.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of pairs) {
    sumX += x;
    sumY += y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let varianceX = 0;
  let varianceY = 0;
  let covariance = 0;

  for (const [x, y] of pairs) {
    const dx = x - meanX;
    const dy = y - meanY;
    varianceX += dx * dx;
    varianceY += dy * dy;
    covariance += dx * dy;
  }

  covariance /= n;
  const stdX = Math.sqrt(varianceX / n);
  const stdY = Math.sqrt(varianceY / n);

  if (stdX === 0 || stdY === 0) {
    return {
      sample_size: n,
      mean_x: Math.round(meanX * 1000) / 1000,
      mean_y: Math.round(meanY * 1000) / 1000,
      std_x: Math.round(stdX * 1000) / 1000,
      std_y: Math.round(stdY * 1000) / 1000,
      covariance: Math.round(covariance * 1000) / 1000,
      pearson_r: 0,
      regression_slope: 0,
      regression_intercept: Math.round(meanY * 1000) / 1000,
    };
  }

  const pearsonR = covariance / (stdX * stdY);
  const slope = (covariance) / (stdX * stdX);
  const intercept = meanY - slope * meanX;

  return {
    sample_size: n,
    mean_x: Math.round(meanX * 1000) / 1000,
    mean_y: Math.round(meanY * 1000) / 1000,
    std_x: Math.round(stdX * 1000) / 1000,
    std_y: Math.round(stdY * 1000) / 1000,
    covariance: Math.round(covariance * 1000) / 1000,
    pearson_r: Math.round(pearsonR * 1000) / 1000,
    regression_slope: Math.round(slope * 1000) / 1000,
    regression_intercept: Math.round(intercept * 1000) / 1000,
  };
}

/**
 * Calculates client-side rolling Simple Moving Average (SMA) for instant slider feedback.
 */
export function calculateClientSMA(
  readings: WeatherReading[],
  field: keyof WeatherReading,
  windowHours: number
): SmoothedPoint[] {
  if (windowHours <= 1) {
    return readings.map((r) => ({
      timestamp: r.timestamp,
      time_iso: r.time_iso,
      raw_value: (r[field] as number) ?? null,
      smoothed_value: (r[field] as number) ?? null,
    }));
  }

  const result: SmoothedPoint[] = [];
  const buffer: number[] = [];

  for (const r of readings) {
    const val = r[field];
    if (typeof val === 'number' && !isNaN(val)) {
      buffer.push(val);
      if (buffer.length > windowHours) {
        buffer.shift();
      }
      const sum = buffer.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / buffer.length;
      result.push({
        timestamp: r.timestamp,
        time_iso: r.time_iso,
        raw_value: val,
        smoothed_value: Math.round(avg * 100) / 100,
      });
    } else {
      result.push({
        timestamp: r.timestamp,
        time_iso: r.time_iso,
        raw_value: null,
        smoothed_value: null,
      });
    }
  }

  return result;
}

/**
 * Downsamples timeseries for high-performance rendering over multi-month datasets.
 */
export function downsampleByInterval(
  readings: WeatherReading[],
  intervalHours: number
): WeatherReading[] {
  if (intervalHours <= 1 || readings.length === 0) return readings;

  const result: WeatherReading[] = [];
  const intervalSeconds = intervalHours * 3600;
  let lastIncludedTs = -Infinity;

  for (const r of readings) {
    if (r.timestamp - lastIncludedTs >= intervalSeconds) {
      result.push(r);
      lastIncludedTs = r.timestamp;
    }
  }

  return result;
}
