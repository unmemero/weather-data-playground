import React, { useState } from 'react';
import { ChallengeStepProps, ScienceBadge } from './types';
import { JargonBusterTooltip } from './JargonBusterTooltip';
import {
  Snowflake,
  Award,
  ChevronRight,
  HelpCircle,
  Thermometer,
  Gauge,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const BADGE_CHALLENGE_4: ScienceBadge = {
  id: 'badge-synoptic-autopsy',
  title: 'Storm Investigator: Arctic Autopsy',
  category: 'Synoptic Meteorology',
  iconName: 'Snowflake',
  summary: 'Learned multi-dimensional synoptic alignment to diagnose arctic front passages from pressure, wind, and temperature signatures.',
  plainEnglishConcept:
    'A weather event is rarely diagnosed by a single sensor. To confirm a true cold front passage, an atmospheric scientist looks for three synchronized physical signals occurring at the exact same moment: 1) A sharp barometric pressure surge (cold dense arctic air weighing down on the ground), 2) A dramatic wind direction veer from South to North, and 3) A collapse in ambient temperature.',
  keyTakeaway:
    'Never analyze a single metric in isolation. Corroborating multiple physical dimensions (pressure + wind + temperature) eliminates false alarms and confirms the true physics of an air mass boundary.',
  formalEquation: 'dP/dz = -ρ·g  ⟹  P_surface = ∫ ρ(z)·g·dz',
};

// Historical hourly dataset of the 2021 Texas Freeze front arrival (Feb 11-12)
const HISTORICAL_FREEZE_STEPS = [
  { hour: 'Feb 10, 12:00 PM', temp: 21.5, pressure: 1012.1, windDir: 'South (170°)', isFront: false },
  { hour: 'Feb 10, 06:00 PM', temp: 19.8, pressure: 1013.0, windDir: 'South (180°)', isFront: false },
  { hour: 'Feb 11, 12:00 AM', temp: 17.2, pressure: 1014.2, windDir: 'SSE (160°)', isFront: false },
  { hour: 'Feb 11, 06:00 AM', temp: 15.0, pressure: 1015.8, windDir: 'Variable', isFront: false },
  { hour: 'Feb 11, 11:00 AM', temp: 12.1, pressure: 1019.4, windDir: 'North (355°)', isFront: true }, // Cold Front Arrival!
  { hour: 'Feb 11, 06:00 PM', temp: 3.4, pressure: 1027.8, windDir: 'North (010°)', isFront: false },
  { hour: 'Feb 12, 12:00 AM', temp: -1.2, pressure: 1032.5, windDir: 'North (360°)', isFront: false },
  { hour: 'Feb 12, 06:00 AM', temp: -6.8, pressure: 1038.1, windDir: 'NNW (340°)', isFront: false },
  { hour: 'Feb 12, 12:00 PM', temp: -8.5, pressure: 1041.2, windDir: 'North (005°)', isFront: false },
];

export const Challenge4ArcticFreeze: React.FC<ChallengeStepProps> = ({
  onComplete,
  onNextChallenge,
  isCompleted,
}) => {
  const [scrubberIndex, setScrubberIndex] = useState<number>(1);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [hasUnlocked, setHasUnlocked] = useState<boolean>(isCompleted);

  const currentObservation = HISTORICAL_FREEZE_STEPS[scrubberIndex];
  const isGoalReached = pinnedIndex === 4; // Feb 11, 11:00 AM is the front!

  const handlePin = () => {
    setPinnedIndex(scrubberIndex);
    if (scrubberIndex === 4) {
      setHasUnlocked(true);
      onComplete(BADGE_CHALLENGE_4);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. The Real-World Mystery & Jargon Buster */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#a29bfe]/15 border border-[#a29bfe]/30 text-[#a29bfe]">
            <Snowflake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#a29bfe] uppercase tracking-wider font-bold">
              Challenge 4 of 4 • Event Diagnostics & Case Studies
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Autopsy of an Arctic Freeze
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In February 2021, a catastrophic arctic front paralyzed the Texas energy grid.
          How do atmospheric scientists detect the exact hour an arctic front arrives?
          They look for three signals aligning at the exact same moment:
          1) <JargonBusterTooltip id="pressure">Barometric Pressure</JargonBusterTooltip> surges,
          2) Wind direction swings to the North, and
          3) Temperature crashes.
        </p>

        {/* Instructions */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white font-mono">
            <HelpCircle className="w-4 h-4 text-[#feca57]" />
            <span>Mission Objective:</span>
          </div>
          <p>
            Scrub through the February 2021 timeline below. Inspect the telemetry dials at each timestamp and click <b>"Pin Front Arrival"</b> at the exact hour you see pressure surge, wind pivot North, and the deep freeze begin!
          </p>
        </div>
      </div>

      {/* 2. Interactive Scrubber & Telemetry Dials */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 font-semibold">
            Timeline Scrubber (Feb 10 - Feb 12, 2021):
          </span>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-[#a29bfe]/15 border border-[#a29bfe]/30 text-[#a29bfe] rounded-lg">
            {currentObservation.hour}
          </span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max={HISTORICAL_FREEZE_STEPS.length - 1}
          value={scrubberIndex}
          onChange={(e) => setScrubberIndex(parseInt(e.target.value, 10))}
          className="w-full accent-[#a29bfe] h-3 bg-slate-800 rounded-lg cursor-pointer"
        />

        {/* 3 Telemetry Dials at Active Timestamp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Temperature */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Thermometer className="w-3.5 h-3.5 text-[#ff6b6b]" />
              <span>Ambient Temp</span>
            </div>
            <span
              className={`text-2xl font-black font-mono ${
                currentObservation.temp <= 0 ? 'text-[#48dbfb]' : 'text-[#ff6b6b]'
              }`}
            >
              {currentObservation.temp > 0 ? `+${currentObservation.temp}` : currentObservation.temp}°C
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentObservation.temp <= 0 ? '❄️ Freezing arctic air' : 'Mild pre-frontal air'}
            </span>
          </div>

          {/* Barometric Pressure */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Gauge className="w-3.5 h-3.5 text-[#1dd1a1]" />
              <span>Surface Pressure</span>
            </div>
            <span className="text-2xl font-black font-mono text-[#1dd1a1]">
              {currentObservation.pressure} hPa
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentObservation.pressure >= 1025 ? 'Heavy dense arctic dome' : 'Normal sea-level weight'}
            </span>
          </div>

          {/* Wind Direction */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Compass className="w-3.5 h-3.5 text-[#feca57]" />
              <span>Wind Bearing</span>
            </div>
            <span className="text-sm font-bold font-mono text-white mt-1">
              {currentObservation.windDir}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentObservation.windDir.includes('North') ? '🧭 Arctic origin flow' : 'Gulf moisture flow'}
            </span>
          </div>
        </div>

        {/* Pin Action Button */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <div className="text-xs font-mono text-slate-400">
            {pinnedIndex !== null ? (
              pinnedIndex === 4 ? (
                <span className="text-[#1dd1a1] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct! Pinned at {HISTORICAL_FREEZE_STEPS[pinnedIndex].hour}</span>
                </span>
              ) : (
                <span className="text-amber-400 font-bold">
                  Not quite: At {HISTORICAL_FREEZE_STEPS[pinnedIndex].hour}, the front had not yet arrived or had already passed. Look for the exact moment pressure jumps and wind flips North!
                </span>
              )
            ) : (
              <span>Move the scrubber and pin the front arrival hour.</span>
            )}
          </div>

          <button
            onClick={handlePin}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#a29bfe] text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            Pin This Timestamp
          </button>
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
                <span>🎉 Discovery Unlocked: You Pinpointed the 2021 Texas Front!</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                At 11:00 AM on Feb 11, the dense arctic air mass arrived. Barometric pressure jumped from 1015 to 1019 hPa, wind pivoted sharply to true North (355°), and temperatures plummeted below freezing in hours. You analyzed multiple physical dimensions simultaneously!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!hasUnlocked ? (
              <button
                onClick={() => {
                  setHasUnlocked(true);
                  onComplete(BADGE_CHALLENGE_4);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1dd1a1] text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(29,209,161,0.4)] flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Collect Badge</span>
              </button>
            ) : (
              <button
                onClick={onNextChallenge}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#a29bfe] text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Complete Track</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
