import { GATES } from '../quantum/gates';
import { applyCNOT, applyGate1, type QState } from '../quantum/state';

export type QubitCount = 1 | 2 | 3;

export type Op =
  | { kind: 'X' | 'H' | 'Z' | 'Y'; coin: number }
  | { kind: 'CNOT'; control: number; target: number };

export interface Challenge {
  level: QubitCount;
  target: number[];
  key: string;
  solution: Op[];
  depth: number;
}

export function applyOp(s: QState, op: Op): QState {
  return op.kind === 'CNOT'
    ? applyCNOT(s, op.control, op.target)
    : applyGate1(s, GATES[op.kind], op.coin);
}

export const COIN_NAMES = ['A', 'B', 'C'];

const ACTION_NAMES: Record<string, string> = {
  X: 'FLIP',
  H: 'MIX',
  Z: 'TURN',
  Y: 'TWIST',
  CNOT: 'LINK',
};

export const ACTION_DEFS = [
  { name: 'FLIP', kind: 'X' },
  { name: 'MIX', kind: 'H' },
  { name: 'TURN', kind: 'Z' },
  { name: 'TWIST', kind: 'Y' },
  { name: 'LINK', kind: 'CNOT' },
] as const;

export const LEVEL_ACTIONS: Record<QubitCount, readonly string[]> = {
  1: ['FLIP', 'MIX'],
  2: ['FLIP', 'MIX', 'TURN', 'TWIST', 'LINK'],
  3: ['FLIP', 'MIX', 'TURN', 'TWIST', 'LINK'],
};

export function opLabel(op: Op): string {
  if (op.kind === 'CNOT') {
    return `${ACTION_NAMES.CNOT} ${COIN_NAMES[op.control]}\u2192${COIN_NAMES[op.target]}`;
  }
  return `${ACTION_NAMES[op.kind]} \u00b7 ${COIN_NAMES[op.coin]}`;
}

export function opsForLevel(level: QubitCount): Op[] {
  const kinds: Array<'X' | 'H' | 'Z' | 'Y'> = level === 1 ? ['X', 'H'] : ['X', 'H', 'Z', 'Y'];
  const ops: Op[] = [];
  for (let coin = 0; coin < level; coin++) {
    for (const kind of kinds) ops.push({ kind, coin });
  }
  for (let control = 0; control < level; control++) {
    for (let target = 0; target < level; target++) {
      if (control !== target) ops.push({ kind: 'CNOT', control, target });
    }
  }
  return ops;
}
