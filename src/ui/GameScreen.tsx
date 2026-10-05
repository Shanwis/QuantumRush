import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../audio/synth';
import { generateChallenge, minimalSolution } from '../game/challenge';
import { score } from '../game/scoring';
import { recordScore } from '../game/storage';
import { COIN_NAMES, type QubitCount, opLabel } from '../game/types';
import type { Rng } from '../quantum/rng';
import { coinMarginal } from '../quantum/state';
import { ActionBar } from './components/ActionBar';
import { Coin } from './components/Coin';
import { HistoryList } from './components/HistoryList';
import { ShotHistogram } from './components/ShotHistogram';
import { SuccessModal } from './components/SuccessModal';
import { TargetPanel } from './components/TargetPanel';
import { useCoinPlay } from './useCoinPlay';

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
  const makeChallenge = (rng: Rng) => {
    const challenge = generateChallenge(level, rng, servedRef.current);
    servedRef.current = [...servedRef.current, challenge.key];
    return challenge;
  };

  const [newBest, setNewBest] = useState(false);
  const [now, setNow] = useState(() => performance.now());
  const [hintStep, setHintStep] = useState(0);

  const play = useCoinPlay(level, makeChallenge, (value) => {
    setNewBest(recordScore(level, value));
    onScore(level, value);
  });
  const { session } = play;

  useEffect(() => {
    if (session.status !== 'playing') return;
    const id = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(id);
  }, [session.status]);

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

  const startNext = (fresh: boolean) => {
    setNewBest(false);
    setHintStep(0);
    sfx('click');
    const challenge = fresh ? makeChallenge(play.rng) : session.challenge;
    play.start(level, challenge);
    setNow(performance.now());
  };

  const elapsed = (session.endedAt ?? now) - session.startedAt;
  const liveScore =
    session.score ?? score(session.moves, Math.floor(elapsed / 1000), level);
  const hint = play.linkArmed
    ? play.linkCtl === null
      ? 'PICK CONTROL COIN'
      : 'PICK TARGET COIN'
    : level === 1
      ? 'FLIP OR MIX THE COIN, THEN MEASURE'
      : 'CLICK A COIN TO SELECT IT';

  return (
    <div className="flex flex-col gap-4" onClick={play.onScreenPress}>
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
                settleFace={play.settle ? play.settle[i] : null}
                selected={play.sel === i && !play.linkArmed}
                linkRole={play.linkCtl === i ? 'control' : null}
                pickTarget={play.linkArmed && play.linkCtl !== null && play.linkCtl !== i}
                flipKey={play.flipKeys[i]}
                onClick={() => play.onCoinClick(i)}
              />
            ))}
          </div>
          <p className="hint hint--center">{hint}</p>
        </section>
      </div>

      <section className="panel">
        <h2 className="panel__title">SHOTS</h2>
        <ShotHistogram shots={session.shots} n={level} run={play.measureRun} />
      </section>

      <ActionBar
        level={level}
        linkArmed={play.linkArmed}
        canUndo={session.history.length > 0}
        canHint={hintStep < hintOps.length}
        disabled={session.status !== 'playing'}
        hintText={hintText}
        onAction={play.onAction}
        onLinkToggle={play.onLinkToggle}
        onUndo={play.onUndo}
        onReset={play.onReset}
        onMeasure={play.onMeasure}
        onHint={onHint}
      />

      <HistoryList ops={session.history.map((entry) => entry.op)} />

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
