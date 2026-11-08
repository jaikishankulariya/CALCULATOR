/**
 * Synthesizes a crisp, subtle mechanical click sound using Web Audio API
 * No external audio files or network requests required
 */

let audioCtx: AudioContext | null = null;

export function playKeyClick(enabled: boolean, pitchMultiplier = 1) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const now = audioCtx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchMultiplier, now + 0.025);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // Ignore audio errors if blocked by browser autoplay policy
  }
}
