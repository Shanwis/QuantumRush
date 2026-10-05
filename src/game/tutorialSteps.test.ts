import { describe, expect, it } from 'vitest';
import { createZeroState, probabilities } from '../quantum/state';
import { TUTORIAL_STEPS, challengeForStep } from './tutorialSteps';
import { ACTION_DEFS, applyOp, type ActionName, type Op } from './types';
import { matchesTarget } from './win';

function nameOf(op: Op): ActionName {
  if (op.kind === 'CNOT') return 'LINK';
  return ACTION_DEFS.find((d) => d.kind === op.kind)!.name;
}

describe('tutorial steps', () => {
  it('replays every solution to its step target', () => {
    for (const step of TUTORIAL_STEPS) {
      let state = createZeroState(step.level);
      for (const op of step.solution) state = applyOp(state, op);
      expect(
        matchesTarget(probabilities(state), step.target),
        `step ${step.id} solution does not reach target`,
      ).toBe(true);
    }
  });

  it('suggests an operation that is part of the solution', () => {
    for (const step of TUTORIAL_STEPS) {
      const used = step.solution.map(nameOf);
      expect(used, `step ${step.id} suggests ${step.suggestedOp} but never uses it`).toContain(
        step.suggestedOp,
      );
    }
  });

  it('uses only operations allowed on that step', () => {
    for (const step of TUTORIAL_STEPS) {
      for (const op of step.solution) {
        expect(step.actions, `step ${step.id} solution uses a hidden action`).toContain(nameOf(op));
      }
    }
  });

  it('is well formed', () => {
    TUTORIAL_STEPS.forEach((step, index) => {
      expect(step.id).toBe(index + 1);
      expect(step.target.length).toBe(1 << step.level);
      expect(step.target.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    });
    const keys = TUTORIAL_STEPS.map((s) => challengeForStep(s).key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
