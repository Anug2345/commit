import React, { useState, useEffect } from 'react';
import { Clock, Shield, Sparkles, Smartphone, Play, Pause, CheckCircle2, History, ArrowRight, Zap, X } from 'lucide-react';
import { RestrictedApp, UserStats, PlatformConfig, FreedomTransaction } from '../types';
import { playSuccessChime, playCommitPing } from '../utils/audio';

interface FreedomMinutesVaultProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  platformConfig: PlatformConfig;
  availableApps: RestrictedApp[];
  onRedeemMinutes: (minutes: number, appId?: string) => void;
  onUpdateConfig?: (config: Partial<PlatformConfig>) => void;
}

export const FreedomMinutesVault: React.FC<FreedomMinutesVaultProps> = ({
  isOpen,
  onClose,
  stats,
  platformConfig,
  availableApps,
  onRedeemMinutes,
  onUpdateConfig,
}) => {
  const [selectedApp, setSelectedApp] = useState<RestrictedApp | null>(availableApps[0] || null);
  const [sessionMinutes, setSessionMinutes] = useState<number>(15);
  const [activeUnlock, setActiveUnlock] = useState<{ app: RestrictedApp; remainingSeconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'unlock' | 'calculator' | 'rules'>('unlock');

  // Timer for active unlocked freedom session
  useEffect(() => {
    let interval: any = null;
    if (activeUnlock && activeUnlock.remainingSeconds > 0) {
      interval = setInterval(() => {
        setActiveUnlock((prev) => {
          if (!prev) return null;
          if (prev.remainingSeconds <= 1) {
            playSuccessChime();
            return null;
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeUnlock]);

  if (!isOpen) return null;

  const handleStartUnlock = () => {
    if (!selectedApp) return;
    if (stats.availableScreenTimeMinutes < sessionMinutes) return;

    onRedeemMinutes(sessionMinutes, selectedApp.id);
    playSuccessChime();
    setActiveUnlock({
      app: selectedApp,
      remainingSeconds: sessionMinutes * 60,
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0D111A] via-[#0A0D14] to-[#07080C] p-6 sm:p-7 text-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Vault Header */}
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1.5">
          <Clock className="h-4 w-4" />
          <span>Earn Your Screen Time • Freedom Vault</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
              Freedom Minutes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Guilt-free leisure time earned through verified focus sprints.
            </p>
          </div>
          <div className="flex items-baseline gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
            <span className="font-display text-2xl font-black text-emerald-400">
              {stats.availableScreenTimeMinutes}m
            </span>
            <span className="text-[11px] font-semibold text-emerald-300">Banked</span>
          </div>
        </div>

        {/* Active Unlocked Banner (if user is currently enjoying an earned break) */}
        {activeUnlock && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeUnlock.app.icon}</span>
              <div>
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  Active Screen Time Pass
                </div>
                <div className="text-sm font-semibold text-white">
                  Unlocked: {activeUnlock.app.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-black text-emerald-300">
                {formatSeconds(activeUnlock.remainingSeconds)}
              </div>
              <button
                onClick={() => setActiveUnlock(null)}
                className="text-[10px] text-slate-400 hover:text-white underline mt-0.5"
              >
                End Pass Early
              </button>
            </div>
          </div>
        )}

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 border-b border-white/[0.08] pb-3 mb-5">
          <button
            onClick={() => setActiveTab('unlock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'unlock'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Spend Freedom Minutes
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exchange Ratio
          </button>
        </div>

        {activeTab === 'unlock' && (
          <div className="space-y-5">
            {/* Step 1: Select App */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                1. Choose App to Unlock
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {availableApps.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/15 shadow-md shadow-emerald-500/20 text-white'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="text-xl shrink-0">{app.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{app.name}</div>
                        <div className="text-[10px] text-slate-400">{app.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                2. Select Freedom Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 30].map((mins) => {
                  const canAfford = stats.availableScreenTimeMinutes >= mins;
                  const isSelected = sessionMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      disabled={!canAfford}
                      onClick={() => setSessionMinutes(mins)}
                      className={`rounded-xl border py-2.5 text-center transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                          : canAfford
                          ? 'border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                          : 'border-white/[0.04] bg-white/[0.01] text-slate-600 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-sm font-black">{mins}m</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">
                        {canAfford ? 'Ready' : 'Locked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                Cost:{' '}
                <span className="font-bold text-emerald-400">{sessionMinutes} Freedom Minutes</span>
                <span className="text-slate-500 ml-1.5">
                  ({stats.availableScreenTimeMinutes - sessionMinutes >= 0 
                    ? `${stats.availableScreenTimeMinutes - sessionMinutes}m remaining in bank`
                    : 'Insufficient balance'})
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartUnlock}
                disabled={stats.availableScreenTimeMinutes < sessionMinutes || !selectedApp}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Unlock {selectedApp?.name || 'App'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Screen Time Exchange Philosophy
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                COMMIT enforces an honest exchange rate between deep focus and leisure browsing.
                You are never forbidden from social media or games—you simply keep your word first.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { ratio: 0.5, label: 'Strict Mode', desc: '30m Focus = 15m Screen Time' },
                { ratio: 1.0, label: 'Honest 1:1', desc: '30m Focus = 30m Screen Time' },
                { ratio: 1.5, label: 'Generous Mode', desc: '30m Focus = 45m Screen Time' },
              ].map((opt) => {
                const isCurrent = platformConfig.screenTimeRatio === opt.ratio;
                return (
                  <button
                    key={opt.ratio}
                    type="button"
                    onClick={() => onUpdateConfig && onUpdateConfig({ screenTimeRatio: opt.ratio })}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-500/15 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{opt.label}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{opt.desc}</div>
                    {isCurrent && (
                      <span className="inline-block mt-2 text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400">
              💡 Tip: The 1:1 ratio is scientifically proven to build sustainable dopamine resilience without creating deprivation rebellions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
