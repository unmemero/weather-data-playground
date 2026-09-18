import React from 'react';
import { CorrelationStats, ScatterPoint } from '../../types';
import { LatexRenderer } from './LatexRenderer';
import { Sparkles, Activity } from 'lucide-react';

interface CorrelationLatexBoxProps {
  stats: CorrelationStats | null;
  hoveredPoint: ScatterPoint | null;
  xLabel?: string;
  yLabel?: string;
}

export const CorrelationLatexBox: React.FC<CorrelationLatexBoxProps> = ({
  stats,
  hoveredPoint,
  xLabel = 'X',
  yLabel = 'Y',
}) => {
  if (!stats) {
    return (
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 text-xs text-center font-mono">
        Awaiting bivariate dataset calculation...
      </div>
    );
  }

  // Calculate live hover deviations if a point is hovered
  const hoverMetrics = hoveredPoint
    ? {
        x: hoveredPoint.x,
        y: hoveredPoint.y,
        dx: Math.round((hoveredPoint.x - stats.mean_x) * 100) / 100,
        dy: Math.round((hoveredPoint.y - stats.mean_y) * 100) / 100,
        product:
          Math.round(
            (hoveredPoint.x - stats.mean_x) * (hoveredPoint.y - stats.mean_y) * 100
          ) / 100,
        predictedY:
          Math.round(
            (stats.regression_slope * hoveredPoint.x + stats.regression_intercept) * 100
          ) / 100,
        residual:
          Math.round(
            (hoveredPoint.y -
              (stats.regression_slope * hoveredPoint.x + stats.regression_intercept)) *
              100
          ) / 100,
      }
    : null;

  const basePearsonFormula = `r = \\frac{\\sum_{i=1}^{n} (X_i - \\bar{X})(Y_i - \\bar{Y})}{\\sqrt{\\sum (X_i - \\bar{X})^2 \\sum (Y_i - \\bar{Y})^2}} = \\frac{\\text{Cov}(X, Y)}{\\sigma_X \\cdot \\sigma_Y} = \\frac{${stats.covariance}}{${stats.std_x} \\times ${stats.std_y}} = \\mathbf{${stats.pearson_r}}`;

  const regressionFormula = `\\hat{Y} = (${stats.regression_slope}) \\cdot X + (${stats.regression_intercept})`;

  return (
    <div
      id="tour-corr-latex"
      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-lg backdrop-blur"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0abde3]" />
          <span className="text-sm font-semibold text-slate-200">
            Mathematical Formulation & Decomposition
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sample Size:</span>
          <span className="font-mono text-[#48dbfb] font-medium">n = {stats.sample_size}</span>
        </div>
      </div>

      {/* Main Pearson Equation */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 overflow-x-auto text-center flex flex-col gap-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider text-left">
          Pearson Product-Moment Correlation (r)
        </span>
        <div className="text-slate-100 py-1">
          <LatexRenderer formula={basePearsonFormula} displayMode={true} />
        </div>
      </div>

      {/* Regression Equation & Live Hover Reaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Regression Line */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 flex flex-col gap-1.5">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Least-Squares Regression Trendline
          </span>
          <div className="text-slate-200 py-1">
            <LatexRenderer formula={regressionFormula} displayMode={false} />
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-auto">
            Slope (m) = {stats.regression_slope} | Intercept (c) = {stats.regression_intercept}
          </div>
        </div>

        {/* Live Hover Inspection Box */}
        <div
          className={`border rounded-lg p-3 flex flex-col gap-1.5 transition-all duration-200 ${
            hoverMetrics
              ? 'bg-[#0abde3]/10 border-[#0abde3]/40 shadow-inner'
              : 'bg-slate-950/40 border-slate-800/80'
          }`}
          data-testid="hover-latex-box"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#48dbfb] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Point Co-Variation Inspection</span>
            </span>
            {hoverMetrics && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0abde3]/20 text-[#48dbfb] rounded">
                Hover Active
              </span>
            )}
          </div>

          {hoverMetrics ? (
            <div className="flex flex-col gap-1 text-xs font-mono">
              <div className="text-slate-300">
                <span className="text-slate-400">Observed: </span>
                <span className="text-[#48dbfb] font-semibold">
                  ({xLabel}: {hoverMetrics.x}, {yLabel}: {hoverMetrics.y})
                </span>
              </div>
              <div className="py-1">
                <LatexRenderer
                  formula={`\\Delta X = ${hoverMetrics.dx}, \\; \\Delta Y = ${hoverMetrics.dy} \\implies \\Delta X \\cdot \\Delta Y = \\mathbf{${hoverMetrics.product}}`}
                  displayMode={false}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>
                  Model <LatexRenderer formula="\hat{Y}" />: <b className="text-slate-200">{hoverMetrics.predictedY}</b>
                </span>
                <span>
                  Residual <LatexRenderer formula="\epsilon" />: <b className={hoverMetrics.residual >= 0 ? 'text-[#2ed573]' : 'text-[#ff6b6b]'}>{hoverMetrics.residual}</b>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-2">
              Hover over any point on the scatter plot to inspect its deviation products $\Delta X \cdot \Delta Y$ and regression residual in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrelationLatexBox;
