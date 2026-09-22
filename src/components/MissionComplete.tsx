import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Unlock, Clock, Flame, ArrowRight, Sparkles, Smartphone, PartyPopper } from 'lucide-react';
import { Commitment, RestrictedApp } from '../types';
import { playSuccessChime } from '../utils/audio';
import { ConfettiCelebration, triggerMissionCompleteConfetti } from './ConfettiCelebration';

interface MissionCompleteProps {
  commitment: Commitment;
  restrictedApps: RestrictedApp[];
  earnedMinutes: number;
  newAvailableMinutes: number;
  newStreak: number;
  onDone: () => void;
}

export const MissionComplete: React.FC<MissionCompleteProps> = ({
  commitment,
  restrictedApps,
  earnedMinutes,
  newAvailableMinutes,
  newStreak,
  onDone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play triumphant chime on mount
  useEffect(() => {
    playSuccessChime();
  }, []);

  // Native particle canvas celebration animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8'];
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }> = [];

    // Spawn burst
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: width / 2,
        y: height / 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.012 + 0.006,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const lockedApps = restrictedApps.filter((a) =>
    commitment.restrictedAppIds.includes(a.id)
  );

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto text-white">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-40"
      />

      {/* Canvas-Confetti Automated Celebration */}
      <ConfettiCelebration autoTrigger={true} />

      {/* Main Mission Complete Card */}
      <div className="relative z-10 w-full rounded-3xl border border-white/[0.15] bg-gradient-to-b from-[#111422] to-[#0A0C14] p-6 sm:p-10 shadow-2xl text-center space-y-7 animate-in fade-in zoom-in-95 duration-500">
        {/* Glow behind icon */}
        <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

        {/* Victory Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/30 ring-4 ring-white/10">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>

        {/* Title and Philosophy Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Promise Fulfilled</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white">
            MISSION COMPLETE ✓
          </h1>

          <p className="font-display text-lg sm:text-2xl font-semibold text-indigo-200">
            “You kept your word.”
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Task completed: <span className="text-white font-medium">"{commitment.taskTitle}"</span>
          </p>
        </div>

        {/* Earned Screen Time & Streak Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {/* Screen Time Reward */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
              <Clock className="h-4 w-4" />
              <span>Screen Time Earned</span>
            </div>
            <div className="font-display text-3xl font-black text-white">
              +{earnedMinutes}m
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              Total Available: {newAvailableMinutes} minutes
            </p>
          </div>

          {/* Current Streak */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
              <Flame className="h-4 w-4" />
              <span>Daily Momentum</span>
            </div>
            <div className="font-display text-3xl font-black text-white">
              {newStreak} Days
            </div>
            <p className="text-[11px] text-amber-300/80 mt-1">
              Consecutive promises honored
            </p>
          </div>
        </div>

        {/* Restored Access Celebration */}
        <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 text-left max-w-lg mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Restored App Access
              </h4>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
              UNRESTRICTED
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            All distraction shields have lifted. You have earned your leisure time guilt-free.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {lockedApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200"
              >
                <span>{app.badge}</span>
                <span>{app.name}</span>
                <span className="text-emerald-400">✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Claim Freedom CTA & Confetti trigger */}
        <div className="pt-2 max-w-sm mx-auto space-y-2.5">
          <button
            id="claim-freedom-button"
            type="button"
            onClick={() => {
              triggerMissionCompleteConfetti();
              onDone();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 px-8 py-4 font-display text-sm sm:text-base font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:brightness-110 hover:scale-[1.01]"
          >
            <span>Claim Freedom & Return Home</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            id="retrigger-confetti-button"
            type="button"
            onClick={() => triggerMissionCompleteConfetti()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
          >
            <PartyPopper className="h-3.5 w-3.5 text-amber-400" />
            <span>Toss More Confetti</span>
          </button>
        </div>
      </div>
    </div>
  );
};
