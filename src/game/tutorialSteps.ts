import type { Challenge, Op, QubitCount, ActionName } from './types';

export interface TutorialStep {
  id: number;
  badge: string;
  title: string;
  level: QubitCount;
  target: number[];
  actions: ActionName[];
  solution: Op[];
  suggestedOp: ActionName;
  initialInstruction: string;
  matchedInstruction: string;
  measuredInstruction: string;
  quantumNote: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    badge: 'STEP 1 OF 5',
    title: 'THE COINS & BIT FLIP (FLIP)',
    level: 1,
    actions: ['FLIP', 'MIX'],
    target: [0, 1],
    solution: [{ kind: 'X', coin: 0 }],
    suggestedOp: 'FLIP',
    initialInstruction:
      'Welcome to Qubit Rush! Each coin is a quantum coin (qubit). Heads is 0 (|0⟩) and Tails is 1 (|1⟩). Coin A starts on HEADS. Click FLIP to turn it to TAILS, then click MEASURE.',
    matchedInstruction:
      'Great! Coin A is now on TAILS. Now click the flashing MEASURE button to sample 1000 shots and verify your state.',
    measuredInstruction:
      'Target reached! Notice that all 1000 shots landed on TAILS. Click NEXT STEP to learn about Superposition.',
    quantumNote: 'Quantum: X gate, the bit flip.',
  },
  {
    id: 2,
    badge: 'STEP 2 OF 5',
    title: 'SUPERPOSITION (MIX)',
    level: 1,
    actions: ['FLIP', 'MIX'],
    target: [0.5, 0.5],
    solution: [{ kind: 'H', coin: 0 }],
    suggestedOp: 'MIX',
    initialInstruction:
      'A normal coin can only be Heads or Tails. A quantum coin can be both! Click MIX to shake Coin A into an unsettled 50/50 state.',
    matchedInstruction:
      'Look at Coin A flickering! It holds Heads and Tails simultaneously — that is quantum superposition. Now click MEASURE to sample 1000 shots.',
    measuredInstruction:
      'Superposition verified! Notice how the counts wobble around ~500 Heads / ~500 Tails. That wobble is real quantum sampling noise. Click NEXT STEP.',
    quantumNote: 'Quantum: Hadamard (H) gate — makes and erases superposition.',
  },
  {
    id: 3,
    badge: 'STEP 3 OF 5',
    title: 'QUANTUM INTERFERENCE (TURN)',
    level: 1,
    actions: ['MIX', 'TURN'],
    target: [0, 1],
    solution: [
      { kind: 'H', coin: 0 },
      { kind: 'Z', coin: 0 },
      { kind: 'H', coin: 0 },
    ],
    suggestedOp: 'TURN',
    initialInstruction:
      'Quantum states have a hidden phase sign. TURN flips this sign (Z gate). Let’s see quantum interference in action:\n1. Click MIX (coin flickers)\n2. Click TURN (phase flips)\n3. Click MIX again (watch it settle on TAILS!)',
    matchedInstruction:
      'Interference magic! The two paths to Heads cancelled out (destructive interference), leaving 100% TAILS! Now click MEASURE.',
    measuredInstruction:
      'Perfect interference! You proved that quantum coins have hidden phase signs. Click NEXT STEP.',
    quantumNote: 'Quantum: Z gate, the phase flip — the source of interference.',
  },
  {
    id: 4,
    badge: 'STEP 4 OF 5',
    title: 'ENTANGLEMENT (LINK)',
    level: 2,
    actions: ['FLIP', 'MIX', 'TURN', 'TWIST', 'LINK'],
    target: [0.5, 0, 0, 0.5],
    solution: [
      { kind: 'H', coin: 0 },
      { kind: 'CNOT', control: 0, target: 1 },
    ],
    suggestedOp: 'LINK',
    initialInstruction:
      'Now we have two coins (A and B). Let’s link them together:\n1. Click MIX on Coin A\n2. Click LINK (the CNOT gate)\n3. Click Coin A (control), then Coin B (target)',
    matchedInstruction:
      'The coins are now entangled! Coin B flips only when Coin A is Tails. Notice how HT and TH are 0%. Click MEASURE!',
    measuredInstruction:
      'Entanglement confirmed! The two coins lock together and always land on the same face (HH or TT). Click NEXT STEP.',
    quantumNote:
      'Quantum: CNOT (controlled-NOT) gate — the standard way to entangle qubits. Direction matters: LINK A→B is not the same as LINK B→A.',
  },
  {
    id: 5,
    badge: 'STEP 5 OF 5',
    title: 'TWIST (Y) & TRAINING COMPLETE',
    level: 2,
    actions: ['FLIP', 'MIX', 'TURN', 'TWIST', 'LINK'],
    target: [0, 0.5, 0.5, 0],
    solution: [
      { kind: 'H', coin: 0 },
      { kind: 'CNOT', control: 0, target: 1 },
      { kind: 'Y', coin: 1 },
    ],
    suggestedOp: 'TWIST',
    initialInstruction:
      'TWIST is FLIP and TURN in one move (Y gate): it flips the coin and adds a hidden sign. Try it:\n1. Click MIX on Coin A\n2. Click LINK: Coin A (control) → Coin B (target)\n3. Click Coin B to select it, then click TWIST\n4. Click MEASURE!',
    matchedInstruction:
      'Target reached! TWIST flipped Coin B and its hidden sign. The odds here look the same as FLIP would give — but the hidden sign matters in interference (try MIX, TWIST, MIX on one coin). Now click MEASURE.',
    measuredInstruction:
      'Training complete! You have used every operation: FLIP (X), MIX (H), TURN (Z), TWIST (Y), and LINK (CNOT). Ready to set high scores?',
    quantumNote:
      'Quantum: Y gate — bit flip and phase in one gate. In every challenge, match the target distribution and press MEASURE; any action sequence that gets there is a valid solution.',
  },
];

export function challengeForStep(step: TutorialStep): Challenge {
  return {
    level: step.level,
    target: [...step.target],
    key: `tutorial-${step.id}`,
    solution: [...step.solution],
    depth: step.solution.length,
  };
}
