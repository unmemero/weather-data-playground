import React from 'react';
import { WindVectorStats } from '../../types';
import { LatexRenderer } from './LatexRenderer';
import { Compass, Wind } from 'lucide-react';

interface WindVectorLatexBoxProps {
  stats: WindVectorStats | null;
  hoveredSpeed?: number | null;
  hoveredDirection?: number | null;
}

export const WindVectorLatexBox: React.FC<WindVectorLatexBoxProps> = ({
  stats,
  hoveredSpeed = null,
  hoveredDirection = null,
}) => {
  // Live trigonometric calculation for hovered point
  const hoverVector =
    hoveredSpeed !== null &&
    hoveredSpeed !== undefined &&
    hoveredDirection !== null &&
    hoveredDirection !== undefined
      ? {
          speed: hoveredSpeed,
          dir: hoveredDirection,
          rad: Math.round(((hoveredDirection * Math.PI) / 180) * 1000) / 1000,
          u:
            Math.round(
              -hoveredSpeed * Math.sin((hoveredDirection * Math.PI) / 180) * 100
            ) / 100,
          v:
            Math.round(
              -hoveredSpeed * Math.cos((hoveredDirection * Math.PI) / 180) * 100
            ) / 100,
        }
      : null;

  const decompositionFormula = `U = -\\text{spd} \\cdot \\sin(\\theta), \\quad V = -\\text{spd} \\cdot \\cos(\\theta)`;

  const resultantFormula = stats
    ? `\\bar{\\Phi} = \\text{atan2}(-\\bar{U}, -\\bar{V}) = \\text{atan2}(-(${stats.mean_u}), -(${stats.mean_v})) = \\mathbf{${stats.resultant_direction}^\\circ}`
    : `\\bar{\\Phi} = \\text{atan2}(-\\bar{U}, -\\bar{V})`;

  return (
    <div
      id="tour-wind-latex"
      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-lg backdrop-blur"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#1dd1a1]" />
          <span className="text-sm font-semibold text-slate-200">
            Meteorological Vector Mathematics
          </span>
        </div>
        {stats && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Resultant:</span>
            <span className="text-[#1dd1a1] font-semibold">{stats.resultant_direction}°</span>
            <span className="text-slate-400">({stats.mean_speed} km/h)</span>
          </div>
        )}
      </div>

      {/* Trigonometric Decomposition Formulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col gap-1.5">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Zonal (U) & Meridional (V) Decomposition
          </span>
          <div className="text-slate-100 py-1">
            <LatexRenderer formula={decompositionFormula} displayMode={false} />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Meteorological wind directions define <i>where wind originates from</i>. The negative signs convert from azimuth compass bearing to Cartesian flow vectors.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col gap-1.5">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Vector Resultant Average Direction (<LatexRenderer formula="\bar{\Phi}" />)
          </span>
          <div className="text-slate-100 py-1">
            <LatexRenderer formula={resultantFormula} displayMode={false} />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Scalar compass averaging suffers from the 360°/0° modular singularity (e.g. 350° and 10° average to 180° South). Vector averaging preserves true atmospheric mass transport.
          </p>
        </div>
      </div>

      {/* Live Hover Vector Breakdown */}
      <div
        className={`border rounded-lg p-3 flex flex-col gap-1.5 transition-all duration-200 ${
          hoverVector
            ? 'bg-[#1dd1a1]/10 border-[#1dd1a1]/40 shadow-inner'
            : 'bg-slate-950/40 border-slate-800/80'
        }`}
        data-testid="wind-hover-latex-box"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#1dd1a1] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
            <Wind className="w-3.5 h-3.5 text-[#1dd1a1]" />
            <span>Instantaneous Observation Vector</span>
          </span>
          {hoverVector && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1dd1a1]/20 text-[#1dd1a1] rounded">
              Observation Active
            </span>
          )}
        </div>

        {hoverVector ? (
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <div className="text-slate-300 flex items-center justify-between">
              <span>
                Wind Speed: <b className="text-[#1dd1a1]">{hoverVector.speed} km/h</b>
              </span>
              <span>
                Azimuth Bearing ($\theta$): <b className="text-[#1dd1a1]">{hoverVector.dir}°</b>
              </span>
            </div>
            <div className="py-1">
              <LatexRenderer
                formula={`U = -(${hoverVector.speed}) \\cdot \\sin(${hoverVector.dir}^\\circ) = \\mathbf{${hoverVector.u} \\text{ km/h}}, \\quad V = -(${hoverVector.speed}) \\cdot \\cos(${hoverVector.dir}^\\circ) = \\mathbf{${hoverVector.v} \\text{ km/h}}`}
                displayMode={false}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-4 pt-1 border-t border-slate-800/80">
              <span>
                Zonal Flow: <b className="text-slate-200">{hoverVector.u >= 0 ? 'Eastward (W->E)' : 'Westward (E->W)'}</b>
              </span>
              <span>
                Meridional Flow: <b className="text-slate-200">{hoverVector.v >= 0 ? 'Northward (S->N)' : 'Southward (N->S)'}</b>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-1">
            Hover over any wind timeseries point or polar compass bin to see trigonometric $U, V$ vector decomposition in real-time.
          </div>
        )}
      </div>
    </div>
  );
};

export default WindVectorLatexBox;
