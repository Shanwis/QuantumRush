import { describe, expect, it } from 'vitest';
import { H, X, Y, Z } from './gates';
import { type Rng, mulberry32 } from './rng';
import {
  applyCNOT,
  applyGate1,
  coinMarginal,
  createZeroState,
  label,
  norm,
  probabilities,
  type QState,
} from './state';

function expectProbs(actual: readonly number[], expected: readonly number[]): void {
  expect(actual.length).toBe(expected.length);
  actual.forEach((p, i) => expect(p).toBeCloseTo(expected[i], 10));
}

function randomSequence(n: number, steps: number, rng: Rng): QState {
  let s = createZeroState(n);
  for (let i = 0; i < steps; i++) {
    const coin = Math.floor(rng() * n);
    const roll = rng();
    if (roll < 0.2) {
      let target = Math.floor(rng() * n);
      if (target === coin) target = (target + 1) % n;
      s = applyCNOT(s, coin, target);
    } else {
      const gates = [X, H, Z, Y];
      s = applyGate1(s, gates[Math.floor(rng() * gates.length)], coin);
    }
  }
  return s;
}

describe('bit convention', () => {
  it('maps coin A to the most significant bit', () => {
    expect([0, 1, 2, 3].map((i) => label(i, 2))).toEqual(['HH', 'HT', 'TH', 'TT']);
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((i) => label(i, 3))).toEqual([
      'HHH',
      'HHT',
      'HTH',
      'HTT',
      'THH',
      'THT',
      'TTH',
      'TTT',
    ]);
  });

  it('flips the coin A bit under FLIP', () => {
    const s = applyGate1(createZeroState(2), X, 0);
    expectProbs(probabilities(s), [0, 0, 1, 0]);
    expect(label(2, 2)).toBe('TH');
  });
});

describe('LINK direction', () => {
  it('flips the target only when the control coin is Tails', () => {
    const th = applyGate1(createZeroState(2), X, 0);
    expectProbs(probabilities(applyCNOT(th, 0, 1)), [0, 0, 0, 1]);
  });

  it('differs between LINK(A,B) and LINK(B,A)', () => {
    const th = applyGate1(createZeroState(2), X, 0);
    expectProbs(probabilities(applyCNOT(th, 1, 0)), [0, 0, 1, 0]);
    expectProbs(probabilities(applyCNOT(th, 0, 1)), [0, 0, 0, 1]);
  });
});

describe('multi-coin behavior', () => {
  it('produces the Bell distribution from MIX(A) then LINK(A,B)', () => {
    let s = createZeroState(2);
    s = applyGate1(s, H, 0);
    s = applyCNOT(s, 0, 1);
    expectProbs(probabilities(s), [0.5, 0, 0, 0.5]);
    expect(coinMarginal(s, 0)).toBeCloseTo(0.5, 10);
    expect(coinMarginal(s, 1)).toBeCloseTo(0.5, 10);
  });
});

describe('interference', () => {
  it('runs MIX, TURN, MIX back to Tails', () => {
    let s = createZeroState(1);
    s = applyGate1(s, H, 0);
    s = applyGate1(s, Z, 0);
    s = applyGate1(s, H, 0);
    expectProbs(probabilities(s), [0, 1]);
  });

  it('runs MIX, FLIP, MIX back to Heads', () => {
    let s = createZeroState(1);
    s = applyGate1(s, H, 0);
    s = applyGate1(s, X, 0);
    s = applyGate1(s, H, 0);
    expectProbs(probabilities(s), [1, 0]);
  });

  it('keeps probabilities unchanged under TURN alone', () => {
    const mixed = applyGate1(createZeroState(1), H, 0);
    const turned = applyGate1(mixed, Z, 0);
    expectProbs(probabilities(turned), probabilities(mixed));
  });
});

describe('TWIST', () => {
  it('flips a definite coin and keeps its phase', () => {
    const s = applyGate1(createZeroState(1), Y, 0);
    expectProbs(probabilities(s), [0, 1]);
    expect(s.amps[1][0]).toBeCloseTo(0, 10);
    expect(s.amps[1][1]).toBeCloseTo(1, 10);
  });

  it('squares to identity on a mixed coin', () => {
    let s = applyGate1(createZeroState(1), H, 0);
    const before = s;
    s = applyGate1(applyGate1(s, Y, 0), Y, 0);
    s.amps.forEach((a, i) => {
      expect(a[0]).toBeCloseTo(before.amps[i][0], 10);
      expect(a[1]).toBeCloseTo(before.amps[i][1], 10);
    });
  });
});

describe('invariants under random sequences', () => {
  for (const n of [1, 2, 3, 4]) {
    it(`preserves normalization and dyadic probabilities for ${n} coin(s)`, () => {
      const rng = mulberry32(1000 + n);
      const grid = [0, 0.0625, 0.125, 0.25, 0.5, 1];
      for (let run = 0; run < 40; run++) {
        const s = randomSequence(n, 30, rng);
        expect(norm(s)).toBeCloseTo(1, 9);
        const probs = probabilities(s);
        expect(probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
        for (const p of probs) {
          const nearest = Math.min(...grid.map((g) => Math.abs(g - p)));
          expect(nearest).toBeLessThan(1e-9);
        }
      }
    });
  }
});
