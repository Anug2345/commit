import React from 'react';
import { Shield, Flame, Clock, Sparkles, Sliders, BarChart3, HelpCircle, LifeBuoy } from 'lucide-react';
import { UserStats, PlatformConfig } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'history' | 'insights' | 'settings';
  setCurrentTab: (tab: 'dashboard' | 'history' | 'insights' | 'settings') => void;
  stats: UserStats;
  platformConfig: PlatformConfig;
  onOpenOnboarding: () => void;
  isFocusing: boolean;
  onOpenVault?: () => void;
  onOpenRescue?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  stats,
  platformConfig,
  onOpenOnboarding,
  isFocusing,
  onOpenVault,
  onOpenRescue,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-[#07080C]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            id="nav-logo-button"
            onClick={() => setCurrentTab('dashboard')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <span className="font-display text-base font-black tracking-tight text-white">C</span>
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07080C] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-bold tracking-wider text-white group-hover:text-indigo-300 transition-colors">
                  COMMIT
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Earn your screen time.
              </p>
            </div>
          </button>
        </div>

        {/* Center Tabs (Desktop) */}
        {!isFocusing && (
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 shadow-inner">
            <button
              id="tab-dashboard-button"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>🚀</span>
              <span>Focus</span>
            </button>
            <button
              id="tab-history-button"
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                currentTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>🏆</span>
              <span>Rewards & Stats</span>
            </button>
            <button
              id="tab-insights-button"
              onClick={() => setCurrentTab('insights')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                currentTab === 'insights'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>💡</span>
              <span>Coach</span>
            </button>
          </nav>
        )}

        {/* Right Stats & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Freedom Minutes Vault Button */}
          <button
            type="button"
            onClick={onOpenVault}
            title="Freedom Minutes Vault: Click to spend or manage screen time"
            className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 active:scale-95 transition-all shrink-0"
          >
            <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>{stats.availableScreenTimeMinutes}m</span>
            <span className="hidden lg:inline text-[11px] font-normal text-emerald-400/80">Freedom</span>
          </button>

          {/* Distraction Rescue Button */}
          <button
            type="button"
            onClick={onOpenRescue}
            title="Distraction Rescue: Urge surfing & emergency pause"
            className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 active:scale-95 transition-all shrink-0"
          >
            <LifeBuoy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Rescue</span>
          </button>

          {/* Streak Pill */}
          <div
            title={`Current streak: ${stats.currentStreak} consecutive days keeping promises`}
            className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-amber-300 shrink-0"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>{stats.currentStreak}d</span>
          </div>

          {/* Help / Philosophy button */}
          <button
            id="header-help-button"
            onClick={onOpenOnboarding}
            title="Philosophy & How it Works"
            className="rounded-full p-1.5 sm:p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white shrink-0"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Settings button (hidden on mobile header because it is in mobile bottom nav) */}
          <button
            id="header-settings-button"
            onClick={() => setCurrentTab('settings')}
            title="Platform Settings & Screen Time APIs"
            className={`hidden md:block rounded-full p-2 transition-colors shrink-0 ${
              currentTab === 'settings'
                ? 'bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/40'
                : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
