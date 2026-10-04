import type { ReactNode } from 'react';
import { COIN_NAMES } from '../../game/types';
import { useReducedMotion } from './useReducedMotion';

export function shouldFlicker(marginal: number): boolean {
  return marginal > 0.02 && marginal < 0.98;
}

export interface CoinProps {
  index: number;
  marginal: number;
  settleFace: 'H' | 'T' | null;
  selected: boolean;
  linkRole: 'control' | null;
  pickTarget?: boolean;
  flipKey: number;
  onClick: () => void;
}

export function Coin({
  index,
  marginal,
  settleFace,
  selected,
  linkRole,
  pickTarget,
  flipKey,
  onClick,
}: CoinProps) {
  const reduced = useReducedMotion();
  const flicker = shouldFlicker(marginal);
  const definiteFace: 'H' | 'T' = marginal < 0.5 ? 'H' : 'T';

  const classes = ['coin'];
  if (selected) classes.push('coin--selected');
  if (linkRole === 'control') classes.push('coin--control');
  if (pickTarget) classes.push('coin--pick-target');
  if (flicker && !reduced && settleFace === null) classes.push('coin--flicker');

  let stage: ReactNode;
  if (settleFace !== null) {
    stage = (
      <span className="coin__face coin__face--settle" key={`settle-${flipKey}`}>
        <span className="coin__glyph">{settleFace}</span>
        <span className="coin__side">{settleFace === 'H' ? 'HEADS' : 'TAILS'}</span>
      </span>
    );
  } else if (flicker && reduced) {
    stage = (
      <span className="coin__face coin__face--split">
        <span className="coin__glyph coin__glyph--split">H|T</span>
        <span className="coin__side">UNSETTLED</span>
      </span>
    );
  } else if (flicker) {
    stage = (
      <>
        <span className="coin__face coin__face--h" key={`h-${flipKey}`}>
          <span className="coin__glyph">H</span>
          <span className="coin__side">HEADS</span>
        </span>
        <span className="coin__face coin__face--t" key={`t-${flipKey}`}>
          <span className="coin__glyph">T</span>
          <span className="coin__side">TAILS</span>
        </span>
      </>
    );
  } else {
    stage = (
      <span className="coin__face" key={`d-${flipKey}`}>
        <span className="coin__glyph">{definiteFace}</span>
        <span className="coin__side">{definiteFace === 'H' ? 'HEADS' : 'TAILS'}</span>
      </span>
    );
  }

  return (
    <button className={classes.join(' ')} onClick={onClick} aria-label={`Coin ${COIN_NAMES[index]}`}>
      <span className="coin__name">COIN {COIN_NAMES[index]}</span>
      <span className="coin__stage">{stage}</span>
      {linkRole === 'control' ? <span className="chip chip--cyan">CONTROL</span> : null}
    </button>
  );
}
