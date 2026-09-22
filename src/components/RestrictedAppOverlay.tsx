import React from 'react';
import { Lock, ArrowLeft, ShieldAlert, Sparkles, X, Clock, LifeBuoy } from 'lucide-react';
import { RestrictedApp, Commitment } from '../types';

interface RestrictedAppOverlayProps {
  app: RestrictedApp | null;
  commitment: Commitment | null;
  onClose: () => void;
  onEmergencyOverride: () => void;
  onLaunchRescue?: () => void;
}

export const RestrictedAppOverlay: React.FC<RestrictedAppOverlayProps> = ({
  app,
  commitment,
  onClose,
  onEmergencyOverride,
  onLaunchRescue,
}) => {
  if (!app || !commitment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#07080CEE] backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl border border-white/[0.12] bg-[#0E1018] p-5 sm:p-7 text-center text-white shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Shield Icon with App Badge */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#161824] border border-white/[0.1] shadow-xl">
            <span className="text-2xl">{app.badge}</span>
            <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
              <Lock className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* App Title & System Status */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-rose-300">
            <ShieldAlert className="h-3 w-3" />
            <span>Platform Shield Active</span>
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            {app.name} is Restricted
          </h2>
        </div>

        {/* Philosophical Statement */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center">
          <p className="font-display text-base sm:text-lg font-bold text-white leading-snug">
            “You can use it. First, keep the promise you made to yourself.”
          </p>
          <p className="text-[11px] text-indigo-300 mt-2">
            Screen time is earned through discipline, not stolen through impulse.
          </p>
        </div>

        {/* Active Commitment Card */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Active Task</span>
            <span className="flex items-center gap-1 text-indigo-400 font-medium">
              <Clock className="h-3 w-3" />
              {commitment.durationMinutes}m commitment
            </span>
          </div>
          <p className="text-sm font-bold text-white">
            {commitment.taskTitle}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            id="return-to-focus-button"
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Focus Session</span>
          </button>

          {onLaunchRescue && (
            <button
              type="button"
              onClick={onLaunchRescue}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              <LifeBuoy className="h-3.5 w-3.5 text-amber-400" />
              <span>Distraction Rescue (Urge Surfing & AI Reframe)</span>
            </button>
          )}

          <button
            id="emergency-override-button"
            type="button"
            onClick={onEmergencyOverride}
            className="w-full rounded-xl py-2.5 text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors"
          >
            Emergency 5m Pass (Penalty: -15m Screen Time)
          </button>
        </div>
      </div>
    </div>
  );
};
