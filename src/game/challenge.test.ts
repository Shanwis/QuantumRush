import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../quantum/rng';
import { createZeroState, probabilities } from '../quantum/state';
import { buildCatalog, distributionKey } from './analysis';
import {
  DEPTH_BANDS,
  HISTORY_WINDOW,
  eligibleKeys,
  generateChallenge,
  supportSize,
} from './challenge';
import { type QubitCount, applyOp, opsForLevel } from './types';

const LEVELS: QubitCount[] = [1, 2, 3];

describe('target catalog', () => {
  it('exposes exactly 3, 11 and 51 distinct distributions', () => {
    expect(buildCatalog(1).size).toBe(3);
    expect(buildCatalog(2).size).toBe(11);
    expect(buildCatalog(3).size).toBe(51);
  });

  it('rejects the unreachable HHH/HTT/THT/TTT example', () => {
    const key = distributionKey([0.25, 0, 0, 0.25, 0, 0.25, 0, 0.25]);
    expect(buildCatalog(3).has(key)).toBe(false);
  });

  it('accepts the reachable HHH/HTT/THH/TTT replacement example', () => {
    const key = distributionKey([0.25, 0, 0, 0.25, 0.25, 0, 0, 0.25]);
    expect(buildCatalog(3).has(key)).toBe(true);
  });
});

describe('generateChallenge', () => {
  it('produces 500 solvable, non-trivial, banded challenges without fresh repeats', () => {
    const rng = mulberry32(20261004);
    const histories: Record<QubitCount, string[]> = { 1: [], 2: [], 3: [] };
    for (let i = 0; i < 500; i++) {
      const level = LEVELS[i % 3];
      const challenge = generateChallenge(level, rng, histories[level]);
      histories[level].push(challenge.key);

      expect(supportSize(challenge.target)).toBeGreaterThanOrEqual(2);

      const [lo, hi] = DEPTH_BANDS[level];
      expect(challenge.depth).toBeGreaterThanOrEqual(lo);
      expect(challenge.depth).toBeLessThanOrEqual(hi);

      const pool = opsForLevel(level);
      let s = createZeroState(level);
      for (const op of challenge.solution) {
        expect(pool).toContainEqual(op);
        s = applyOp(s, op);
      }
      const replay = probabilities(s);
      replay.forEach((p, j) => {
        expect(Math.abs(p - challenge.target[j])).toBeLessThan(1e-9);
      });

      if (level !== 1) {
        const window = Math.max(1, Math.min(HISTORY_WINDOW, eligibleKeys(level).length - 1));
        const tail = histories[level].slice(-(window + 1), -1);
        expect(tail).not.toContain(challenge.key);
      }
    }
  });

  it('always targets 50/50 on level 1', () => {
    const rng = mulberry32(11);
    for (let i = 0; i < 20; i++) {
      const challenge = generateChallenge(1, rng, []);
      expect(challenge.target[0]).toBeCloseTo(0.5, 9);
      expect(challenge.target[1]).toBeCloseTo(0.5, 9);
    }
  });

  it('stays solvable when the history is saturated', () => {
    const rng = mulberry32(23);
    const history = eligibleKeys(2).concat(eligibleKeys(2), eligibleKeys(2));
    const challenge = generateChallenge(2, rng, history);
    let s = createZeroState(2);
    for (const op of challenge.solution) s = applyOp(s, op);
    probabilities(s).forEach((p, j) => {
      expect(Math.abs(p - challenge.target[j])).toBeLessThan(1e-9);
    });
  });
});
