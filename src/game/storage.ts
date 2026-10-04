import type { QubitCount } from './types';

export interface Bests {
  1: number | null;
  2: number | null;
  3: number | null;
}

export interface Settings {
  themeOn: boolean;
}

const BESTS_KEY = 'qubit_rush_highscores';
const SETTINGS_KEY = 'qubit_rush_settings';

function readJson(key: string): unknown {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw === null || raw === undefined ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function loadBests(): Bests {
  const data = readJson(BESTS_KEY) as { v?: number; best?: Record<string, unknown> } | null;
  const best = data && data.v === 1 && data.best ? data.best : {};
  const pick = (level: QubitCount): number | null => {
    const value = best[String(level)];
    return typeof value === 'number' ? value : null;
  };
  return { 1: pick(1), 2: pick(2), 3: pick(3) };
}

export function recordScore(level: QubitCount, value: number): boolean {
  const bests = loadBests();
  const prev = bests[level];
  if (prev !== null && value <= prev) return false;
  bests[level] = value;
  writeJson(BESTS_KEY, { v: 1, best: bests });
  return true;
}

export function loadSettings(): Settings {
  const data = readJson(SETTINGS_KEY) as { v?: number; themeOn?: boolean } | null;
  return { themeOn: data !== null && data.v === 2 ? data.themeOn !== false : true };
}

export function saveSettings(settings: Settings): void {
  writeJson(SETTINGS_KEY, { v: 2, themeOn: settings.themeOn });
}
