import { describe, expect, it } from 'vitest';
import { type Amp, add, mul } from './complex';
import { type Gate, H, X, Y, Z, isUnitary } from './gates';

function mul2(a: Gate, b: Gate): Gate {
  const cell = (r: number, c: number): Amp =>
    add(mul(a[2 * r], b[c]), mul(a[2 * r + 1], b[2 + c]));
  return [cell(0, 0), cell(0, 1), cell(1, 0), cell(1, 1)];
}

function isIdentity(g: Gate): boolean {
  const want = [1, 0, 0, 0, 0, 0, 1, 0];
  const flat = g.flatMap((a) => [a[0], a[1]]);
  return flat.every((v, i) => Math.abs(v - want[i]) < 1e-9);
}

describe('gate algebra', () => {
  it('keeps every gate unitary', () => {
    for (const g of [X, H, Z, Y]) expect(isUnitary(g)).toBe(true);
  });

  it('squares every gate to identity', () => {
    for (const g of [X, H, Z, Y]) expect(isIdentity(mul2(g, g))).toBe(true);
  });
});
