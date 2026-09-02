import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Frontend Base Setup', () => {
  it('renders application title in header', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Meteorology Lab & Timeseries Workbook/i)).toBeInTheDocument();
    });
  });

  it('renders feature card placeholders', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Bivariate Correlation/i)).toBeInTheDocument();
      expect(screen.getByText(/Wind Vector Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Synoptic Case Studies/i)).toBeInTheDocument();
    });
  });
});
