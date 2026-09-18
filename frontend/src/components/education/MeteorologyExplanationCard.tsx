import React, { useState } from 'react';
import { LatexRenderer } from '../latex/LatexRenderer';
import { BookOpen, Thermometer, Wind, BarChart2, Sun, ChevronRight } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  summary: string;
  fullExplanation: string;
  keyFormula: string;
  formulaLabel: string;
  observedPhenomenon: string;
  academicCitation: string;
}

const TOPICS: Topic[] = [
  {
    id: 'clausius-clapeyron',
    title: 'Clausius-Clapeyron & Moisture Capacity',
    category: 'Atmospheric Thermodynamics',
    icon: Thermometer,
    color: 'text-[#ff6b6b]',
    borderColor: 'border-[#ff6b6b]/40',
    summary:
      'Explains the strong negative correlation (r ≈ -0.9) between Temperature and Relative Humidity during diurnal heating.',
    fullExplanation:
      'Relative Humidity (RH) represents the ratio of actual water vapor pressure (e) to the saturation vapor pressure (e_s). As solar radiation heats the surface, temperature rises, causing saturation vapor pressure to expand exponentially. If no new water vapor is added, RH plummets to its diurnal minimum near maximum afternoon heating.',
    keyFormula:
      'e_s(T) \\approx 6.112 \\cdot \\exp\\left(\\frac{17.67 \\cdot T}{T + 243.5}\\right) \\implies \\text{RH} = \\frac{e(T_d)}{e_s(T)} \\times 100\\%',
    formulaLabel: 'Tetens Parameterization for Saturation Vapor Pressure (hPa)',
    observedPhenomenon:
      'In our live bivariate scatter plot, you observe strong negative slope (m < 0) and high correlation (|r| > 0.85) between 2m Temperature and Relative Humidity.',
    academicCitation:
      'Ahrens, C. D. (2018). Meteorology Today: An Introduction to Weather, Climate, and the Environment (12th ed.). Cengage Learning. Chapter 4: Atmospheric Moisture.',
  },
  {
    id: 'wind-vector-averaging',
    title: 'Kinematics & Vector Wind Averaging',
    category: 'Dynamic Meteorology',
    icon: Wind,
    color: 'text-[#1dd1a1]',
    borderColor: 'border-[#1dd1a1]/40',
    summary:
      'Overcomes the 0°/360° modular compass singularity by decomposing wind into Cartesian U (Zonal) and V (Meridional) vectors.',
    fullExplanation:
      'Averaging azimuth angles directly as scalars produces catastrophic mathematical artifacts near North. For example, two observations at 350° (NNW) and 10° (NNE) have a scalar arithmetic mean of (350+10)/2 = 180° (South)—the exact opposite direction! Vector decomposition into U and V components preserves physical momentum and net atmospheric mass flux.',
    keyFormula:
      'U = -\\text{spd} \\cdot \\sin(\\theta), \\; V = -\\text{spd} \\cdot \\cos(\\theta) \\implies \\bar{\\Phi} = \\text{atan2}(-\\bar{U}, -\\bar{V})',
    formulaLabel: 'Meteorological Cartesian Vector Decomposition & Resultant Flow',
    observedPhenomenon:
      'Our Wind Rose engine bins observations into 16 discrete polar sectors while calculating the true resultant flow direction vectorially.',
    academicCitation:
      'Wallace, J. M., & Hobbs, P. V. (2006). Atmospheric Science: An Introductory Survey (2nd ed.). Academic Press. Chapter 8: The Planetary Boundary Layer.',
  },
  {
    id: 'baroclinic-fronts',
    title: 'Baroclinic Fronts & Temperature-Pressure Dipoles',
    category: 'Synoptic Meteorology',
    icon: BarChart2,
    color: 'text-[#a29bfe]',
    borderColor: 'border-[#a29bfe]/40',
    summary:
      'Cold frontal passages and polar outbreaks generate a distinct inverse pressure-temperature dipole as dense arctic air surges in.',
    fullExplanation:
      'Under hydrostatic equilibrium (dP = -ρ g dz), cold arctic air has significantly higher density (ρ = P / (R_d T)) than warm tropical air. When a polar front sweeps across a station (e.g. during the 2021 Texas Freeze), the rapid arrival of the cold dome causes surface pressure to surge while ambient temperatures collapse.',
    keyFormula:
      'P(z_0) = \\int_{z_0}^{\\infty} \\rho(z) g \\, dz = \\int_{z_0}^{\\infty} \\frac{P(z)}{R_d T(z)} g \\, dz',
    formulaLabel: 'Hydrostatic Mass Integral (Surface Barometric Weight)',
    observedPhenomenon:
      'Inspecting our historical Case Study (2021 Texas Freeze) shows a sharp barometric pressure jump correlated with sub-zero freezing temperatures.',
    academicCitation:
      'Holton, J. R., & Hakim, G. J. (2012). An Introduction to Dynamic Meteorology (5th ed.). Elsevier Academic Press. Chapter 3: Hydrostatic Balance.',
  },
  {
    id: 'solar-forcing-pbl',
    title: 'Solar Radiation & Boundary Layer Heat Flux',
    category: 'Planetary Boundary Layer',
    icon: Sun,
    color: 'text-[#feca57]',
    borderColor: 'border-[#feca57]/40',
    summary:
      'Incoming shortwave solar irradiance drives turbulent sensible heat flux, creating the characteristic 2-hour diurnal temperature lag.',
    fullExplanation:
      'Solar radiation (GHI) peaks at solar noon (~12:00-13:00 local solar time), but maximum surface air temperature occurs 2-3 hours later (~15:00-16:00). This hysteresis occurs because temperature continues rising as long as incoming solar and sensible heat fluxes exceed outgoing terrestrial infrared radiation.',
    keyFormula:
      'R_{\\text{net}} = S_\\downarrow (1 - \\alpha) + L_\\downarrow - L_\\uparrow = H + LE + G',
    formulaLabel: 'Surface Energy Budget Equilibrium Equation',
    observedPhenomenon:
      'Our Dual-Y Timeseries chart clearly displays the phase lag between shortwave solar irradiance peaks (W/m²) and peak ambient temperature (°C).',
    academicCitation:
      'Stull, R. B. (1988). An Introduction to Boundary Layer Meteorology. Kluwer Academic Publishers. Chapter 7: Surface Energy Balance.',
  },
];

export const MeteorologyExplanationCard: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('clausius-clapeyron');

  const currentTopic = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];
  const IconComponent = currentTopic.icon;

  return (
    <div
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur flex flex-col gap-6"
      data-testid="education-explainer-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0abde3]/10 border border-[#0abde3]/30 rounded-xl text-[#48dbfb]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Atmospheric Physics & Pedagogical Reference
            </h2>
            <p className="text-xs text-slate-400">
              Scientific physical interpretations, formulas, and academic literature citations
            </p>
          </div>
        </div>
      </div>

      {/* Topic Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TOPICS.map((topic) => {
          const isSelected = topic.id === selectedTopicId;
          const TopicIcon = topic.icon;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? `bg-slate-950 ${topic.borderColor} shadow-md`
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
            >
              <TopicIcon className={`w-4 h-4 ${topic.color}`} />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase truncate">
                  {topic.category}
                </span>
                <span
                  className={`text-xs font-semibold truncate ${
                    isSelected ? 'text-slate-100' : 'text-slate-300'
                  }`}
                >
                  {topic.title.split('&')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Topic Detailed Content Pane */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        {/* Title & Category Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconComponent className={`w-5 h-5 ${currentTopic.color}`} />
            <div>
              <h3 className="text-sm font-bold text-slate-100">{currentTopic.title}</h3>
              <span className="text-[11px] font-mono text-[#48dbfb]">
                Category: {currentTopic.category}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Explanation */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-lg border border-slate-800/80">
          {currentTopic.fullExplanation}
        </p>

        {/* Mathematical Formulation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{currentTopic.formulaLabel}</span>
          </div>
          <div className="py-2 text-center text-slate-100 overflow-x-auto">
            <LatexRenderer formula={currentTopic.keyFormula} displayMode={true} />
          </div>
        </div>

        {/* Real-World Observation in Workbook */}
        <div className="flex items-start gap-2.5 p-3.5 bg-[#0abde3]/10 border border-[#0abde3]/30 rounded-lg text-xs text-slate-300">
          <ChevronRight className="w-4 h-4 text-[#48dbfb] shrink-0 mt-0.5" />
          <div>
            <b className="text-[#48dbfb] font-mono">Workbook Observation Link: </b>
            {currentTopic.observedPhenomenon}
          </div>
        </div>

        {/* Academic Reference & Citation */}
        <div className="text-[11px] text-slate-400 font-mono bg-slate-900/30 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 uppercase tracking-wider font-semibold block mb-1">
            Academic Literature Citation
          </span>
          <span className="italic">{currentTopic.academicCitation}</span>
        </div>
      </div>
    </div>
  );
};

export default MeteorologyExplanationCard;
