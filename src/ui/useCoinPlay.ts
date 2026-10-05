import { useEffect, useReducer, useRef, useState, type MouseEvent } from 'react';
import { sfx, unlockAudio } from '../audio/synth';
import { reduce, startSession, type GameSession } from '../game/reducer';
import type { Challenge, Op, QubitCount } from '../game/types';
import { sampleOutcome } from '../quantum/sampler';
import { createRng, seedFromUrl, type Rng } from '../quantum/rng';
import { coinBit, probabilities } from '../quantum/state';

export interface CoinPlayApi {
  session: GameSession;
  rng: Rng;
  sel: number;
  linkArmed: boolean;
  linkCtl: number | null;
  settle: ('H' | 'T')[] | null;
  flipKeys: number[];
  measureRun: number;
  apply: (op: Op) => void;
  onCoinClick: (i: number) => void;
  onAction: (kind: 'X' | 'H' | 'Z' | 'Y') => void;
  onLinkToggle: () => void;
  onUndo: () => void;
  onReset: () => void;
  onMeasure: () => void;
  onScreenPress: (event: MouseEvent<HTMLDivElement>) => void;
  start: (level: QubitCount, challenge: Challenge) => void;
}

export function useCoinPlay(
  level: QubitCount,
  makeChallenge: (rng: Rng) => Challenge,
  onWin?: (score: number) => void,
): CoinPlayApi {
  const [rng] = useState<Rng>(() => createRng(seedFromUrl() ?? Date.now()));
  const [session, dispatch] = useReducer(reduce, level, (lv) =>
    startSession(lv, makeChallenge(rng), performance.now()),
  );

  const [sel, setSel] = useState(0);
  const [linkArmed, setLinkArmed] = useState(false);
  const [linkCtl, setLinkCtl] = useState<number | null>(null);
  const [settle, setSettle] = useState<('H' | 'T')[] | null>(null);
  const [measureRun, setMeasureRun] = useState(0);
  const [flipKeys, setFlipKeys] = useState<number[]>(() => [0, 0, 0]);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  useEffect(() => {
    if (session.shots === null) {
      setSettle(null);
      return;
    }
    const outcome = sampleOutcome(probabilities(session.state), rng);
    const faces: ('H' | 'T')[] = [];
    for (let coin = 0; coin < session.level; coin++) {
      faces.push((outcome >> coinBit(session.level, coin)) & 1 ? 'T' : 'H');
    }
    setSettle(faces);
    const id = window.setTimeout(() => setSettle(null), 900);
    return () => window.clearTimeout(id);
  }, [session.shots]);

  useEffect(() => {
    if (import.meta.env.MODE !== 'production') {
      (window as { __QR_TEST__?: unknown }).__QR_TEST__ = {
        challenge: session.challenge,
        status: session.status,
      };
    }
  }, [session]);

  useEffect(() => {
    if (session.status !== 'won' || wonRef.current) return;
    wonRef.current = true;
    sfx('win');
    if (session.score !== null && onWinRef.current) onWinRef.current(session.score);
  }, [session.status]);

  const apply = (op: Op) => {
    unlockAudio();
    if (op.kind === 'CNOT') sfx('link');
    else if (op.kind === 'H') sfx('mix');
    else if (op.kind === 'X') sfx('flip');
    else if (op.kind === 'Z') sfx('turn');
    else sfx('twist');
    dispatch({ type: 'APPLY', op });
    setFlipKeys((keys) => {
      const next = [...keys];
      if (op.kind === 'CNOT') {
        next[op.control] += 1;
        next[op.target] += 1;
      } else {
        next[op.coin] += 1;
      }
      return next;
    });
  };

  const onCoinClick = (i: number) => {
    unlockAudio();
    if (linkCtl !== null) {
      if (i === linkCtl) return;
      apply({ kind: 'CNOT', control: linkCtl, target: i });
      setLinkCtl(null);
      setLinkArmed(false);
      return;
    }
    sfx('click');
    setSel(i);
    if (linkArmed) setLinkCtl(i);
  };

  const onAction = (kind: 'X' | 'H' | 'Z' | 'Y') => apply({ kind, coin: sel });

  const onLinkToggle = () => {
    sfx('click');
    setLinkArmed((armed) => !armed);
    setLinkCtl(null);
  };

  const onUndo = () => {
    sfx('click');
    dispatch({ type: 'UNDO' });
  };

  const onReset = () => {
    sfx('click');
    setSel(0);
    setLinkArmed(false);
    setLinkCtl(null);
    dispatch({ type: 'RESET' });
  };

  const onMeasure = () => {
    unlockAudio();
    sfx('measure');
    setMeasureRun((run) => run + 1);
    dispatch({ type: 'MEASURE', now: performance.now(), rng });
  };

  const onScreenPress = (event: MouseEvent<HTMLDivElement>) => {
    if (linkCtl === null) return;
    const target = event.target as HTMLElement;
    if (target.closest('.coin')) return;
    setLinkCtl(null);
    sfx('click');
  };

  const start = (nextLevel: QubitCount, challenge: Challenge) => {
    wonRef.current = false;
    setSel(0);
    setLinkArmed(false);
    setLinkCtl(null);
    setSettle(null);
    setFlipKeys([0, 0, 0]);
    dispatch({ type: 'START', level: nextLevel, challenge, now: performance.now() });
  };

  return {
    session,
    rng,
    sel,
    linkArmed,
    linkCtl,
    settle,
    flipKeys,
    measureRun,
    apply,
    onCoinClick,
    onAction,
    onLinkToggle,
    onUndo,
    onReset,
    onMeasure,
    onScreenPress,
    start,
  };
}
