export const WIN_EPSILON = 0.005;

export function matchesTarget(
  current: readonly number[],
  target: readonly number[],
  eps = WIN_EPSILON,
): boolean {
  if (current.length !== target.length) return false;
  let maxDiff = 0;
  for (let i = 0; i < current.length; i++) {
    maxDiff = Math.max(maxDiff, Math.abs(current[i] - target[i]));
  }
  return maxDiff < eps;
}
