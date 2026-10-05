# Qubit Rush

Retro-arcade quantum coin game. Single-player, fully client-side static web app — no backend, no accounts.

## Run

```bash
npm install --include=dev
npm run dev
```

## Test

```bash
npm test          # unit + game-logic suites (Vitest)
npm run test:e2e  # browser suite (Playwright, starts its own dev server)
```

E2E runs are deterministic via the `?seed=<number>` URL parameter (seeds challenge generation and shot sampling).

Sound: the speaker toggle controls the theme song only (off by default). Action sounds (coin presses, MEASURE, win) always play.

## Build and deploy

```bash
npm run build     # static bundle in dist/
npm run preview   # serve dist/ locally
```

Deploy the `dist/` directory to any static host.
