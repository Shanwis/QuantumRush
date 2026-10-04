import { describe, expect, it } from 'vitest';
import { matchesTarget } from './win';

describe('win condition', () => {
  it('accepts exact distribution matches', () => {
    expect(matchesTarget([0.5, 0, 0, 0.5], [0.5, 0, 0, 0.5])).toBe(true);
  });

  it('tolerates float noise but rejects distinct reachable distributions', () => {
    expect(matchesTarget([0.504, 0, 0, 0.496], [0.5, 0, 0, 0.5])).toBe(true);
    expect(matchesTarget([0.625, 0, 0, 0.375], [0.5, 0, 0, 0.5])).toBe(false);
    expect(matchesTarget([0.25, 0.25, 0.25, 0.25], [0.5, 0, 0, 0.5])).toBe(false);
    expect(matchesTarget([1, 0, 0, 0], [0.5, 0, 0, 0.5])).toBe(false);
  });

  it('rejects mismatched lengths', () => {
    expect(matchesTarget([0.5, 0.5], [0.5, 0, 0, 0.5])).toBe(false);
  });
});
