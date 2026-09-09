import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface ScientificTooltipProps {
  title: string;
  content: string;
  formula?: string;
  citation?: string;
  className?: string;
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
}

export const ScientificTooltip: React.FC<ScientificTooltipProps> = ({
  title,
  content,
  formula,
  citation,
  className = '',
  position = 'bottom',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const posClasses =
    position === 'bottom'
      ? 'top-full mt-2.5'
      : 'bottom-full mb-2.5';

  const alignClasses =
    align === 'right'
      ? 'right-0'
      : align === 'left'
      ? 'left-0'
      : 'left-1/2 -translate-x-1/2';

  const arrowClasses =
    position === 'bottom'
      ? align === 'right'
        ? 'bottom-full right-2 border-b-slate-900'
        : align === 'left'
        ? 'bottom-full left-2 border-b-slate-900'
        : 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900'
      : align === 'right'
      ? 'top-full right-2 border-t-slate-900'
      : align === 'left'
      ? 'top-full left-2 border-t-slate-900'
      : 'top-full left-1/2 -translate-x-1/2 border-t-slate-900';

  return (
    <div className={`relative inline-flex items-center ${isOpen ? 'z-50' : ''} ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-cyan-400 p-0.5 rounded-full transition-colors focus:outline-none"
        aria-label={`Explain ${title}`}
        data-testid="scientific-tooltip-trigger"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${posClasses} ${alignClasses} w-72 p-3.5 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl z-[100] text-left backdrop-blur pointer-events-none transition-all duration-150 animate-in fade-in`}
          data-testid="scientific-tooltip-content"
        >
          <div className="text-xs font-bold text-cyan-300 font-mono mb-1">{title}</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">{content}</p>
          {formula && (
            <div className="mt-1.5 p-1.5 bg-slate-950/80 rounded border border-slate-800 text-[10px] font-mono text-cyan-200">
              {formula}
            </div>
          )}
          {citation && (
            <div className="mt-1.5 text-[9px] text-slate-500 font-mono italic border-t border-slate-800 pt-1">
              Source: {citation}
            </div>
          )}
          <div className={`absolute border-4 border-transparent ${arrowClasses}`} />
        </div>
      )}
    </div>
  );
};

export default ScientificTooltip;
