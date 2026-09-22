import { Commitment, UserStats, RestrictedApp, PlatformConfig, CoachInsight } from '../types';
import { DEFAULT_RESTRICTED_APPS, INITIAL_STATS, INITIAL_HISTORY, INITIAL_PLATFORM_CONFIG, INITIAL_COACH_INSIGHTS } from '../data/initialData';

const KEYS = {
  STATS: 'commit_user_stats',
  HISTORY: 'commit_history_records',
  APPS: 'commit_restricted_apps',
  CONFIG: 'commit_platform_config',
  INSIGHTS: 'commit_coach_insights',
  ONBOARDED: 'commit_onboarded_v1',
};

export const loadStoredStats = (): UserStats => {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATS,
      ...parsed,
      dailyFocusGoalMinutes: parsed.dailyFocusGoalMinutes ?? INITIAL_STATS.dailyFocusGoalMinutes ?? 60,
    };
  } catch {
    return INITIAL_STATS;
  }
};

export const saveStoredStats = (stats: UserStats) => {
  try {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
};

export const loadStoredHistory = (): Commitment[] => {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : INITIAL_HISTORY;
  } catch {
    return INITIAL_HISTORY;
  }
};

export const saveStoredHistory = (history: Commitment[]) => {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const loadStoredApps = (): RestrictedApp[] => {
  try {
    const raw = localStorage.getItem(KEYS.APPS);
    return raw ? JSON.parse(raw) : DEFAULT_RESTRICTED_APPS;
  } catch {
    return DEFAULT_RESTRICTED_APPS;
  }
};

export const saveStoredApps = (apps: RestrictedApp[]) => {
  try {
    localStorage.setItem(KEYS.APPS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save apps', e);
  }
};

export const loadStoredConfig = (): PlatformConfig => {
  try {
    const raw = localStorage.getItem(KEYS.CONFIG);
    return raw ? JSON.parse(raw) : INITIAL_PLATFORM_CONFIG;
  } catch {
    return INITIAL_PLATFORM_CONFIG;
  }
};

export const saveStoredConfig = (config: PlatformConfig) => {
  try {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
};

export const loadStoredInsights = (): CoachInsight[] => {
  try {
    const raw = localStorage.getItem(KEYS.INSIGHTS);
    return raw ? JSON.parse(raw) : INITIAL_COACH_INSIGHTS;
  } catch {
    return INITIAL_COACH_INSIGHTS;
  }
};

export const saveStoredInsights = (insights: CoachInsight[]) => {
  try {
    localStorage.setItem(KEYS.INSIGHTS, JSON.stringify(insights));
  } catch (e) {
    console.error('Failed to save insights', e);
  }
};

export const isUserOnboarded = (): boolean => {
  try {
    return localStorage.getItem(KEYS.ONBOARDED) === 'true';
  } catch {
    return false;
  }
};

export const setUserOnboarded = (onboarded: boolean) => {
  try {
    localStorage.setItem(KEYS.ONBOARDED, onboarded ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set onboarded', e);
  }
};
