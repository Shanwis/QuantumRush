import { loadSettings, saveSettings } from '../game/storage';

export type SfxName =
  | 'click'
  | 'flip'
  | 'mix'
  | 'turn'
  | 'twist'
  | 'link'
  | 'measure'
  | 'win';

let ctx: AudioContext | null = null;
let themeOn = loadSettings().themeOn;

let musicGain: GainNode | null = null;
let padOscs: OscillatorNode[] = [];
let themeTimer: number | null = null;
let themeStep = 0;
let themeNextTime = 0;

const ARP = [220.0, 261.63, 329.63, 493.88, 392.0, 329.63];
const BASS = [55.0, 55.0, 65.41, 49.0];
const STEP = 0.28;

export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  if (ctx === null) {
    const Ctor =
      window.AudioContext ??
      (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  if (themeOn) startTheme();
}

export function setThemeEnabled(next: boolean): void {
  themeOn = next;
  saveSettings({ themeOn: next });
  if (ctx === null) return;
  if (next) startTheme();
  else stopTheme();
}

function note(
  dest: AudioNode,
  send: AudioNode | null,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  vol: number,
): void {
  if (ctx === null) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  if (send !== null) gain.connect(send);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function startTheme(): void {
  if (ctx === null || themeTimer !== null) return;
  const t = ctx.currentTime;
  musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(0.0001, t);
  musicGain.gain.exponentialRampToValueAtTime(1, t + 2);
  musicGain.connect(ctx.destination);

  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.36;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  const wet = ctx.createGain();
  wet.gain.value = 0.4;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(musicGain);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  filter.Q.value = 2;
  filter.connect(musicGain);

  padOscs = [];
  for (const freq of [110, 110.6, 164.81, 246.9]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(filter);
    osc.start();
    padOscs.push(osc);
  }

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 350;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  padOscs.push(lfo);

  themeStep = 0;
  themeNextTime = t + 0.1;
  themeTimer = window.setInterval(schedulerTick, 120);
}

function stopTheme(): void {
  if (themeTimer !== null) {
    window.clearInterval(themeTimer);
    themeTimer = null;
  }
  if (ctx === null || musicGain === null) return;
  const t = ctx.currentTime;
  const bus = musicGain;
  const oscs = padOscs;
  musicGain = null;
  padOscs = [];
  bus.gain.cancelScheduledValues(t);
  bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), t);
  bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  window.setTimeout(() => {
    for (const osc of oscs) {
      try {
        osc.stop();
      } catch {
        return;
      }
    }
  }, 700);
}

function schedulerTick(): void {
  if (ctx === null || musicGain === null) return;
  while (themeNextTime < ctx.currentTime + 0.4) {
    scheduleThemeStep(themeStep, themeNextTime);
    themeNextTime += STEP;
    themeStep++;
  }
}

function scheduleThemeStep(step: number, at: number): void {
  if (musicGain === null) return;
  note(musicGain, musicGain, ARP[step % ARP.length], at, 0.22, 'square', 0.05);
  if (step % 2 === 0) {
    note(musicGain, null, BASS[(step >> 1) % BASS.length], at, 0.5, 'sine', 0.08);
  }
  if (step % 8 === 7) {
    note(musicGain, musicGain, ARP[(step + 2) % ARP.length] * 2, at, 0.18, 'triangle', 0.03);
  }
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  vol: number,
): void {
  if (ctx === null) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function sfx(name: SfxName): void {
  if (ctx === null) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'click':
      tone(880, t, 0.05, 'square', 0.08);
      break;
    case 'flip':
      tone(220, t, 0.08, 'square', 0.1);
      tone(330, t + 0.06, 0.08, 'square', 0.08);
      break;
    case 'mix':
      tone(523, t, 0.06, 'triangle', 0.1);
      tone(784, t + 0.05, 0.09, 'triangle', 0.09);
      break;
    case 'turn':
      tone(392, t, 0.1, 'sine', 0.1);
      break;
    case 'twist':
      tone(294, t, 0.07, 'sawtooth', 0.07);
      tone(349, t + 0.05, 0.07, 'sawtooth', 0.06);
      break;
    case 'link':
      tone(523, t, 0.07, 'square', 0.09);
      tone(659, t + 0.07, 0.07, 'square', 0.09);
      tone(784, t + 0.14, 0.1, 'square', 0.08);
      break;
    case 'measure':
      for (let i = 0; i < 10; i++) tone(1046 + i * 40, t + i * 0.03, 0.03, 'square', 0.05);
      tone(147, t + 0.35, 0.18, 'triangle', 0.12);
      break;
    case 'win':
      tone(523, t, 0.12, 'square', 0.1);
      tone(659, t + 0.12, 0.12, 'square', 0.1);
      tone(784, t + 0.24, 0.12, 'square', 0.1);
      tone(1046, t + 0.36, 0.3, 'square', 0.1);
      break;
  }
}
