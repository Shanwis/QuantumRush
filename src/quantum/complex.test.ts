import { describe, expect, it } from 'vitest';
import { abs2, add, conj, mul, scale, sub } from './complex';

describe('complex arithmetic', () => {
  it('adds and subtracts componentwise', () => {
    expect(add([1, 2], [3, -4])).toEqual([4, -2]);
    expect(sub([1, 2], [3, -4])).toEqual([-2, 6]);
  });

  it('multiplies and conjugates', () => {
    expect(mul([1, 2], [3, -4])).toEqual([11, 2]);
    expect(conj([1, 2])).toEqual([1, -2]);
  });

  it('computes squared magnitude and scaling', () => {
    expect(abs2([3, 4])).toBe(25);
    expect(scale([1, -2], 0.5)).toEqual([0.5, -1]);
  });
});
