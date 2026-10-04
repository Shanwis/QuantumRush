import { type Amp, abs2, add, mul } from './complex';
import type { Gate } from './gates';

export interface QState {
  readonly n: number;
  readonly amps: readonly Amp[];
}

export function coinBit(n: number, coin: number): number {
  return n - 1 - coin;
}

export function label(index: number, n: number): string {
  let out = '';
  for (let coin = 0; coin < n; coin++) {
    out += (index >> coinBit(n, coin)) & 1 ? 'T' : 'H';
  }
  return out;
}

export function createZeroState(n: number): QState {
  const amps: Amp[] = [];
  for (let i = 0; i < 1 << n; i++) amps.push([0, 0]);
  amps[0] = [1, 0];
  return { n, amps };
}

export function applyGate1(s: QState, u: Gate, coin: number): QState {
  const bit = 1 << coinBit(s.n, coin);
  const amps: Amp[] = s.amps.map((a) => [a[0], a[1]]);
  for (let k = 0; k < s.amps.length; k++) {
    if (k & bit) continue;
    const k1 = k | bit;
    const a0 = s.amps[k];
    const a1 = s.amps[k1];
    amps[k] = add(mul(u[0], a0), mul(u[1], a1));
    amps[k1] = add(mul(u[2], a0), mul(u[3], a1));
  }
  return { n: s.n, amps };
}

export function applyCNOT(s: QState, control: number, target: number): QState {
  const cb = 1 << coinBit(s.n, control);
  const tb = 1 << coinBit(s.n, target);
  const amps: Amp[] = s.amps.map((a) => [a[0], a[1]]);
  for (let k = 0; k < amps.length; k++) {
    if ((k & cb) !== 0 && (k & tb) === 0) {
      const other = k ^ tb;
      const tmp = amps[k];
      amps[k] = amps[other];
      amps[other] = tmp;
    }
  }
  return { n: s.n, amps };
}

export function probabilities(s: QState): number[] {
  const raw = s.amps.map(abs2);
  const total = raw.reduce((acc, p) => acc + p, 0);
  return raw.map((p) => Math.max(0, p) / total);
}

export function coinMarginal(s: QState, coin: number): number {
  const bit = 1 << coinBit(s.n, coin);
  const p = probabilities(s);
  let sum = 0;
  for (let k = 0; k < p.length; k++) {
    if (k & bit) sum += p[k];
  }
  return sum;
}

export function norm(s: QState): number {
  return Math.sqrt(s.amps.reduce((acc, a) => acc + abs2(a), 0));
}
