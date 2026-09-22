import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle, AlertTriangle, Shield, Volume2, VolumeX, Sparkles, Check, Lock, ChevronDown, ListChecks } from 'lucide-react';
import { Commitment, RestrictedApp, PlatformConfig } from '../types';
import { startAmbientSound, stopAmbientSound } from '../utils/audio';

interface FocusSessionProps {
  commitment: Commitment;
  restrictedApps: RestrictedApp[];
  platformConfig: PlatformConfig;
  onSessionComplete: () => void;
  onSessionFailed: () => void;
  onUpdateSubsteps: (updatedSteps: Commitment['breakdown']) => void;
  onSimulateAppAttempt: (app: RestrictedApp) => void;
}

export const FocusSession: React.FC<FocusSessionProps> = ({
  commitment,
  restrictedApps,
  platformConfig,
  onSessionComplete,
  onSessionFailed,
  onUpdateSubsteps,
  onSimulateAppAttempt,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(commitment.remainingSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [giveUpReason, setGiveUpReason] = useState('');
  const [soundscape, setSoundscape] = useState<'none' | 'binaural' | 'rain' | 'deep_space'>(
    platformConfig.soundscapeEnabled ? platformConfig.activeSoundscape : 'none'
  );
  const [encouragement, setEncouragement] = useState<string>("You're in the pocket. Keep the promise you made to yourself.");
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAppPillMenu, setShowAppPillMenu] = useState(false);

  const totalSeconds = commitment.durationMinutes * 60;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSeconds / totalSeconds) * 100)));

  // Filter restricted apps active in this session
  const activeRestrictedApps = restrictedApps.filter((a) =>
    commitment.restrictedAppIds.includes(a.id)
  );

  // Soundscape effect
  useEffect(() => {
    if (soundscape === 'none') {
      stopAmbientSound();
    } else {
      startAmbientSound(soundscape);
    }
    return () => {
      stopAmbientSound();
    };
  }, [soundscape]);

  // Main countdown timer tick
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onSessionComplete]);

  // Dynamic minimal AI encouragement based on progress thresholds
  const lastEncouragementMilestone = useRef<number>(-1);
  useEffect(() => {
    const milestones = [25, 50, 75, 90];
    const currentMilestone = milestones.reverse().find((m) => progressPercent >= m) || 0;

    if (currentMilestone > 0 && currentMilestone !== lastEncouragementMilestone.current) {
      lastEncouragementMilestone.current = currentMilestone;

      // Request fresh dynamic encouragement from server
      fetch('/api/ai/encouragement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: commitment.taskTitle,
          progressPercent,
          remainingMinutes: Math.ceil(remainingSeconds / 60),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.encouragement) {
            setEncouragement(data.encouragement);
          }
        })
        .catch(() => {
          if (progressPercent >= 75) {
            setEncouragement("The finish line is in sight. Stay locked in.");
          } else if (progressPercent >= 50) {
            setEncouragement("You're halfway there. Keep going.");
          } else {
            setEncouragement("Building momentum. Silence the noise.");
          }
        });
    }
  }, [progressPercent, commitment.taskTitle, remainingSeconds]);

  const toggleSubstep = (stepId: string) => {
    const updated = commitment.breakdown.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    onUpdateSubsteps(updated);
  };

  // Format time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Circular ring calculations
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto text-white">
      {/* Top Session Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        {/* Task Info */}
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {commitment.category}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                Active Commitment
              </span>
            </div>
            <h1 className="font-display text-base sm:text-xl font-bold text-white truncate max-w-md">
              {commitment.taskTitle}
            </h1>
          </div>
        </div>

        {/* Restricted Apps Shield Badge */}
        <div className="relative">
          <button
            id="restricted-apps-badge"
            type="button"
            onClick={() => setShowAppPillMenu(!showAppPillMenu)}
            className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 shadow-sm shadow-rose-500/10 hover:bg-rose-500/15 transition-all"
          >
            <Lock className="h-3.5 w-3.5 text-rose-400" />
            <span>{activeRestrictedApps.length} Apps Locked</span>
            <ChevronDown className="h-3 w-3 text-rose-400 opacity-70" />
          </button>

          {/* Dropdown list of locked apps with click-to-simulate */}
          {showAppPillMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/[0.12] bg-[#0E1018] p-3 shadow-2xl z-40">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/[0.06]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Restricted Distractions
                </span>
                <span className="text-[10px] text-slate-500">Tap to test shield</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeRestrictedApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setShowAppPillMenu(false);
                      onSimulateAppAttempt(app);
                    }}
                    className="w-full flex items-center justify-between rounded-lg p-2 text-left hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{app.badge}</span>
                      <span className="text-xs font-medium text-white">{app.name}</span>
                    </div>
                    <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">
                      Locked 🔒
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500 text-center">
                Access restored on Mission Complete.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Focus Centerpiece */}
      <div className="my-auto flex flex-col items-center justify-center text-center py-6">
        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 300 300" className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 -rotate-90 transform">
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="stroke-white/[0.06]"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              className="stroke-indigo-500 transition-all duration-700 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time & Percentage Inside Ring */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
              {formatTime(remainingSeconds)}
            </span>
            <span className="mt-1 text-xs sm:text-sm font-semibold text-indigo-400 tracking-wider">
              {progressPercent}% COMPLETE
            </span>
            <span className="mt-1 text-[11px] text-slate-500 font-medium">
              +{commitment.durationMinutes}m screen time at stake
            </span>
          </div>
        </div>

        {/* Minimal AI Encouragement Banner */}
        <div className="mt-6 max-w-md rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-widest mb-0.5">
            <Sparkles className="h-3 w-3" />
            <span>AI Coach Pulse</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            "{encouragement}"
          </p>
        </div>

        {/* Soundscape Selector Bar */}
        <div className="mt-4 flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 text-xs max-w-full overflow-x-auto">
          <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
            Audio:
          </span>
          {[
            { id: 'none', label: 'Mute' },
            { id: 'binaural', label: '40Hz Gamma' },
            { id: 'rain', label: 'Rain' },
            { id: 'deep_space', label: 'Deep Space' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSoundscape(item.id as any)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors shrink-0 ${
                soundscape === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sub-steps Toggle Button */}
        {commitment.breakdown.length > 0 && (
          <div className="mt-4 w-full max-w-md">
            <button
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-slate-400 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2">
                <ListChecks className="h-3.5 w-3.5 text-indigo-400" />
                <span>
                  Checklist ({commitment.breakdown.filter((b) => b.completed).length}/{commitment.breakdown.length})
                </span>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showChecklist ? 'rotate-180' : ''}`} />
            </button>

            {showChecklist && (
              <div className="mt-2 space-y-1.5 rounded-xl border border-white/[0.08] bg-[#0A0C14] p-3 text-left">
                {commitment.breakdown.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => toggleSubstep(step.id)}
                    className="flex items-center gap-2.5 w-full rounded-lg p-2 text-xs text-left hover:bg-white/[0.04] transition-colors"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        step.completed
                          ? 'border-emerald-500 bg-emerald-600 text-white'
                          : 'border-white/20 bg-black/40'
                      }`}
                    >
                      {step.completed && <Check className="h-3 w-3" />}
                    </span>
                    <span className={step.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {step.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Session Controls */}
      <div className="w-full flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
        {/* Give Up / Break Promise */}
        <button
          id="give-up-session-button"
          type="button"
          onClick={() => setShowGiveUpConfirm(true)}
          className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors py-2 px-3"
        >
          Give Up
        </button>

        <div className="flex items-center gap-3">
          {/* Pause / Resume */}
          <button
            id="pause-resume-button"
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Complete & Verify */}
          <button
            id="complete-verify-session-button"
            type="button"
            onClick={onSessionComplete}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Complete & Verify →</span>
          </button>
        </div>
      </div>

      {/* Give Up Intentional Friction Modal */}
      {showGiveUpConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0E1018] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Break this commitment?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
              COMMIT's philosophy is rooted in keeping promises to yourself. Giving up early unlocks restricted apps, but you forfeit the <span className="text-emerald-400 font-bold">+{commitment.durationMinutes}m screen time reward</span>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Reason (Optional self-reflection)
              </label>
              <input
                type="text"
                placeholder="What interrupted your focus?"
                value={giveUpReason}
                onChange={(e) => setGiveUpReason(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-[#07080C] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] pt-3">
              <button
                type="button"
                onClick={() => setShowGiveUpConfirm(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Stay Committed
              </button>
              <button
                id="confirm-give-up-button"
                type="button"
                onClick={() => {
                  setShowGiveUpConfirm(false);
                  onSessionFailed();
                }}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
