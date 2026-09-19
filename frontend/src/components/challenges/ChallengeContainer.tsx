import React, { useState } from 'react';
import { WeatherReading } from '../../types';
import { ScienceBadge } from './types';
import { BADGE_CHALLENGE_1, Challenge1DayNight } from './Challenge1DayNight';
import { BADGE_CHALLENGE_2, Challenge2Correlation } from './Challenge2Correlation';
import { BADGE_CHALLENGE_3, Challenge3BrokenCompass } from './Challenge3BrokenCompass';
import { BADGE_CHALLENGE_4, Challenge4ArcticFreeze } from './Challenge4ArcticFreeze';
import { ScienceNotebookModal } from './ScienceNotebookModal';
import {
  BookOpen,
  ArrowRight,
  Sun,
  Droplets,
  Compass,
  Snowflake,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';

interface ChallengeContainerProps {
  readings: WeatherReading[];
  onSwitchToWorkbench: () => void;
}

const ALL_BADGES: ScienceBadge[] = [
  BADGE_CHALLENGE_1,
  BADGE_CHALLENGE_2,
  BADGE_CHALLENGE_3,
  BADGE_CHALLENGE_4,
];

const CHALLENGES = [
  {
    id: 'challenge-1',
    number: 1,
    title: 'Erase Day & Night',
    badgeTitle: 'Filter Master',
    icon: Sun,
    accentColor: '#ff9f43',
    description: 'Time Series & Moving Average Low-Pass Filters',
  },
  {
    id: 'challenge-2',
    number: 2,
    title: 'Friends or Enemies?',
    badgeTitle: 'Correlation Detective',
    icon: Droplets,
    accentColor: '#ff6b6b',
    description: 'Scatter Plots, Pearson r & The Air Sponge',
  },
  {
    id: 'challenge-3',
    number: 3,
    title: 'The Broken Compass',
    badgeTitle: 'Vector Navigator',
    icon: Compass,
    accentColor: '#1dd1a1',
    description: 'Angular Singularities & Cartesian Vectors',
  },
  {
    id: 'challenge-4',
    number: 4,
    title: 'Arctic Freeze Autopsy',
    badgeTitle: 'Storm Investigator',
    icon: Snowflake,
    accentColor: '#a29bfe',
    description: 'Multi-Dimensional Synoptic Alignment',
  },
];

export const ChallengeContainer: React.FC<ChallengeContainerProps> = ({
  readings,
  onSwitchToWorkbench,
}) => {
  const [activeChallengeId, setActiveChallengeId] = useState<string>('challenge-1');
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('weather_lab_completed_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);

  // Unlocked badges based on completed IDs
  const unlockedBadges = ALL_BADGES.filter((_, idx) =>
    completedIds.includes(`challenge-${idx + 1}`)
  );

  const handleChallengeComplete = (_badge: ScienceBadge) => {
    if (!completedIds.includes(activeChallengeId)) {
      const next = [...completedIds, activeChallengeId];
      setCompletedIds(next);
      localStorage.setItem('weather_lab_completed_challenges', JSON.stringify(next));
    }
  };

  const handleNextChallenge = () => {
    const currentIndex = CHALLENGES.findIndex((c) => c.id === activeChallengeId);
    if (currentIndex < CHALLENGES.length - 1) {
      setActiveChallengeId(CHALLENGES[currentIndex + 1].id);
    } else {
      // Finished all challenges -> Open Science Notebook to celebrate!
      setIsNotebookOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0abde3]/15 border border-[#0abde3]/30 text-[#48dbfb]">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Guided Science Challenges
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0abde3]/15 text-[#48dbfb] border border-[#0abde3]/30 font-semibold">
                Student Track
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Learn scientific data analytics through real-world weather mysteries
            </p>
          </div>
        </div>

        {/* Notebook & Switch Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNotebookOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border border-[#feca57]/40 bg-[#feca57]/15 text-[#feca57] hover:brightness-110 active:scale-95 transition-all shadow-sm"
            data-testid="open-notebook-btn"
          >
            <BookOpen className="w-4 h-4" />
            <span>Science Notebook</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#feca57]/20 text-[10px]">
              {unlockedBadges.length}/{ALL_BADGES.length}
            </span>
          </button>

          <button
            onClick={onSwitchToWorkbench}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-slate-900/60 transition-all"
            title="Switch to Full Analytical Workbench"
          >
            <span>Pro Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mission Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CHALLENGES.map((ch) => {
          const isSelected = ch.id === activeChallengeId;
          const isDone = completedIds.includes(ch.id);
          const Icon = ch.icon;

          return (
            <button
              key={ch.id}
              onClick={() => setActiveChallengeId(ch.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-900 border-white/30 shadow-lg scale-[1.02]'
                  : 'bg-slate-950/50 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold"
                  style={{
                    color: ch.accentColor,
                    borderColor: `${ch.accentColor}40`,
                    backgroundColor: `${ch.accentColor}15`,
                  }}
                >
                  Mission {ch.number}
                </span>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1dd1a1]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ch.accentColor }} />
                  <span className="truncate">{ch.title}</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {ch.badgeTitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Canvas */}
      <div className="w-full">
        {activeChallengeId === 'challenge-1' && (
          <Challenge1DayNight
            readings={readings}
            onComplete={handleChallengeComplete}
            onNextChallenge={handleNextChallenge}
            isCompleted={completedIds.includes('challenge-1')}
          />
        )}

        {activeChallengeId === 'challenge-2' && (
          <Challenge2Correlation
            readings={readings}
            onComplete={handleChallengeComplete}
            onNextChallenge={handleNextChallenge}
            isCompleted={completedIds.includes('challenge-2')}
          />
        )}

        {activeChallengeId === 'challenge-3' && (
          <Challenge3BrokenCompass
            readings={readings}
            onComplete={handleChallengeComplete}
            onNextChallenge={handleNextChallenge}
            isCompleted={completedIds.includes('challenge-3')}
          />
        )}

        {activeChallengeId === 'challenge-4' && (
          <Challenge4ArcticFreeze
            readings={readings}
            onComplete={handleChallengeComplete}
            onNextChallenge={handleNextChallenge}
            isCompleted={completedIds.includes('challenge-4')}
          />
        )}
      </div>

      {/* Science Notebook Modal */}
      <ScienceNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        badges={unlockedBadges}
        allBadges={ALL_BADGES}
      />
    </div>
  );
};

export default ChallengeContainer;
