import React, { useState } from 'react';
import { BookOpen, X, Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { ScienceBadge } from './types';

interface ScienceNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: ScienceBadge[];
  allBadges: ScienceBadge[];
}

export const ScienceNotebookModal: React.FC<ScienceNotebookModalProps> = ({
  isOpen,
  onClose,
  badges,
  allBadges,
}) => {
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(
    badges[0]?.id || allBadges[0]?.id || ''
  );

  if (!isOpen) return null;

  const unlockedIds = new Set(badges.map((b) => b.id));
  const activeBadge = allBadges.find((b) => b.id === selectedBadgeId) || allBadges[0];
  const isUnlocked = unlockedIds.has(activeBadge.id);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] glass-panel rounded-3xl border border-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#feca57]/15 border border-[#feca57]/30 text-[#feca57]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>My Science Notebook & Badge Collection</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#feca57]/10 text-[#feca57] border border-[#feca57]/30 font-semibold">
                  {badges.length} of {allBadges.length} Unlocked
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Your personal reference guide for data analytics & atmospheric science concepts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Notebook (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Badges List (Left) + Detail Card (Right) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Badge Directory */}
          <div className="border-r border-white/10 p-4 overflow-y-auto flex flex-col gap-2 bg-slate-950/30">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 font-semibold">
              Mastery Badges
            </span>
            {allBadges.map((badge) => {
              const unlocked = unlockedIds.has(badge.id);
              const isSelected = badge.id === selectedBadgeId;
              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadgeId(badge.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-[#feca57]/50 shadow-md'
                      : 'bg-slate-950/40 border-white/5 hover:border-white/15'
                  } ${!unlocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
                        unlocked
                          ? 'bg-[#feca57]/20 border-[#feca57]/50 text-[#feca57]'
                          : 'bg-slate-800/40 border-slate-700 text-slate-500'
                      }`}
                    >
                      {unlocked ? <Award className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="truncate">
                      <div className={`text-xs font-bold truncate ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                        {badge.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {badge.category}
                      </div>
                    </div>
                  </div>
                  {unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-[#1dd1a1] flex-shrink-0 ml-2" />
                  ) : (
                    <span className="text-[9px] font-mono text-slate-600 uppercase">Locked</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Badge Detail & Cheat Sheet */}
          <div className="md:col-span-2 p-6 overflow-y-auto flex flex-col gap-5 bg-slate-900/30">
            {isUnlocked ? (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[11px] font-mono text-[#feca57] font-semibold uppercase tracking-wider">
                      {activeBadge.category} • Unlocked
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
                      <span>{activeBadge.title}</span>
                    </h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#feca57]/15 border border-[#feca57]/30 text-[#feca57] shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                {/* Plain-English Concept */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#48dbfb] font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plain-English Mental Model</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {activeBadge.plainEnglishConcept}
                  </p>
                </div>

                {/* Key Takeaway */}
                <div className="p-4 rounded-2xl bg-[#1dd1a1]/10 border border-[#1dd1a1]/30 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[#1dd1a1] font-mono uppercase tracking-wider">
                    ⚡ Key Rule of Thumb:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeBadge.keyTakeaway}
                  </p>
                </div>

                {/* Formal Scientific Equation (If exists) */}
                {activeBadge.formalEquation && (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col gap-2 font-mono">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                      Formal Mathematical / Physics Definition:
                    </span>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-bold text-sm text-[#ff9f43]">
                      {activeBadge.formalEquation}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{activeBadge.title}</h3>
                  <p className="text-xs text-slate-400 max-w-sm font-mono">
                    This scientific concept card is currently locked. Complete the corresponding guided mission in Challenge Mode to unlock this cheat sheet!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
