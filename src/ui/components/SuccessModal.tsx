export interface SuccessModalProps {
  timeText: string;
  moves: number;
  score: number;
  newBest: boolean;
  practice: boolean;
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
  onNext,
  onReplay,
  onMenu,
}: SuccessModalProps) {
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
