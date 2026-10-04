import { label } from '../../quantum/state';

function formatPercent(p: number): string {
  const pct = p * 100;
  return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

export function TargetPanel({ probs, n }: { probs: readonly number[]; n: number }) {
  return (
    <div>
      {probs.map((p, i) => (
        <div className="bar-row" key={i}>
          <span className="bar-row__label">{label(i, n)}</span>
          <span className="bar">
            <span className="bar__fill" style={{ width: `${p * 100}%` }} />
          </span>
          <span className="bar-row__value">{formatPercent(p)}</span>
        </div>
      ))}
    </div>
  );
}
