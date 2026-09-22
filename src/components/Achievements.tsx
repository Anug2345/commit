import React, { useState, useMemo } from 'react';
import {
  Award,
  Flame,
  Sun,
  Target,
  Clock,
  ShieldCheck,
  Lock,
  Trophy,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { UserStats, Commitment } from '../types';

interface AchievementsProps {
  stats: UserStats;
  history: Commitment[];
}

export interface AchievementItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: 'sun' | 'flame' | 'target' | 'award' | 'clock' | 'shield' | 'lock' | 'trophy';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  currentValue: number;
  targetValue: number;
  unit: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export const Achievements: React.FC<AchievementsProps> = ({ stats, history }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const achievementsList = useMemo<AchievementItem[]>(() => {
    // Check if early session was completed
    const hasEarlySession = history.some((item) => {
      if (item.status !== 'completed') return false;
      const date = new Date(item.createdAt);
      const hour = date.getHours();
      return hour < 9;
    });

    // Check if any session shielded 5+ apps
    const hasMaxShield = history.some(
      (item) => item.status === 'completed' && item.restrictedAppIds && item.restrictedAppIds.length >= 5
    );

    const completionRate =
      stats.totalSessionsCount > 0
        ? Math.round((stats.completedSessionsCount / stats.totalSessionsCount) * 100)
        : 100;

    return [
      {
        id: 'first_promise',
        title: 'First Promise Kept',
        tagline: 'Seed of Integrity',
        description: 'Complete your first commitment and reclaim digital sovereignty.',
        iconName: 'award',
        tier: 'bronze',
        currentValue: stats.completedSessionsCount,
        targetValue: 1,
        unit: 'session',
        unlocked: stats.completedSessionsCount >= 1,
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        tagline: 'Dawn Focus',
        description: 'Complete a focus session before 9:00 AM to kickstart your day.',
        iconName: 'sun',
        tier: 'silver',
        currentValue: hasEarlySession ? 1 : 0,
        targetValue: 1,
        unit: 'session',
        unlocked: hasEarlySession,
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        tagline: '7-Day Unbroken Momentum',
        description: 'Maintain a 7-day focus streak without breaking a single commitment.',
        iconName: 'flame',
        tier: 'gold',
        currentValue: Math.max(stats.currentStreak, stats.bestStreak),
        targetValue: 7,
        unit: 'days',
        unlocked: Math.max(stats.currentStreak, stats.bestStreak) >= 7,
      },
      {
        id: 'deep_focus_master',
        title: 'Deep Focus Master',
        tagline: 'Sustained Flow State',
        description: 'Accumulate over 200 total minutes of deep, verified productivity.',
        iconName: 'target',
        tier: 'gold',
        currentValue: stats.totalFocusedMinutes,
        targetValue: 200,
        unit: 'mins',
        unlocked: stats.totalFocusedMinutes >= 200,
      },
      {
        id: 'screen_time_millionaire',
        title: 'Screen Time Tycoon',
        tagline: 'Freedom Banked',
        description: 'Accumulate 60+ minutes of available earned screen time in your bank.',
        iconName: 'clock',
        tier: 'silver',
        currentValue: stats.availableScreenTimeMinutes,
        targetValue: 60,
        unit: 'mins',
        unlocked: stats.availableScreenTimeMinutes >= 60,
      },
      {
        id: 'shield_of_honor',
        title: 'Iron Integrity',
        tagline: 'Flawless Commitment',
        description: 'Maintain a 90%+ completion rate across at least 5 focus commitments.',
        iconName: 'shield',
        tier: 'gold',
        currentValue: stats.totalSessionsCount >= 5 ? completionRate : 0,
        targetValue: 90,
        unit: '% rate',
        unlocked: stats.totalSessionsCount >= 5 && completionRate >= 90,
      },
      {
        id: 'app_tamer',
        title: 'Distraction Slayer',
        tagline: 'Full Fortress Lockdown',
        description: 'Shield 5 or more distracting apps in a single high-stakes focus session.',
        iconName: 'lock',
        tier: 'silver',
        currentValue: hasMaxShield ? 5 : Math.min(4, stats.completedSessionsCount > 0 ? 3 : 0),
        targetValue: 5,
        unit: 'apps',
        unlocked: hasMaxShield,
      },
      {
        id: 'century_club',
        title: 'Century Club',
        tagline: '500 Minutes of Sovereignty',
        description: 'Surpass 500 minutes of total focused time on the COMMIT protocol.',
        iconName: 'trophy',
        tier: 'platinum',
        currentValue: stats.totalFocusedMinutes,
        targetValue: 500,
        unit: 'mins',
        unlocked: stats.totalFocusedMinutes >= 500,
      },
    ];
  }, [stats, history]);

  const unlockedCount = achievementsList.filter((a) => a.unlocked).length;
  const totalCount = achievementsList.length;
  const unlockedPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = achievementsList.filter((item) => {
    if (filter === 'unlocked') return item.unlocked;
    if (filter === 'locked') return !item.unlocked;
    return true;
  });

  const renderBadgeIcon = (icon: AchievementItem['iconName'], unlocked: boolean, tier: AchievementItem['tier']) => {
    const iconClass = "h-5 w-5";
    switch (icon) {
      case 'sun':
        return <Sun className={`${iconClass} ${unlocked ? 'text-amber-400' : 'text-slate-500'}`} />;
      case 'flame':
        return <Flame className={`${iconClass} ${unlocked ? 'text-orange-400' : 'text-slate-500'}`} />;
      case 'target':
        return <Target className={`${iconClass} ${unlocked ? 'text-indigo-400' : 'text-slate-500'}`} />;
      case 'award':
        return <Award className={`${iconClass} ${unlocked ? 'text-emerald-400' : 'text-slate-500'}`} />;
      case 'clock':
        return <Clock className={`${iconClass} ${unlocked ? 'text-cyan-400' : 'text-slate-500'}`} />;
      case 'shield':
        return <ShieldCheck className={`${iconClass} ${unlocked ? 'text-violet-400' : 'text-slate-500'}`} />;
      case 'lock':
        return <Lock className={`${iconClass} ${unlocked ? 'text-rose-400' : 'text-slate-500'}`} />;
      case 'trophy':
        return <Trophy className={`${iconClass} ${unlocked ? 'text-yellow-400' : 'text-slate-500'}`} />;
    }
  };

  const getTierBadgeStyle = (tier: AchievementItem['tier'], unlocked: boolean) => {
    if (!unlocked) return 'border-white/[0.06] bg-white/[0.02] text-slate-500';
    switch (tier) {
      case 'platinum':
        return 'border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300';
      case 'gold':
        return 'border-amber-400/40 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-300';
      case 'silver':
        return 'border-indigo-400/40 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 text-indigo-300';
      case 'bronze':
        return 'border-emerald-400/40 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-300';
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0E1018] p-5 sm:p-6 space-y-5">
      {/* Top Banner & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Milestone Achievements</span>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  {unlockedCount} / {totalCount} Unlocked
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Honor badges earned through sustained discipline and screen time mastery.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'unlocked', 'locked'] as const).map((filterOpt) => (
            <button
              key={filterOpt}
              type="button"
              onClick={() => setFilter(filterOpt)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all ${
                filter === filterOpt
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              {filterOpt === 'all' ? `All (${totalCount})` : filterOpt === 'unlocked' ? `Unlocked (${unlockedCount})` : `Locked (${totalCount - unlockedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="rounded-xl border border-white/[0.06] bg-[#07080C] p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Achievement Completion</span>
          <span className="font-bold text-white font-display">
            {unlockedPercentage}% Complete ({unlockedCount}/{totalCount})
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-400 transition-all duration-700 ease-out"
            style={{ width: `${unlockedPercentage}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredAchievements.map((item) => {
          const progressPercent = Math.min(100, Math.round((item.currentValue / item.targetValue) * 100));

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                item.unlocked
                  ? 'border-white/[0.12] bg-gradient-to-br from-[#121524] to-[#0A0C14] shadow-md shadow-indigo-500/5'
                  : 'border-white/[0.05] bg-[#0A0C14]/60 opacity-80'
              }`}
            >
              <div>
                {/* Header row with Icon, Tier, and Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                        item.unlocked
                          ? 'border-white/10 bg-black/40 ring-1 ring-white/10 shadow-sm'
                          : 'border-white/[0.05] bg-black/20 text-slate-600'
                      }`}
                    >
                      {renderBadgeIcon(item.iconName, item.unlocked, item.tier)}
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {item.unlocked && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        )}
                      </h4>
                      <span className="text-[10px] text-indigo-300 font-medium tracking-wide">
                        {item.tagline}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getTierBadgeStyle(
                      item.tier,
                      item.unlocked
                    )}`}
                  >
                    {item.tier}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {/* Progress Footer */}
              <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {item.unlocked ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Badge Achieved
                      </span>
                    ) : (
                      <span>Progress to unlock</span>
                    )}
                  </span>
                  <span className="font-medium text-slate-300">
                    {Math.min(item.currentValue, item.targetValue)} / {item.targetValue} {item.unit}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.unlocked
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
