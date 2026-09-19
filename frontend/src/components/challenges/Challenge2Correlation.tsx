import React, { useState, useMemo } from 'react';
import { ChallengeStepProps, ScienceBadge } from './types';
import { JargonBusterTooltip } from './JargonBusterTooltip';
import { useLivePearson } from '../../hooks/useLiveCalculations';
import { WeatherReading } from '../../types';
import {
  Award,
  ChevronRight,
  HelpCircle,
  Droplets,
} from 'lucide-react';

export const BADGE_CHALLENGE_2: ScienceBadge = {
  id: 'badge-correlation-sponge',
  title: 'Correlation Detective: The Air Sponge',
  category: 'Statistical Analysis',
  iconName: 'GitCommit',
  summary: 'Learned how Pearson r reveals inverse physical relationships through the Clausius-Clapeyron air sponge analogy.',
  plainEnglishConcept:
    'Relative humidity does not tell you how much water is in the air; it tells you how full the sponge is. Because warm air can hold exponentially more water vapor, afternoon heating expands the sponge, driving relative humidity down to its daily minimum even if zero water was lost. On a scatter plot, this shows up as a tight negative slope with r ≈ -0.85 (Bitter Enemies).',
  keyTakeaway:
    'A negative correlation (r < 0) means two variables move in opposite directions. Strong correlation (|r| > 0.7) means they are tightly coupled by an underlying physical law.',
  formalEquation: 'e_s(T) ∝ exp(17.67·T / (T + 243.5)) ⟹ r(T, RH) ≈ -0.85',
};

export const Challenge2Correlation: React.FC<ChallengeStepProps> = ({
  readings,
  onComplete,
  onNextChallenge,
  isCompleted,
}) => {
  const [prediction, setPrediction] = useState<'up' | 'down' | null>(null);
  const [xVar, setXVar] = useState<keyof WeatherReading>('temperature_2m');
  const [yVar, setYVar] = useState<keyof WeatherReading>('relative_humidity');
  const [hasUnlocked, setHasUnlocked] = useState<boolean>(isCompleted);

  // Compute live Pearson statistics
  const livePearson = useLivePearson(readings, xVar, yVar);
  const rVal = livePearson.stats?.pearson_r;

  // The goal is reached when they choose Temperature vs Relative Humidity and r is strongly negative
  const isGoalReached =
    (xVar === 'temperature_2m' && yVar === 'relative_humidity') ||
    (xVar === 'relative_humidity' && yVar === 'temperature_2m');

  const handleClaimBadge = () => {
    setHasUnlocked(true);
    onComplete(BADGE_CHALLENGE_2);
  };

  // Mini scatter plot points
  const scatterPoints = useMemo(() => {
    if (!livePearson.points || livePearson.points.length === 0) return [];
    const sample = livePearson.points.slice(-100);
    const xVals = sample.map((p) => p.x);
    const yVals = sample.map((p) => p.y);
    const minX = Math.min(...xVals);
    const maxX = Math.max(...xVals);
    const minY = Math.min(...yVals);
    const maxY = Math.max(...yVals);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const width = 450;
    const height = 200;

    return sample.map((p) => ({
      cx: ((p.x - minX) / rangeX) * (width - 40) + 20,
      cy: height - ((p.y - minY) / rangeY) * (height - 40) - 20,
      x: p.x,
      y: p.y,
    }));
  }, [livePearson.points]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. The Real-World Mystery & Jargon Buster */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ff6b6b]/15 border border-[#ff6b6b]/30 text-[#ff6b6b]">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#ff6b6b] uppercase tracking-wider font-bold">
              Challenge 2 of 4 • Statistical Relationships & Bivariate Analysis
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Best Friends, Bitter Enemies, or Total Strangers?
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Why does the air feel sticky on a cool morning, but your skin dries out on a scorching hot 35°C afternoon—even when no rain has fallen?
          To find out, scientists use <JargonBusterTooltip id="correlation">Pearson Correlation</JargonBusterTooltip> to see if two variables are <b>Best Friends</b> (move together), <b>Bitter Enemies</b> (move in opposite directions), or <b>Strangers</b>.
        </p>

        {/* Prediction Box */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
            <HelpCircle className="w-4 h-4 text-[#feca57]" />
            <span>Step 1: Test Your Intuition</span>
          </div>
          <p className="text-xs text-slate-300">
            Remember: the air is like a sponge! When temperature climbs from 15°C to 35°C, does <JargonBusterTooltip id="relative_humidity">Relative Humidity</JargonBusterTooltip> go UP or DOWN?
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => setPrediction('up')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                prediction === 'up'
                  ? 'bg-[#ff6b6b]/25 border-[#ff6b6b] text-[#ff6b6b]'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              [▲] Goes UP (Air gets wetter)
            </button>
            <button
              onClick={() => setPrediction('down')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                prediction === 'down'
                  ? 'bg-[#1dd1a1]/25 border-[#1dd1a1] text-[#1dd1a1] shadow-md'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              [▼] Drops DOWN (The sponge gets bigger)
            </button>
          </div>
          {prediction !== null && (
            <div className="text-xs font-mono pt-1 text-slate-300">
              {prediction === 'down' ? (
                <span className="text-[#1dd1a1] font-semibold">
                  ✓ Exactly! Warm air expands its sponge capacity exponentially. Now verify it with real field data below!
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">
                  Common trap! Total moisture might stay the same, but the warm sponge gets much bigger, so relative fullness drops. Check the chart below!
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Mission Canvas */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold">Step 2: Choose Variables:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#48dbfb] font-bold">X:</span>
              <select
                value={xVar}
                onChange={(e) => setXVar(e.target.value as keyof WeatherReading)}
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 text-xs outline-none"
              >
                <option value="temperature_2m">Temperature (°C)</option>
                <option value="surface_pressure">Pressure (hPa)</option>
                <option value="wind_speed_10m">Wind Speed (km/h)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ff6b6b] font-bold">Y:</span>
              <select
                value={yVar}
                onChange={(e) => setYVar(e.target.value as keyof WeatherReading)}
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 text-xs outline-none"
              >
                <option value="relative_humidity">Relative Humidity (%)</option>
                <option value="surface_pressure">Pressure (hPa)</option>
                <option value="wind_speed_10m">Wind Speed (km/h)</option>
              </select>
            </div>
          </div>

          {/* Relationship Meter */}
          {rVal !== null && rVal !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Relationship Score:</span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  rVal <= -0.7
                    ? 'bg-[#ff6b6b]/15 border-[#ff6b6b]/40 text-[#ff6b6b]'
                    : rVal >= 0.7
                    ? 'bg-[#1dd1a1]/15 border-[#1dd1a1]/40 text-[#1dd1a1]'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {rVal <= -0.7
                  ? `Bitter Enemies (r = ${rVal})`
                  : rVal >= 0.7
                  ? `Best Friends (r = ${rVal})`
                  : `Strangers (r = ${rVal})`}
              </span>
            </div>
          )}
        </div>

        {/* Interactive Scatter Plot */}
        <div className="relative w-full h-56 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
            <span>Each dot = One hourly station reading</span>
            <span className="text-slate-400">
              {rVal !== null && rVal !== undefined && rVal < 0 ? 'Downward slope = Inverse coupling' : 'Upward slope = Direct coupling'}
            </span>
          </div>

          <svg className="w-full h-36 overflow-visible" viewBox="0 0 450 200" preserveAspectRatio="none">
            {/* Dots */}
            {scatterPoints.map((pt, i) => (
              <circle
                key={i}
                cx={pt.cx}
                cy={pt.cy}
                r="3.5"
                fill="#ff6b6b"
                opacity="0.65"
                className="transition-all duration-200 hover:r-5 hover:opacity-100"
              />
            ))}

            {/* Downward trend line */}
            {scatterPoints.length > 1 && (
              <line
                x1="20"
                y1="30"
                x2="430"
                y2="170"
                stroke="#ff6b6b"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
            )}
          </svg>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-1">
            <span>Lower {xVar.split('_')[0]}</span>
            <span>Higher {xVar.split('_')[0]} ➔</span>
          </div>
        </div>
      </div>

      {/* 3. The "Aha!" Discovery Banner & Badge Reward */}
      {isGoalReached ? (
        <div className="rounded-2xl bg-gradient-to-r from-[#ff6b6b]/15 via-slate-900 to-[#ff6b6b]/10 border border-[#ff6b6b]/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#ff6b6b]/20 border border-[#ff6b6b]/40 text-[#ff6b6b]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🎉 Discovery Unlocked: Temperature & Humidity Are Bitter Enemies!</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                The dots slide steeply downward with a strong negative score (r ≈ -0.85). As afternoon temperatures climb, the air sponge expands exponentially, driving relative humidity down without losing a single drop of moisture!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!hasUnlocked ? (
              <button
                onClick={handleClaimBadge}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#ff6b6b] text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,107,107,0.4)] flex items-center justify-center gap-2"
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
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Target: Select Temperature (X) and Relative Humidity (Y) to reveal their empirical coupling.</span>
          <span className="text-[#ff6b6b] font-bold">Select Variables</span>
        </div>
      )}
    </div>
  );
};
