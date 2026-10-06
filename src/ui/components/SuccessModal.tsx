import { useState } from 'react';
import { loadTag, sanitizeTag } from '../../game/leaderboard';

export interface SuccessModalProps {
  timeText: string;
  moves: number;
  score: number;
  newBest: boolean;
  practice: boolean;
  onSubmit: (tag: string) => Promise<{ ok: boolean; error?: string }>;
  onLeaderboard: () => void;
  onNext: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export function SuccessModal({
  timeText,
  moves,
  score,
  newBest,
  practice,
  onSubmit,
  onLeaderboard,
  onNext,
  onReplay,
  onMenu,
}: SuccessModalProps) {
  const [tag, setTag] = useState(loadTag);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const cleanTag = sanitizeTag(tag);

  const submit = async () => {
    setStatus('sending');
    setError('');
    const result = await onSubmit(cleanTag);
    if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('idle');
      setError(result.error ?? 'LINK DOWN');
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Target reached">
      <div className="modal__box">
        <h2 className="modal__title pixel">TARGET REACHED</h2>
        <dl className="modal__stats">
          <div>
            <dt>TIME</dt>
            <dd>{timeText}</dd>
          </div>
          <div>
            <dt>MOVES</dt>
            <dd>{moves}</dd>
          </div>
          <div>
            <dt>SCORE</dt>
            <dd>{score}</dd>
          </div>
        </dl>
        {practice ? (
          <p className="modal__practice">(not considered for high score)</p>
        ) : newBest ? (
          <p className="modal__best">NEW HIGH SCORE!</p>
        ) : null}
        {practice ? null : status === 'sent' ? (
          <div className="modal__submit">
            <p className="modal__sent">SCORE TRANSMITTED!</p>
            <button className="btn btn--ghost" onClick={onLeaderboard}>
              VIEW LEADERBOARD
            </button>
          </div>
        ) : (
          <div className="modal__submit">
            <input
              className="tag-input"
              value={tag}
              maxLength={12}
              placeholder="ARCADE TAG"
              aria-label="Arcade tag"
              onChange={(event) => setTag(sanitizeTag(event.target.value))}
            />
            <button
              className="btn"
              disabled={status === 'sending' || cleanTag.length === 0}
              onClick={submit}
            >
              SUBMIT SCORE
            </button>
            {error ? <p className="modal__error">{error}</p> : null}
          </div>
        )}
        <div className="modal__actions">
          <button className="btn btn--amber" onClick={onNext}>
            NEXT CHALLENGE
          </button>
          <button className="btn" onClick={onReplay}>
            PLAY AGAIN
          </button>
          <button className="btn btn--ghost" onClick={onMenu}>
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}
