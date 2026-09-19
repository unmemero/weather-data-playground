import React, { useState } from 'react';
import { ChallengeStepProps, ScienceBadge } from './types';
import { JargonBusterTooltip } from './JargonBusterTooltip';
import {
  Compass,
  Award,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const BADGE_CHALLENGE_3: ScienceBadge = {
  id: 'badge-vector-compass',
  title: 'Vector Navigator: The Broken Compass',
  category: 'Trigonometry & Kinematics',
  iconName: 'Compass',
  summary: 'Mastered Cartesian U and V vector decomposition to solve the 360° modular compass singularity.',
  plainEnglishConcept:
    'Ordinary numbers live on a line, but compass directions live on a loop. When numbers wrap around from 359° to 0° (North), standard averaging breaks down completely: (350° + 10°) / 2 = 180° (South)! In physics, you cannot average raw angles. You must split every wind into an East-West arrow (U) and a North-South arrow (V), average the arrows, and then convert back.',
  keyTakeaway:
    'Never take the arithmetic mean of circular or periodic data. Decompose into Cartesian vectors (U, V) to preserve true mass flow and momentum.',
  formalEquation: 'U = -spd · sin(θ), V = -spd · cos(θ) ⟹ θ_avg = atan2(-U_avg, -V_avg)',
};

export const Challenge3BrokenCompass: React.FC<ChallengeStepProps> = ({
  onComplete,
  onNextChallenge,
  isCompleted,
}) => {
  const [activeMathMode, setActiveMathMode] = useState<'scalar' | 'vector'>('scalar');
  const [hasUnlocked, setHasUnlocked] = useState<boolean>(isCompleted);
  const [prediction, setPrediction] = useState<string | null>(null);

  const isGoalReached = activeMathMode === 'vector';

  const handleClaimBadge = () => {
    setHasUnlocked(true);
    onComplete(BADGE_CHALLENGE_3);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. The Real-World Mystery & Jargon Buster */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#1dd1a1]/15 border border-[#1dd1a1]/30 text-[#1dd1a1]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#1dd1a1] uppercase tracking-wider font-bold">
              Challenge 3 of 4 • Directional Math & Vector Kinematics
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              The Broken Compass: Why Standard Math Fails
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Imagine a weather station records two wind gusts: Reading #1 blows from <span className="font-mono text-[#1dd1a1] font-bold">350° (NNW)</span>, and Reading #2 blows from <span className="font-mono text-[#1dd1a1] font-bold">10° (NNE)</span>.
          Both gusts are blowing almost directly from the North! But if you average compass <JargonBusterTooltip id="azimuth">azimuth</JargonBusterTooltip> using school arithmetic, you fall into <JargonBusterTooltip id="modular_trap">The Modular Trap</JargonBusterTooltip>! To preserve true physics, scientists convert them to <JargonBusterTooltip id="vectors">Cartesian U and V vectors</JargonBusterTooltip>.
        </p>

        {/* Prediction Box */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
            <HelpCircle className="w-4 h-4 text-[#feca57]" />
            <span>Step 1: What Direction Did the Wind Actually Blow?</span>
          </div>
          <p className="text-xs text-slate-300">
            If one gust blew from 350° (just left of North) and the second gust blew from 10° (just right of North), which direction did the wind blow on average?
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => setPrediction('north')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                prediction === 'north'
                  ? 'bg-[#1dd1a1]/25 border-[#1dd1a1] text-[#1dd1a1] shadow-md'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              [▲] North (0° / 360°)
            </button>
            <button
              onClick={() => setPrediction('south')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                prediction === 'south'
                  ? 'bg-[#ff6b6b]/25 border-[#ff6b6b] text-[#ff6b6b]'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              [▼] South (180°)
            </button>
          </div>
          {prediction !== null && (
            <div className="text-xs font-mono pt-1 text-slate-300">
              {prediction === 'north' ? (
                <span className="text-[#1dd1a1] font-semibold">
                  ✓ Common sense says North! But look below to see what standard school math claims!
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">
                  Notice: Standard arithmetic claims South! See the visual proof below why that is a mathematical trap.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Mission Canvas */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <span className="text-slate-400 font-semibold">
            Step 2: Compare Arithmetic vs. Vector Math:
          </span>

          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMathMode('scalar')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMathMode === 'scalar'
                  ? 'bg-[#ff6b6b]/20 border border-[#ff6b6b]/40 text-[#ff6b6b]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Bad School Arithmetic
            </button>
            <button
              onClick={() => setActiveMathMode('vector')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeMathMode === 'vector'
                  ? 'bg-[#1dd1a1]/20 border border-[#1dd1a1]/40 text-[#1dd1a1]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Vector Decomposition (U & V)
            </button>
          </div>
        </div>

        {/* Visual Dual Compass Engine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Visual Dial */}
          <div className="relative h-60 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 flex flex-col items-center justify-center overflow-hidden">
            {/* Cardinal Markers */}
            <div className="absolute top-3 text-[11px] font-mono text-slate-400 font-bold">N (0°)</div>
            <div className="absolute bottom-3 text-[11px] font-mono text-slate-400 font-bold">S (180°)</div>
            <div className="absolute right-3 text-[11px] font-mono text-slate-400 font-bold">E (90°)</div>
            <div className="absolute left-3 text-[11px] font-mono text-slate-400 font-bold">W (270°)</div>

            {/* Compass Outer Ring */}
            <div className="w-44 h-44 rounded-full border border-dashed border-slate-700/60 relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-slate-800" />

              {/* Gust 1 Indicator (350°) */}
              <div
                className="absolute w-0.5 h-16 bg-slate-500 origin-bottom"
                style={{ transform: 'rotate(350deg) translateY(-8px)' }}
              />
              {/* Gust 2 Indicator (10°) */}
              <div
                className="absolute w-0.5 h-16 bg-slate-500 origin-bottom"
                style={{ transform: 'rotate(10deg) translateY(-8px)' }}
              />

              {/* Computed Average Arrow */}
              <div
                className={`absolute w-1.5 h-20 origin-bottom rounded-full transition-all duration-500 shadow-lg ${
                  activeMathMode === 'scalar'
                    ? 'bg-[#ff6b6b] shadow-[0_0_12px_#ff6b6b]'
                    : 'bg-[#1dd1a1] shadow-[0_0_16px_#1dd1a1]'
                }`}
                style={{
                  transform: activeMathMode === 'scalar' ? 'rotate(180deg) translateY(-10px)' : 'rotate(0deg) translateY(-10px)',
                }}
              />

              {/* Center Pivot */}
              <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-900 z-10" />
            </div>
          </div>

          {/* Explanation Matrix */}
          <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
            {activeMathMode === 'scalar' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#ff6b6b] font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Scalar Trap: (350 + 10) ÷ 2 = 180°</span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Because a circle wraps around at 360°, ordinary school arithmetic doesn't know that 350° is right next to 10°. It averages the numbers directly and claims the wind blew from the <b>South (180°)</b>! That is a 180° error—pointing in the exact opposite direction.
                </p>
                <div className="p-3 rounded-xl bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] text-[11px]">
                  ❌ Catastrophic Error: Claimed wind was blowing South when it was actually blowing North.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#1dd1a1] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The Vector Solution: Cartesian U & V</span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Instead of averaging angles, we split both gusts into orthogonal arrows:
                  <br />• <b>U (East-West)</b>: +3.5 km/h cancels out -3.5 km/h.
                  <br />• <b>V (North-South)</b>: Both point strong North (+19.7 km/h).
                  <br />When combined with trigonometry, the result is <b>True North (0°)</b>.
                </p>
                <div className="p-3 rounded-xl bg-[#1dd1a1]/10 border border-[#1dd1a1]/30 text-[#1dd1a1] text-[11px]">
                  ✓ Physically Accurate: Mass flow and momentum are conserved.
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveMathMode(activeMathMode === 'scalar' ? 'vector' : 'scalar')}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              Toggle to {activeMathMode === 'scalar' ? 'Vector Math (Correct)' : 'School Math (Wrong)'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. The "Aha!" Discovery Banner & Badge Reward */}
      {isGoalReached ? (
        <div className="rounded-2xl bg-gradient-to-r from-[#1dd1a1]/15 via-slate-900 to-[#1dd1a1]/10 border border-[#1dd1a1]/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#1dd1a1]/20 border border-[#1dd1a1]/40 text-[#1dd1a1]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🎉 Discovery Unlocked: You Mastered Vector Kinematics!</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                You now understand why all meteorologists, oceanographers, and roboticists use Cartesian U and V vectors for circular data. You defeated the 360° modular trap!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!hasUnlocked ? (
              <button
                onClick={handleClaimBadge}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1dd1a1] text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(29,209,161,0.4)] flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Collect Badge</span>
              </button>
            ) : (
              <button
                onClick={onNextChallenge}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1dd1a1] text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(29,209,161,0.4)] flex items-center justify-center gap-2"
              >
                <span>Next Challenge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
