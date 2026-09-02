import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { LatexRenderer } from '../src/components/latex/LatexRenderer';
import { CorrelationLatexBox } from '../src/components/latex/CorrelationLatexBox';
import { WindVectorLatexBox } from '../src/components/latex/WindVectorLatexBox';
import { CorrelationStats, ScatterPoint, WindVectorStats } from '../src/types';

describe('Interactive LaTeX Animation Engine', () => {
  describe('LatexRenderer', () => {
    it('renders mathematical LaTeX strings into KaTeX DOM markup', () => {
      render(<LatexRenderer formula="r = \frac{\text{Cov}(X, Y)}{\sigma_X \sigma_Y}" />);
      const katexElement = screen.getByTestId('katex-render');
      expect(katexElement).toBeInTheDocument();
      expect(katexElement.innerHTML).toContain('katex');
    });

    it('renders block equations when displayMode is true', () => {
      render(<LatexRenderer formula="E = mc^2" displayMode={true} />);
      const katexElement = screen.getByTestId('katex-render');
      expect(katexElement.innerHTML).toContain('katex-display');
    });
  });

  describe('CorrelationLatexBox', () => {
    const mockStats: CorrelationStats = {
      sample_size: 720,
      mean_x: 25.0,
      mean_y: 60.0,
      std_x: 4.0,
      std_y: 15.0,
      covariance: -54.0,
      pearson_r: -0.9,
      regression_slope: -3.375,
      regression_intercept: 144.375,
    };

    it('renders baseline Pearson formula and regression trendline', () => {
      render(<CorrelationLatexBox stats={mockStats} hoveredPoint={null} />);
      expect(screen.getByText(/Pearson Product-Moment Correlation/i)).toBeInTheDocument();
      expect(screen.getByText(/Least-Squares Regression Trendline/i)).toBeInTheDocument();
      expect(screen.getByText(/n = 720/i)).toBeInTheDocument();
      expect(screen.getByText(/Slope \(m\) = -3.375/i)).toBeInTheDocument();
    });

    it('reacts dynamically to hovered point with deviations and residuals', () => {
      const hoveredPoint: ScatterPoint = {
        x: 30.0,
        y: 40.0,
        timestamp: 1788200000,
        time_iso: '2026-08-30T12:00',
      };

      render(
        <CorrelationLatexBox
          stats={mockStats}
          hoveredPoint={hoveredPoint}
          xLabel="Temperature"
          yLabel="Humidity"
        />
      );

      const hoverBox = screen.getByTestId('hover-latex-box');
      expect(within(hoverBox).getByText(/Hover Active/i)).toBeInTheDocument();
      expect(within(hoverBox).getByText(/\(Temperature: 30, Humidity: 40\)/i)).toBeInTheDocument();
      expect(hoverBox.innerHTML).toContain('katex');
    });
  });

  describe('WindVectorLatexBox', () => {
    const mockWindStats: WindVectorStats = {
      mean_speed: 12.5,
      mean_u: -2.5,
      mean_v: 11.8,
      resultant_direction: 168.0,
      wind_rose_bins: [],
    };

    it('renders vector mathematics and resultant average direction', () => {
      render(<WindVectorLatexBox stats={mockWindStats} />);
      expect(screen.getByText(/Meteorological Vector Mathematics/i)).toBeInTheDocument();
      expect(screen.getByText(/168°/i)).toBeInTheDocument();
      expect(screen.getByText(/Zonal \(U\) & Meridional \(V\) Decomposition/i)).toBeInTheDocument();
    });

    it('dynamically computes U and V vectors on observation hover', () => {
      render(
        <WindVectorLatexBox
          stats={mockWindStats}
          hoveredSpeed={10.0}
          hoveredDirection={180.0}
        />
      );

      const hoverBox = screen.getByTestId('wind-hover-latex-box');
      expect(within(hoverBox).getByText(/Observation Active/i)).toBeInTheDocument();
      expect(within(hoverBox).getByText(/Wind Speed:/i)).toBeInTheDocument();
      expect(within(hoverBox).getByText(/10 km\/h/i)).toBeInTheDocument();
      expect(within(hoverBox).getByText(/180°/i)).toBeInTheDocument();
      expect(within(hoverBox).getByText(/Northward \(S->N\)/i)).toBeInTheDocument();
      expect(hoverBox.innerHTML).toContain('katex');
    });
  });
});
