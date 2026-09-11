let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function unlockAudio(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  osc.start();
  osc.stop(ctx.currentTime + 0.01);
}

export function playScream(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = 1.2;

  // Noise buffer for the screeching layer
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(2000, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(400, now + duration);
  noiseFilter.Q.value = 5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.8, now + 0.02);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  // High-pitched descending scream oscillator
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(1200, now);
  osc1.frequency.exponentialRampToValueAtTime(150, now + duration);

  const osc1Gain = ctx.createGain();
  osc1Gain.gain.setValueAtTime(0.001, now);
  osc1Gain.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
  osc1Gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(osc1Gain);
  osc1Gain.connect(ctx.destination);

  // Dissonant second oscillator
  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(800, now);
  osc2.frequency.exponentialRampToValueAtTime(100, now + duration);

  const osc2Gain = ctx.createGain();
  osc2Gain.gain.setValueAtTime(0.001, now);
  osc2Gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
  osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc2.connect(osc2Gain);
  osc2Gain.connect(ctx.destination);

  // Sub bass thump
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60, now);
  sub.frequency.exponentialRampToValueAtTime(30, now + 0.5);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.001, now);
  subGain.gain.exponentialRampToValueAtTime(0.7, now + 0.01);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  sub.connect(subGain);
  subGain.connect(ctx.destination);

  noiseSource.start(now);
  osc1.start(now);
  osc2.start(now);
  sub.start(now);

  noiseSource.stop(now + duration);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
  sub.stop(now + 0.5);
}

export function playHeartbeat(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

export function playTick(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}
