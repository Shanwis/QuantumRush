import { type Rng } from '../quantum/rng';
import { createZeroState, probabilities } from '../quantum/state';
import { buildCatalog, distributionKey, type TargetInfo } from './analysis';
import { type Challenge, type Op, type QubitCount, applyOp, opsForLevel } from './types';

export const K_RANGES: Record<QubitCount, [number, number]> = {
  1: [1, 3],
  2: [2, 5],
  3: [3, 7],
};

export const DEPTH_BANDS: Record<QubitCount, [number, number]> = {
  1: [1, 2],
  2: [2, 4],
  3: [3, 6],
};

export const HISTORY_WINDOW = 8;
export const MAX_ATTEMPTS = 30;

const catalogs = new Map<QubitCount, Map<string, TargetInfo>>();

function catalogFor(level: QubitCount): Map<string, TargetInfo> {
  let catalog = catalogs.get(level);
  if (!catalog) {
    catalog = buildCatalog(level);
    catalogs.set(level, catalog);
  }
  return catalog;
}

export function supportSize(probs: readonly number[]): number {
  return probs.filter((p) => p > 1e-9).length;
}

export function eligibleKeys(level: QubitCount): string[] {
  const [lo, hi] = DEPTH_BANDS[level];
  return [...catalogFor(level).values()]
    .filter((info) => supportSize(info.probs) >= 2 && info.depth >= lo && info.depth <= hi)
    .map((info) => info.key);
}

function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, xs: readonly T[]): T {
  return xs[Math.floor(rng() * xs.length)];
}

function simulate(level: QubitCount, ops: readonly Op[]): number[] {
  let s = createZeroState(level);
  for (const op of ops) s = applyOp(s, op);
  return probabilities(s);
}

function inBand(level: QubitCount, key: string): boolean {
  const info = catalogFor(level).get(key);
  if (!info) return false;
  const [lo, hi] = DEPTH_BANDS[level];
  return info.depth >= lo && info.depth <= hi;
}

function fallbackChallenge(
  level: QubitCount,
  rng: Rng,
  history: readonly string[],
): Challenge {
  const [lo, hi] = DEPTH_BANDS[level];
  let pool = [...catalogFor(level).values()].filter(
    (info) => supportSize(info.probs) >= 2 && info.depth >= lo && info.depth <= hi,
  );
  if (pool.length === 0) {
    pool = [...catalogFor(level).values()].filter((info) => supportSize(info.probs) >= 2);
  }
  let best = Infinity;
  for (const info of pool) {
    best = Math.min(best, history.lastIndexOf(info.key));
  }
  const leastRecent = pool.filter((info) => history.lastIndexOf(info.key) === best);
  const info = pick(rng, leastRecent);
  return {
    level,
    target: [...info.probs],
    key: info.key,
    solution: [...info.solution],
    depth: info.depth,
  };
}

export function minimalSolution(level: QubitCount, key: string): Op[] {
  const info = catalogFor(level).get(key);
  return info ? [...info.solution] : [];
}

export function generateChallenge(
  level: QubitCount,
  rng: Rng,
  history: readonly string[],
): Challenge {
  const opsPool = opsForLevel(level);
  const [kMin, kMax] = K_RANGES[level];
  const recent = history.slice(-HISTORY_WINDOW);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const ops: Op[] = [];
    const k = randInt(rng, kMin, kMax);
    for (let i = 0; i < k; i++) ops.push(pick(rng, opsPool));
    const target = simulate(level, ops);
    if (supportSize(target) < 2) continue;
    const key = distributionKey(target);
    if (level !== 1 && recent.includes(key)) continue;
    if (!inBand(level, key)) continue;
    return {
      level,
      target,
      key,
      solution: ops,
      depth: catalogFor(level).get(key)!.depth,
    };
  }
  return fallbackChallenge(level, rng, history);
}
