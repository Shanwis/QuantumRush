import {
  ensureAnonSession,
  fetchTopScores,
  isSupabaseConfigured,
  submitScoreRpc,
} from '../lib/supabase';
import { loadSettings, saveSettings } from './storage';
import type { QubitCount } from './types';

export interface LeaderboardEntry {
  playerName: string;
  level: QubitCount;
  moves: number;
  timeSeconds: number;
  score: number;
}

export type LeaderboardSource = 'live' | 'offline';

export interface LeaderboardData {
  byLevel: Record<QubitCount, LeaderboardEntry[]>;
  source: LeaderboardSource;
}

export function sanitizeTag(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .slice(0, 12);
}

export function loadTag(): string {
  return loadSettings().tag ?? '';
}

export function saveTag(tag: string): void {
  saveSettings({ ...loadSettings(), tag: sanitizeTag(tag) });
}

export function groupRows(
  rows: Array<{ player_name: string; level: number; moves: number; time_seconds: number; score: number }>,
  limitPerLevel: number,
): Record<QubitCount, LeaderboardEntry[]> {
  const byLevel: Record<QubitCount, LeaderboardEntry[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const row of rows) {
    const level = row.level;
    if (level !== 2 && level !== 3 && level !== 4) continue;
    if (byLevel[level].length >= limitPerLevel) continue;
    byLevel[level].push({
      playerName: row.player_name,
      level,
      moves: row.moves,
      timeSeconds: row.time_seconds,
      score: row.score,
    });
  }
  return byLevel;
}

const EMPTY_BOARD: Record<QubitCount, LeaderboardEntry[]> = { 1: [], 2: [], 3: [], 4: [] };

export async function fetchLeaderboard(limitPerLevel = 50): Promise<LeaderboardData> {
  if (!isSupabaseConfigured()) return { byLevel: EMPTY_BOARD, source: 'offline' };
  try {
    const rows = await fetchTopScores(limitPerLevel * 3);
    return { byLevel: groupRows(rows, limitPerLevel), source: 'live' };
  } catch {
    return { byLevel: EMPTY_BOARD, source: 'offline' };
  }
}

export async function submitScore(
  tag: string,
  level: QubitCount,
  moves: number,
  timeSeconds: number,
): Promise<{ ok: boolean; error?: string }> {
  const name = sanitizeTag(tag);
  if (name.length === 0) return { ok: false, error: 'ENTER AN ARCADE TAG' };
  if (!isSupabaseConfigured()) return { ok: false, error: 'LINK DOWN' };
  try {
    await ensureAnonSession();
  } catch {
    return { ok: false, error: 'SIGN-IN FAILED' };
  }
  try {
    await submitScoreRpc(name, level, moves, timeSeconds);
    saveTag(name);
    return { ok: true };
  } catch {
    return { ok: false, error: 'LINK DOWN' };
  }
}
