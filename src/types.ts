export type CategoryType = 
  | 'Education' 
  | 'Deep Work' 
  | 'Health & Wellness' 
  | 'Creative' 
  | 'Life Admin';

export interface BreakdownStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface Commitment {
  id: string;
  rawPrompt: string;
  taskTitle: string;
  category: CategoryType;
  durationMinutes: number;
  remainingSeconds: number;
  breakdown: BreakdownStep[];
  restrictedAppIds: string[];
  coachAdvice: string;
  estimatedDifficulty?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  verificationMethod: 'timer' | 'activity' | 'integration' | 'user_confirm';
  verificationProof?: string;
  earnedScreenTimeMinutes: number;
}

export interface RestrictedApp {
  id: string;
  name: string;
  category: 'Social' | 'Entertainment' | 'Gaming' | 'Browsing';
  icon: string; // identifier
  color: string;
  badge: string;
  bundleId: string;
  defaultRestricted: boolean;
}

export interface UserStats {
  availableScreenTimeMinutes: number;
  totalEarnedMinutes: number;
  totalFocusedMinutes: number;
  completedSessionsCount: number;
  totalSessionsCount: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  dailyFocusGoalMinutes?: number;
}

export interface CoachInsight {
  id: string;
  headline: string;
  observation: string;
  recommendation: string;
  confidence: string;
  category?: string;
  date: string;
}

export interface PlatformConfig {
  platform: 'ios' | 'android' | 'web';
  screenTimeAuthorized: boolean;
  accessibilityAuthorized: boolean;
  notificationsEnabled: boolean;
  soundscapeEnabled: boolean;
  activeSoundscape: 'none' | 'binaural' | 'rain' | 'deep_space';
  screenTimeRatio: number; // e.g. 1.0 = 1 min focus -> 1 min screen time
  strictMode: boolean; // requires typing reason to quit early
}

export interface FreedomTransaction {
  id: string;
  type: 'earned' | 'spent';
  minutes: number;
  description: string;
  timestamp: string;
  appId?: string;
}

export interface TaskVerificationResult {
  verified: boolean;
  score: number; // 0 - 100
  critique: string;
  feedback: string;
  badge: string;
  bonusMinutes: number;
}

export interface WeeklyInsightData {
  weekRange: string;
  focusGrade: string;
  focusIntegrityPercent: number;
  totalFocusedMinutes: number;
  freedomMinutesEarned: number;
  streakStatus: string;
  keyStrength: string;
  distractionLeak: string;
  recommendedFocusSprint: number;
  tacticalPrescription: string;
  categoryDistribution: { category: CategoryType; minutes: number; percent: number }[];
  generatedAt: string;
}
