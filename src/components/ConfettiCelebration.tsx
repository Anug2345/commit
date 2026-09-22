import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  autoTrigger?: boolean;
}

/**
 * Fires a high-energy celebratory confetti sequence matching COMMIT's palette
 * (electric indigo, mint emerald, amber gold, cyber cyan, magenta).
 */
export const triggerMissionCompleteConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Dual side cannon bursts + center glitter star cascade
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#6366F1', '#10B981', '#F59E0B'],
    origin: { x: 0.15, y: 0.7 },
  });

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#38BDF8', '#10B981', '#EC4899'],
    origin: { x: 0.85, y: 0.7 },
  });

  fire(0.2, {
    spread: 60,
    colors: ['#F59E0B', '#FBBF24', '#34D399', '#6366F1'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
    colors: ['#10B981', '#6366F1', '#38BDF8', '#FFFFFF'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    shapes: ['star', 'circle'],
    colors: ['#F59E0B', '#10B981', '#6366F1'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#38BDF8', '#10B981', '#EC4899'],
  });
};

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ autoTrigger = true }) => {
  useEffect(() => {
    if (autoTrigger) {
      // Immediate celebratory burst on mount
      triggerMissionCompleteConfetti();

      // Secondary delayed burst for maximum dopamine satisfaction
      const timer = setTimeout(() => {
        triggerMissionCompleteConfetti();
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [autoTrigger]);

  return null;
};
