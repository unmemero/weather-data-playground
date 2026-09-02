import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrentConditionsRibbon } from '../src/components/dashboard/CurrentConditionsRibbon';
import { OnboardingHero } from '../src/components/dashboard/OnboardingHero';
import { WeatherReading } from '../src/types';

describe('Dashboard Micro-Components Suite', () => {
  describe('CurrentConditionsRibbon', () => {
    const mockReadings: WeatherReading[] = [
      {
        id: 1,
        location_id: 1,
        timestamp: 1788200000,
        time_iso: '2026-08-30T00:00',
        source_type: 'automated',
        series_id: null,
        ingested_at: 1788200000,
        temperature_2m: 22.0,
        apparent_temperature: 23.5,
        dewpoint_2m: 16.0,
        relative_humidity: 65,
        surface_pressure: 1010.0,
        wind_speed_10m: 10.0,
        wind_direction_10m: 180,
        wind_u: 0.0,
        wind_v: 10.0,
        shortwave_radiation: 0,
        uv_index: 0,
        precipitation: 0,
        soil_temperature_0_to_7cm: null,
        soil_moisture_0_to_7cm: null,
      },
      {
        id: 2,
        location_id: 1,
        timestamp: 1788210800, // 3 hours later
        time_iso: '2026-08-30T03:00',
        source_type: 'automated',
        series_id: null,
        ingested_at: 1788210800,
        temperature_2m: 28.4,
        apparent_temperature: 30.1,
        dewpoint_2m: 17.2,
        relative_humidity: 52,
        surface_pressure: 1012.8, // +2.8 hPa (Rising)
        wind_speed_10m: 15.6,
        wind_direction_10m: 165,
        wind_u: -4.0,
        wind_v: 15.1,
        shortwave_radiation: 650,
        uv_index: 6.5,
        precipitation: 0,
        soil_temperature_0_to_7cm: null,
        soil_moisture_0_to_7cm: null,
      },
    ];

    it('renders latest observation metrics, station name, and 3h pressure tendency', () => {
      render(
        <CurrentConditionsRibbon
          readings={mockReadings}
          cityName="Austin"
          timezone="America/Chicago"
        />
      );

      expect(screen.getByTestId('current-conditions-ribbon')).toBeInTheDocument();
      expect(screen.getByText('Austin')).toBeInTheDocument();
      expect(screen.getByText('(America/Chicago)')).toBeInTheDocument();

      // Ambient Temperature & Apparent Feel
      expect(screen.getByText('28.4°C')).toBeInTheDocument();
      expect(screen.getByText(/Feels 30.1°C/i)).toBeInTheDocument();

      // Relative Humidity
      expect(screen.getByText('52%')).toBeInTheDocument();
      expect(screen.getByText(/Comfortable/i)).toBeInTheDocument();

      // Surface Pressure & 3h Tendency
      expect(screen.getByText('1012.8')).toBeInTheDocument();
      expect(screen.getByText(/\+2.8 hPa \/ 3h \(Rising\)/i)).toBeInTheDocument();

      // Wind Velocity & Direction
      expect(screen.getByText('15.6')).toBeInTheDocument();
      expect(screen.getByText(/SSE \(165°\)/i)).toBeInTheDocument();

      // Solar Radiation & UV
      expect(screen.getByText('650')).toBeInTheDocument();
      expect(screen.getByText('6.5')).toBeInTheDocument();
    });

    it('returns null if no readings are provided', () => {
      const { container } = render(<CurrentConditionsRibbon readings={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('OnboardingHero', () => {
    it('renders onboarding welcome card and triggers search and preset callbacks', () => {
      const handleOpenSearch = vi.fn();
      const handleSelectPreset = vi.fn();

      render(
        <OnboardingHero
          onOpenSearch={handleOpenSearch}
          onSelectPreset={handleSelectPreset}
        />
      );

      expect(screen.getByTestId('onboarding-hero')).toBeInTheDocument();
      expect(
        screen.getByText(/Welcome to Meteorology Lab & Timeseries Workbook/i)
      ).toBeInTheDocument();

      // Click Search Button
      const searchBtn = screen.getByRole('button', {
        name: /Search & Configure Weather Station/i,
      });
      fireEvent.click(searchBtn);
      expect(handleOpenSearch).toHaveBeenCalledTimes(1);

      // Click Austin Preset Button
      const austinBtn = screen.getByRole('button', { name: /Austin/i });
      fireEvent.click(austinBtn);
      expect(handleSelectPreset).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Austin', country: 'United States' })
      );
    });
  });
});
