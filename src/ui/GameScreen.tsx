import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { sfx, unlockAudio } from '../audio/synth';
import { generateChallenge, minimalSolution } from '../game/challenge';
import { reduce, startSession, type GameSession } from '../game/reducer';
import { score } from '../game/scoring';
import { recordScore } from '../game/storage';
import { COIN_NAMES, type Op, type QubitCount, opLabel } from '../game/types';
import { sampleOutcome } from '../quantum/sampler';
import { createRng, seedFromUrl, type Rng } from '../quantum/rng';
import { coinBit, coinMarginal, probabilities } from '../quantum/state';
import { ActionBar } from './components/ActionBar';
import { Coin } from './components/Coin';
import { HistoryList } from './components/HistoryList';
import { ShotHistogram } from './components/ShotHistogram';
import { SuccessModal } from './components/SuccessModal';
import { TargetPanel } from './components/TargetPanel';

const LEVEL_TITLES: Record<QubitCount, string> = {
  1: 'ONE COIN',
  2: 'TWO COINS',
  3: 'THREE COINS',
};

function timeText(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export interface GameScreenProps {
  level: QubitCount;
  onExit: () => void;
  onScore: (level: QubitCount, value: number) => void;
}

export function GameScreen({ level, onExit, onScore }: GameScreenProps) {
  const servedRef = useRef<string[]>([]);
  const rngRef = useRef<Rng | null>(null);
  const [session, dispatch] = useReducer(reduce, level, (lv) => {
    const rng = createRng(seedFromUrl() ?? Date.now());
    rngRef.current = rng;
    const challenge = generateChallenge(lv, rng, servedRef.current);
    servedRef.current = [...servedRef.current, challenge.key];
    return startSession(lv, challenge, performance.now());
  });
  const rng = rngRef.current!;

  const [sel, setSel] = useState(0);
  const [linkArmed, setLinkArmed] = useState(false);
  const [linkCtl, setLinkCtl] = useState<number | null>(null);
  const [now, setNow] = useState(() => performance.now());
  const [settle, setSettle] = useState<('H' | 'T')[] | null>(null);
  const [measureRun, setMeasureRun] = useState(0);
  const [flipKeys, setFlipKeys] = useState<number[]>(() => {
    const keys: number[] = [];
    for (let i = 0; i < level; i++) keys.push(0);
    return keys;
  });
  const [newBest, setNewBest] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.MODE !== 'production') {
      (window as { __QR_TEST__?: unknown }).__QR_TEST__ = {
        challenge: session.challenge,
        status: session.status,
      };
    }
  }, [session]);

  useEffect(() => {
    if (session.status !== 'playing') return;
    const id = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(id);
  }, [session.status]);

  useEffect(() => {
    if (session.shots === null) {
      setSettle(null);
      return;
    }
    const probs = probabilities(session.state);
    const outcome = sampleOutcome(probs, rng);
    const faces: ('H' | 'T')[] = [];
    for (let coin = 0; coin < level; coin++) {
      faces.push((outcome >> coinBit(level, coin)) & 1 ? 'T' : 'H');
    }
    setSettle(faces);
    const id = window.setTimeout(() => setSettle(null), 900);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.shots]);

  useEffect(() => {
    if (session.status !== 'won') return;
    sfx('win');
    if (!recordedRef.current && session.score !== null) {
      recordedRef.current = true;
      const best = recordScore(session.level, session.score);
      setNewBest(best);
      onScore(session.level, session.score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    dispatch({ type: 'RESET', now: performance.now() });
  };

  const onMeasure = () => {
    unlockAudio();
    sfx('measure');
    setMeasureRun((run) => run + 1);
    dispatch({ type: 'MEASURE', now: performance.now(), rng });
  };

  const startNext = (fresh: boolean) => {
    recordedRef.current = false;
    setNewBest(false);
    setSettle(null);
    setLinkArmed(false);
    setLinkCtl(null);
    setSel(0);
    setHintStep(0);
    const challenge = fresh
      ? generateChallenge(level, rng, servedRef.current)
      : session.challenge;
    if (fresh) servedRef.current = [...servedRef.current, challenge.key];
    sfx('click');
    dispatch({ type: 'START', level, challenge, now: performance.now() });
    setNow(performance.now());
  };

  const elapsed = (session.endedAt ?? now) - session.startedAt;
  const liveScore =
    session.score ?? score(session.moves, Math.floor(elapsed / 1000), level);
  const hintOps = useMemo(
    () => minimalSolution(level, session.challenge.key),
    [level, session.challenge.key],
  );
  const hintText =
    hintStep > 0 ? `TRY: ${hintOps.slice(0, hintStep).map(opLabel).join(', ')}` : '';
  const onHint = () => {
    sfx('click');
    setHintStep((step) => Math.min(step + 1, hintOps.length));
  };
  const hint = linkArmed
    ? linkCtl === null
      ? 'PICK CONTROL COIN'
      : 'PICK TARGET COIN'
    : level === 1
      ? 'FLIP OR MIX THE COIN, THEN MEASURE'
      : 'CLICK A COIN TO SELECT IT';

  return (
    <div className="flex flex-col gap-4">
      <header className="hud">
        <div className="hud__stat">
          <span className="hud__label">LEVEL</span>
          <span className="hud__value">{LEVEL_TITLES[level]}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__label">TIME</span>
          <span className="hud__value">{timeText(elapsed)}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__label">MOVES</span>
          <span className="hud__value">{session.moves}</span>
        </div>
        <div className="hud__stat">
          <span className="hud__label">SCORE</span>
          <span className="hud__value">{liveScore}</span>
        </div>
        <button className="btn btn--ghost" onClick={onExit}>
          MENU
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel">
          <h2 className="panel__title">TARGET</h2>
          <TargetPanel probs={session.challenge.target} n={level} />
        </section>
        <section className="panel">
          <h2 className="panel__title">COINS</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {COIN_NAMES.slice(0, level).map((name, i) => (
              <Coin
                key={name}
                index={i}
                marginal={coinMarginal(session.state, i)}
                settleFace={settle ? settle[i] : null}
                selected={sel === i && !linkArmed}
                linkRole={linkCtl === i ? 'control' : null}
                flipKey={flipKeys[i]}
                onClick={() => onCoinClick(i)}
              />
            ))}
          </div>
          <p className="hint hint--center">{hint}</p>
        </section>
      </div>

      <section className="panel">
        <h2 className="panel__title">SHOTS</h2>
        <ShotHistogram shots={session.shots} n={level} run={measureRun} />
      </section>

      <ActionBar
        level={level}
        linkArmed={linkArmed}
        canUndo={session.history.length > 0}
        canHint={hintStep < hintOps.length}
        disabled={session.status !== 'playing'}
        hintText={hintText}
        onAction={onAction}
        onLinkToggle={onLinkToggle}
        onUndo={onUndo}
        onReset={onReset}
        onMeasure={onMeasure}
        onHint={onHint}
      />

      <HistoryList ops={session.history.map((entry: { op: Op }) => entry.op)} />

      {session.status === 'won' && session.score !== null ? (
        <SuccessModal
          timeText={timeText(elapsed)}
          moves={session.moves}
          score={session.score}
          newBest={newBest}
          onNext={() => startNext(true)}
          onReplay={() => startNext(false)}
          onMenu={onExit}
        />
      ) : null}
    </div>
  );
}

export type { GameSession };
