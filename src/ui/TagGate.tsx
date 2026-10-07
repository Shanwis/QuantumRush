import { useState } from 'react';
import { sfx, unlockAudio } from '../audio/synth';
import { saveTag, sanitizeTag } from '../game/leaderboard';

export function TagGate({ onDone }: { onDone: () => void }) {
  const [tag, setTag] = useState('');
  const cleanTag = sanitizeTag(tag);

  const start = () => {
    if (cleanTag.length === 0) return;
    unlockAudio();
    sfx('click');
    saveTag(cleanTag);
    onDone();
  };

  return (
    <div className="tag-gate flex flex-col items-center gap-4">
      <h2 className="tag-gate__title pixel">ENTER YOUR ARCADE TAG</h2>
      <p className="hint hint--center">PRINTED ON THE GLOBAL LEADERBOARD</p>
      <input
        className="tag-input tag-input--lg"
        value={tag}
        maxLength={12}
        placeholder="ACE"
        aria-label="Arcade tag"
        onChange={(event) => setTag(sanitizeTag(event.target.value))}
        onKeyDown={(event) => {
          if (event.key === 'Enter') start();
        }}
      />
      <button
        className="btn btn--wide btn--amber btn--mega"
        disabled={cleanTag.length === 0}
        onClick={start}
      >
        START
      </button>
    </div>
  );
}
