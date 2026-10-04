import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { sfx, unlockAudio } from '../audio/synth';
import {
  COIN_NAMES,
  type Op,
  type QubitCount,
  ACTION_DEFS,
  LEVEL_ACTIONS,
  applyOp,
} from '../game/types';
import {
  createZeroState,
  coinMarginal,
  probabilities,
  type QState,
} from '../quantum/state';
import { sampleOutcome, sampleShots } from '../quantum/sampler';
import { createRng } from '../quantum/rng';
import { matchesTarget } from '../game/win';
import { Coin } from './components/Coin';
import { TargetPanel } from './components/TargetPanel';
import { ShotHistogram } from './components/ShotHistogram';
import { HistoryList } from './components/HistoryList';

interface TutorialStep {
  id: number;
  badge: string;
  title: string;
  level: QubitCount;
  target: number[];
  initialInstruction: string;
  matchedInstruction: string;
  measuredInstruction: string;
  quantumNote: string;
  suggestedOp?: 'FLIP' | 'MIX' | 'TURN' | 'TWIST' | 'LINK';
  actions?: Array<'FLIP' | 'MIX' | 'TURN' | 'TWIST' | 'LINK'>;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    badge: 'STEP 1 OF 5',
    title: 'THE COINS & BIT FLIP (FLIP)',
    level: 1,
    actions: ['FLIP', 'MIX'],
    target: [0, 1], // Tails: 100%
    initialInstruction:
      'Welcome to Qubit Rush! Each coin is a quantum coin (qubit). Heads is 0 (|0⟩) and Tails is 1 (|1⟩). Coin A starts on HEADS. Click FLIP to turn it to TAILS, then click MEASURE.',
    matchedInstruction:
      'Great! Coin A is now on TAILS. Now click the flashing MEASURE button to sample 1000 shots and verify your state.',
    measuredInstruction:
      'Target reached! Notice that all 1000 shots landed on TAILS. Click NEXT STEP to learn about Superposition.',
    quantumNote: 'Quantum: X gate, the bit flip.',
    suggestedOp: 'FLIP',
  },
  {
    id: 2,
    badge: 'STEP 2 OF 5',
    title: 'SUPERPOSITION (MIX)',
    level: 1,
    actions: ['FLIP', 'MIX'],
    target: [0.5, 0.5], // 50% H, 50% T
    initialInstruction:
      'A normal coin can only be Heads or Tails. A quantum coin can be both! Click MIX to shake Coin A into an unsettled 50/50 state.',
    matchedInstruction:
      'Look at Coin A flickering! It holds Heads and Tails simultaneously — that is quantum superposition. Now click MEASURE to sample 1000 shots.',
    measuredInstruction:
      'Superposition verified! Notice how the counts wobble around ~500 Heads / ~500 Tails. That wobble is real quantum sampling noise. Click NEXT STEP.',
    quantumNote: 'Quantum: Hadamard (H) gate — makes and erases superposition.',
    suggestedOp: 'MIX',
  },
  {
    id: 3,
    badge: 'STEP 3 OF 5',
    title: 'QUANTUM INTERFERENCE (TURN)',
    level: 1,
    actions: ['FLIP', 'MIX', 'TURN'],
    target: [0, 1], // Tails: 100%
    initialInstruction:
      'Quantum states have a hidden phase sign. TURN flips this sign (Z gate). Let’s see quantum interference in action:\n1. Click MIX (coin flickers)\n2. Click TURN (phase flips)\n3. Click MIX again (watch it settle on TAILS!)',
    matchedInstruction:
      'Interference magic! The two paths to Heads cancelled out (destructive interference), leaving 100% TAILS! Now click MEASURE.',
    measuredInstruction:
      'Perfect interference! You proved that quantum coins have hidden phase signs. Click NEXT STEP.',
    quantumNote: 'Quantum: Z gate, the phase flip — the source of interference.',
    suggestedOp: 'TURN',
  },
  {
    id: 4,
    badge: 'STEP 4 OF 5',
    title: 'ENTANGLEMENT (LINK)',
    level: 2,
    target: [0.5, 0, 0, 0.5], // HH: 50%, TT: 50%
    initialInstruction:
      'Now we have two coins (A and B). Let’s link them together:\n1. Click MIX on Coin A\n2. Click LINK (the CNOT gate)\n3. Click Coin A (control), then Coin B (target)',
    matchedInstruction:
      'The coins are now entangled! Coin B flips only when Coin A is Tails. Notice how HT and TH are 0%. Click MEASURE!',
    measuredInstruction:
      'Entanglement confirmed! The two coins lock together and always land on the same face (HH or TT). Click NEXT STEP.',
    quantumNote:
      'Quantum: CNOT (controlled-NOT) gate — the standard way to entangle qubits. Direction matters: LINK A→B is not the same as LINK B→A.',
    suggestedOp: 'LINK',
  },
  {
    id: 5,
    badge: 'STEP 5 OF 5',
    title: 'TWIST & TRAINING COMPLETE',
    level: 2,
    target: [0, 0.5, 0.5, 0], // HT: 50%, TH: 50%
    initialInstruction:
      'TWIST combines a FLIP and TURN in one move (Y gate). Try reaching this target:\n1. Click MIX on Coin A\n2. Click LINK: Coin A → Coin B\n3. Click FLIP on Coin B\n4. Click MEASURE!',
    matchedInstruction:
      'Target reached! Press MEASURE to verify the 50% HT / 50% TH distribution.',
    measuredInstruction:
      'Training complete! You have learned all quantum operations: FLIP (X), MIX (H), TURN (Z), TWIST (Y), and LINK (CNOT). Ready to set high scores?',
    quantumNote:
      'Quantum: Y gate. In every challenge, manipulate the coins until their measured behavior matches the target, then press MEASURE. Any action sequence that gets there is a valid solution.',
    suggestedOp: 'TWIST',
  },
];

const DESCRIPTIONS: Record<string, string> = {
  FLIP: 'Flip the coin.',
  MIX: 'Mix the coin between its two sides.',
  TURN: "Turn the coin's quantum state.",
  TWIST: "Twist the coin's quantum state.",
  LINK: 'Let one coin control another.',
};

export interface TutorialScreenProps {
  onBack: () => void;
  onPlayLevel?: (level: QubitCount) => void;
}

export function TutorialScreen({ onBack, onPlayLevel }: TutorialScreenProps) {
  const [tab, setTab] = useState<'interactive' | 'manual'>('interactive');
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = TUTORIAL_STEPS[stepIndex];

  // Step state
  const [state, setState] = useState<QState>(() => createZeroState(currentStep.level));
  const [history, setHistory] = useState<Array<{ op: Op; state: QState }>>([]);
  const [shots, setShots] = useState<number[] | null>(null);
  const [measureRun, setMeasureRun] = useState(0);
  const [sel, setSel] = useState(0);
  const [linkArmed, setLinkArmed] = useState(false);
  const [linkCtl, setLinkCtl] = useState<number | null>(null);
  const [settle, setSettle] = useState<('H' | 'T')[] | null>(null);
  const [flipKeys, setFlipKeys] = useState<number[]>([0, 0, 0]);

  const rng = useMemo(() => createRng(42), []);

  const resetStep = (stepIdx: number) => {
    const s = TUTORIAL_STEPS[stepIdx];
    setState(createZeroState(s.level));
    setHistory([]);
    setShots(null);
    setSel(0);
    setLinkArmed(false);
    setLinkCtl(null);
    setSettle(null);
    setFlipKeys([0, 0, 0]);
  };

  const goToStep = (idx: number) => {
    sfx('click');
    setStepIndex(idx);
    resetStep(idx);
  };

  const nextStep = () => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      goToStep(stepIndex + 1);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      goToStep(stepIndex - 1);
    }
  };

  const currentProbs = probabilities(state);
  const isMatched = matchesTarget(currentProbs, currentStep.target);
  const hasMeasured = shots !== null;

  const apply = (op: Op) => {
    unlockAudio();
    if (op.kind === 'CNOT') sfx('link');
    else if (op.kind === 'H') sfx('mix');
    else if (op.kind === 'X') sfx('flip');
    else if (op.kind === 'Z') sfx('turn');
    else sfx('twist');

    const nextState = applyOp(state, op);
    setHistory((h) => [...h, { op, state }]);
    setState(nextState);
    setShots(null);
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

  const onScreenPress = (event: MouseEvent<HTMLDivElement>) => {
    if (linkCtl === null) return;
    const target = event.target as HTMLElement;
    if (target.closest('.coin')) return;
    setLinkCtl(null);
    sfx('click');
  };

  const onAction = (kind: 'X' | 'H' | 'Z' | 'Y') => apply({ kind, coin: sel });

  const onLinkToggle = () => {
    sfx('click');
    setLinkArmed((armed) => !armed);
    setLinkCtl(null);
  };

  const onUndo = () => {
    if (history.length === 0) return;
    sfx('click');
    const prev = history[history.length - 1];
    setState(prev.state);
    setHistory((h) => h.slice(0, -1));
    setShots(null);
  };

  const onReset = () => {
    sfx('click');
    resetStep(stepIndex);
  };

  const onMeasure = () => {
    unlockAudio();
    sfx(isMatched ? 'win' : 'measure');
    const sampledShots = sampleShots(currentProbs, 1000, rng);
    setShots(sampledShots);
    setMeasureRun((r) => r + 1);

    const outcome = sampleOutcome(currentProbs, rng);
    const faces: ('H' | 'T')[] = [];
    for (let coin = 0; coin < currentStep.level; coin++) {
      const bit = currentStep.level - 1 - coin;
      faces.push((outcome >> bit) & 1 ? 'T' : 'H');
    }
    setSettle(faces);
    setTimeout(() => setSettle(null), 900);
  };

  useEffect(() => {
    if (shots === null) setSettle(null);
  }, [shots]);

  const level = currentStep.level;
  const allowed = currentStep.actions ?? LEVEL_ACTIONS[level];
  const defs = ACTION_DEFS.filter((d) => allowed.includes(d.name));

  // Determine current guidance instruction
  let instructionText = currentStep.initialInstruction;
  if (hasMeasured && isMatched) {
    instructionText = currentStep.measuredInstruction;
  } else if (isMatched) {
    instructionText = currentStep.matchedInstruction;
  }

  return (
    <div className="tutorial flex flex-col gap-4">
      {/* Header */}
      <header className="hud">
        <div className="hud__stat">
          <span className="hud__label">TRAINING</span>
          <span className="hud__value">HOW TO PLAY</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`btn ${tab === 'interactive' ? 'btn--amber' : 'btn--ghost'}`}
            onClick={() => {
              sfx('click');
              setTab('interactive');
            }}
          >
            PRACTICE
          </button>
          <button
            className={`btn ${tab === 'manual' ? 'btn--amber' : 'btn--ghost'}`}
            onClick={() => {
              sfx('click');
              setTab('manual');
            }}
          >
            MANUAL
          </button>
          <button className="btn btn--ghost" onClick={onBack}>
            BACK
          </button>
        </div>
      </header>

      {tab === 'manual' ? (
        /* Full Reference Manual */
        <div className="flex flex-col gap-4">
          <section className="panel">
            <h2 className="panel__title">THE LOOP</h2>
            <p className="tut-text">
              Every challenge shows a TARGET: bars with the wanted share of outcomes. Work the
              coins until measuring them matches the target, then press MEASURE. Any action
              sequence that gets there is a valid solution.
            </p>
          </section>

          <section className="panel">
            <h2 className="panel__title">THE COINS</h2>
            <p className="tut-text">
              Each coin is a quantum coin. In quantum computing it is called a qubit. Heads is 0,
              Tails is 1 (in quantum notation: |0⟩ and |1⟩).
            </p>
            <p className="tut-text">
              A settled coin shows one certain face. A flickering coin is unsettled: it holds
              Heads and Tails possibilities at once. That is quantum superposition.
            </p>
          </section>

          <section className="panel">
            <h2 className="panel__title">ACTIONS</h2>
            <div className="tut-row">
              <span className="tut-name">FLIP</span>
              <span className="tut-text">
                Turns a settled coin over: Heads becomes Tails.
                <br />
                <span className="tut-quantum">Quantum: X gate, the bit flip.</span>
              </span>
            </div>
            <div className="tut-row">
              <span className="tut-name">MIX</span>
              <span className="tut-text">
                Shakes a settled coin into the unsettled 50/50 flicker, or shakes a flickering
                coin back to certainty.
                <br />
                <span className="tut-quantum">
                  Quantum: Hadamard (H) gate — makes and erases superposition.
                </span>
              </span>
            </div>
            <div className="tut-row">
              <span className="tut-name">TURN</span>
              <span className="tut-text">
                Nothing looks different right away. It flips a hidden sign that only shows up
                later. Try MIX, TURN, MIX: the coin settles on Tails.
                <br />
                <span className="tut-quantum">
                  Quantum: Z gate, the phase flip — the source of interference.
                </span>
              </span>
            </div>
            <div className="tut-row">
              <span className="tut-name">TWIST</span>
              <span className="tut-text">
                FLIP and TURN in one move: flips the coin and its hidden sign.
                <br />
                <span className="tut-quantum">Quantum: Y gate.</span>
              </span>
            </div>
            <div className="tut-row">
              <span className="tut-name">LINK</span>
              <span className="tut-text">
                One coin controls another. Pick the control coin, then the target. The target
                flips only when the control is Tails. Direction matters: LINK A&rarr;B is not the
                same as LINK B&rarr;A. Try MIX on coin A, then LINK A&rarr;B: the coins lock
                together and always land the same way — that is entanglement.
                <br />
                <span className="tut-quantum">
                  Quantum: CNOT (controlled-NOT) gate — the standard way to entangle qubits.
                </span>
              </span>
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">MEASUREMENT</h2>
            <p className="tut-text">
              MEASURE runs 1000 shots and draws the histogram. Counts wobble between runs — that
              is real sampling noise. Winning never depends on the wobble: the game checks the
              exact underlying probabilities behind the coins.
            </p>
            <p className="tut-text tut-quantum">
              Quantum: measuring draws one outcome at random, with odds set by the state. The
              histogram estimates those odds.
            </p>
          </section>

          <section className="panel">
            <h2 className="panel__title">WINNING AND SCORES</h2>
            <p className="tut-text">
              Match the target distribution and press MEASURE to win. Fewer moves and faster
              times score higher. UNDO rewinds one move, RESET restarts the same challenge, and
              HINT reveals solution steps one at a time.
            </p>
          </section>
        </div>
      ) : (
        /* Interactive Guided Practice */
        <div className="flex flex-col gap-4" onClick={onScreenPress}>
          {/* Interactive Tutorial Guidance Box */}
          <section className={`tut-box ${isMatched ? 'tut-box--success' : ''}`}>
            <div className="tut-box__header">
              <div className="tut-box__badge">
                <span className="tut-box__tag">{currentStep.badge}</span>
                <span>{currentStep.title}</span>
              </div>
              <div className="tut-step-dots" aria-label="Tutorial step progress">
                {TUTORIAL_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    className={`tut-step-dot ${
                      idx === stepIndex
                        ? 'tut-step-dot--active'
                        : idx < stepIndex
                          ? 'tut-step-dot--complete'
                          : ''
                    }`}
                    onClick={() => goToStep(idx)}
                    title={s.title}
                    aria-label={`Step ${s.id}`}
                  />
                ))}
              </div>
            </div>

            <div className="tut-box__body">
              {instructionText.split('\n').map((line, i) => (
                <p key={i} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>

            <div className="tut-box__quantum">
              💡 {currentStep.quantumNote}
            </div>

            <div className="tut-box__actions">
              <div className="flex gap-2">
                <button
                  className="btn btn--ghost"
                  disabled={stepIndex === 0}
                  onClick={prevStep}
                >
                  PREV
                </button>
                <button className="btn btn--ghost" onClick={onReset}>
                  RETRY
                </button>
              </div>

              <div className="flex gap-2">
                {stepIndex === TUTORIAL_STEPS.length - 1 && isMatched && hasMeasured ? (
                  <button
                    className="btn btn--amber"
                    onClick={() => {
                      if (onPlayLevel) onPlayLevel(1);
                      else onBack();
                    }}
                  >
                    PLAY LEVEL 1
                  </button>
                ) : (
                  <button
                    className={`btn ${isMatched ? 'btn--amber btn--pulse' : 'btn--ghost'}`}
                    disabled={stepIndex >= TUTORIAL_STEPS.length - 1}
                    onClick={nextStep}
                  >
                    NEXT STEP &rarr;
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Game Playfield */}
          <div className="grid gap-4 md:grid-cols-2">
            <section className="panel">
              <h2 className="panel__title">TARGET</h2>
              <TargetPanel probs={currentStep.target} n={level} />
            </section>
            <section className="panel">
              <h2 className="panel__title">COINS</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {COIN_NAMES.slice(0, level).map((name, i) => (
                  <Coin
                    key={name}
                    index={i}
                    marginal={coinMarginal(state, i)}
                    settleFace={settle ? settle[i] : null}
                    selected={sel === i && !linkArmed}
                    linkRole={linkCtl === i ? 'control' : null}
                    pickTarget={linkArmed && linkCtl !== null && linkCtl !== i}
                    flipKey={flipKeys[i]}
                    onClick={() => onCoinClick(i)}
                  />
                ))}
              </div>
              <p className="hint hint--center">
                {linkArmed
                  ? linkCtl === null
                    ? 'PICK CONTROL COIN'
                    : 'PICK TARGET COIN'
                  : level === 1
                    ? 'CLICK AN ACTION TO MANIPULATE THE COIN'
                    : 'CLICK A COIN TO SELECT IT'}
              </p>
            </section>
          </div>

          {/* Shot Histogram */}
          <section className="panel">
            <h2 className="panel__title">SHOTS</h2>
            <ShotHistogram shots={shots} n={level} run={measureRun} />
          </section>

          {/* Action Toolbar */}
          <section className="panel">
            <h2 className="panel__title">ACTIONS</h2>
            <div className="toolbar">
              {defs.map((d) => (
                <span className="tool" key={d.name}>
                  {d.kind === 'CNOT' ? (
                    <button
                      className={
                        linkArmed
                          ? 'btn btn--amber'
                          : currentStep.suggestedOp === 'LINK'
                            ? 'btn btn--amber btn--pulse'
                            : 'btn'
                      }
                      aria-pressed={linkArmed}
                      onClick={onLinkToggle}
                    >
                      {d.name}
                    </button>
                  ) : (
                    <button
                      className={
                        currentStep.suggestedOp === d.name && !isMatched
                          ? 'btn btn--amber btn--pulse'
                          : 'btn'
                      }
                      disabled={linkArmed}
                      onClick={() => onAction(d.kind)}
                    >
                      {d.name}
                    </button>
                  )}
                  <span className="tool__desc">{DESCRIPTIONS[d.name]}</span>
                </span>
              ))}
              <span className="toolbar__spacer" />
              <button
                className="btn btn--ghost"
                disabled={history.length === 0}
                onClick={onUndo}
              >
                UNDO
              </button>
              <button className="btn btn--ghost" onClick={onReset}>
                RESET
              </button>
              <button
                className={`btn btn--measure ${isMatched && !hasMeasured ? 'btn--pulse' : ''}`}
                onClick={onMeasure}
              >
                MEASURE
              </button>
            </div>
          </section>

          {/* History */}
          <HistoryList ops={history.map((h) => h.op)} />
        </div>
      )}
    </div>
  );
}
