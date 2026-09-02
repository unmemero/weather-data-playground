import {
  ApiResponse,
  CaseStudyInfo,
  CorrelationResponse,
  Location,
  SyncResult,
  TimeseriesResponse,
  WindVectorStats,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json: ApiResponse<T> = await response.json();
  if (!json.success || json.error) {
    throw new Error(json.error || `Request to ${endpoint} failed`);
  }

  return json.data as T;
}

// ----------------------------------------------------------------------------
// Location & Station Profile Endpoints
// ----------------------------------------------------------------------------

export async function listLocations(): Promise<Location[]> {
  return request<Location[]>('/locations');
}

export async function searchLocations(query: string, count = 5): Promise<Location[]> {
  const params = new URLSearchParams({ query, count: count.toString() });
  return request<Location[]>(`/locations/search?${params.toString()}`);
}

export async function selectLocation(payload: {
  location_id?: number;
  location?: Location;
}): Promise<Location> {
  return request<Location>('/locations/select', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteLocation(id: number): Promise<boolean> {
  return request<boolean>(`/locations/${id}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------------------------------
// Ingestion & Sync Endpoints
// ----------------------------------------------------------------------------

export async function syncWeather(): Promise<SyncResult> {
  return request<SyncResult>('/weather/sync', {
    method: 'POST',
  });
}

// ----------------------------------------------------------------------------
// Timeseries Endpoints
// ----------------------------------------------------------------------------

export interface TimeseriesParams {
  range?: string;
  series_id?: string;
  smoothing?: string;
  smooth_field?: string;
}

export async function getTimeseries(params?: TimeseriesParams): Promise<TimeseriesResponse> {
  const query = new URLSearchParams();
  if (params?.range) query.set('range', params.range);
  if (params?.series_id) query.set('series_id', params.series_id);
  if (params?.smoothing && params.smoothing !== 'none') query.set('smoothing', params.smoothing);
  if (params?.smooth_field) query.set('smooth_field', params.smooth_field);

  const qs = query.toString();
  return request<TimeseriesResponse>(`/weather/timeseries${qs ? `?${qs}` : ''}`);
}

// ----------------------------------------------------------------------------
// Scientific Statistics Endpoints
// ----------------------------------------------------------------------------

export interface CorrelationParams {
  x: string;
  y: string;
  range?: string;
  series_id?: string;
}

export async function getCorrelation(params: CorrelationParams): Promise<CorrelationResponse> {
  const query = new URLSearchParams({ x: params.x, y: params.y });
  if (params.range) query.set('range', params.range);
  if (params.series_id) query.set('series_id', params.series_id);

  return request<CorrelationResponse>(`/weather/stats/correlation?${query.toString()}`);
}

export interface WindRoseParams {
  range?: string;
  series_id?: string;
}

export async function getWindRose(params?: WindRoseParams): Promise<WindVectorStats> {
  const query = new URLSearchParams();
  if (params?.range) query.set('range', params.range);
  if (params?.series_id) query.set('series_id', params.series_id);

  const qs = query.toString();
  return request<WindVectorStats>(`/weather/stats/wind-rose${qs ? `?${qs}` : ''}`);
}

// ----------------------------------------------------------------------------
// Synoptic Case Studies Endpoints
// ----------------------------------------------------------------------------

export async function downloadCaseStudy(payload: {
  series_id: string;
  start_date: string;
  end_date: string;
}): Promise<number> {
  return request<number>('/weather/case-studies/download', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listCaseStudies(): Promise<CaseStudyInfo[]> {
  return request<CaseStudyInfo[]>('/weather/case-studies');
}

export async function deleteCaseStudy(seriesId: string): Promise<number> {
  return request<number>(`/weather/case-studies/${seriesId}`, {
    method: 'DELETE',
  });
}

// ----------------------------------------------------------------------------
// CSV Data Portability
// ----------------------------------------------------------------------------

export function getExportCsvUrl(params?: { range?: string; series_id?: string }): string {
  const query = new URLSearchParams();
  if (params?.range) query.set('range', params.range);
  if (params?.series_id) query.set('series_id', params.series_id);
  const qs = query.toString();
  return `${API_BASE}/weather/export/csv${qs ? `?${qs}` : ''}`;
}

export async function importCsv(csvContent: string): Promise<number> {
  const url = `${API_BASE}/weather/import/csv`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/csv',
    },
    body: csvContent,
  });

  const json: ApiResponse<number> = await response.json();
  if (!json.success || json.error) {
    throw new Error(json.error || 'Failed to import CSV dataset');
  }

  return json.data as number;
}
