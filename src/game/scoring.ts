import type { QubitCount } from './types';

const MULTIPLIERS: Record<QubitCount, number> = { 1: 1, 2: 2, 3: 4 };

export function score(moves: number, seconds: number, level: QubitCount): number {
  const base = Math.max(100, 5000 - moves * 120 - seconds * 15);
  return base * MULTIPLIERS[level];
}
