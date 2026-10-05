# Build Qubit Rush V1 — Quantum Coins

Build a polished, browser-based, single-player game called **Qubit Rush**.

Qubit Rush is a retro arcade-style educational game designed to introduce people with **no prior quantum computing knowledge** to ideas such as superposition, measurement, probability, and eventually multi-qubit behavior.

The central gameplay metaphor is **quantum coins**.

The player should feel like they are experimenting with strange coins that behave differently from ordinary coins.

The game should **teach through interaction rather than explanation**.

---

# 1. Core Experience

The player should be able to open the website and immediately understand the basic idea:

> **You have quantum coins. Manipulate them until their measured behavior matches the target.**

The game should not require:

- prior quantum knowledge
- knowledge of quantum notation
- knowledge of quantum gates
- an account
- installation
- a backend

Everything should work directly in the browser.

The game is **single-player only for V1**.

Scores and progress may be stored locally in the browser.

---

# 2. Main Menu

The first screen should be a polished retro arcade-style main menu.

Example:

```text
╔══════════════════════════════════════╗
║                                      ║
║            ⚛ QUBIT RUSH              ║
║                                      ║
║       THE QUANTUM COIN GAME          ║
║                                      ║
║             🪙  🪙  🪙               ║
║                                      ║
║       ┌────────────────────┐         ║
║       │   ONE COIN         │         ║
║       └────────────────────┘         ║
║                                      ║
║       ┌────────────────────┐         ║
║       │   TWO COINS        │         ║
║       └────────────────────┘         ║
║                                      ║
║       ┌────────────────────┐         ║
║       │   THREE COINS      │         ║
║       └────────────────────┘         ║
║                                      ║
║              HIGH SCORES             ║
║                                      ║
╚══════════════════════════════════════╝
```

The player should be able to choose any unlocked/available level directly.

For V1, **all three levels can be available immediately**.

Do not force the player to complete Level 1 before accessing Level 2 or Level 3.

The purpose is to let people freely experiment.

---

# 3. Three Levels

The game consists of:

```text
🪙 ONE COIN
🪙🪙 TWO COINS
🪙🪙🪙 THREE COINS
```

These correspond to:

```text
1 qubit
2 qubits
3 qubits
```

Do not prominently use the word "qubit" in the gameplay UI.

The player should primarily see and interact with **coins**.

Quantum terminology can be introduced later as part of the event presentation, not as part of the initial game experience.

---

# 4. The Quantum Coin

The central visual element is a coin.

A normal coin can be:

```text
HEADS
  OR
TAILS
```

The game's coins can behave differently.

When a coin is in a superposition-like state, it should visually **flicker rapidly between its two sides**.

For example:

```text
      ┌───────┐
      │ HEADS │
      └───────┘

          ↓

      ┌───────┐
      │ TAILS │
      └───────┘

          ↓

      ┌───────┐
      │ HEADS │
      └───────┘

          ↓

      ┌───────┐
      │ TAILS │
      └───────┘
```

The flickering should communicate:

> **The coin isn't currently settled on one side.**

Do not display mathematical quantum notation to the player.

Do not explain superposition directly during gameplay.

Let the visual behavior create curiosity.

---

# 5. Coin States

The game should visually distinguish between:

### Definite state

The coin clearly shows:

```text
🪙 HEADS
```

or:

```text
🪙 TAILS
```

### Superposition

The coin rapidly flickers between:

```text
HEADS
TAILS
HEADS
TAILS
...
```

The player should be able to visually recognize that something different is happening.

The animation should be subtle enough that it does not become distracting.

Respect reduced-motion accessibility settings by providing a static representation if necessary.

---

# 6. Game Objective

Every challenge gives the player a **target probability distribution**.

The player needs to manipulate the coins until measuring them produces the target distribution.

For one coin:

```text
TARGET

HEADS   ██████████  50%
TAILS   ██████████  50%
```

For two coins:

```text
TARGET

HH       ██████████  50%
HT                   0%
TH                   0%
TT       ██████████  50%
```

For three coins:

```text
TARGET

HHH      █████       25%
HHT                  0%
HTH                  0%
HTT      █████       25%
THH      █████       25%
THT                  0%
TTH                  0%
TTT      █████       25%
```

The exact target should be randomly generated for each challenge.

---

# 7. Random Challenges

Each time a new challenge begins, generate a random **reachable quantum state**.

Do not generate arbitrary probability distributions that may be impossible to produce using the available operations.

Instead:

```text
Generate valid circuit/state
          ↓
Simulate it
          ↓
Calculate probabilities
          ↓
Use probabilities as target
```

This guarantees that every challenge has at least one solution.

The player does not need to find the exact circuit used to generate the target.

Any circuit producing the target distribution should be considered valid.

---

# 8. Player Actions

Instead of exposing technical quantum gate names, use approachable action names.

Initial actions:

```text
🪙 FLIP
🎲 MIX
🔄 TURN
🌀 TWIST
🔗 LINK
```

The conceptual mapping is:

```text
FLIP   → X
MIX    → H
TURN   → Z
TWIST  → Y
LINK   → CNOT
```

Do not show the quantum gate names in V1 gameplay.

The player should interact with the operations as game mechanics.

---

# 9. Action Descriptions

Each action should have a short beginner-friendly description.

### FLIP

> Flip the coin.

Equivalent to an X gate.

---

### MIX

> Mix the coin between its two sides.

Equivalent to the Hadamard gate.

When applied appropriately, this should create the game's flickering superposition behavior.

---

### TURN

> Turn the coin's quantum state.

Equivalent to a Z gate.

This operation does not need to be explained mathematically.

---

### TWIST

> Twist the coin's quantum state.

Equivalent to a Y gate.

---

### LINK

> Let one coin control another.

Equivalent to a CNOT gate.

For two or three coins, the player should select the control coin and target coin when using LINK.

---

# 10. Level 1 — One Coin

The first level introduces the basic interaction.

The player sees:

```text
             🪙

             HEADS
```

and a target such as:

```text
TARGET

HEADS   ██████████  50%
TAILS   ██████████  50%
```

The available actions should initially be limited to:

```text
[ FLIP ]
[ MIX ]
```

The player experiments and discovers that MIX creates the desired behavior.

After clicking **MEASURE**, the game performs many simulated measurements.

For example:

```text
MEASURING...

1000 COIN FLIPS

HEADS  ████████████████████  497
TAILS  ████████████████████  503
```

This should be visually satisfying.

The result should make it obvious that the outcome is probabilistic.

---

# 11. Level 2 — Two Coins

Introduce two coins:

```text
       🪙                 🪙
     COIN A             COIN B
```

The player now works with the combined behavior of two coins.

Possible outcomes:

```text
HH
HT
TH
TT
```

The available actions expand:

```text
[ FLIP ]
[ MIX ]
[ TURN ]
[ TWIST ]
[ LINK ]
```

The LINK action should allow interactions between the two coins.

Example challenge:

```text
TARGET

HH  ██████████  50%
HT              0%
TH              0%
TT  ██████████  50%
```

The player can discover that the coins can become correlated.

Do not explicitly call this "entanglement" inside the game.

That concept can be explained during the quantum theory session after the game.

---

# 12. Level 3 — Three Coins

Introduce:

```text
       🪙          🪙          🪙
       A           B           C
```

The possible measurement outcomes become:

```text
HHH
HHT
HTH
HTT
THH
THT
TTH
TTT
```

The target distribution can involve multiple outcomes.

The player now has to reason about interactions between three coins.

LINK should allow any valid pair of coins to be connected.

This level should feel substantially more difficult than the first two.

---

# 13. Measurement

Measurement is one of the most important parts of the game.

Do not simply calculate the final probability and display it.

Instead, make measurement feel like an actual event.

The player presses:

```text
╔══════════════╗
║   MEASURE    ║
╚══════════════╝
```

The game then performs many simulated measurements/shots.

For example:

```text
         MEASURING...

          1000 SHOTS

HH       ███████████████████  493
HT                         0
TH                         0
TT       ███████████████████  507
```

The actual shot counts should be sampled from the calculated probability distribution.

Therefore, repeated measurements should not always produce exactly the same numbers.

For example:

```text
Run 1:
HH → 493
TT → 507

Run 2:
HH → 511
TT → 489

Run 3:
HH → 498
TT → 502
```

This is important because the player is learning about **probability through experimentation**.

---

# 14. Successful Measurement

After measurement, compare the observed distribution/state against the target.

Because measurement involves statistical sampling, do not require the shot counts to exactly match the target percentages.

The underlying simulated probability distribution should be used to determine whether the player's circuit reaches the target.

The measurement visualization is primarily for player feedback and educational value.

---

# 15. Circuit / Action History

The player should be able to see what actions they have applied.

For example:

```text
COIN A

MIX → FLIP → MIX

COIN B

MIX → LINK
```

For LINK, clearly show the relationship:

```text
A ───── LINK ─────► B
```

The UI does not need to resemble a professional quantum circuit editor.

It should feel like manipulating objects in a game.

---

# 16. Undo and Reset

Provide:

```text
[ UNDO ]
[ RESET ]
```

UNDO removes the most recent action.

RESET returns all coins to their initial state and clears the action history.

The move counter keeps counting the whole attempt — RESET clears the coins and the history, not your spent moves or the running clock.

---

# 17. Timer

Each challenge has a timer.

Example:

```text
TIME
01:42
```

Start timing when the challenge starts.

Stop timing when the player successfully completes the challenge.

The timer contributes to the score.

---

# 18. Scoring

The score should be based on:

### Number of coins

More coins = higher score multiplier.

```text
1 coin  → ×1
2 coins → ×2
3 coins → ×4
```

### Number of operations

Fewer operations = higher score. Every operation pressed counts — even ones later undone or reset. The score never goes back up within a challenge.

### Time

Faster completion = higher score.

Accuracy should **not** be a scoring factor.

The objective is simply to reach the correct underlying probability distribution.

---

# 19. Local High Scores

There is no online leaderboard in V1.

Instead, maintain local high scores using browser storage.

Track scores separately for:

```text
ONE COIN
TWO COINS
THREE COINS
```

Example:

```text
PERSONAL BEST

ONE COIN
Best:  1240

TWO COINS
Best:  2840

THREE COINS
Best:  6310
```

No account or username should be required.

The player should simply see:

```text
NEW HIGH SCORE!
```

when they beat their previous best.

---

# 20. Retro Arcade Aesthetic

The visual design is extremely important.

The game should look like a **retro-futuristic quantum arcade machine**.

Think:

- 1980s/1990s arcade
- CRT monitors
- pixel art
- monochrome/limited-color displays
- neon accents
- scanlines
- pixel borders
- chunky arcade buttons
- terminal-style text
- subtle screen flicker
- retro sound-inspired visual feedback

However, maintain good readability.

Do not turn the interface into visual noise.

The coins should be the visual stars of the game.

---

# 21. Coin Animation

Coins should have satisfying animations.

Examples:

### FLIP

The coin visibly rotates/flips.

```text
HEADS
  ↓
 ↻
  ↓
TAILS
```

### MIX

The coin begins flickering rapidly between HEADS and TAILS.

```text
HEADS
TAILS
HEADS
TAILS
HEADS
...
```

### LINK

A visible connection appears between two coins.

```text
🪙  ═════════  🪙
```

### MEASURE

The coins stop flickering and settle on definite results.

```text
🪙 HEADS

🪙 TAILS
```

Then the measurement results are accumulated into the shot histogram.

---

# 22. Main Game Layout

A possible desktop layout:

```text
┌─────────────────────────────────────────────────────┐
│                    ⚛ QUBIT RUSH                    │
│                                                     │
│  LEVEL: TWO COINS             TIME: 01:42           │
│  SCORE: 1840                  MOVES: 7              │
│                                                     │
├───────────────────────┬─────────────────────────────┤
│                       │                             │
│       TARGET          │          COINS              │
│                       │                             │
│  HH  ████████  50%    │        🪙       🪙          │
│  HT            0%     │       COIN A   COIN B       │
│  TH            0%     │                             │
│  TT  ████████  50%    │                             │
│                       │                             │
├───────────────────────┴─────────────────────────────┤
│                                                     │
│ ACTIONS                                             │
│                                                     │
│ [ 🪙 FLIP ] [ 🎲 MIX ] [ 🔄 TURN ] [ 🌀 TWIST ]   │
│                                                     │
│ [ 🔗 LINK ]                                         │
│                                                     │
│ [ UNDO ] [ RESET ]                  [ MEASURE ]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Adapt the layout responsively for smaller screens.

---

# 23. Success Screen

When the target is successfully reached:

```text
╔══════════════════════════════════╗
║                                  ║
║          ✨ SUCCESS! ✨           ║
║                                  ║
║       TARGET REACHED             ║
║                                  ║
║       TIME       01:24           ║
║       MOVES         6            ║
║       SCORE      1840            ║
║                                  ║
║       NEW HIGH SCORE!            ║
║                                  ║
║       [ NEXT CHALLENGE ]         ║
║       [ PLAY AGAIN ]             ║
║                                  ║
╚══════════════════════════════════╝
```

Do not immediately explain the underlying quantum mechanics.

The player should simply experience the result.

---

# 24. No Explicit Quantum Mode

Do not add a "quantum mode", "advanced mode", state-vector display, Dirac notation, or technical explanation in V1.

The player should interact entirely through:

```text
Coins
Targets
Actions
Measurement
Probability
```

The game is intentionally hiding the complexity.

The educational explanation happens outside the game.

The HOW TO PLAY tutorial (PRACTICE + MANUAL tabs) is the game's sanctioned explanation layer. It may name quantum operations (X/H/Z/Y/CNOT) and use minimal notation (|0⟩, |1⟩). Gameplay screens stay notation-free.

---

# 25. No Leaderboard

Do not implement:

- Online leaderboard
- Accounts
- Authentication
- Multiplayer
- Social features
- Backend
- Cloud database

V1 is purely a local single-player experience.

---

# 26. No Forced Tutorial

Do not create a long tutorial.

The main menu should let the player immediately select:

```text
🪙 ONE COIN
🪙🪙 TWO COINS
🪙🪙🪙 THREE COINS
```

The game itself should be understandable through its UI.

A tiny contextual hint system is acceptable if the player gets stuck.

For example:

```text
💡 Try MIX on this coin.
```

Hints should be optional.

---

# 27. Educational Philosophy

The game should **not tell players what superposition, entanglement, or quantum gates are**.

Instead, players should experience the phenomena first.

For example:

```text
Player clicks MIX

        ↓

Coin starts flickering

        ↓

Player measures

        ↓

500 HEADS
500 TAILS

        ↓

Player thinks:

"Wait... what is this coin?"
```

That moment of curiosity is intentional.

The game is designed to create the question that the following quantum theory session answers.

The HOW TO PLAY tutorial answers those questions on demand — PRACTICE first, names afterward.

---

# 28. Technical Philosophy

Keep the implementation simple and self-contained.

The quantum simulation only needs to support:

```text
1–3 qubits
```

and:

```text
X / H / Z / Y / CNOT
```

A small state-vector simulator is sufficient.

The entire game should run locally in the browser.

No external quantum computer or quantum cloud service is required.

---

# 29. V1 Must Include

### Game

- Main menu
- Three selectable levels
- One-coin gameplay
- Two-coin gameplay
- Three-coin gameplay
- Random reachable challenges
- Quantum coin visualization
- Flickering superposition visual
- Flip
- Mix
- Turn
- Twist
- Link
- Measurement
- Many-shot simulation
- Probability distribution display
- Timer
- Move/operation counter
- Scoring
- Undo
- Reset
- Success screen
- Local high scores

### Visual

- Strong retro arcade aesthetic
- Animated coins
- Retro typography
- CRT-inspired visual treatment
- Clear probability bars
- Satisfying measurement animation
- Responsive design
- Accessible interaction
- Reduced-motion fallback

### Explicitly excluded

- Online leaderboard
- Accounts
- Multiplayer
- Backend
- Authentication
- Cloud storage
- Quantum notation in the gameplay UI
- Advanced quantum explanations
- Quantum hardware execution

---

# 30. The Desired Feeling

The final product should feel like:

> **You walked into a strange retro arcade machine and found a box of coins that don't obey the normal rules.**

The player should think:

> "Why is this coin flickering?"

> "Why do these two coins behave together?"

> "Why does measuring them give different results every time?"

> "How can I control this?"

Only later, during the quantum computing session, should they discover:

> **That weird coin was a qubit.**

> **Mix was a Hadamard gate.**

> **Link was a controlled operation.**

> **The flickering was our visual representation of superposition.**

> **The repeated measurements were sampling the quantum probability distribution.**

That connection between **game experience → intuition → quantum theory** is the core purpose of Qubit Rush.

---

# Final Objective

Build a polished V1 that can be deployed as a normal website and played entirely from a browser.

The priority order is:

**1. Fun**

**2. Intuitive interaction**

**3. Strong visual feedback**

**4. Probability/measurement experience**

**5. Educational value**

**6. Technical sophistication**

Do not sacrifice the first four for unnecessary technical complexity.

The player should be able to open Qubit Rush, choose a level, start manipulating coins, and understand the basic gameplay within **30 seconds**.
