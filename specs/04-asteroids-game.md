# 04 — Asteroids Game

---

id: 04-asteroids-game
title: Asteroids Game
state: Approved
date: 2026-07-02
depends_on: 01-arcade-box-mvp-ui
---

**Objective:** Port the standalone `references/started-games/02-asteroids/game.js` canvas engine into a new `ASTEROIDS` entry in the game library, wired to the existing Player screen's HUD, pause and game-over modal.

---

## Scope

### Included

- New game engine at `src/games/asteroids/` — a straight TypeScript port of `references/started-games/02-asteroids/game.js`:
  - `engine.ts` — framework-agnostic canvas engine (`Bullet`, `Asteroid`, `PowerUp`, `Ship`, `Particle` classes, game loop, collisions, the triple-shot power-up, level progression). Same gameplay constants and feel as the source (800×600 internal resolution, toroidal wrap, invincibility flicker, asteroid splitting).
  - `AsteroidsCanvas.tsx` — `"use client"` React wrapper: owns the `<canvas>` element, mounts/tears down the engine on mount/unmount, forwards a `paused` prop (synced to the engine via effect), and exposes `onStateChange({ score, lives, level })` and `onGameOver(finalScore)` callbacks to its parent.
- Engine changes versus the source file:
  - In-canvas SCORE / NIVEL / lives HUD text removed — those numbers are reported to React via `onStateChange` and rendered only in the existing `.player-hud` bar.
  - GAME OVER overlay simplified to just the "GAME OVER" title (no subtitle, no functional Space-to-restart) — it's a visual backdrop once React's modal takes over. The rest of the overlay (dead-ship blink, level-clear flow) is unchanged.
  - `keydown` handler adds `preventDefault()` for `ArrowLeft`/`ArrowRight`/`ArrowUp`/`Space` to stop the page from scrolling while playing (the source was a standalone full-page demo without this concern).
  - Power-up label ("3x") stays in-canvas — it has no slot in the external HUD and isn't part of the score/lives/level duplication being removed.
- New entry in `lib/data.ts` `GAMES` array: `id: "asteroids"`, `title: "ASTEROIDS"`, `cat: "SHOOTER"`, `color: "magenta"`, `cover: "cover-asteroides"`, plus `short`/`long` copy and mock `best`/`plays` values consistent with the other 8 entries.
- New `.cover-asteroides` CSS class in `app/globals.css`, following the same pattern as the other `cover-*` placeholder classes.
- `app/games/[id]/play/page.tsx` changes:
  - Renders `<AsteroidsCanvas>` (inside the existing `.crt-screen`) instead of the static "COMING SOON" placeholder when `game.id === "asteroids"`; all other games keep the current static placeholder.
  - Removes the fake auto-incrementing score `setInterval` and the `[level, setLevel]` random-threshold effect for this game — score/lives/level state is now driven live by the engine's `onStateChange` callback.
  - Fixes the existing `lives` state (currently `useState(3)` with no setter) to be updatable from the engine.
  - Wires the existing PAUSE button to a `paused` boolean passed into `<AsteroidsCanvas>`.
  - "PLAY AGAIN" remounts `<AsteroidsCanvas>` via a changed `key` prop, producing a fresh engine instance.
  - `onGameOver` triggers the same `setOver(true)` flow already in place, so the existing modal (name input, `saveScore` via Context, PLAY AGAIN / BACK TO LIBRARY) works unmodified for this game.

### Not included

- Touch/on-screen controls (keyboard-only, matching the source game).
- Any other game beyond Asteroids — no generic multi-game engine abstraction is introduced; other library entries keep their static "COMING SOON" placeholder.
- Resolution-independent/responsive canvas physics — internal resolution stays fixed at 800×600, scaled via CSS to fill the existing 4:3 `.crt-screen` container.
- Leaderboard/`seededScores` changes on the Detail page — the new game uses the existing generic leaderboard mechanism as-is.
- Sound effects (the source game has none either).

---

## Data Model

### `src/games/asteroids/engine.ts`

No new persisted data — this is in-memory canvas engine state, framework-agnostic (no React imports):

```ts
export interface EngineState {
  score: number;
  lives: number;
  level: number;
}

export interface AsteroidsEngineOptions {
  canvas: HTMLCanvasElement;
  onStateChange: (state: EngineState) => void;
  onGameOver: (finalScore: number) => void;
}

export class AsteroidsEngine {
  constructor(options: AsteroidsEngineOptions);
  setPaused(paused: boolean): void;
  destroy(): void; // cancels rAF loop, removes window key listeners
}

// Internal classes, unchanged in shape from the source port:
// Bullet, Asteroid, PowerUp, Ship, Particle
```

### `src/games/asteroids/AsteroidsCanvas.tsx`

```ts
interface AsteroidsCanvasProps {
  paused: boolean;
  onStateChange: (state: EngineState) => void;
  onGameOver: (finalScore: number) => void;
}
```

### `lib/data.ts`

No new types — one new `Game` object appended to the existing `GAMES` array:

```ts
{
  id: "asteroids",
  title: "ASTEROIDS",
  short: "...",
  long: "...",
  cat: "SHOOTER",
  cover: "cover-asteroides",
  color: "magenta",
  best: number,
  plays: string,
}
```

---

## Implementation Plan

1. **Read Next.js 16 canvas/client-component docs** — check `node_modules/next/dist/docs/` for anything relevant to client components with `<canvas>` and `requestAnimationFrame` before writing code, per AGENTS.md.

2. **Port the engine — `src/games/asteroids/engine.ts`**
   - Translate `game.js` to TypeScript: `Bullet`, `Asteroid`, `PowerUp`, `Ship`, `Particle` classes, constants (`RADII`, `SPEEDS`, `POINTS`, power-up tuning), `wrap`/`dist`/`rand`/`randInt` helpers.
   - Wrap the module-level game state (`ship`, `bullets`, `asteroids`, `particles`, `powerUps`, `score`, `lives`, `level`, `state`, `deadTimer`) inside an `AsteroidsEngine` class instantiated per canvas, instead of file-level globals — needed so remounting via `key` produces a clean instance.
   - Constructor takes `{ canvas, onStateChange, onGameOver }`, sets up its own `keydown`/`keyup` listeners (scoped to remove on `destroy()`), and starts the `requestAnimationFrame` loop.
   - `update()` calls `onStateChange({ score, lives, level })` whenever any of the three change; calls `onGameOver(score)` once when transitioning into `'gameover'` state (instead of the source's Space-to-restart handling).
   - Add `setPaused(paused)`: when `true`, `update()` returns early before simulating (ship/asteroids/bullets/particles freeze) but `draw()` keeps running.
   - Remove in-canvas SCORE/NIVEL/lives HUD drawing from `drawHUD()` (keep the "3x" power-up label). Simplify the game-over overlay to just "GAME OVER" (no subtitle, no restart-on-Space).
   - Add `preventDefault()` for `ArrowLeft`/`ArrowRight`/`ArrowUp`/`Space` in the `keydown` listener.
   - `destroy()` cancels the rAF loop and removes the window listeners.

3. **React wrapper — `src/games/asteroids/AsteroidsCanvas.tsx`**
   - `"use client"` component rendering a `<canvas width={800} height={600}>` styled to fill its container (`width: 100%; height: 100%`).
   - `useEffect` on mount: `new AsteroidsEngine({ canvas: canvasRef.current, onStateChange, onGameOver })`; on unmount calls `engine.destroy()`.
   - `useEffect` on `paused` change: `engineRef.current?.setPaused(paused)`.

4. **Add CSS — `app/globals.css`**
   - New `.cover-asteroides` class, following the same gradient/placeholder pattern as the existing `cover-*` classes.

5. **Add game entry — `lib/data.ts`**
   - Append the `asteroids` object to `GAMES` (id, title, short/long copy, `cat: "SHOOTER"`, `cover: "cover-asteroides"`, `color: "magenta"`, mock `best`/`plays`).

6. **Wire the Player screen — `app/games/[id]/play/page.tsx`**
   - Remove the fake score `setInterval` and the random-level-up effect.
   - Add a `restartKey` counter state; `restart()` increments it in addition to its existing resets.
   - Conditionally render, inside `.crt-content`: `<AsteroidsCanvas key={restartKey} paused={paused} onStateChange={...} onGameOver={...} />` when `game.id === "asteroids"`; keep the existing static placeholder markup for every other game id.
   - `onStateChange` updates local `score`/`lives`/`level` state (fixing the current dead `lives` state).
   - `onGameOver` calls the existing `endGame()` (`setOver(true)`), reusing the modal untouched.

7. **Manual verification pass** — run `npm run dev`, play a full round on `/games/asteroids/play`: movement/rotation/thrust/shooting, asteroid splitting, triple-shot power-up, level clear, taking damage, pause/resume, death → game over → save score → PLAY AGAIN starts a clean run, EXIT/BACK TO LIBRARY navigate correctly.

8. **`npm run build` and `npm run lint`** — confirm both pass with no errors.

---

## Acceptance Criteria

- [ ] `/games` shows a new "ASTEROIDS" card (SHOOTER category, magenta accent) alongside the existing 8 games
- [ ] `/games/asteroids` (Detail) shows the new cover, description and leaderboard like any other game; "PLAY NOW" navigates to `/games/asteroids/play`
- [ ] `/games/asteroids/play` renders the real Asteroids canvas inside the CRT screen instead of the "COMING SOON" placeholder
- [ ] `/games/[any-other-id]/play` (e.g. `/games/rocas/play`) still shows the static "COMING SOON" placeholder, unchanged
- [ ] Arrow keys rotate/thrust the ship and Space fires; pressing these keys does not scroll the page
- [ ] The external HUD bar's Score, Lives and Level values update live as the game is played; the canvas itself no longer draws its own score/level/lives text
- [ ] Destroying asteroids splits large → medium → small and awards points per size (20/50/100); the triple-shot power-up occasionally drops and applies for its duration (canvas still shows the "3x" indicator)
- [ ] Losing all 3 lives ends the run: the canvas shows a plain "GAME OVER" backdrop and React's existing modal appears with the final score, name input and save-score flow
- [ ] "PLAY AGAIN" in the modal starts a completely fresh run (score 0, 3 lives, level 1, new asteroid field)
- [ ] The PAUSE button freezes ship/asteroid/bullet movement without resetting state; RESUME continues from the same frame
- [ ] "END" and "EXIT" behave the same as they already do for other games (end run / navigate back to the game's Detail page)
- [ ] `npm run build` and `npm run lint` pass without errors

---

## Decisions Taken and Discarded

- **Reuse the "rocas" slot vs a new game entry** → new entry (`id: "asteroids"`). "rocas" is a distinct, unrelated game concept already in the library; overwriting its copy/leaderboard to point at a different game would be confusing and would silently break its existing leaderboard seed.

- **Class-based OOP port vs rewrite in a different style (hooks/ECS)** → straight class-based port, matching the source file's structure (`Bullet`, `Asteroid`, `Ship`, `Particle`, `PowerUp`). A rewrite would add risk and time without a stated benefit; the source is already clean single-file canvas code.

- **Module-level globals vs an `AsteroidsEngine` class instance** → wrapped in a class. The source uses file-level `let` globals (`ship`, `bullets`, `score`, ...), which is fine for a single static HTML page but breaks in React where the component (and thus the game) can mount more than once per page load (dev double-invoke, remount via `key` on restart). A class instance scopes state per mount.

- **In-canvas HUD vs external React HUD only** → external only, in-canvas HUD text removed. The Player screen already renders score/lives/level in `.player-hud`; keeping both would show the same numbers twice in different fonts/positions for no benefit.

- **Keep vs drop the in-canvas GAME OVER overlay** → kept, but stripped down to just the title text and made non-functional (no Space-to-restart). Preserves the original game's visual beat (the field freezes under a "GAME OVER" caption) while avoiding two competing restart mechanisms — React's modal is the only functional one.

- **Restart via engine `reset()` method vs component remount (`key` change)** → remount. Guarantees a fully clean engine instance (no leftover asteroids, particles, listeners, or timers) with no manual reset bookkeeping to keep in sync as the engine evolves.

- **Fixed 800×600 canvas vs resolution-independent physics** → fixed, CSS-scaled to fill the container. The existing `.crt-screen` is already `aspect-ratio: 4/3`, an exact match for 800×600; reworking all pixel-based physics constants to be resolution-independent would touch most of the engine for no visible benefit.

- **Touch controls in this spec vs deferred** → deferred. The source game is keyboard-only and touch controls need new UI design (on-screen buttons) that's out of scope for a straight port.

- **`preventDefault()` on gameplay keys** → added, even though absent in the source. The source was a standalone full-page demo with nothing else on the page to scroll; embedded in the Arcade Box layout, arrow keys/Space would otherwise scroll the page during play.

---

## Identified Risks

- **Next.js 16 breaking changes.** AGENTS.md warns this version differs from training data. Read the relevant `node_modules/next/dist/docs/` pages on Client Components and canvas/effects usage before writing `AsteroidsCanvas.tsx`.

- **React Strict Mode double-invoke in development.** `useEffect` mounts/unmounts/remounts once in dev. If `engine.destroy()` doesn't fully cancel the rAF loop and remove window key listeners, dev mode will end up with duplicate loops or leaked listeners (visible as double-speed simulation or ghost input). Must verify `destroy()` is complete, not just implemented.

- **`key`-based remount timing.** Changing `restartKey` unmounts the old `<AsteroidsCanvas>` and mounts a new one; if `onStateChange`/`onGameOver` from the outgoing instance fire after React has already started tearing it down, it could update state on an unmounted-adjacent render. Guard by checking the engine instance is still current inside the callbacks, or rely on `destroy()` running synchronously before the new instance's first callback.

- **`window`-scoped key listeners while paused elsewhere in the app.** Since listeners are added on `window` for the lifetime of the mounted canvas, pressing arrow keys/Space anywhere else on `/games/[id]/play` while the canvas is mounted (e.g. focus in a future settings field) would still be captured by the game. Acceptable for this spec since the Player page has no other keyboard-interactive controls, but worth noting if the page grows one.

- **CSS scaling and click/pointer coordinates.** The canvas is CSS-scaled from 800×600 to fill a responsive container. This spec has no pointer-based interaction (keyboard only), so scaling only affects rendering, not input — but this becomes a real constraint if touch controls are added later (deferred, per the decisions above).
