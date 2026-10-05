import {
  ACTION_DEFS,
  ACTION_DESCRIPTIONS,
  LEVEL_ACTIONS,
  type QubitCount,
} from '../../game/types';

export interface ActionBarProps {
  level: QubitCount;
  linkArmed: boolean;
  canUndo: boolean;
  canHint: boolean;
  disabled: boolean;
  hintText: string;
  onAction: (kind: 'X' | 'H' | 'Z' | 'Y') => void;
  onLinkToggle: () => void;
  onUndo: () => void;
  onReset: () => void;
  onMeasure: () => void;
  onHint: () => void;
}

export function ActionBar({
  level,
  linkArmed,
  canUndo,
  canHint,
  disabled,
  hintText,
  onAction,
  onLinkToggle,
  onUndo,
  onReset,
  onMeasure,
  onHint,
}: ActionBarProps) {
  const defs = ACTION_DEFS.filter((d) => LEVEL_ACTIONS[level].includes(d.name));
  return (
    <section className="panel">
      <h2 className="panel__title">ACTIONS</h2>
      <div className="toolbar">
        {defs.map((d) => (
          <span className="tool" key={d.name}>
            {d.kind === 'CNOT' ? (
              <button
                className={linkArmed ? 'btn btn--amber' : 'btn'}
                disabled={disabled}
                aria-pressed={linkArmed}
                onClick={onLinkToggle}
              >
                {d.name}
              </button>
            ) : (
              <button
                className="btn"
                disabled={disabled || linkArmed}
                onClick={() => onAction(d.kind)}
              >
                {d.name}
              </button>
            )}
            <span className="tool__desc">{ACTION_DESCRIPTIONS[d.name]}</span>
          </span>
        ))}
        <span className="toolbar__spacer" />
        <button className="btn btn--ghost" disabled={disabled || !canHint} onClick={onHint}>
          HINT
        </button>
        <button className="btn btn--ghost" disabled={disabled || !canUndo} onClick={onUndo}>
          UNDO
        </button>
        <button className="btn btn--ghost" disabled={disabled} onClick={onReset}>
          RESET
        </button>
        <button className="btn btn--measure" disabled={disabled} onClick={onMeasure}>
          MEASURE
        </button>
      </div>
      {hintText ? <p className="hint">{hintText}</p> : null}
    </section>
  );
}
