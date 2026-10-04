import { createZeroState, probabilities, type QState } from '../quantum/state';
import { type Op, type QubitCount, applyOp, opsForLevel } from './types';

export interface TargetInfo {
  key: string;
  probs: number[];
  depth: number;
  solution: Op[];
}

interface Node {
  state: QState;
  solution: Op[];
  depth: number;
}

export function distributionKey(probs: readonly number[]): string {
  return probs.map((p) => p.toFixed(6)).join(',');
}

function stateSignature(s: QState): string {
  let ref: [number, number] | null = null;
  for (const a of s.amps) {
    if (Math.hypot(a[0], a[1]) > 1e-9) {
      ref = a;
      break;
    }
  }
  if (ref === null) return s.amps.map(() => '0.000000,0.000000').join(';');
  const mag = Math.hypot(ref[0], ref[1]);
  const rot: [number, number] = [ref[0] / mag, -ref[1] / mag];
  return s.amps
    .map((a) => {
      const re = a[0] * rot[0] - a[1] * rot[1];
      const im = a[0] * rot[1] + a[1] * rot[0];
      return `${re.toFixed(6)},${im.toFixed(6)}`;
    })
    .join(';');
}

export function buildCatalog(n: QubitCount, maxDepth = 10): Map<string, TargetInfo> {
  const ops = opsForLevel(n);
  const catalog = new Map<string, TargetInfo>();
  const visited = new Set<string>();
  const start: Node = { state: createZeroState(n), solution: [], depth: 0 };
  visited.add(stateSignature(start.state));
  let frontier: Node[] = [start];
  while (frontier.length > 0) {
    const next: Node[] = [];
    for (const node of frontier) {
      const probs = probabilities(node.state);
      const key = distributionKey(probs);
      if (!catalog.has(key)) {
        catalog.set(key, { key, probs, depth: node.depth, solution: node.solution });
      }
      if (node.depth >= maxDepth) continue;
      for (const op of ops) {
        const state = applyOp(node.state, op);
        const sig = stateSignature(state);
        if (visited.has(sig)) continue;
        visited.add(sig);
        next.push({ state, solution: [...node.solution, op], depth: node.depth + 1 });
      }
    }
    frontier = next;
  }
  return catalog;
}
