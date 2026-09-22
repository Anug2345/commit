import React, { useState } from 'react';
import { Sparkles, Shield, CheckCircle2, ArrowRight, X, Smartphone, Brain, Lock, Unlock } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      badge: 'Product Philosophy',
      title: 'Not another punishment app.',
      subtitle: 'COMMIT re-engineers your dopamine loop by making screen time an earned reward, not a default state.',
      quote: 'Traditional blockers say: "You can\'t use this app."\nCOMMIT says: "You can use it. First, keep the promise you made to yourself."',
      icon: <Brain className="h-8 w-8 text-indigo-400" />,
    },
    {
      badge: 'The 5-Step Loop',
      title: 'How You Earn Your Freedom',
      subtitle: 'A friction-tested behavioral loop backed by generative AI.',
      steps: [
        { num: '01', title: 'SAY IT', desc: 'Tell the AI what you need to accomplish in natural language.' },
        { num: '02', title: 'COMMIT', desc: 'AI crafts a realistic, structured task with optimal duration.' },
        { num: '03', title: 'RESTRICT', desc: 'Select distracting apps to lock during your session.' },
        { num: '04', title: 'FOCUS', desc: 'Work with ambient focus audio and minimal AI encouragement.' },
        { num: '05', title: 'UNLOCK', desc: 'Mission complete. Access is restored and screen time is credited.' },
      ],
      icon: <Sparkles className="h-8 w-8 text-blue-400" />,
    },
    {
      badge: 'Platform Transparency',
      title: 'Real APIs. Zero Fake Claims.',
      subtitle: 'COMMIT respects platform guidelines and user trust.',
      points: [
        {
          title: 'iOS Platform Support',
          desc: 'Utilizes Apple Screen Time API (FamilyControls & ManagedSettings) to shield apps natively without invasive proxies.',
        },
        {
          title: 'Android Platform Support',
          desc: 'Interfaces with Android UsageStats & Accessibility Service for prompt-level app restriction.',
        },
        {
          title: 'Honest Verification',
          desc: 'We never pretend third-party apps have magical spyware access. Completion is verified via timer milestones, app activity logs, and personal integrity.',
        },
      ],
      icon: <Smartphone className="h-8 w-8 text-emerald-400" />,
    },
  ];

  const current = slides[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0C0E17] p-6 shadow-2xl sm:p-8 text-white">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          {current.icon}
          <span>{current.badge}</span>
        </div>

        {/* Slide Title */}
        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {current.subtitle}
        </p>

        {/* Content Body */}
        {step === 0 && (
          <div className="space-y-4 my-6">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-slate-300 italic border-l-4 border-l-indigo-500">
              "{slides[0].quote}"
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
                  <Lock className="h-3.5 w-3.5" /> Traditional App Blockers
                </div>
                <p className="text-xs text-slate-400">Guilt-driven, easily bypassed, treats users like unruly children.</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                  <Unlock className="h-3.5 w-3.5" /> COMMIT Approach
                </div>
                <p className="text-xs text-slate-400">Dignified, pact-driven, rewards your discipline with earned freedom.</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2.5 my-6 max-h-64 overflow-y-auto pr-1">
            {slides[1].steps?.map((s) => (
              <div key={s.num} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/20 text-[11px] font-bold text-indigo-300">
                  {s.num}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">{s.title}</h4>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 my-6">
            {slides[2].points?.map((pt, i) => (
              <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  {pt.title}
                </h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{pt.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-4">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  step === i ? 'w-6 bg-indigo-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            {step < slides.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 transition-all"
              >
                Start Earning Freedom <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
