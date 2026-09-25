# Spot the Hazard — Warehouse Safety 360°

A browser-based, first-person 3D safety-training game built with **Three.js** and **Vite**.
Players walk through a procedurally-built warehouse — pallet racking, forklifts, loading
bays, chemical storage — and must locate **9 hidden safety hazards** before the clock runs
out. Finding a hazard triggers a short info card and a multiple-choice safety quiz;
answering correctly scores points, answering wrongly (or running out of time) costs points.

The whole scene — walls, floor, cartons, signage, textures — is generated at runtime with
the Canvas API and Three.js primitives, so the project ships with **no external image or
3D-model assets**.

**Deployment Link:** https://spot-the-hazard-game.netlify.app/

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [How to play](#how-to-play)
- [The 9 hazards](#the-9-hazards)
- [Scoring system](#scoring-system)
- [Grading & certification (results screen)](#grading--certification-results-screen)
- [Settings](#settings)
- [Data persistence](#data-persistence)
- [Standalone quiz mode](#standalone-quiz-mode)
- [Building for production](#building-for-production)
- [Known limitations / notes](#known-limitations--notes)
- [License](#license)

---

## Features

- **First-person 360° movement** through a fully 3D warehouse — walk with keyboard controls
  and look around by dragging the mouse (or a finger, on touch devices).
- **9 hidden hazards** placed around the warehouse, each marked with a glowing, bobbing
  3D warning sign that's revealed as you explore.
- **Info card + timed multiple-choice quiz** for every hazard: an info card explains the
  hazard, then an 18-second quiz question tests what the correct response should be.
- **Live scoring** with a streak multiplier, speed bonuses for fast correct answers, and
  penalties for wrong answers.
- **"Near-miss" penalty** — walking too close to certain active hazards (forklift, exposed
  cable, leaking chemical drum) without reporting them first costs points.
- **Overall countdown timer** (4 minutes 30 seconds) for the whole walkthrough, separate
  from the per-question quiz timer.
- **Patrolling forklift** that moves back and forth across the warehouse floor for
  atmosphere and immersion.
- **Results / scoreboard screen** with a letter grade, star rating, a "Certified Safety
  Inspector" style tier, and a persistent high score.
- **Adjustable look sensitivity** via an in-game/menu settings panel.
- **Procedurally generated visuals** — corrugated metal walls, cardboard cartons, warning
  posters, etc. are all drawn on `<canvas>` at load time, so there are no image downloads.

## Tech stack

| Layer            | Tool |
|-------------------|------|
| 3D rendering       | [Three.js](https://threejs.org/) `r0.160` |
| Build tool / dev server | [Vite](https://vitejs.dev/) `^5.4` |
| Language           | Vanilla JavaScript (ES modules), HTML, CSS |
| Persistence        | Browser `sessionStorage` (per-run results) and `localStorage` (high score, settings) |

No UI framework (React/Vue/etc.) is used — each screen is a plain HTML page with its own
JS entry point, bundled by Vite.

## Project structure

```
spot-the-hazard/
├── index.html            # Title / start screen
├── game.html             # Main 3D gameplay page
├── end.html               # Results / scoreboard screen
├── quiz.html               # Standalone 9-question quiz mode (see note below)
├── package.json
├── package-lock.json
├── vite.config.js           # Multi-page Vite build config
├── public/                    # Static assets folder (currently empty — all
│                                 visuals are generated procedurally at runtime)
└── src/
    ├── style.css              # Shared styling for all pages
    ├── start.js                # Title screen: play button, how-to-play panel, settings
    ├── game.js                  # Main game: scene setup, movement, hazards, quiz, scoring
    ├── end.js                    # Results screen: grading, animated score, high score
    └── quiz.js                    # Logic for the standalone quiz page
```

## Requirements

- [Node.js](https://nodejs.org/) **18 or later** (includes `npm`)
- A modern browser with WebGL support (Chrome, Edge, Firefox, or Safari)

## Getting started

1. **Clone or open the project folder** (e.g. in VS Code).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the dev server**:
   ```bash
   npm run dev
   ```
4. Vite will start a local server on **port 8080** and automatically open the game at
   `http://localhost:8080/index.html`. If it doesn't open automatically, click the link
   printed in the terminal.

## Available scripts

| Command | Description |
|---------|--------------|
| `npm run dev` | Starts the Vite development server with hot reload at `http://localhost:8080`. |
| `npm run build` | Builds an optimized, static production bundle into `dist/`. |
| `npm run preview` | Serves the production build from `dist/` locally, for a final check before deploying. |

## How to play

1. From the **title screen**, click **▶ Play Game** to enter the warehouse.
2. **Move** with `W` `A` `S` `D` or the arrow keys.
3. **Look around** by clicking-and-dragging (or touch-dragging) — you get a full 360° view.
4. Explore the warehouse to find the **9 glowing ⚠️ warning signs**.
5. Click a warning sign to open its **info card**, then press **Start Quiz** to answer a
   multiple-choice question about the correct safety response.
6. You have **18 seconds** to answer each quiz question before it times out.
7. Keep exploring and answering until all 9 hazards are resolved, or the **overall
   4:30 timer** runs out — either way, you're taken to the **results screen**.
8. Avoid loitering too close to the **forklift, exposed cable, or chemical drum** hazards
   before reporting them — getting within range triggers a "too close" near-miss penalty.

## The 9 hazards

| # | Hazard | Hazard type |
|---|--------|-------------|
| 1 | Oil Spill / Slip Hazard | Slip/trip hazard |
| 2 | Blocked Emergency Exit | Fire/evacuation hazard |
| 3 | Unstable Stack / Falling Objects | Falling-object hazard |
| 4 | Exposed Electrical Cable | Electrical/fire hazard |
| 5 | Damaged / Overloaded Racking | Structural collapse hazard |
| 6 | Forklift Near Pedestrians (Raised Load) | Vehicle/pedestrian hazard |
| 7 | Leaking Chemical Drum | Chemical/hazmat hazard |
| 8 | Worker Without Hard Hat / PPE | PPE compliance hazard |
| 9 | Blocked Fire Extinguisher | Fire-response hazard |

Each hazard has its own info blurb, a tailored multiple-choice question, four answer
options, and an explanation shown after answering — all defined in the `HAZARD_DATA` array
in `src/game.js`.

## Scoring system

Scoring is handled per quiz answer, with several modifiers stacked on top:

- **Base points for a correct answer** scale with your current streak:
  - `10` points normally
  - `15` points once your streak reaches **3** correct answers in a row
  - `20` points once your streak reaches **5** correct answers in a row
- **Speed bonus**: answer within **5 seconds** of the quiz opening for an extra **+3**
  points.
- **Wrong answer**: **−5** points, and your streak resets to 0.
- **Quiz timeout** (no answer within 18 seconds): treated the same as a wrong answer,
  **−5** points.
- **Near-miss penalty**: walking within close range of an unreported active hazard
  (forklift, cable, or chemical drum) costs **−3** points and resets your streak, with a
  short cooldown so it can't repeatedly fire on the same hazard.

The live score, hazards found (`x / 9`), remaining time, and current streak (once ≥ 2) are
all shown in the HUD at the top of the gameplay screen.

## Grading & certification (results screen)

At the end of a run, `end.html` reads the results Passed from the game (score, time,
wrong answers, hazards found) and computes:

- **A letter grade (S / A / B / C / D)** and a 0–3 star rating, based on your score as a
  percentage of a 150-point "perfect" baseline (and, for an `S`, requiring at most 1 wrong
  answer).
- A **rank name** (e.g. "Perfect Audit", "Sharp Eye", "Solid Walkthrough", "Needs Another
  Pass", "Missed Too Much") matching the grade.
- A **certification tier** based on the percentage of hazards answered correctly:
  - ≥ 90% correct → 🏅 *Certified Safety Inspector*
  - ≥ 60% correct → ✅ *Passed — Refresher Recommended*
  - below 60% → ⚠️ *Needs Retraining*
- A **new-high-score badge** if this run beats your previous best (stored locally).
- A message if the run ended because the overall timer ran out rather than by finding
  all 9 hazards.

From the results screen you can **restart** (back into `game.html`) or return **home**
(back to `index.html`).

## Settings

Both the title screen and the in-game HUD include a **⚙️ Settings** panel where you can
adjust **look sensitivity** (mouse/touch-drag look speed) with a slider. The chosen value
is saved to `localStorage` and reused across sessions. The in-game settings panel also
has a **Quit Game** button that returns you to the title screen.

## Data persistence

The game uses the browser's built-in storage — no backend or database is required:

- **`sessionStorage`** carries the results of the run you just finished (`score`, `time`,
  `wrong answers`, `hazards found`, whether the overall timer ran out) from `game.html`
  to `end.html`.
- **`localStorage`** persists your **all-time high score** and your **look-sensitivity
  preference** across browser sessions.

## Standalone quiz mode

`quiz.html` / `src/quiz.js` implement a separate, walkthrough-free **9-question quiz mode**
covering the same 9 hazard questions, with its own progress bar, live score, and results
screen (with retake/play/home options). It's fully built and included in the Vite build
config, but isn't currently linked to from the title screen — you can reach it directly at
`http://localhost:8080/quiz.html` during development, or wire up a button to it on
`index.html` if you'd like to expose it in the UI.

## Building for production

```bash
npm run build
```

This produces an optimized, static bundle in `dist/` containing all four pages
(`index.html`, `game.html`, `end.html`, `quiz.html`) and their bundled assets. Since it's
fully static, the `dist/` folder can be deployed to any static host (GitHub Pages, Netlify,
Vercel, S3, etc.).

Preview the production build locally before deploying:

```bash
npm run preview
```

## Known limitations / notes

- The `public/` folder is currently empty — all textures and visuals are generated
  procedurally with the Canvas API and Three.js materials, so no external image assets are
  needed for the game to run.
- The project has no automated tests or linter configured.
- Movement and camera look are tuned for desktop mouse/keyboard and touch-drag; there's no
  dedicated on-screen joystick for mobile movement.
- `quiz.html` is a complete, working page but isn't linked from the navigation flow yet
  (see [Standalone quiz mode](#standalone-quiz-mode) above).

## License

No license file is currently included in this project. Add a `LICENSE` file (e.g. MIT) if
you intend to open-source or share this project publicly.
