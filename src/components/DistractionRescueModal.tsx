import React, { useState, useEffect } from 'react';
import { LifeBuoy, Wind, Brain, Zap, ArrowRight, X, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { playCommitPing, playSuccessChime } from '../utils/audio';

interface DistractionRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchMicroCommitment: (taskTitle: string, durationMinutes: number) => void;
  activeTaskTitle?: string;
  blockedAppName?: string;
}

export const DistractionRescueModal: React.FC<DistractionRescueModalProps> = ({
  isOpen,
  onClose,
  onLaunchMicroCommitment,
  activeTaskTitle,
  blockedAppName,
}) => {
  const [activeTab, setActiveTab] = useState<'urge_surf' | 'ai_reframe' | 'micro_sprint'>('urge_surf');
  
  // Urge surfing breathing state
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // AI Reframe state
  const [selectedFeeling, setSelectedFeeling] = useState<string>('Boredom / Monotony');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiReframeData, setAiReframeData] = useState<{
    reframe: string;
    breathingMantra: string;
    microChallenge: string;
    dopamineTruth: string;
  } | null>(null);

  // 60-second Urge Surfing Box Breathing Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'urge_surf') return;

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          setBreathPhase((current) => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Rest';
            setCyclesCompleted((c) => c + 1);
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleFetchAiReframe = async (feeling: string) => {
    setSelectedFeeling(feeling);
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/distraction-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetApp: blockedAppName || 'Social Media',
          feeling,
          activeTask: activeTaskTitle || 'Current deep work objective',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiReframeData(data);
      }
    } catch {
      setAiReframeData({
        reframe: "Reaching for distraction is dopamine seeking escape. The impulse dissolves if you wait 90 seconds.",
        breathingMantra: "Notice the sensation in your chest or fingers without judging it.",
        microChallenge: "Give yourself 5 minutes on the hardest sentence or problem. Flow follows action.",
        dopamineTruth: "Doomscrolling numbs resistance; finishing the task resolves it permanently.",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleStart5MinSprint = () => {
    playCommitPing();
    onClose();
    onLaunchMicroCommitment(
      activeTaskTitle ? `5-Min Jumpstart: ${activeTaskTitle}` : "5-Min Micro Focus Sprint",
      5
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#14120E] via-[#0E0C09] to-[#07080C] p-5 sm:p-7 text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-full p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
          <LifeBuoy className="h-4 w-4" />
          <span>Emergency Intervention • Distraction Rescue</span>
        </div>

        <h2 className="font-display text-2xl font-black text-white mb-1">
          Pause the Impulse
        </h2>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          {blockedAppName 
            ? `Caught the urge to open ${blockedAppName}? Let's re-wire the dopamine reflex together.`
            : "Feeling resistance or an urge to wander? Ground your attention before deciding."}
        </p>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('urge_surf')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'urge_surf'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Urge Surf</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ai_reframe');
              if (!aiReframeData) handleFetchAiReframe(selectedFeeling);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai_reframe'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            <span>AI Reframe</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('micro_sprint')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'micro_sprint'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>5m Micro</span>
          </button>
        </div>

        {/* Tab 1: Urge Surfing Box Breathing */}
        {activeTab === 'urge_surf' && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            {/* Animated Pulse Circle */}
            <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-2 border-amber-500/30 bg-amber-500/5 mb-5">
              <div 
                className={`absolute inset-0 rounded-full bg-amber-500/20 transition-all duration-1000 ${
                  breathPhase === 'Inhale' 
                    ? 'scale-100 opacity-80' 
                    : breathPhase === 'Hold' 
                    ? 'scale-100 opacity-60' 
                    : breathPhase === 'Exhale' 
                    ? 'scale-50 opacity-20' 
                    : 'scale-50 opacity-10'
                }`}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className="font-display text-2xl font-black text-white tracking-wide">
                  {breathPhase}
                </span>
                <span className="font-mono text-3xl font-black text-amber-400 mt-1">
                  {breathTimer}s
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                  Box Breathing
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
              Neuroscience confirms cravings crest like a wave and fade in 60–90 seconds. 
              Do 2 breath cycles to let the dopamine spike subside.
            </p>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Cycles completed: {cyclesCompleted}</span>
            </div>
          </div>
        )}

        {/* Tab 2: AI Reframe */}
        {activeTab === 'ai_reframe' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                What emotion is triggering this urge?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Boredom / Monotony',
                  'Task Overwhelm',
                  'Mental Fatigue',
                  'Fear of Bad Output',
                ].map((feeling) => (
                  <button
                    key={feeling}
                    type="button"
                    onClick={() => handleFetchAiReframe(feeling)}
                    className={`rounded-xl border p-2.5 text-xs text-left font-medium transition-all ${
                      selectedFeeling === feeling
                        ? 'border-amber-500 bg-amber-500/20 text-white font-bold'
                        : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    {feeling}
                  </button>
                ))}
              </div>
            </div>

            {loadingAi ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
                <Sparkles className="h-6 w-6 text-amber-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-300">Consulting AI Behavioral Model...</p>
              </div>
            ) : aiReframeData ? (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 space-y-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    The Cognitive Reframe
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                    "{aiReframeData.reframe}"
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.08]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dopamine Reality Check
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {aiReframeData.dopamineTruth}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 3: 5-Minute Micro-Commitment */}
        {activeTab === 'micro_sprint' && (
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-center">
              <div className="font-display text-4xl font-black text-amber-400 mb-1">
                5 Minutes
              </div>
              <h4 className="text-sm font-bold text-white mb-2">
                The Friction-Buster Protocol
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Motivation doesn't precede action; action produces motivation. 
                Commit to just 5 minutes with all distractions shielded. If you still want to stop after 5 minutes, you can.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStart5MinSprint}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-xs sm:text-sm font-bold text-black shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <Zap className="h-4 w-4 fill-black" />
              <span>Launch 5-Minute Micro Sprint</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white transition-colors"
          >
            I'm Ready to Return
          </button>
          <span className="text-[11px] text-amber-400 font-semibold">
            One breath at a time.
          </span>
        </div>
      </div>
    </div>
  );
};
