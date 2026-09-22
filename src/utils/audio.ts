/**
 * Audio synthesis utility using Web Audio API for COMMIT.
 * Generates binaural beats, gentle rain textures, and completion chimes.
 */

let audioCtx: AudioContext | null = null;
let activeAmbientNodes: { stop: () => void } | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Harmonic triumphant chord: C4, E4, G4, C5
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25];
    const now = ctx.currentTime;

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      // Smooth decay
      gain.gain.setValueAtTime(0.0001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 2.0);
    });
  } catch (e) {
    console.warn('Audio feedback not available', e);
  }
}

export function playCommitPing() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.warn('Audio feedback not available', e);
  }
}

export function startAmbientSound(type: 'binaural' | 'rain' | 'deep_space') {
  stopAmbientSound();
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (type === 'binaural') {
      // 40Hz Gamma frequency binaural pulse: 200Hz base + 240Hz
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(196, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(206, ctx.currentTime); // 10Hz alpha pulse

      gain.gain.setValueAtTime(0.02, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      activeAmbientNodes = {
        stop: () => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else if (type === 'deep_space') {
      // Warm low drone
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      activeAmbientNodes = {
        stop: () => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        },
      };
    } else {
      // Rain texture simulated with white noise + lowpass filter
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.025, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      activeAmbientNodes = {
        stop: () => {
          try {
            whiteNoise.stop();
            whiteNoise.disconnect();
          } catch {
            // ignore
          }
        },
      };
    }
  } catch (err) {
    console.warn('Ambient sound failed to start', err);
  }
}

export function stopAmbientSound() {
  if (activeAmbientNodes) {
    activeAmbientNodes.stop();
    activeAmbientNodes = null;
  }
}
