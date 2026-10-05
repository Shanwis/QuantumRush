import { useState } from 'react';
import { sfx } from '../audio/synth';
import { TUTORIAL_STEPS, challengeForStep } from '../game/tutorialSteps';
import {
  ACTION_DEFS,
  ACTION_DESCRIPTIONS,
  COIN_NAMES,
  type QubitCount,
} from '../game/types';
import { coinMarginal, probabilities } from '../quantum/state';
import { matchesTarget } from '../game/win';
import { useCoinPlay } from './useCoinPlay';
import { Coin } from './components/Coin';
import { HistoryList } from './components/HistoryList';
import { ShotHistogram } from './components/ShotHistogram';
import { TargetPanel } from './components/TargetPanel';

export interface TutorialScreenProps {
  onBack: () => void;
  onPlayLevel?: (level: QubitCount) => void;
}

export function TutorialScreen({ onBack, onPlayLevel }: TutorialScreenProps) {
  const [tab, setTab] = useState<'interactive' | 'manual'>('interactive');
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = TUTORIAL_STEPS[stepIndex];

  const play = useCoinPlay(currentStep.level, () => challengeForStep(currentStep));
  const { session } = play;

  const goToStep = (idx: number) => {
    sfx('click');
    setStepIndex(idx);
    const step = TUTORIAL_STEPS[idx];
    play.start(step.level, challengeForStep(step));
  };

  const currentProbs = probabilities(session.state);
  const isMatched = matchesTarget(currentProbs, currentStep.target);
  const hasMeasured = session.shots !== null;
  const complete = isMatched && hasMeasured;

  let instructionText = currentStep.initialInstruction;
  if (complete) {
    instructionText = currentStep.measuredInstruction;
  } else if (isMatched) {
    instructionText = currentStep.matchedInstruction;
  }

  const defs = ACTION_DEFS.filter((d) => currentStep.actions.includes(d.name));

  return (
    <div className="tutorial flex flex-col gap-4">
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
                FLIP and TURN in one move: flips the coin and its hidden sign. Try MIX, TWIST,
                MIX: the coin settles on Tails too.
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
        <div className="flex flex-col gap-4" onClick={play.onScreenPress}>
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

            <div className="tut-box__quantum">💡 {currentStep.quantumNote}</div>

            <div className="tut-box__actions">
              <div className="flex gap-2">
                <button
                  className="btn btn--ghost"
                  disabled={stepIndex === 0}
                  onClick={() => goToStep(stepIndex - 1)}
                >
                  PREV
                </button>
                <button className="btn btn--ghost" onClick={play.onReset}>
                  RETRY
                </button>
              </div>

              <div className="flex gap-2">
                {stepIndex === TUTORIAL_STEPS.length - 1 ? (
                  complete ? (
                    <button
                      className="btn btn--amber"
                      onClick={() => {
                        if (onPlayLevel) onPlayLevel(1);
                        else onBack();
                      }}
                    >
                      PLAY LEVEL 1
                    </button>
                  ) : null
                ) : (
                  <button
                    className={`btn ${complete ? 'btn--amber btn--pulse' : 'btn--ghost'}`}
                    disabled={!complete}
                    onClick={() => goToStep(stepIndex + 1)}
                  >
                    NEXT STEP &rarr;
                  </button>
                )}
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="panel">
              <h2 className="panel__title">TARGET</h2>
              <TargetPanel probs={currentStep.target} n={currentStep.level} />
            </section>
            <section className="panel">
              <h2 className="panel__title">COINS</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {COIN_NAMES.slice(0, currentStep.level).map((name, i) => (
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
              <p className="hint hint--center">
                {play.linkArmed
                  ? play.linkCtl === null
                    ? 'PICK CONTROL COIN'
                    : 'PICK TARGET COIN'
                  : currentStep.level === 1
                    ? 'CLICK AN ACTION TO MANIPULATE THE COIN'
                    : 'CLICK A COIN TO SELECT IT'}
              </p>
            </section>
          </div>

          <section className="panel">
            <h2 className="panel__title">SHOTS</h2>
            <ShotHistogram shots={session.shots} n={currentStep.level} run={play.measureRun} />
          </section>

          <section className="panel">
            <h2 className="panel__title">ACTIONS</h2>
            <div className="toolbar">
              {defs.map((d) => (
                <span className="tool" key={d.name}>
                  {d.kind === 'CNOT' ? (
                    <button
                      className={
                        play.linkArmed
                          ? 'btn btn--amber'
                          : currentStep.suggestedOp === 'LINK'
                            ? 'btn btn--amber btn--pulse'
                            : 'btn'
                      }
                      aria-pressed={play.linkArmed}
                      onClick={play.onLinkToggle}
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
                      disabled={play.linkArmed}
                      onClick={() => play.onAction(d.kind)}
                    >
                      {d.name}
                    </button>
                  )}
                  <span className="tool__desc">{ACTION_DESCRIPTIONS[d.name]}</span>
                </span>
              ))}
              <span className="toolbar__spacer" />
              <button
                className="btn btn--ghost"
                disabled={session.history.length === 0}
                onClick={play.onUndo}
              >
                UNDO
              </button>
              <button className="btn btn--ghost" onClick={play.onReset}>
                RESET
              </button>
              <button
                className={`btn btn--measure ${isMatched && !hasMeasured ? 'btn--pulse' : ''}`}
                onClick={play.onMeasure}
              >
                MEASURE
              </button>
            </div>
          </section>

          <HistoryList ops={session.history.map((entry) => entry.op)} />
        </div>
      )}
    </div>
  );
}
