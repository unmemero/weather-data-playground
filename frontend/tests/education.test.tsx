import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScientificTooltip } from '../src/components/education/ScientificTooltip';
import { MeteorologyExplanationCard } from '../src/components/education/MeteorologyExplanationCard';

describe('Pedagogical Explainers & Atmospheric Tooltips Suite', () => {
  describe('ScientificTooltip', () => {
    it('renders tooltip trigger and displays popover on hover', () => {
      render(
        <ScientificTooltip
          title="Pearson Correlation (r)"
          content="Measures the strength and direction of linear relationship between two variables."
          formula="r = Cov(X,Y) / (σX σY)"
          citation="Ahrens (2018)"
        />
      );

      const trigger = screen.getByTestId('scientific-tooltip-trigger');
      expect(trigger).toBeInTheDocument();

      // Mouse enter triggers tooltip content
      fireEvent.mouseEnter(trigger);
      expect(screen.getByTestId('scientific-tooltip-content')).toBeInTheDocument();
      expect(screen.getByText(/Pearson Correlation \(r\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Measures the strength/i)).toBeInTheDocument();
      expect(screen.getByText(/Source: Ahrens \(2018\)/i)).toBeInTheDocument();

      // Mouse leave hides tooltip
      fireEvent.mouseLeave(trigger);
      expect(screen.queryByTestId('scientific-tooltip-content')).not.toBeInTheDocument();
    });
  });

  describe('MeteorologyExplanationCard', () => {
    it('renders atmospheric physics card with tabs and KaTeX formula', () => {
      render(<MeteorologyExplanationCard />);

      expect(screen.getByTestId('education-explainer-card')).toBeInTheDocument();
      expect(screen.getByText(/Atmospheric Physics & Pedagogical Reference/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Clausius-Clapeyron/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Ahrens, C. D./i)).toBeInTheDocument();
    });

    it('allows switching between physics topics and displays respective citations', () => {
      render(<MeteorologyExplanationCard />);

      // Switch to Vector Wind Averaging
      const windTab = screen.getByText(/Kinematics/i);
      fireEvent.click(windTab);

      expect(screen.getByText(/Kinematics & Vector Wind Averaging/i)).toBeInTheDocument();
      expect(screen.getByText(/Wallace, J. M., & Hobbs, P. V./i)).toBeInTheDocument();

      // Switch to Baroclinic Fronts
      const frontTab = screen.getByText(/Baroclinic/i);
      fireEvent.click(frontTab);

      expect(screen.getByText(/Baroclinic Fronts & Temperature-Pressure Dipoles/i)).toBeInTheDocument();
      expect(screen.getByText(/Holton, J. R., & Hakim/i)).toBeInTheDocument();
    });
  });
});
