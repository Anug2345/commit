import React, { useState } from 'react';
import { Sparkles, Clock, Target, ArrowRight, Check, Mic, MicOff, Lock, Zap, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Commitment, CategoryType, RestrictedApp } from '../types';
import { playCommitPing } from '../utils/audio';

interface CreateCommitmentProps {
  onStartCommitment: (commitmentData: {
    taskTitle: string;
    durationMinutes: number;
    category: CategoryType;
    breakdown: { id: string; title: string; completed: boolean }[];
    restrictedAppIds: string[];
    coachAdvice?: string;
  }) => void;
  availableApps: RestrictedApp[];
  screenTimeRatio: number;
}

const TEMPLATES = [
  { emoji: '🦉', label: 'Duolingo Spanish', prompt: "Complete today's Duolingo lesson", duration: 25, category: 'Education' as CategoryType, apps: ['instagram', 'tiktok', 'youtube', 'x', 'reddit'] },
  { emoji: '💻', label: 'Code PR Review', prompt: "Review 2 open pull requests and verify tests", duration: 30, category: 'Deep Work' as CategoryType, apps: ['instagram', 'tiktok', 'x', 'reddit', 'games'] },
  { emoji: '📚', label: 'Study Sprint', prompt: "Read 1 chapter of textbook and write summary", duration: 45, category: 'Education' as CategoryType, apps: ['instagram', 'tiktok', 'youtube', 'x', 'reddit', 'games', 'netflix'] },
  { emoji: '🏃', label: 'Quick Workout', prompt: "30-minute core workout & stretching", duration: 30, category: 'Health & Wellness' as CategoryType, apps: ['instagram', 'tiktok', 'x'] },
  { emoji: '✍️', label: 'Writing Flow', prompt: "Draft introduction and outline for next article", duration: 40, category: 'Creative' as CategoryType, apps: ['instagram', 'tiktok', 'youtube', 'x', 'reddit'] },
];

const DURATION_PRESETS = [15, 25, 35, 45, 60];

const CATEGORIES: { name: CategoryType; icon: string }[] = [
  { name: 'Education', icon: '🎯' },
  { name: 'Deep Work', icon: '💻' },
  { name: 'Health & Wellness', icon: '⚡' },
  { name: 'Creative', icon: '🎨' },
  { name: 'Life Admin', icon: '🧹' },
];

export const CreateCommitment: React.FC<CreateCommitmentProps> = ({
  onStartCommitment,
  availableApps,
  screenTimeRatio,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [category, setCategory] = useState<CategoryType>('Education');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([
    'instagram',
    'tiktok',
    'youtube',
    'x',
    'reddit',
  ]);
  const [breakdown, setBreakdown] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [coachTip, setCoachTip] = useState<string | null>(null);

  // Earned screen time calculation
  const earnedMinutes = Math.round(durationMinutes * screenTimeRatio);

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    setTaskTitle(template.prompt);
    setDurationMinutes(template.duration);
    setCategory(template.category);
    setSelectedAppIds(template.apps);
    setCoachTip(`Sweet choice! ${template.duration} minutes is a prime flow state window.`);
    playCommitPing();
  };

  const handleToggleApp = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleSelectAllApps = () => {
    if (selectedAppIds.length === availableApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(availableApps.map((a) => a.id));
    }
  };

  // Quick Voice Input
  const handleToggleVoice = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTaskTitle("Complete today's Duolingo lesson");
      setDurationMinutes(25);
      setCategory('Education');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (!isRecording) {
        setIsRecording(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTaskTitle(transcript);
          setIsRecording(false);
          handleAiAutoTune(transcript);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    } catch {
      setIsRecording(false);
      setTaskTitle("Complete today's Duolingo lesson");
    }
  };

  // Optional AI Auto-Tune with Gemini
  const handleAiAutoTune = async (customPrompt?: string) => {
    const input = (customPrompt ?? taskTitle).trim();
    if (!input) return;

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/parse-commitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      if (res.ok) {
        const data = await res.json();
        playCommitPing();
        if (data.taskTitle) setTaskTitle(data.taskTitle);
        if (data.durationMinutes) setDurationMinutes(data.durationMinutes);
        if (data.category) setCategory(data.category as CategoryType);
        if (data.coachAdvice) setCoachTip(data.coachAdvice);
        if (Array.isArray(data.breakdown) && data.breakdown.length > 0) {
          setBreakdown(
            data.breakdown.map((item: string, idx: number) => ({
              id: String(idx + 1),
              title: item,
              completed: false,
            }))
          );
          setShowAdvanced(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = taskTitle.trim() || 'Focused Sprint';

    playCommitPing();
    onStartCommitment({
      taskTitle: finalTitle,
      durationMinutes,
      category,
      breakdown: breakdown.length > 0 ? breakdown : [
        { id: '1', title: `Complete ${finalTitle}`, completed: false },
        { id: '2', title: 'Verify outcome & keep promise', completed: false },
      ],
      restrictedAppIds: selectedAppIds,
      coachAdvice: coachTip || `Locked in for ${durationMinutes} minutes. Stay true to your word!`,
    });
  };

  return (
    <div className="relative w-full rounded-3xl border border-white/[0.12] bg-gradient-to-b from-[#111424] via-[#0E101D] to-[#0A0C14] p-5 sm:p-7 shadow-2xl overflow-hidden">
      {/* Glow highlight */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
              <Sparkles className="h-3.5 w-3.5 fill-indigo-400" />
            </span>
            <h2 className="font-display text-lg sm:text-xl font-black tracking-tight text-white">
              AI Commitment Builder
            </h2>
            <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
              Gemini Powered
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Tell the AI what you need to accomplish. It deconstructs your goal into focused sprints.
          </p>
        </div>

        {/* Live Reward Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 shadow-sm shadow-emerald-500/20 animate-pulse">
          <span>💰 Reward:</span>
          <span className="text-white">+{earnedMinutes}m Freedom Minutes</span>
        </div>
      </div>

      {/* Quick Launch Template Chips */}
      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Quick Ideas:
          </span>
          {TEMPLATES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSelectTemplate(item)}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/15 hover:text-white transition-all shrink-0 active:scale-95"
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
              <span className="text-[10px] text-indigo-400 font-bold">⏱{item.duration}m</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleLaunch} className="space-y-4">
        {/* Main Task Input Bar */}
        <div className="relative flex items-center">
          <input
            id="commitment-task-input"
            type="text"
            placeholder="e.g., I need to complete my Duolingo lesson..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full rounded-2xl border border-white/[0.12] bg-[#07080D] px-4 py-3.5 pl-4 pr-24 text-sm sm:text-base font-semibold text-white placeholder-slate-500 shadow-inner focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice Input */}
            <button
              type="button"
              onClick={handleToggleVoice}
              title="Voice Input"
              className={`rounded-xl p-2 transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* AI Auto-tune Button */}
            <button
              type="button"
              onClick={() => handleAiAutoTune()}
              disabled={isAiLoading || !taskTitle.trim()}
              title="AI Structure & Advice"
              className="flex items-center gap-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-40 transition-all"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">AI Tune</span>
            </button>
          </div>
        </div>

        {/* Coach Tip if available */}
        {coachTip && (
          <div className="flex items-start gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-2.5 text-xs text-indigo-200 animate-in fade-in">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{coachTip}</span>
          </div>
        )}

        {/* Duration & Category Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Duration Selector */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#07080D]/60 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Target Duration
              </span>
              <span className="font-bold text-white text-xs">{durationMinutes} Minutes</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {DURATION_PRESETS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`rounded-xl py-1.5 text-xs font-bold transition-all ${
                    durationMinutes === mins
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                      : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#07080D]/60 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                Focus Category
              </span>
              <span className="text-xs font-bold text-indigo-300">{category}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  title={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`rounded-xl py-1.5 text-xs font-bold flex items-center justify-center transition-all ${
                    category === cat.name
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                      : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Integrated Distraction Shield (Instant App Toggle) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#07080D]/80 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Shield Distracting Apps
              </span>
              <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-rose-300">
                {selectedAppIds.length} Locked
              </span>
            </div>

            <button
              type="button"
              onClick={handleSelectAllApps}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {selectedAppIds.length === availableApps.length ? 'Clear All' : 'Lock All'}
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {availableApps.slice(0, 6).map((app) => {
              const isLocked = selectedAppIds.includes(app.id);
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleToggleApp(app.id)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 text-left transition-all ${
                    isLocked
                      ? 'border-rose-500/50 bg-rose-500/15 shadow-sm shadow-rose-500/20 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/10'
                  }`}
                >
                  <span className="text-sm">{app.badge}</span>
                  <div className="truncate flex-1">
                    <span className="text-xs font-bold truncate block">{app.name}</span>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isLocked ? 'bg-rose-400 animate-pulse' : 'bg-white/10'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Locked apps are protected during focus. Complete your commitment to unlock them guilt-free.
          </p>
        </div>

        {/* Optional Sub-goals Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <span>Sub-task Checklist ({breakdown.length})</span>
              {breakdown.length > 0 && <span className="text-emerald-400 font-bold">• Active</span>}
            </span>
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-2 rounded-2xl border border-white/[0.08] bg-[#07080D] p-3 animate-in fade-in">
              {breakdown.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-400 w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...breakdown];
                      updated[idx].title = e.target.value;
                      setBreakdown(updated);
                    }}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setBreakdown(breakdown.filter((b) => b.id !== item.id))}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setBreakdown([
                    ...breakdown,
                    { id: String(Date.now()), title: 'New sub-milestone', completed: false },
                  ])
                }
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Checklist Item</span>
              </button>
            </div>
          )}
        </div>

        {/* Big Motivating Launch Button */}
        <button
          id="launch-commitment-button"
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 px-6 py-4 font-display text-base font-black text-white shadow-xl shadow-indigo-600/30 hover:brightness-110 active:scale-[0.99] transition-all"
        >
          <Zap className="h-5 w-5 fill-white" />
          <span>LOCK IN & START FOCUS (+{earnedMinutes}m Screen Time)</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};
