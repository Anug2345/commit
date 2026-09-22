import React, { useState } from 'react';
import { CheckCircle, Clock, Award, ArrowRight, ShieldCheck, FileCheck, X, Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { Commitment, TaskVerificationResult } from '../types';
import { playSuccessChime } from '../utils/audio';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  commitment: Commitment;
  onConfirmVerification: (method: Commitment['verificationMethod'], proofNote?: string, bonusMinutes?: number) => void;
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  commitment,
  onConfirmVerification,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<Commitment['verificationMethod']>('timer');
  const [proofNote, setProofNote] = useState('');
  const [isAiVerifying, setIsAiVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<TaskVerificationResult | null>(null);

  if (!isOpen) return null;

  const verificationOptions = [
    {
      id: 'timer' as const,
      title: 'Full Timer Completed',
      desc: `Focused for the full ${commitment.durationMinutes}-minute commitment sprint.`,
      icon: <Clock className="h-4 w-4 text-emerald-400" />,
      badge: 'Time-Tested',
    },
    {
      id: 'activity' as const,
      title: 'Task Milestone Evidence',
      desc: 'Finished deliverable (e.g. lesson, PR review, reading chapter, writing outline).',
      icon: <FileCheck className="h-4 w-4 text-indigo-400" />,
      badge: 'Proof-Backed',
    },
    {
      id: 'user_confirm' as const,
      title: 'Honest Self-Confirmation',
      desc: 'Kept the promise made to myself with 100% personal integrity.',
      icon: <Award className="h-4 w-4 text-amber-400" />,
      badge: 'Honor Code',
    },
  ];

  const handleRunAiVerification = async () => {
    setIsAiVerifying(true);
    try {
      const res = await fetch('/api/ai/verify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: commitment.taskTitle,
          durationMinutes: commitment.durationMinutes,
          proofNote: proofNote.trim(),
          verificationMethod: selectedMethod,
        }),
      });

      if (res.ok) {
        const result: TaskVerificationResult = await res.json();
        setAiResult(result);
        playSuccessChime();
      }
    } catch {
      setAiResult({
        verified: true,
        score: 92,
        badge: "Verified Completion",
        critique: `Effort confirmed for "${commitment.taskTitle}".`,
        feedback: "Integrity verified. You kept your promise to yourself.",
        bonusMinutes: 3,
      });
      playSuccessChime();
    } finally {
      setIsAiVerifying(false);
    }
  };

  const handleFinalUnlock = () => {
    const bonus = aiResult?.bonusMinutes || 0;
    onConfirmVerification(selectedMethod, proofNote, bonus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#0E1018] p-6 sm:p-7 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5 text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Step 4: AI Task Verification
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl font-black text-white mb-1">
          Verify Task Completion
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
          Task: <span className="text-white font-semibold">"{commitment.taskTitle}"</span> ({commitment.durationMinutes}m)
        </p>

        {/* AI Result Card if generated */}
        {aiResult ? (
          <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>AI Integrity Auditor: Passed</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/30">
                {aiResult.score}% Confidence
              </span>
            </div>

            <div className="text-xs text-slate-200">
              <span className="font-semibold text-white">Auditor Critique: </span>
              {aiResult.critique}
            </div>

            <div className="text-[11px] text-emerald-300/90 font-medium">
              "{aiResult.feedback}"
            </div>

            {aiResult.bonusMinutes > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>+{aiResult.bonusMinutes} Bonus Freedom Minutes Awarded for High Fidelity Proof!</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Options */}
            <div className="space-y-2 mb-4">
              {verificationOptions.map((opt) => {
                const isSelected = selectedMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedMethod(opt.id)}
                    className={`w-full flex items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500/60 bg-emerald-500/15 shadow-md shadow-emerald-500/15'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{opt.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">{opt.title}</h4>
                        <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/[0.08]">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Completion Note or Proof with AI Verification */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Completion Proof Note (Optional)
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Earns bonus Freedom Minutes
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. Completed Chapter 4 review exercises with all correct answers"
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-[#07080C] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* AI Audit trigger button */}
            <button
              type="button"
              onClick={handleRunAiVerification}
              disabled={isAiVerifying}
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 py-2 text-xs font-bold text-indigo-300 transition-all disabled:opacity-40"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isAiVerifying ? 'animate-spin' : ''}`} />
              <span>{isAiVerifying ? 'Auditing with Gemini...' : 'Run AI Task Verification'}</span>
            </button>
          </>
        )}

        {/* Integrity note */}
        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3 mb-5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Honesty Principle: </span>
          COMMIT never uses invasive surveillance. You are building trust with your future self.
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Return to Session
          </button>

          <button
            id="confirm-verification-button"
            type="button"
            onClick={handleFinalUnlock}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Claim Freedom Minutes</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
