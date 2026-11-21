// Gentle Web Audio helper — strictly silent unless soundEnabled is true

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function playTone(freq: number, durationSec: number, delaySec = 0, peakGain = 0.06) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const start = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + durationSec + 0.02);
  } catch {
    // Graceful silent fallback
  }
}

export function playSoftTap(soundEnabled: boolean) {
  if (!soundEnabled) return;
  playTone(523.25, 0.14, 0, 0.05); // C5 soft chime
}

export function playGentleSuccess(soundEnabled: boolean) {
  if (!soundEnabled) return;
  playTone(523.25, 0.18, 0, 0.05); // C5
  playTone(659.25, 0.24, 0.11, 0.055); // E5
}

export function playCelebrationChord(soundEnabled: boolean) {
  if (!soundEnabled) return;
  playTone(523.25, 0.3, 0, 0.05); // C5
  playTone(659.25, 0.32, 0.1, 0.05); // E5
  playTone(783.99, 0.42, 0.2, 0.055); // G5
}
