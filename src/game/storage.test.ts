import { afterEach, describe, expect, it } from 'vitest';
import { loadBests, loadSettings, recordScore, saveSettings } from './storage';

class FakeStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function install(fake: unknown): void {
  (globalThis as { localStorage?: unknown }).localStorage = fake;
}

afterEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = undefined;
});

describe('high score storage', () => {
  it('round-trips per-level bests', () => {
    install(new FakeStorage());
    expect(loadBests()).toEqual({ 1: null, 2: null, 3: null, 4: null });
    expect(recordScore(2, 2840)).toBe(true);
    expect(loadBests()).toEqual({ 1: null, 2: 2840, 3: null, 4: null });
  });

  it('records only strictly greater scores', () => {
    install(new FakeStorage());
    expect(recordScore(1, 1000)).toBe(true);
    expect(recordScore(1, 1000)).toBe(false);
    expect(recordScore(1, 900)).toBe(false);
    expect(recordScore(1, 1200)).toBe(true);
    expect(loadBests()[1]).toBe(1200);
  });

  it('survives corrupt payloads', () => {
    const fake = new FakeStorage();
    fake.setItem('qubit_rush_highscores', '{not json');
    install(fake);
    expect(loadBests()).toEqual({ 1: null, 2: null, 3: null, 4: null });
    expect(recordScore(3, 500)).toBe(true);
  });

  it('survives unavailable storage', () => {
    install({
      getItem() {
        throw new Error('denied');
      },
      setItem() {
        throw new Error('denied');
      },
    });
    expect(loadBests()).toEqual({ 1: null, 2: null, 3: null, 4: null });
    expect(recordScore(1, 500)).toBe(true);
    expect(loadSettings()).toEqual({ themeOn: false });
    expect(() => saveSettings({ themeOn: true })).not.toThrow();
  });
});

describe('settings storage', () => {
  it('defaults the theme to off and round-trips the flag', () => {
    install(new FakeStorage());
    expect(loadSettings()).toEqual({ themeOn: false });
    saveSettings({ themeOn: true });
    expect(loadSettings()).toEqual({ themeOn: true });
    saveSettings({ themeOn: false });
    expect(loadSettings()).toEqual({ themeOn: false });
  });
});
