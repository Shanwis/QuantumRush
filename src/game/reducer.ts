import { type Rng } from '../quantum/rng';
import { sampleShots } from '../quantum/sampler';
import { createZeroState, probabilities, type QState } from '../quantum/state';
import { score } from './scoring';
import { type Challenge, type Op, type QubitCount, applyOp } from './types';
import { matchesTarget } from './win';

export const SHOT_COUNT = 1000;

export interface HistoryEntry {
  op: Op;
  state: QState;
}

export interface GameSession {
  level: QubitCount;
  challenge: Challenge;
  state: QState;
  history: HistoryEntry[];
  moves: number;
  startedAt: number;
  endedAt: number | null;
  shots: number[] | null;
  status: 'playing' | 'won';
  score: number | null;
}

export type GameEvent =
  | { type: 'START'; level: QubitCount; challenge: Challenge; now: number }
  | { type: 'APPLY'; op: Op }
  | { type: 'UNDO' }
  | { type: 'RESET'; now: number }
  | { type: 'MEASURE'; now: number; rng: Rng };

export function startSession(
  level: QubitCount,
  challenge: Challenge,
  now: number,
): GameSession {
  return {
    level,
    challenge,
    state: createZeroState(level),
    history: [],
    moves: 0,
    startedAt: now,
    endedAt: null,
    shots: null,
    status: 'playing',
    score: null,
  };
}

export function reduce(session: GameSession, event: GameEvent): GameSession {
  switch (event.type) {
    case 'START':
      return startSession(event.level, event.challenge, event.now);
    case 'APPLY': {
      if (session.status !== 'playing') return session;
      const state = applyOp(session.state, event.op);
      return {
        ...session,
        state,
        history: [...session.history, { op: event.op, state: session.state }],
        moves: session.moves + 1,
        shots: null,
      };
    }
    case 'UNDO': {
      if (session.status !== 'playing' || session.history.length === 0) return session;
      const prev = session.history[session.history.length - 1];
      return {
        ...session,
        state: prev.state,
        history: session.history.slice(0, -1),
        moves: session.moves - 1,
        shots: null,
      };
    }
    case 'RESET':
      return startSession(session.level, session.challenge, event.now);
    case 'MEASURE': {
      if (session.status !== 'playing') return session;
      const probs = probabilities(session.state);
      const shots = sampleShots(probs, SHOT_COUNT, event.rng);
      const won = matchesTarget(probs, session.challenge.target);
      if (!won) return { ...session, shots };
      const seconds = Math.floor((event.now - session.startedAt) / 1000);
      return {
        ...session,
        shots,
        status: 'won',
        endedAt: event.now,
        score: score(session.moves, seconds, session.level),
      };
    }
  }
}
