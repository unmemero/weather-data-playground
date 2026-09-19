import React, { useState, useMemo } from 'react';
import { ChallengeStepProps, ScienceBadge } from './types';
import { JargonBusterTooltip } from './JargonBusterTooltip';
import { useLiveSMA } from '../../hooks/useLiveCalculations';
import {
  Award,
  ChevronRight,
  Sun,
  HelpCircle,
} from 'lucide-react';

export const BADGE_CHALLENGE_1: ScienceBadge = {
  id: 'badge-sma-diurnal',
  title: 'Filter Master: Day & Night',
  category: 'Signal Processing',
  iconName: 'Sliders',
  summary: 'Learned how to suppress 24h solar diurnal oscillations using a Simple Moving Average.',
  plainEnglishConcept:
    'Real-world sensor data is constantly polluted with day-to-night temperature swings (diurnal cycle) caused by the sun. By taking a 24-hour moving average, you average together every hour of the daily cycle (the hottest afternoon and the coldest dawn). This cancels out the day-night wave, leaving behind the true long-term background weather front.',
  keyTakeaway:
    'Always match your moving average window to the frequency of the cycle you want to eliminate. To remove a daily 24h cycle, use a 24h filter window.',
  formalEquation: 'SMA_t = (1 / 24) · ∑[i=0..23] Temperature(t - i)',
};

export const Challenge1DayNight: React.FC<ChallengeStepProps> = ({
  readings,
  onComplete,
  onNextChallenge,
  isCompleted,
}) => {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [sliderWindow, setSliderWindow] = useState<number>(1);
  const [hasUnlocked, setHasUnlocked] = useState<boolean>(isCompleted);

  // Compute live SMA on temperature
  const liveSMA = useLiveSMA(readings, 'temperature_2m', sliderWindow);

  // Check if target goal is met (slider reached 24 hours)
  const isGoalReached = sliderWindow >= 24;

  const handleClaimBadge = () => {
    setHasUnlocked(true);
    onComplete(BADGE_CHALLENGE_1);
  };

  // Sample data points for miniature SVG preview chart
  const previewData = useMemo(() => {
    if (!readings || readings.length === 0) return { rawPath: '', smoothPath: '', minVal: 0, maxVal: 40 };
    // Take recent 7 days (up to 120 points)
    const points = readings.slice(-120);
    const rawVals = points
      .map((p) => p.temperature_2m)
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    const minVal = rawVals.length > 0 ? Math.floor(Math.min(...rawVals) - 2) : 0;
    const maxVal = rawVals.length > 0 ? Math.ceil(Math.max(...rawVals) + 2) : 40;
    const range = maxVal - minVal || 1;

    const width = 600;
    const height = 180;
    const stepX = width / (points.length - 1);

    // Build SVG path for raw line
    const rawCoords = points.map((p, i) => {
      const x = i * stepX;
      const temp = p.temperature_2m ?? 0;
      const y = height - ((temp - minVal) / range) * (height - 30) - 15;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // Build SVG path for smoothed line
    const smoothedCoords = liveSMA.smoothedPoints.slice(-120).map((p, i) => {
      const val = p.smoothed_value ?? p.raw_value ?? 0;
      const x = i * stepX;
      const y = height - ((val - minVal) / range) * (height - 30) - 15;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return {
      rawPath: rawCoords.join(' '),
      smoothPath: smoothedCoords.join(' '),
      minVal,
      maxVal,
    };
  }, [readings, liveSMA.smoothedPoints]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. The Real-World Mystery & Jargon Buster */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ff9f43]/15 border border-[#ff9f43]/30 text-[#ff9f43]">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#ff9f43] uppercase tracking-wider font-bold">
              Challenge 1 of 4 • Signal Processing & Time Series
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Can You Erase Day & Night?
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Look at the temperature line below. It bounces up and down like a roller coaster every single day.
          This repeating 24-hour wave is called the <JargonBusterTooltip id="diurnal">diurnal cycle</JargonBusterTooltip>.
          If you want to know whether a cold front is arriving, this daily roller coaster is just <JargonBusterTooltip id="noise">noise</JargonBusterTooltip> that gets in the way of the true <JargonBusterTooltip id="noise">trend</JargonBusterTooltip>.
        </p>

        {/* Prediction Box */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
            <HelpCircle className="w-4 h-4 text-[#feca57]" />
            <span>Step 1: Make a Quick Prediction</span>
          </div>
          <p className="text-xs text-slate-300">
            How many hours of weather data must you average together with a <JargonBusterTooltip id="sma">moving average</JargonBusterTooltip> to completely cancel out one full day-and-night cycle?
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {[6, 12, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => setPrediction(hours)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  prediction === hours
                    ? hours === 24
                      ? 'bg-[#1dd1a1]/25 border-[#1dd1a1] text-[#1dd1a1] shadow-md'
                      : 'bg-[#ff6b6b]/25 border-[#ff6b6b] text-[#ff6b6b]'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                {hours} Hours
              </button>
            ))}
          </div>
          {prediction !== null && (
            <div className="text-xs font-mono pt-1 text-slate-300">
              {prediction === 24 ? (
                <span className="text-[#1dd1a1] font-semibold">
                  ✓ Brilliant hypothesis! The earth takes 24 hours to complete one rotation under the sun. Now test it below!
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">
                  Notice: {prediction} hours only covers part of the day. Slide the dial below to test what happens!
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Mission Canvas */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-semibold">
              Step 2: Turn the Filter Window Dial:
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#ff9f43]/15 border border-[#ff9f43]/30 text-[#ff9f43] rounded-lg">
              Window: {sliderWindow} Hours
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Noise Attenuation:</span>
            <span className="text-sm font-bold text-[#1dd1a1]">
              -{liveSMA.varianceReductionPct}%
            </span>
          </div>
        </div>

        {/* The Live Interactive Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>1h (Raw Jitter)</span>
            <span>12h (Partial Flattening)</span>
            <span className="text-[#1dd1a1] font-bold">24h (Diurnal Flattening Target)</span>
            <span>48h (Multi-Day Trend)</span>
          </div>
          <input
            type="range"
            min="1"
            max="48"
            value={sliderWindow}
            onChange={(e) => setSliderWindow(parseInt(e.target.value, 10))}
            className="w-full accent-[#ff9f43] h-3 bg-slate-800 rounded-lg cursor-pointer"
            data-testid="challenge-sma-slider"
          />
        </div>

        {/* Visual Canvas Rendering Raw vs. Smoothed */}
        <div className="relative w-full h-48 bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono z-10">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-500 inline-block" />
              <span>Dotted Gray: Raw Day/Night Observations</span>
            </span>
            <span className="flex items-center gap-2 text-[#ff9f43] font-bold">
              <span className="w-3 h-1 bg-[#ff9f43] inline-block rounded" />
              <span>Solid Amber: Your Moving Average Filter</span>
            </span>
          </div>

          {/* SVG Line Graph */}
          <svg className="w-full h-32 overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
            {/* Raw Temperature Line (Dotted Gray) */}
            <path
              d={previewData.rawPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            {/* Smoothed SMA Line (Solid Vibrant Amber) */}
            <path
              d={previewData.smoothPath}
              fill="none"
              stroke="#ff9f43"
              strokeWidth={sliderWindow >= 24 ? "3.5" : "2.5"}
              className="transition-all duration-150"
            />
          </svg>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 z-10 border-t border-slate-900 pt-1">
            <span>5 Days Ago</span>
            <span>3 Days Ago</span>
            <span>1 Day Ago</span>
            <span>Now</span>
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
                <span>🎉 Discovery Unlocked: You Erased Day & Night!</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Notice how the sharp peaks and valleys completely vanished at 24 hours. You averaged the hottest afternoon and the coldest dawn together. The remaining smooth line reveals the real weather front moving through!
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#ff9f43] text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,159,67,0.4)] flex items-center justify-center gap-2"
              >
                <span>Next Challenge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Target: Drag the window slider up to at least 24 hours to cancel out the diurnal wave.</span>
          <span className="text-[#ff9f43] font-bold">{sliderWindow}/24h</span>
        </div>
      )}
    </div>
  );
};
