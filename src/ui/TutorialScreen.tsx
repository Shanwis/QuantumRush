export function TutorialScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="tutorial flex flex-col gap-4">
      <header className="hud">
        <div className="hud__stat">
          <span className="hud__label">MANUAL</span>
          <span className="hud__value">HOW TO PLAY</span>
        </div>
        <button className="btn btn--ghost" onClick={onBack}>
          BACK
        </button>
      </header>

      <section className="panel">
        <h2 className="panel__title">THE LOOP</h2>
        <p className="tut-text">
          Every challenge shows a TARGET: bars with the wanted share of outcomes. Work the
          coins until measuring them matches the target, then press MEASURE. Any action
          sequence that gets there is a valid solution.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">THE COINS</h2>
        <p className="tut-text">
          Each coin is a quantum coin. In quantum computing it is called a qubit. Heads is 0,
          Tails is 1 (in quantum notation: |0⟩ and |1⟩).
        </p>
        <p className="tut-text">
          A settled coin shows one certain face. A flickering coin is unsettled: it holds
          Heads and Tails possibilities at once. That is quantum superposition.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">ACTIONS</h2>
        <div className="tut-row">
          <span className="tut-name">FLIP</span>
          <span className="tut-text">
            Turns a settled coin over: Heads becomes Tails.
            <br />
            <span className="tut-quantum">Quantum: X gate, the bit flip.</span>
          </span>
        </div>
        <div className="tut-row">
          <span className="tut-name">MIX</span>
          <span className="tut-text">
            Shakes a settled coin into the unsettled 50/50 flicker, or shakes a flickering
            coin back to certainty.
            <br />
            <span className="tut-quantum">
              Quantum: Hadamard (H) gate — makes and erases superposition.
            </span>
          </span>
        </div>
        <div className="tut-row">
          <span className="tut-name">TURN</span>
          <span className="tut-text">
            Nothing looks different right away. It flips a hidden sign that only shows up
            later. Try MIX, TURN, MIX: the coin settles on Tails.
            <br />
            <span className="tut-quantum">
              Quantum: Z gate, the phase flip — the source of interference.
            </span>
          </span>
        </div>
        <div className="tut-row">
          <span className="tut-name">TWIST</span>
          <span className="tut-text">
            FLIP and TURN in one move: flips the coin and its hidden sign.
            <br />
            <span className="tut-quantum">Quantum: Y gate.</span>
          </span>
        </div>
        <div className="tut-row">
          <span className="tut-name">LINK</span>
          <span className="tut-text">
            One coin controls another. Pick the control coin, then the target. The target
            flips only when the control is Tails. Direction matters: LINK A&rarr;B is not the
            same as LINK B&rarr;A. Try MIX on coin A, then LINK A&rarr;B: the coins lock
            together and always land the same way — that is entanglement.
            <br />
            <span className="tut-quantum">
              Quantum: CNOT (controlled-NOT) gate — the standard way to entangle qubits.
            </span>
          </span>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">MEASUREMENT</h2>
        <p className="tut-text">
          MEASURE runs 1000 shots and draws the histogram. Counts wobble between runs — that
          is real sampling noise. Winning never depends on the wobble: the game checks the
          exact underlying probabilities behind the coins.
        </p>
        <p className="tut-text tut-quantum">
          Quantum: measuring draws one outcome at random, with odds set by the state. The
          histogram estimates those odds.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">WINNING AND SCORES</h2>
        <p className="tut-text">
          Match the target distribution and press MEASURE to win. Fewer moves and faster
          times score higher. UNDO rewinds one move, RESET restarts the same challenge, and
          HINT reveals solution steps one at a time.
        </p>
      </section>
    </div>
  );
}
