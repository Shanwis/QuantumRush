import { sfx } from '../audio/synth';
import type { Bests } from '../game/storage';
import { LEVEL_LABELS, PLAY_LEVELS, type QubitCount } from '../game/types';

export interface MenuScreenProps {
  bests: Bests;
  onPlay: (level: QubitCount) => void;
  onTutorial: () => void;
}

export function MenuScreen({ bests, onPlay, onTutorial }: MenuScreenProps) {
  return (
    <div className="menu flex flex-col items-center gap-6 py-8">
      <h1 className="menu__title pixel">QUBIT RUSH</h1>
      <p className="menu__tag">THE QUANTUM COIN GAME</p>
      <div className="menu__coins" aria-hidden="true">
        <span className="menu__coin">?</span>
        <span className="menu__coin menu__coin--alt">?</span>
        <span className="menu__coin">?</span>
      </div>
      <div className="flex w-full max-w-md flex-col items-stretch gap-4">
        {PLAY_LEVELS.map((level) => (
          <button
            key={level}
            className="btn btn--wide btn--amber"
            onClick={() => {
              onPlay(level);
              sfx("click");
            }}
          >
            {LEVEL_LABELS[level]}
          </button>
        ))}
        <button 
          className="btn btn--wide btn--ghost" 
          onClick={onTutorial}
        >
          HOW TO PLAY
        </button>
      </div>
      <section className="panel w-full max-w-md">
        <h2 className="panel__title">HIGH SCORES</h2>
        <dl className="menu__scores">
          {PLAY_LEVELS.map((level) => (
            <div key={level}>
              <dt>{LEVEL_LABELS[level]}</dt>
              <dd>{bests[level] ?? '---'}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
