import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  CaseStudyInfo,
  CorrelationResponse,
  Location,
  TimeseriesResponse,
  WindVectorStats,
} from '../types';
import * as api from '../services/api';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '2y' | 'all';
export type SmoothingWindow = 'none' | '3h' | '12h' | '24h';

export interface WeatherContextValue {
  locations: Location[];
  activeLocation: Location | null;
  timeseriesData: TimeseriesResponse | null;
  correlationData: CorrelationResponse | null;
  windRoseData: WindVectorStats | null;
  caseStudies: CaseStudyInfo[];

  selectedRange: TimeRange;
  selectedSeriesId: string | null;
  smoothingWindow: SmoothingWindow;
  smoothingField: string;
  correlationX: string;
  correlationY: string;

  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  refreshAll: () => Promise<void>;
  selectCity: (payload: { location_id?: number; location?: Location }) => Promise<void>;
  deleteCity: (id: number) => Promise<void>;
  syncNow: () => Promise<void>;
  setRange: (range: TimeRange) => void;
  setSmoothing: (window: SmoothingWindow, field?: string) => void;
  setCorrelationVariables: (x: string, y: string) => void;
  selectSeries: (seriesId: string | null) => void;
  downloadCaseStudy: (seriesId: string, startDate: string, endDate: string) => Promise<void>;
  deleteCaseStudy: (seriesId: string) => Promise<void>;
  clearError: () => void;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesResponse | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationResponse | null>(null);
  const [windRoseData, setWindRoseData] = useState<WindVectorStats | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudyInfo[]>([]);

  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [smoothingWindow, setSmoothingWindow] = useState<SmoothingWindow>('none');
  const [smoothingField, setSmoothingField] = useState<string>('temperature_2m');
  const [correlationX, setCorrelationX] = useState<string>('temperature_2m');
  const [correlationY, setCorrelationY] = useState<string>('relative_humidity');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Load weather dataset and statistics for the active location
  const loadWeatherData = useCallback(
    async (
      range = selectedRange,
      seriesId = selectedSeriesId,
      smoothing = smoothingWindow,
      smoothField = smoothingField,
      corrX = correlationX,
      corrY = correlationY
    ) => {
      try {
        const [tsRes, corrRes, windRes, studiesRes] = await Promise.all([
          api.getTimeseries({
            range,
            series_id: seriesId || undefined,
            smoothing: smoothing !== 'none' ? smoothing : undefined,
            smooth_field: smoothField,
          }),
          api
            .getCorrelation({
              x: corrX,
              y: corrY,
              range,
              series_id: seriesId || undefined,
            })
            .catch(() => null),
          api
            .getWindRose({
              range,
              series_id: seriesId || undefined,
            })
            .catch(() => null),
          api.listCaseStudies().catch(() => []),
        ]);

        setTimeseriesData(tsRes);
        setCorrelationData(corrRes);
        setWindRoseData(windRes);
        setCaseStudies(studiesRes);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch weather telemetry');
      }
    },
    [selectedRange, selectedSeriesId, smoothingWindow, smoothingField, correlationX, correlationY]
  );

  // Initial load: Fetch locations and active location
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const locs = await api.listLocations();
      setLocations(locs);
      const active = locs.find((l) => l.is_active) || null;
      setActiveLocation(active);

      if (active) {
        await loadWeatherData();
      } else {
        setTimeseriesData(null);
        setCorrelationData(null);
        setWindRoseData(null);
        setCaseStudies([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize weather telemetry');
    } finally {
      setIsLoading(false);
    }
  }, [loadWeatherData]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Select / Switch city profile
  const selectCity = async (payload: { location_id?: number; location?: Location }) => {
    setIsLoading(true);
    setError(null);
    try {
      const activated = await api.selectLocation(payload);
      setActiveLocation(activated);
      const locs = await api.listLocations();
      setLocations(locs);
      setSelectedSeriesId(null);
      await loadWeatherData(selectedRange, null);
    } catch (err: any) {
      setError(err.message || 'Failed to switch city profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete city profile
  const deleteCity = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteLocation(id);
      await refreshAll();
    } catch (err: any) {
      setError(err.message || 'Failed to delete location');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual trigger sync
  const syncNow = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      await api.syncWeather();
      await loadWeatherData();
    } catch (err: any) {
      setError(err.message || 'Manual sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Change time range filter
  const setRange = (range: TimeRange) => {
    setSelectedRange(range);
    loadWeatherData(range, selectedSeriesId);
  };

  // Change smoothing window
  const setSmoothing = (window: SmoothingWindow, field?: string) => {
    const f = field || smoothingField;
    setSmoothingWindow(window);
    if (field) setSmoothingField(field);
    loadWeatherData(selectedRange, selectedSeriesId, window, f);
  };

  // Change correlation variables
  const setCorrelationVariables = (x: string, y: string) => {
    setCorrelationX(x);
    setCorrelationY(y);
    loadWeatherData(selectedRange, selectedSeriesId, smoothingWindow, smoothingField, x, y);
  };

  // Switch between automated rolling stream and historical case study
  const selectSeries = (seriesId: string | null) => {
    setSelectedSeriesId(seriesId);
    loadWeatherData(selectedRange, seriesId);
  };

  // Download historical case study
  const downloadCaseStudy = async (seriesId: string, startDate: string, endDate: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.downloadCaseStudy({ series_id: seriesId, start_date: startDate, end_date: endDate });
      setSelectedSeriesId(seriesId);
      await loadWeatherData(selectedRange, seriesId);
    } catch (err: any) {
      setError(err.message || 'Failed to download historical case study');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete historical case study
  const deleteCaseStudy = async (seriesId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteCaseStudy(seriesId);
      if (selectedSeriesId === seriesId) {
        setSelectedSeriesId(null);
        await loadWeatherData(selectedRange, null);
      } else {
        const studies = await api.listCaseStudies();
        setCaseStudies(studies);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete case study');
    } finally {
      setIsLoading(false);
    }
  };

  const value: WeatherContextValue = {
    locations,
    activeLocation,
    timeseriesData,
    correlationData,
    windRoseData,
    caseStudies,

    selectedRange,
    selectedSeriesId,
    smoothingWindow,
    smoothingField,
    correlationX,
    correlationY,

    isLoading,
    isSyncing,
    error,

    refreshAll,
    selectCity,
    deleteCity,
    syncNow,
    setRange,
    setSmoothing,
    setCorrelationVariables,
    selectSeries,
    downloadCaseStudy,
    deleteCaseStudy,
    clearError,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = (): WeatherContextValue => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
