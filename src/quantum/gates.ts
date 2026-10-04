import { type Amp, add, conj, mul } from './complex';

export type Gate = readonly [Amp, Amp, Amp, Amp];

const K = 1 / Math.SQRT2;

export const X: Gate = [
  [0, 0],
  [1, 0],
  [1, 0],
  [0, 0],
];

export const H: Gate = [
  [K, 0],
  [K, 0],
  [K, 0],
  [-K, 0],
];

export const Z: Gate = [
  [1, 0],
  [0, 0],
  [0, 0],
  [-1, 0],
];

export const Y: Gate = [
  [0, 0],
  [0, -1],
  [0, 1],
  [0, 0],
];

export const GATES: Record<'X' | 'H' | 'Z' | 'Y', Gate> = { X, H, Z, Y };

export function isUnitary(g: Gate, eps = 1e-9): boolean {
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let acc: Amp = [0, 0];
      for (let k = 0; k < 2; k++) {
        acc = add(acc, mul(conj(g[2 * k + i]), g[2 * k + j]));
      }
      const want: Amp = i === j ? [1, 0] : [0, 0];
      if (Math.abs(acc[0] - want[0]) > eps || Math.abs(acc[1] - want[1]) > eps) {
        return false;
      }
    }
  }
  return true;
}
