import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../quantum/rng';
import { generateChallenge } from './challenge';
import { reduce, startSession, type GameEvent, SHOT_COUNT } from './reducer';
import { score } from './scoring';
import type { QubitCount } from './types';

function bellChallenge() {
  const challenge = generateChallenge(2, mulberry32(1), []);
  return challenge;
}

function oneCoinChallenge() {
  const challenge = generateChallenge(1, mulberry32(2), []);
  expect(challenge.target[0]).toBeCloseTo(0.5, 9);
  return challenge;
}

describe('reducer', () => {
  it('starts a session with no moves and zero spent gates', () => {
    const session = startSession(1, oneCoinChallenge(), 1000);
    expect(session.status).toBe('playing');
    expect(session.totalMoves).toBe(0);
    expect(session.shots).toBeNull();
    expect(session.history).toEqual([]);
  });

  it('pops history on undo but never refunds spent gates', () => {
    const challenge = oneCoinChallenge();
    let session = startSession(1, challenge, 1000);
    const before = session.state;
    session = reduce(session, { type: 'APPLY', op: { kind: 'H', coin: 0 } });
    expect(session.history.length).toBe(1);
    expect(session.shots).toBeNull();
    session = reduce(session, { type: 'UNDO' });
    expect(session.history.length).toBe(0);
    expect(session.totalMoves).toBe(1);
    expect(session.state).toBe(before);
  });

  it('clears stale shots whenever the state changes', () => {
    let session = startSession(1, oneCoinChallenge(), 1000);
    session = reduce(session, { type: 'MEASURE', now: 1000, rng: mulberry32(3) });
    expect(session.shots).not.toBeNull();
    session = reduce(session, { type: 'APPLY', op: { kind: 'X', coin: 0 } });
    expect(session.shots).toBeNull();
  });

  it('clears operations on reset but keeps the timer and spent-gate tally', () => {
    const challenge = oneCoinChallenge();
    let session = startSession(1, challenge, 1000);
    session = reduce(session, { type: 'APPLY', op: { kind: 'H', coin: 0 } });
    session = reduce(session, { type: 'RESET' });
    expect(session.challenge.key).toBe(challenge.key);
    expect(session.totalMoves).toBe(1);
    expect(session.startedAt).toBe(1000);
    expect(session.history).toEqual([]);
  });

  it('never refunds score across undo and reset', () => {
    const challenge = oneCoinChallenge();
    let session = startSession(1, challenge, 1000);
    let prev = score(session.totalMoves, 0, 1);
    const step = (event: GameEvent) => {
      session = reduce(session, event);
      const derived = score(session.totalMoves, 0, 1);
      expect(derived).toBeLessThanOrEqual(prev);
      prev = derived;
    };
    step({ type: 'APPLY', op: { kind: 'X', coin: 0 } });
    step({ type: 'APPLY', op: { kind: 'X', coin: 0 } });
    step({ type: 'APPLY', op: { kind: 'X', coin: 0 } });
    step({ type: 'UNDO' });
    step({ type: 'RESET' });
    expect(session.totalMoves).toBe(3);
    step({ type: 'APPLY', op: { kind: 'H', coin: 0 } });
    step({ type: 'MEASURE', now: 6000, rng: mulberry32(11) });
    expect(session.status).toBe('won');
    expect(session.score).toBe(score(4, 5, 1));
  });

  it('samples 1000 shots without mutating the state', () => {
    let session = startSession(1, oneCoinChallenge(), 1000);
    session = reduce(session, { type: 'APPLY', op: { kind: 'X', coin: 0 } });
    const stateBefore = session.state;
    session = reduce(session, { type: 'MEASURE', now: 2000, rng: mulberry32(4) });
    expect(session.state).toBe(stateBefore);
    const total = session.shots!.reduce((a, b) => a + b, 0);
    expect(total).toBe(SHOT_COUNT);
    expect(session.status).toBe('playing');
  });

  it('wins only on exact distribution match, never on shot noise', () => {
    let session = startSession(1, oneCoinChallenge(), 1000);
    const rng = mulberry32(5);
    for (let i = 0; i < 5; i++) {
      session = reduce(session, { type: 'MEASURE', now: 2000 + i, rng });
      expect(session.status).toBe('playing');
    }
    session = reduce(session, { type: 'APPLY', op: { kind: 'H', coin: 0 } });
    session = reduce(session, { type: 'MEASURE', now: 5000, rng });
    expect(session.status).toBe('won');
    expect(session.endedAt).toBe(5000);
    expect(session.score).toBe(score(1, 4, 1));
  });

  it('locks the session after a win', () => {
    let session = startSession(1, oneCoinChallenge(), 1000);
    session = reduce(session, { type: 'APPLY', op: { kind: 'H', coin: 0 } });
    session = reduce(session, { type: 'MEASURE', now: 3000, rng: mulberry32(6) });
    expect(session.status).toBe('won');
    const frozen = session;
    const events: GameEvent[] = [
      { type: 'APPLY', op: { kind: 'X', coin: 0 } },
      { type: 'UNDO' },
      { type: 'MEASURE', now: 4000, rng: mulberry32(7) },
    ];
    for (const event of events) {
      expect(reduce(frozen, event)).toBe(frozen);
    }
  });

  it('solves the Bell challenge through LINK', () => {
    const level: QubitCount = 2;
    const challenge = bellChallenge();
    let session = startSession(level, challenge, 1000);
    for (const op of challenge.solution) {
      session = reduce(session, { type: 'APPLY', op });
    }
    session = reduce(session, { type: 'MEASURE', now: 4000, rng: mulberry32(8) });
    expect(session.status).toBe('won');
  });
});
