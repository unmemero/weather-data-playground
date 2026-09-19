import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Sparkles, X } from 'lucide-react';
import { JargonTerm } from './types';

export const JARGON_GLOSSARY: Record<string, JargonTerm> = {
  diurnal: {
    term: 'Diurnal Cycle',
    pronunciation: 'dye-UR-nul',
    literalDefinition: 'Happening once every 24 hours, relating to the day/night cycle.',
    everydayAnalogy: 'Think of it as the 24-hour heartbeat of the sun. The earth warms up after sunrise and cools down after sunset.',
    whyScientistsUseIt: 'Separates daily temperature swings caused by sunshine from real seasonal or frontal airmass changes.',
  },
  sma: {
    term: 'Moving Average (SMA)',
    pronunciation: 'Simple Moving Average',
    literalDefinition: 'An average of data points over a sliding window of time.',
    everydayAnalogy: 'Like squinting your eyes at a noisy, pixelated photograph. Squinting blurs away sharp static so the big shapes stand out.',
    whyScientistsUseIt: 'Cancels out short-term noise (sensor jitter or a quick gust) to expose the broad, long-term trajectory.',
  },
  noise: {
    term: 'Noise vs. Trend',
    literalDefinition: 'Noise is random, high-frequency variation; Trend is the underlying long-term direction.',
    everydayAnalogy: 'Noise is an unexpected wave that splashes your feet; Trend is the tide slowly rising or falling.',
    whyScientistsUseIt: 'Without filtering noise, scientists might mistake a 5-minute wind gust for a severe incoming storm.',
  },
  correlation: {
    term: 'Correlation (Pearson r)',
    literalDefinition: 'A statistical metric between -1.0 and +1.0 measuring linear dependence.',
    everydayAnalogy: 'A relationship score! Best Friends (+1) climb together, Bitter Enemies (-1) move in opposite directions, and Strangers (0) ignore each other.',
    whyScientistsUseIt: 'Discovers whether two physical variables share an invisible thermodynamic connection without guessing.',
  },
  relative_humidity: {
    term: 'Relative Humidity',
    literalDefinition: 'The ratio of current water vapor in the air to the maximum water vapor the air can hold at that temperature.',
    everydayAnalogy: 'The air is a sponge! Warm air is a giant sponge; cold air is a tiny sponge. The same cup of water soaks the tiny sponge to 100%, but barely dampens the giant sponge.',
    whyScientistsUseIt: 'Explains why air feels dry on hot summer afternoons even when total moisture content has not changed.',
  },
  azimuth: {
    term: 'Compass Azimuth',
    literalDefinition: 'Direction measured in degrees around a 360° circle, starting clockwise from North (0°).',
    everydayAnalogy: 'A circular clock face with 360 ticks instead of 12 hours. North is 0°, East is 90°, South is 180°, and West is 270°.',
    whyScientistsUseIt: 'Provides a standardized universal bearing for airmass movement worldwide.',
  },
  modular_trap: {
    term: 'The Modular Trap',
    literalDefinition: 'The mathematical failure of scalar arithmetic on circular, repeating numbers.',
    everydayAnalogy: 'Imagine averaging 11:00 PM and 1:00 AM on a clock. If you do normal math, (11 + 1)/2 = 6:00 AM! Normal math fails when numbers wrap around.',
    whyScientistsUseIt: 'Averaging wind from 350° and 10° produces 180° (South) instead of 0° (North) unless you convert to vectors.',
  },
  vectors: {
    term: 'U and V Wind Vectors',
    literalDefinition: 'Decomposing wind velocity into orthogonal Cartesian coordinates: U (East-West) and V (North-South).',
    everydayAnalogy: 'Breaking a diagonal step into two clean grid steps: how many steps East, and how many steps North.',
    whyScientistsUseIt: 'Arrows can be added and averaged cleanly without ever breaking at the 360° boundary, preserving true physical mass flow.',
  },
  pressure: {
    term: 'Barometric Pressure',
    literalDefinition: 'The atmospheric weight of the column of air pushing down on Earth\'s surface.',
    everydayAnalogy: 'The physical weight of a blanket. Cold arctic air is dense and heavy (high pressure); warm air is buoyant and light (low pressure).',
    whyScientistsUseIt: 'Air naturally rushes from high pressure to low pressure, creating all wind and weather fronts.',
  },
  cold_front: {
    term: 'Cold Front Passage',
    literalDefinition: 'The leading boundary of an advancing cold, dense air mass replacing warmer air.',
    everydayAnalogy: 'An atmospheric snowplow. Heavy arctic air bulldozes underneath warm air, violently lifting it and creating sharp temperature crashes.',
    whyScientistsUseIt: 'Recognized by a sudden pressure spike, a wind direction shift to the North, and rapid cooling.',
  },
};

interface JargonBusterProps {
  id: keyof typeof JARGON_GLOSSARY;
  children?: React.ReactNode;
}

export const JargonBusterTooltip: React.FC<JargonBusterProps> = ({ id, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const jargon = JARGON_GLOSSARY[id];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!jargon) return <span>{children}</span>;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 border-b-2 border-dotted border-[#feca57] text-white hover:text-[#feca57] font-medium transition-colors cursor-pointer text-left group"
        title="Click to bust this jargon in plain English"
      >
        <span>{children || jargon.term}</span>
        <HelpCircle className="w-3 h-3 text-[#feca57] opacity-80 group-hover:opacity-100 transition-opacity inline" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-[9999] left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl glass-panel border border-[#feca57]/40 shadow-[0_12px_36px_rgba(0,0,0,0.6)] p-4 text-xs font-sans text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#feca57]" />
              <span className="font-bold text-white text-xs font-mono tracking-tight">
                Jargon Buster: {jargon.term}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {jargon.pronunciation && (
            <div className="text-[10px] font-mono text-slate-400 mb-1.5">
              Sounds like: <span className="text-[#48dbfb]">{jargon.pronunciation}</span>
            </div>
          )}

          {/* Everyday Analogy */}
          <div className="p-2.5 rounded-xl bg-[#feca57]/10 border border-[#feca57]/20 mb-2.5">
            <span className="font-bold text-[#feca57] block text-[11px] mb-0.5">
              💡 The Everyday Analogy:
            </span>
            <p className="text-slate-200 text-xs leading-relaxed">
              {jargon.everydayAnalogy}
            </p>
          </div>

          {/* Literal definition */}
          <div className="text-[11px] text-slate-400 leading-relaxed mb-2">
            <span className="text-slate-500 font-mono uppercase text-[10px] block">Textbook Definition</span>
            {jargon.literalDefinition}
          </div>

          {/* Why scientists use it */}
          <div className="text-[10px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <span className="text-[#1dd1a1] font-semibold">Why It Matters:</span> {jargon.whyScientistsUseIt}
          </div>
        </div>
      )}
    </span>
  );
};
