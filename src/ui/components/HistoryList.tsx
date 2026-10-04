import { type Op, opLabel } from '../../game/types';

export function HistoryList({ ops }: { ops: readonly Op[] }) {
  return (
    <section className="panel">
      <h2 className="panel__title">MOVES</h2>
      {ops.length === 0 ? (
        <p className="hint">NO MOVES YET</p>
      ) : (
        <div className="history">
          {ops.map((op, i) => (
            <span className="history__item" key={i}>
              {opLabel(op)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
