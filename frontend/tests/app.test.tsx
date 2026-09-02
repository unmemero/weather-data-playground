import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import * as api from '../src/services/api';

vi.mock('../src/services/api', () => ({
  listLocations: vi.fn(),
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
  searchLocations: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: any) => (
    <div data-testid="mock-line-chart" data-datasets-count={data.datasets?.length}>
      Mock Line Chart
    </div>
  ),
  Radar: ({ data }: any) => (
    <div data-testid="mock-radar-chart" data-datasets-count={data.datasets?.length}>
      Mock Radar Chart
    </div>
  ),
  Scatter: () => (
    <div data-testid="mock-scatter-chart">Mock Scatter Chart</div>
  ),
}));

describe('Main Dashboard & Workbench Assembly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listLocations).mockResolvedValue([
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
    ]);
    vi.mocked(api.getTimeseries).mockResolvedValue({ readings: [] });
    vi.mocked(api.getCorrelation).mockResolvedValue(null as any);
    vi.mocked(api.getWindRose).mockResolvedValue(null as any);
    vi.mocked(api.listCaseStudies).mockResolvedValue([]);
  });

  it('renders application header, station badge, and action buttons', async () => {
    render(<App />);

    expect(screen.getAllByText(/Meteorology Lab & Timeseries Workbook/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sync Station/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Austin')).toBeInTheDocument();
    });
  });

  it('allows navigating between workbook tabs', async () => {
    render(<App />);

    // 1. Default Tab: Timeseries
    expect(screen.getByText(/Timeseries & Dual-Y Explorer/i)).toBeInTheDocument();

    // 2. Switch to Bivariate Pearson & Regression Tab
    const corrTab = screen.getByText(/Bivariate Pearson & Regression/i);
    fireEvent.click(corrTab);
    expect(screen.getByText(/Correlation Variables:/i)).toBeInTheDocument();

    // 3. Switch to Polar Wind Rose Tab
    const windTab = screen.getByText(/Polar Wind Rose & Vector Math/i);
    fireEvent.click(windTab);
    expect(screen.getByText(/16-Sector Compass Polar Rose/i)).toBeInTheDocument();

    // 4. Switch to Atmospheric Physics Reference Tab
    const eduTab = screen.getByText(/Atmospheric Physics Reference/i);
    fireEvent.click(eduTab);
    expect(screen.getByText(/Atmospheric Physics & Pedagogical Reference/i)).toBeInTheDocument();
  });

  it('opens city search and CSV modals when clicked', async () => {
    render(<App />);

    const stationBtn = screen.getByTestId('station-selector-btn');
    fireEvent.click(stationBtn);
    expect(screen.getByTestId('city-search-modal')).toBeInTheDocument();

    const csvButtons = screen.getAllByText(/CSV Portability/i);
    fireEvent.click(csvButtons[0]);
    expect(screen.getByTestId('csv-modal')).toBeInTheDocument();
  });
});
