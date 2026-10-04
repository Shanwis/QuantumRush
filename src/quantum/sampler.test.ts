import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng';
import { sampleOutcome, sampleShots } from './sampler';

describe('shot sampling', () => {
  it('is deterministic under a seeded rng', () => {
    const a = sampleShots([0.5, 0.5], 1000, mulberry32(42));
    const b = sampleShots([0.5, 0.5], 1000, mulberry32(42));
    expect(a).toEqual(b);
  });

  it('draws exactly the requested number of shots', () => {
    const counts = sampleShots([0.125, 0.125, 0.25, 0.5], 1000, mulberry32(7));
    expect(counts.reduce((x, y) => x + y, 0)).toBe(1000);
  });

  it('never samples zero-probability outcomes', () => {
    const counts = sampleShots([0.5, 0, 0, 0.5], 1000, mulberry32(9));
    expect(counts[1]).toBe(0);
    expect(counts[2]).toBe(0);
  });

  it('centers counts near the true distribution', () => {
    const [heads] = sampleShots([0.5, 0.5], 1000, mulberry32(1234));
    expect(heads).toBeGreaterThan(350);
    expect(heads).toBeLessThan(650);
  });

  it('samples single outcomes only from supported states', () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 20; i++) {
      const idx = sampleOutcome([0.5, 0, 0, 0.5], rng);
      expect(idx === 0 || idx === 3).toBe(true);
    }
  });
});
