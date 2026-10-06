import { afterEach, describe, expect, it, vi } from 'vitest';
import { score } from './scoring';
import {
  fetchLeaderboard,
  groupRows,
  sanitizeTag,
  submitScore,
} from './leaderboard';

describe('sanitizeTag', () => {
  it('uppercases, strips symbols, trims and caps length', () => {
    expect(sanitizeTag(' ace ')).toBe('ACE');
    expect(sanitizeTag('q-bit_9!')).toBe('QBIT9');
    expect(sanitizeTag('QUANTUM RUSH!!')).toBe('QUANTUM RUSH');
    expect(sanitizeTag('A'.repeat(30))).toBe('A'.repeat(12));
  });

  it('neutralizes injection and unicode input', () => {
    expect(sanitizeTag("'; DROP TABLE leaderboard;--")).toBe('DROP TABLE L');
    expect(sanitizeTag("'; DROP TABLE leaderboard;--")).toMatch(/^[A-Z0-9 ]*$/);
    expect(sanitizeTag('日本語 ACE')).toBe('ACE');
    expect(sanitizeTag('   ')).toBe('');
    expect(sanitizeTag('<script>')).toBe('SCRIPT');
  });
});

describe('groupRows', () => {
  it('groups per level, keeps server order and drops junk levels', () => {
    const rows = [
      { player_name: 'A', level: 2, moves: 5, time_seconds: 10, score: 8200 },
      { player_name: 'B', level: 4, moves: 9, time_seconds: 40, score: 30000 },
      { player_name: 'C', level: 2, moves: 6, time_seconds: 12, score: 8000 },
      { player_name: 'X', level: 1, moves: 1, time_seconds: 1, score: 4800 },
      { player_name: 'Y', level: 9, moves: 1, time_seconds: 1, score: 1 },
    ];
    const byLevel = groupRows(rows, 50);
    expect(byLevel[2].map((e) => e.playerName)).toEqual(['A', 'C']);
    expect(byLevel[3]).toEqual([]);
    expect(byLevel[4].map((e) => e.playerName)).toEqual(['B']);
    expect(byLevel[1]).toEqual([]);
  });

  it('caps entries per level', () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      player_name: `P${i}`,
      level: 3,
      moves: 5,
      time_seconds: 10,
      score: 1000 - i,
    }));
    expect(groupRows(rows, 2)[3]).toHaveLength(2);
  });
});

describe('offline behavior', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns an honest offline board when unconfigured', async () => {
    const data = await fetchLeaderboard();
    expect(data.source).toBe('offline');
    expect(data.byLevel[2]).toEqual([]);
  });

  it('falls back to offline when the network fails', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon');
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))));
    const data = await fetchLeaderboard();
    expect(data.source).toBe('offline');
  });

  it('rejects submission without config and without a tag', async () => {
    expect(await submitScore('', 2, 5, 10)).toEqual({
      ok: false,
      error: 'ENTER AN ARCADE TAG',
    });
    expect(await submitScore('ACE', 2, 5, 10)).toEqual({ ok: false, error: 'LINK DOWN' });
  });
});

describe('score formula parity with SQL generated column', () => {
  it('matches supabase/migration.sql exactly', () => {
    expect(score(5, 20, 2)).toBe(8200);
    expect(score(5, 20, 3)).toBe(16400);
    expect(score(5, 20, 4)).toBe(32800);
    expect(score(0, 0, 4)).toBe(40000);
    expect(score(500, 86400, 2)).toBe(200);
  });
});
