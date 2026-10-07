import { useState } from 'react';
import { sfx } from '../audio/synth';
import { loadTag, sanitizeTag, saveTag } from '../game/leaderboard';
import type { Bests } from '../game/storage';
import { LEVEL_LABELS, PLAY_LEVELS, type QubitCount } from '../game/types';

export interface MenuScreenProps {
  bests: Bests;
  onPlay: (level: QubitCount) => void;
  onTutorial: () => void;
  onLeaderboard: () => void;
}

export function MenuScreen({ bests, onPlay, onTutorial, onLeaderboard }: MenuScreenProps) {
  const [tag, setTag] = useState(loadTag);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const cleanDraft = sanitizeTag(draft);

  const save = () => {
    if (cleanDraft.length === 0) return;
    sfx('click');
    saveTag(cleanDraft);
    setTag(cleanDraft);
    setEditing(false);
  };

  return (
    <div className="menu flex flex-col items-center gap-6 py-8">
      <h1 className="menu__title pixel">QUBIT RUSH</h1>
      <p className="menu__tag">THE QUANTUM COIN GAME</p>
      <div className="menu__coins" aria-hidden="true">
        <span className="menu__coin">?</span>
        <span className="menu__coin menu__coin--alt">?</span>
        <span className="menu__coin">?</span>
      </div>
      <button
        className="btn btn--ghost menu__player"
        onClick={() => {
          sfx('click');
          setDraft(tag);
          setEditing(true);
        }}
      >
        PLAYER: {tag}
      </button>
      {editing ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Edit arcade tag">
          <div className="modal__box">
            <h2 className="modal__title pixel">ARCADE TAG</h2>
            <div className="modal__submit">
              <input
                className="tag-input"
                value={draft}
                maxLength={12}
                aria-label="Arcade tag"
                onChange={(event) => setDraft(sanitizeTag(event.target.value))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') save();
                }}
              />
            </div>
            <div className="modal__actions">
              <button className="btn btn--amber" disabled={cleanDraft.length === 0} onClick={save}>
                SAVE
              </button>
              <button className="btn btn--ghost" onClick={() => setEditing(false)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex w-full max-w-md flex-col items-stretch gap-4">
        <button
          className="btn btn--wide btn--magenta btn--mega"
          onClick={() => {
            onLeaderboard();
            sfx("click");
          }}
        >
          LEADERBOARD
        </button>
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
