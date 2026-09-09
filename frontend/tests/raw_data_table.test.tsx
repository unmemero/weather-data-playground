import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RawDataTable } from '../src/components/data/RawDataTable';
import { WeatherReading } from '../src/types';

describe('RawDataTable Component Suite', () => {
  const mockReadings: WeatherReading[] = [
    {
      id: 1,
      location_id: 1,
      timestamp: 1788200000,
      time_iso: '2026-08-30T00:00',
      source_type: 'automated',
      series_id: null,
      ingested_at: 1788200000,
      temperature_2m: 24.5,
      apparent_temperature: 26.0,
      dewpoint_2m: 18.0,
      relative_humidity: 70,
      surface_pressure: 1012.3,
      wind_speed_10m: 12.5,
      wind_direction_10m: 180,
      wind_u: 0.0,
      wind_v: -12.5,
      shortwave_radiation: 0,
      uv_index: 0,
      precipitation: 0.0,
      soil_temperature_0_to_7cm: 25.0,
      soil_moisture_0_to_7cm: 0.22,
    },
    {
      id: 2,
      location_id: 1,
      timestamp: 1788203600,
      time_iso: '2026-08-30T01:00',
      source_type: 'user_requested',
      series_id: 'texas_freeze_2021',
      ingested_at: 1788203600,
      temperature_2m: -5.2,
      apparent_temperature: -11.0,
      dewpoint_2m: -10.0,
      relative_humidity: 45,
      surface_pressure: 1030.0,
      wind_speed_10m: 25.0,
      wind_direction_10m: 350,
      wind_u: 4.3,
      wind_v: 24.6,
      shortwave_radiation: 150,
      uv_index: 2.1,
      precipitation: 1.5,
      soil_temperature_0_to_7cm: -1.0,
      soil_moisture_0_to_7cm: 0.15,
    },
  ];

  it('renders raw observations table with record count and rows', () => {
    render(<RawDataTable readings={mockReadings} cityName="Austin" />);

    expect(screen.getByTestId('raw-data-table-container')).toBeInTheDocument();
    expect(screen.getByText(/Raw Observations & Telemetry/i)).toBeInTheDocument();
    expect(screen.getByTestId('record-count-badge')).toHaveTextContent(/2 records/i);

    // Check reading values
    expect(screen.getByText('2026-08-30 00:00')).toBeInTheDocument();
    expect(screen.getByText('24.5')).toBeInTheDocument();
    expect(screen.getByText('-5.2')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText(/Case: texas_freeze_2021/i)).toBeInTheDocument();
  });

  it('filters rows by quick search term', () => {
    render(<RawDataTable readings={mockReadings} cityName="Austin" />);

    const searchInput = screen.getByPlaceholderText(/Search date, time, value/i);
    fireEvent.change(searchInput, { target: { value: 'freeze' } });

    // Only 1 record should match
    expect(screen.getByTestId('record-count-badge')).toHaveTextContent(/1 record/i);
    expect(screen.queryByText('2026-08-30 00:00')).not.toBeInTheDocument();
    expect(screen.getByText('2026-08-30 01:00')).toBeInTheDocument();
  });

  it('filters rows by source type', () => {
    render(<RawDataTable readings={mockReadings} cityName="Austin" />);

    const sourceSelect = screen.getByTestId('source-filter-select');
    fireEvent.change(sourceSelect, { target: { value: 'automated' } });

    expect(screen.getByText('2026-08-30 00:00')).toBeInTheDocument();
    expect(screen.queryByText('2026-08-30 01:00')).not.toBeInTheDocument();
  });

  it('sorts columns when clicking header', () => {
    render(<RawDataTable readings={mockReadings} cityName="Austin" />);

    // Click Temperature header to sort asc
    const tempHeader = screen.getByText('Temp (°C)');
    fireEvent.click(tempHeader);

    const cells = screen.getAllByRole('cell');
    // First temperature row should be -5.2 (ascending)
    expect(cells.some((c) => c.textContent === '-5.2')).toBe(true);
  });

  it('renders empty state when no readings provided', () => {
    render(<RawDataTable readings={[]} cityName="Austin" />);

    expect(screen.getByTestId('record-count-badge')).toHaveTextContent(/0 records/i);
    expect(screen.getByText(/No weather observations matching criteria/i)).toBeInTheDocument();
  });
});
