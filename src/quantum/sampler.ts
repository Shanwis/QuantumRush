import type { Rng } from './rng';

export function sampleShots(probs: readonly number[], count: number, rng: Rng): number[] {
  const cumulative: number[] = [];
  let acc = 0;
  for (const p of probs) {
    acc += p;
    cumulative.push(acc);
  }
  const counts: number[] = [];
  for (let i = 0; i < probs.length; i++) counts.push(0);
  for (let shot = 0; shot < count; shot++) {
    const r = rng() * acc;
    let j = 0;
    while (j < cumulative.length - 1 && r >= cumulative[j]) j++;
    counts[j]++;
  }
  return counts;
}

export function sampleOutcome(probs: readonly number[], rng: Rng): number {
  const counts = sampleShots(probs, 1, rng);
  return counts.indexOf(1);
}
