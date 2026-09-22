import React, { useState } from 'react';
import { Target, CheckCircle2, Flame, Edit3, Check, X, Sparkles, Plus, Minus } from 'lucide-react';
import { playCommitPing, playSuccessChime } from '../utils/audio';

interface DailyFocusGoalProps {
  dailyGoalMinutes: number;
  todayFocusedMinutes: number;
  onUpdateGoal: (newGoalMinutes: number) => void;
  streak: number;
}

const PRESET_GOALS = [30, 45, 60, 90, 120];

export const DailyFocusGoal: React.FC<DailyFocusGoalProps> = ({
  dailyGoalMinutes,
  todayFocusedMinutes,
  onUpdateGoal,
  streak,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customGoal, setCustomGoal] = useState<number>(dailyGoalMinutes);

  const goal = Math.max(10, dailyGoalMinutes || 60);
  const progressPercent = Math.min(150, Math.round((todayFocusedMinutes / goal) * 100));
  const isGoalReached = todayFocusedMinutes >= goal;
  const remainingMinutes = Math.max(0, goal - todayFocusedMinutes);

  // SVG Circular Ring Math
  const radius = 46;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  // Cap visual ring offset at 100% (or let it full circle)
  const normalizedProgress = Math.min(100, (todayFocusedMinutes / goal) * 100);
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const handleSaveGoal = (newGoal: number) => {
    const val = Math.max(10, Math.min(480, newGoal));
    onUpdateGoal(val);
    setCustomGoal(val);
    setIsEditing(false);
    playCommitPing();
  };

  const handleAdjustGoal = (delta: number) => {
    setCustomGoal((prev) => Math.max(10, Math.min(480, prev + delta)));
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-[#111424] via-[#0E101D] to-[#0A0C14] p-5 sm:p-6 shadow-xl">
      {/* Decorative background glow */}
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl transition-all duration-700 ${
          isGoalReached ? 'bg-emerald-500/20' : 'bg-indigo-500/15'
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Circular Ring & Key Numbers */}
        <div className="flex items-center gap-5 sm:gap-6 w-full md:w-auto">
          {/* Circular Progress Ring */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg
              className="h-28 w-28 sm:h-32 sm:w-32 -rotate-90 transform"
              viewBox="0 0 110 110"
            >
              <defs>
                {/* Regular Progress Gradient */}
                <linearGradient id="goalProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="60%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                {/* Completed Glow Gradient */}
                <linearGradient id="goalCompletedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Background track */}
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-white/[0.07]"
                fill="transparent"
              />

              {/* Animated Progress bar */}
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke={`url(#${isGoalReached ? 'goalCompletedGradient' : 'goalProgressGradient'})`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content of Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {isGoalReached ? (
                <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-0.5" />
                  <span className="font-display text-lg sm:text-xl font-black text-white leading-none">
                    {todayFocusedMinutes}m
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Goal Done!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="font-display text-lg sm:text-2xl font-black text-white leading-none">
                    {todayFocusedMinutes}
                    <span className="text-xs font-normal text-slate-400">/{goal}m</span>
                  </span>
                  <span className="text-[11px] font-bold text-indigo-300 mt-0.5">
                    {Math.min(100, progressPercent)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Middle Text Details */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
                <Target className="h-3.5 w-3.5" />
              </span>
              <h3 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Today's Focus Target</span>
                {isGoalReached && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300 animate-pulse">
                    COMPLETED 🎉
                  </span>
                )}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isGoalReached ? (
                <span className="text-emerald-300 font-medium">
                  Outstanding discipline! You've crushed today's {goal}m goal with{' '}
                  <span className="font-bold text-white">{todayFocusedMinutes} focused minutes</span>.
                </span>
              ) : (
                <span>
                  You have logged <span className="font-bold text-white">{todayFocusedMinutes}m</span> of deep work today.{' '}
                  <span className="text-indigo-300 font-semibold">{remainingMinutes}m remaining</span> to seal today's pact.
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium text-amber-400">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                Streak: {streak} days active
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">
                {isGoalReached
                  ? 'All subsequent focus minutes earn bonus screen time'
                  : 'Completing 1 focus sprint will hit your target'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Goal Setting / Editing Controls */}
        <div className="w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-6">
          {!isEditing ? (
            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3">
              <div className="text-left md:text-right">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Current Target
                </div>
                <div className="font-display text-xl sm:text-2xl font-black text-white">
                  {goal} Minutes
                </div>
              </div>

              <button
                id="edit-daily-goal-button"
                type="button"
                onClick={() => {
                  setCustomGoal(goal);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] hover:border-indigo-500/40 px-3.5 py-2 text-xs font-bold text-slate-200 transition-all active:scale-95 shadow-sm"
              >
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Adjust Goal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 w-full max-w-xs animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Set Daily Target
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {PRESET_GOALS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomGoal(preset)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      customGoal === preset
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                        : 'bg-white/[0.05] text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>

              {/* Stepper Input */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustGoal(-15)}
                  className="rounded-lg border border-white/[0.1] bg-white/[0.05] p-1.5 text-slate-300 hover:bg-white/[0.1]"
                  title="Decrease 15 min"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <div className="relative flex-1">
                  <input
                    id="custom-daily-goal-input"
                    type="number"
                    min={10}
                    max={480}
                    step={5}
                    value={customGoal}
                    onChange={(e) => setCustomGoal(Number(e.target.value) || 10)}
                    className="w-full rounded-xl border border-white/[0.15] bg-[#07080D] px-3 py-1.5 text-center text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-semibold">
                    MIN
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustGoal(15)}
                  className="rounded-lg border border-white/[0.1] bg-white/[0.05] p-1.5 text-slate-300 hover:bg-white/[0.1]"
                  title="Increase 15 min"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>

                <button
                  id="save-daily-goal-button"
                  type="button"
                  onClick={() => handleSaveGoal(customGoal)}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
