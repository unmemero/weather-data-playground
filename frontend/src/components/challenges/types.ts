import { WeatherReading } from '../../types';

export interface JargonTerm {
  term: string;
  pronunciation?: string;
  literalDefinition: string;
  everydayAnalogy: string;
  whyScientistsUseIt: string;
}

export interface ScienceBadge {
  id: string;
  title: string;
  category: string;
  iconName: string;
  unlockedAt?: string;
  summary: string;
  plainEnglishConcept: string;
  formalEquation?: string;
  keyTakeaway: string;
}

export interface ChallengeState {
  completedChallengeIds: string[];
  activeChallengeId: string;
  badges: ScienceBadge[];
}

export interface ChallengeStepProps {
  readings: WeatherReading[];
  onComplete: (badge: ScienceBadge) => void;
  onNextChallenge: () => void;
  isCompleted: boolean;
}
