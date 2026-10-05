import { describe, expect, it } from 'vitest';
import { score } from './scoring';

describe('scoring', () => {
  it('rewards fewer moves and less time', () => {
    expect(score(0, 0, 1)).toBe(5000);
    expect(score(1, 0, 1)).toBe(4880);
    expect(score(0, 10, 1)).toBe(4850);
    expect(score(10, 100, 2)).toBe(4600);
  });

  it('applies level multipliers', () => {
    expect(score(5, 20, 1)).toBe(4100);
    expect(score(5, 20, 2)).toBe(8200);
    expect(score(5, 20, 3)).toBe(16400);
    expect(score(5, 20, 4)).toBe(32800);
  });

  it('floors at 100 before the multiplier', () => {
    expect(score(100, 1000, 1)).toBe(100);
    expect(score(100, 1000, 3)).toBe(400);
    expect(score(100, 1000, 4)).toBe(800);
  });
});
