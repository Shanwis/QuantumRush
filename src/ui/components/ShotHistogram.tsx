import { label } from '../../quantum/state';

export function ShotHistogram({
  shots,
  n,
  run,
}: {
  shots: readonly number[] | null;
  n: number;
  run: number;
}) {
  if (shots === null) {
    return <p className="hint">PRESS MEASURE TO SAMPLE 1000 SHOTS</p>;
  }
  const total = shots.reduce((a, b) => a + b, 0);
  return (
    <div key={run} className="bar-anim">
      {shots.map((count, i) => (
        <div className="bar-row" key={i}>
          <span className="bar-row__label">{label(i, n)}</span>
          <span className="bar">
            <span
              className="bar__fill bar__fill--shots"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </span>
          <span className="bar-row__value">{count}</span>
        </div>
      ))}
    </div>
  );
}
