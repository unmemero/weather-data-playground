import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CitySearchModal } from '../src/components/modals/CitySearchModal';
import { CaseStudyModal } from '../src/components/modals/CaseStudyModal';
import { CsvModal } from '../src/components/modals/CsvModal';
import { WeatherProvider } from '../src/context/WeatherContext';
import * as api from '../src/services/api';

vi.mock('../src/services/api', () => ({
  listLocations: vi.fn(),
  searchLocations: vi.fn(),
  selectLocation: vi.fn(),
  deleteLocation: vi.fn(),
  syncWeather: vi.fn(),
  getTimeseries: vi.fn(),
  getCorrelation: vi.fn(),
  getWindRose: vi.fn(),
  listCaseStudies: vi.fn(),
  downloadCaseStudy: vi.fn(),
  deleteCaseStudy: vi.fn(),
  getExportCsvUrl: vi.fn().mockReturnValue('/api/weather/export/csv?range=7d'),
  importCsv: vi.fn(),
}));

describe('Management Modals & Portability Suite', () => {
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

  const mockCaseStudies = [
    {
      series_id: 'texas_freeze_2021',
      start_timestamp: 1613088000,
      end_timestamp: 1613516400,
      record_count: 120,
      ingested_at: 1000,
      is_stale: false,
    },
  ];

  describe('CitySearchModal', () => {
    it('renders search bar, triggers geocoding, and renders results', async () => {
      vi.mocked(api.listLocations).mockResolvedValue([mockActiveLocation]);
      vi.mocked(api.getTimeseries).mockResolvedValue({ readings: [] });
      vi.mocked(api.getCorrelation).mockResolvedValue(null as any);
      vi.mocked(api.getWindRose).mockResolvedValue(null as any);
      vi.mocked(api.listCaseStudies).mockResolvedValue([]);
      vi.mocked(api.searchLocations).mockResolvedValue([
        {
          id: null,
          name: 'London',
          country: 'United Kingdom',
          latitude: 51.5,
          longitude: -0.12,
          timezone: 'Europe/London',
          is_active: false,
          created_at: 0,
        },
      ]);

      render(
        <WeatherProvider>
          <CitySearchModal isOpen={true} onClose={() => {}} />
        </WeatherProvider>
      );

      expect(screen.getByTestId('city-search-modal')).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/Search city by name/i);
      fireEvent.change(input, { target: { value: 'London' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(api.searchLocations).toHaveBeenCalledWith('London', 6);
        expect(screen.getAllByText(/London/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Select & Backfill/i)).toBeInTheDocument();
      });
    });
  });

  describe('CaseStudyModal', () => {
    it('renders preset events and pinned historical case studies', async () => {
      vi.mocked(api.listLocations).mockResolvedValue([mockActiveLocation]);
      vi.mocked(api.getTimeseries).mockResolvedValue({ readings: [] });
      vi.mocked(api.getCorrelation).mockResolvedValue(null as any);
      vi.mocked(api.getWindRose).mockResolvedValue(null as any);
      vi.mocked(api.listCaseStudies).mockResolvedValue(mockCaseStudies);

      render(
        <WeatherProvider>
          <CaseStudyModal isOpen={true} onClose={() => {}} />
        </WeatherProvider>
      );

      expect(screen.getByTestId('case-study-modal')).toBeInTheDocument();
      expect(screen.getByText(/2021 Texas Winter Storm/i)).toBeInTheDocument();
      expect(screen.getByText(/2021 Pacific Northwest Heat Dome/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('texas_freeze_2021')).toBeInTheDocument();
      });
    });
  });

  describe('CsvModal', () => {
    it('switches between Export and Import tabs and exposes download link', () => {
      vi.mocked(api.listLocations).mockResolvedValue([mockActiveLocation]);
      vi.mocked(api.getTimeseries).mockResolvedValue({ readings: [] });
      vi.mocked(api.getCorrelation).mockResolvedValue(null as any);
      vi.mocked(api.getWindRose).mockResolvedValue(null as any);
      vi.mocked(api.listCaseStudies).mockResolvedValue(mockCaseStudies);

      render(
        <WeatherProvider>
          <CsvModal isOpen={true} onClose={() => {}} />
        </WeatherProvider>
      );

      expect(screen.getByTestId('csv-modal')).toBeInTheDocument();
      expect(screen.getByText(/Export Timeseries to CSV/i)).toBeInTheDocument();
      expect(screen.getByText(/Download CSV Dataset/i)).toBeInTheDocument();

      // Switch to Import Tab
      fireEvent.click(screen.getByText(/Import CSV Dataset/i));
      expect(screen.getByText(/Select .CSV File:/i)).toBeInTheDocument();
      expect(screen.getByText(/Commit & Upsert into SQLite/i)).toBeInTheDocument();
    });
  });
});
