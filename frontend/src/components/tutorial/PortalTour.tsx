import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  Check,
  Lightbulb,
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  badge: string;
  category: string;
  description: string;
  tip?: string;
  preferredPlacement?: 'bottom' | 'top' | 'left' | 'right';
}

export const PORTAL_TOUR_STEPS: TourStep[] = [
  {
    id: 'station-selector',
    targetId: 'tour-station-selector',
    title: 'Global Observation Stations',
    badge: 'Station Profile',
    category: 'Biomes & Sensors',
    description:
      'Switch between live meteorological stations across polar, desert, and maritime biomes (Tokyo, Svalbard, Death Valley, London) or search any global city coordinate.',
    tip: 'Clicking here opens the global station search with live latitude, longitude, and elevation presets.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'conditions-ribbon',
    targetId: 'tour-conditions-ribbon',
    title: 'Atmospheric Telemetry Ribbon',
    badge: 'Live Sensors',
    category: 'Kinematics & Radiation',
    description:
      'Real-time atmospheric observations updated automatically. Inspect ambient dry-bulb temperature, dew point depression, solar irradiance, and wind velocity vectors at a glance.',
    tip: 'Green and amber pulse indicators signify active SQLite WAL streaming and sensor freshness.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'sidebar-search',
    targetId: 'tour-sidebar-nav',
    title: 'What are Lab Workbenches?',
    badge: 'Core Concept',
    category: 'Analytical Architecture',
    description:
      'Workbenches are modular scientific workspaces designed to analyze the active atmospheric dataset through different analytical lenses. Instead of cramming all charts into one cluttered view, each workbench isolates a distinct meteorological discipline—such as multi-day temporal evolution, polar wind kinematics, bivariate correlations, or thermodynamic physical laws.',
    tip: 'Your selected station, time range, and data series stay in sync as you switch between workbenches. You can also press "/" to search and filter them instantly.',
    preferredPlacement: 'right',
  },
  {
    id: 'case-studies',
    targetId: 'tour-case-studies',
    title: 'Historical Synoptic Archive',
    badge: 'Case Studies',
    category: 'Extreme Weather',
    description:
      'Load calibrated historical atmospheric anomalies such as Hurricane Katrina (2005), the 2021 Texas Deep Freeze, or Death Valley record heatwaves directly into all analytical charts.',
    tip: 'Historical series retain persistent immutable archives independent of live rolling buffers.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'csv-tools',
    targetId: 'tour-csv-tools',
    title: 'Scientific Data Portability',
    badge: 'Data Exchange',
    category: 'Import & Export',
    description:
      'Export synchronized observation records to standard CSV or upload your own lab data to perform offline atmospheric physics calculations and correlation modeling.',
    tip: 'Supports high-throughput schema validation with instant parsing feedback.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'guide-button',
    targetId: 'tour-guide-btn',
    title: 'Lab Guide & Replay Anytime',
    badge: 'Portal Assistance',
    category: 'Guidance',
    description:
      "You're all set to explore! Whenever you need a refresher on the lab tools or want to walk a colleague through the portal, click this Guide button anytime.",
    tip: 'Use Left/Right arrow keys to step through guides and Escape to dismiss at any time.',
    preferredPlacement: 'bottom',
  },
];

interface PortalTourProps {
  isOpen: boolean;
  onClose: (completed: boolean) => void;
  initialStepIndex?: number;
}

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export const PortalTour: React.FC<PortalTourProps> = ({
  isOpen,
  onClose,
  initialStepIndex = 0,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const step = PORTAL_TOUR_STEPS[currentStepIndex];

  // Update target rect with padding
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !step) return;

    let el = document.getElementById(step.targetId);
    // If target element is hidden (e.g. desktop sidebar on mobile), fallback to secondary target
    if (el && (el.offsetWidth === 0 || el.offsetHeight === 0)) {
      el = document.getElementById('tour-sidebar-search') || el;
    }

    if (el && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
      const rect = el.getBoundingClientRect();
      const padding = 8;

      // Scroll element smoothly into viewport if needed
      const isInViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);

      if (!isInViewport) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }

      setTargetRect({
        left: Math.max(0, rect.left - padding),
        top: Math.max(0, rect.top - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        right: rect.right + padding,
        bottom: rect.bottom + padding,
      });
    } else {
      // Fallback center position if element isn't found
      const defaultW = Math.min(window.innerWidth * 0.8, 600);
      const defaultH = 120;
      setTargetRect({
        left: (window.innerWidth - defaultW) / 2,
        top: window.innerHeight * 0.25,
        width: defaultW,
        height: defaultH,
        right: (window.innerWidth + defaultW) / 2,
        bottom: window.innerHeight * 0.25 + defaultH,
      });
    }
  }, [isOpen, step]);

  // Sync step on prop change
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(initialStepIndex);
    }
  }, [isOpen, initialStepIndex]);

  // Track position on step change, resize, and scroll
  useEffect(() => {
    if (!isOpen) return;

    updateTargetRect();
    const handleUpdate = () => updateTargetRect();

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('scroll', handleUpdate, { passive: true });

    // Also run a delayed check to handle any layout shifts
    const timer = setTimeout(updateTargetRect, 150);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStepIndex < PORTAL_TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          onClose(true);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, onClose]);

  if (!isOpen || !step) return null;

  // Calculate Popover Position relative to Target Rect
  const popoverWidth = 380;
  const popoverEstimatedHeight = 280;
  const margin = 16;

  let popoverLeft = 0;
  let popoverTop = 0;

  if (targetRect) {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const spaceRight = window.innerWidth - targetRect.right;
    const spaceLeft = targetRect.left;

    const placement = step.preferredPlacement || 'bottom';

    if (placement === 'right' && spaceRight >= popoverWidth + margin) {
      // Place to the right of target (e.g. for sidebar)
      popoverLeft = targetRect.right + margin;
      popoverTop = Math.max(
        margin,
        Math.min(
          targetRect.top + (targetRect.height / 2) - (popoverEstimatedHeight / 2),
          window.innerHeight - popoverEstimatedHeight - margin
        )
      );
    } else if (placement === 'left' && spaceLeft >= popoverWidth + margin) {
      // Place to the left
      popoverLeft = targetRect.left - popoverWidth - margin;
      popoverTop = Math.max(
        margin,
        Math.min(
          targetRect.top + (targetRect.height / 2) - (popoverEstimatedHeight / 2),
          window.innerHeight - popoverEstimatedHeight - margin
        )
      );
    } else if (spaceBelow >= popoverEstimatedHeight + margin || spaceBelow >= spaceAbove) {
      // Place below target
      popoverTop = targetRect.bottom + margin;
      popoverLeft = Math.max(
        margin,
        Math.min(
          targetRect.left + (targetRect.width / 2) - (popoverWidth / 2),
          window.innerWidth - popoverWidth - margin
        )
      );
    } else {
      // Place above target
      popoverTop = Math.max(margin, targetRect.top - popoverEstimatedHeight - margin);
      popoverLeft = Math.max(
        margin,
        Math.min(
          targetRect.left + (targetRect.width / 2) - (popoverWidth / 2),
          window.innerWidth - popoverWidth - margin
        )
      );
    }
  } else {
    // Center of screen
    popoverLeft = Math.max(margin, (window.innerWidth - popoverWidth) / 2);
    popoverTop = Math.max(margin, (window.innerHeight - popoverEstimatedHeight) / 2);
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === PORTAL_TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose(true);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      data-testid="portal-tour-overlay"
    >
      {/* 1. Fullscreen SVG Cutout Mask */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 9998 }}
        aria-hidden="true"
      >
        <defs>
          <mask id="portal-spotlight-mask">
            {/* White covers entire viewport */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Cutout over active target */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx={14}
                fill="black"
                style={{
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(5, 10, 20, 0.85)"
          mask="url(#portal-spotlight-mask)"
          className="backdrop-blur-[2px]"
        />
      </svg>

      {/* 2. Glowing Animated Frame Around Target */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-2xl transition-all duration-350 ease-out"
          style={{
            zIndex: 9999,
            left: `${targetRect.left}px`,
            top: `${targetRect.top}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            boxShadow:
              '0 0 0 2px #48dbfb, 0 0 24px rgba(72, 219, 251, 0.45), inset 0 0 12px rgba(72, 219, 251, 0.2)',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Animated radar pulse beacon */}
          <div className="absolute -inset-1 rounded-2xl border border-[#48dbfb]/40 animate-ping pointer-events-none opacity-60" />

          {/* Step Badge Indicator Pin */}
          <div className="absolute -top-3 -right-3 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#48dbfb] to-[#0abde3] text-slate-950 font-mono font-bold text-xs shadow-[0_0_14px_rgba(72,219,251,0.6)] border border-white/40">
            {currentStepIndex + 1}
          </div>
        </div>
      )}

      {/* 3. Tethered Floating Tour Popover */}
      <div
        ref={popoverRef}
        className="fixed z-[10000] w-[90vw] max-w-[380px] glass-panel rounded-2xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.65)] p-5 transition-all duration-350 ease-out backdrop-blur-xl"
        style={{
          left: `${popoverLeft}px`,
          top: `${popoverTop}px`,
        }}
      >
        {/* Top Accent Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#48dbfb]/15 border border-[#48dbfb]/30 text-[#48dbfb] font-semibold">
              <Compass className="w-3 h-3 text-[#48dbfb]" />
              <span>{step.badge}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {currentStepIndex + 1} of {PORTAL_TOUR_STEPS.length}
            </span>
          </div>

          {/* Dismiss / Close Button */}
          <button
            onClick={() => onClose(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss Tour (Esc)"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3
          id="tour-step-title"
          className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-2"
        >
          <span>{step.title}</span>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {step.description}
        </p>

        {/* Tip Box */}
        {step.tip && (
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/[0.08] flex items-start gap-2 text-[11px] text-slate-400 font-mono mb-4">
            <Lightbulb className="w-3.5 h-3.5 text-[#feca57] flex-shrink-0 mt-0.5" />
            <span>{step.tip}</span>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {PORTAL_TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentStepIndex
                    ? 'w-5 bg-[#48dbfb] shadow-[0_0_8px_#48dbfb]'
                    : idx < currentStepIndex
                    ? 'w-1.5 bg-slate-500'
                    : 'w-1.5 bg-slate-700'
                }`}
                title={`Go to Step ${idx + 1}: ${s.title}`}
                aria-label={`Go to Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#48dbfb] to-[#0abde3] hover:from-[#0abde3] hover:to-[#48dbfb] text-slate-950 font-bold text-xs transition-all shadow-[0_0_16px_rgba(72,219,251,0.3)] hover:shadow-[0_0_20px_rgba(72,219,251,0.5)]"
              data-testid="tour-next-btn"
            >
              {isLastStep ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Finish Tour</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
