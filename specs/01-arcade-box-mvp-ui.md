# 01 — MVP UI: Arcade Box

---
id: 01-arcade-box-mvp-ui
title: MVP UI — Arcade Box
state: Done
date: 2026-06-18
depends_on: —
---

**Objective:** Implement the five Arcade Box screens (Library, Detail, Player, Auth, Hall of Fame) as Next.js 16 App Router pages, porting the neon-retro design from the reference templates, with no real game logic.

---

## Scope

### Included
- 5 Next.js pages with App Router: `/`, `/games/[id]`, `/games/[id]/play`, `/auth`, `/hall-of-fame`
- Shared `Nav` component (desktop + mobile menu with backdrop)
- Player screen: HUD (score, lives, level, player name), CRT area with static placeholder, pause, game-over modal and score saving
- Mock auth: login/register with any credentials, "play as guest" flow, decorative social buttons (no functionality)
- Global state (user + scores) via React Context with `localStorage` persistence
- Mock data in `lib/data.ts`: 8 games, categories, `seededScores` function
- Styles: template CSS ported to `app/globals.css` (neon variables, CRT/scanlines effects, component classes)

### Excluded
- Any game logic (including animated simulation in the Player screen — CRT area uses a static placeholder)
- Real auth (no external provider, no database)
- Server-side score persistence
- SEO / advanced metadata
- Tests

---

## Data Model

### `lib/data.ts`

```ts
export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: string;
  cover: string;   // CSS class name: "cover-bricks", "cover-tetro", etc.
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export const GAMES: Game[]         // 8 games from the template
export const CATS: string[]        // ["ALL", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
export function seededScores(seed: number, count?: number): ScoreRow[]
```

### `lib/context/arcade-context.tsx`

```ts
interface User { name: string }
interface ScoreEntry { game: string; score: number; name: string; at: number }

interface ArcadeContext {
  user: User | null
  login: (u: User) => void
  signOut: () => void
  scores: ScoreEntry[]
  saveScore: (entry: Omit<ScoreEntry, "at">) => void
}
```

Persistence: `localStorage` under keys `av_user` and `av_scores`.

---

## Implementation Plan

1. **Create `lib/data.ts`** — export `GAMES`, `CATS`, `seededScores` typed in TypeScript.

2. **Create `lib/context/arcade-context.tsx`** — Provider with `user`, `login`, `signOut`, `scores`, `saveScore`; persistence in `localStorage`.

3. **Port styles to `app/globals.css`** — copy neon CSS variables, reset, layout classes (`.av-nav`, `.av-main`, `.card`, `.av-hero`, etc.), CRT/scanlines effects and animations from the template.

4. **Update `app/layout.tsx`** — add `ArcadeProvider` and the `Nav` component; load Press Start 2P and JetBrains Mono fonts via `next/font/google`.

5. **Create `components/nav.tsx`** — desktop navigation + mobile panel with backdrop; links to `/` and `/hall-of-fame`; auth button.

6. **Create `app/page.tsx`** (Library) — hero, search input, category chips, `GameCard` grid; each card navigates to `/games/[id]`.

7. **Create `app/games/[id]/page.tsx`** (Detail) — cover, info, stat-strip, sidebar leaderboard with `seededScores`; "PLAY NOW" button → `/games/[id]/play`.

8. **Create `app/games/[id]/play/page.tsx`** (Player) — HUD, CRT area with static placeholder ("COMING SOON"), pause, game-over modal with score saving via Context.

9. **Create `app/auth/page.tsx`** — login/register tabs, fields, "play as guest" button, decorative social buttons; login calls `context.login()` and redirects to `/`.

10. **Create `app/hall-of-fame/page.tsx`** — tabs per game, top-3 podium, full table with `seededScores`; highlighted row if a user is logged in.

---

## Acceptance Criteria

- [ ] `/` shows the hero, search input and game grid; filtering by category or text reduces the visible cards.
- [ ] Navigating to `/games/[id]` shows the cover, description, stats and leaderboard for that game.
- [ ] From Detail, "PLAY NOW" leads to `/games/[id]/play` with the HUD and the CRT area showing a static placeholder.
- [ ] In Player, "PAUSE" freezes the score counter; "END" opens the modal; saving a score persists it in Context/localStorage.
- [ ] `/auth` allows login with any username/password; "play as guest" works without credentials; both flows redirect to `/`.
- [ ] Nav shows the logged-in user's name with a sign-out option; when logged out it shows "Sign In".
- [ ] `/hall-of-fame` shows tabs per game, podium and table; if a user is logged in their row appears highlighted.
- [ ] Nav has a functional mobile menu (hamburger → side panel → backdrop closes it).
- [ ] `npm run build` and `npm run lint` pass without errors.

---

## Decisions Taken and Discarded

- **File-based routing vs client-side SPA** → file-based (App Router). The template's hash-routing is not idiomatic in Next.js and blocks native navigation and future SEO.

- **Styles: Tailwind utilities vs ported custom CSS** → custom CSS ported to `globals.css`. Effects like scanlines, perspective grid and CRT are hard to express as utilities without plugins; visual fidelity > Tailwind purity.

- **Global state: Context vs props drilling** → React Context. With 5 screens sharing user and scores, props drilling would cross too many layers.

- **Real auth vs mock** → mock. The MVP is UI-only; integrating a provider would be scope creep. The Context interface (`login`/`signOut`) leaves the extension point ready.

- **Animated simulation in Player vs static placeholder** → static placeholder. The auto-incrementing animation simulates a game that doesn't exist; an honest placeholder is more correct for a game-free MVP.

- **Server-side scores vs localStorage** → localStorage. With no backend in the MVP, localStorage covers session persistence without infrastructure.

---

## Identified Risks

- **Next.js 16 breaking changes.** AGENTS.md explicitly warns that this version differs from training data. Read `node_modules/next/dist/docs/` before writing any Next.js code.

- **`"use client"` boundary.** Context, `localStorage` and state hooks require client components. Nav, interactive pages and the Provider must declare `"use client"`; purely static pages can remain Server Components.

- **CSS conflicts between Tailwind v4 and ported CSS.** Tailwind v4 injects its own resets and variables. Verify that arcade classes don't collide with generated utilities; the `av-` prefix (already present in the template) helps isolate them.

- **Press Start 2P font.** Must be loaded via `next/font/google` and exposed as a CSS variable so the `.pixel` classes from the template can use it. If misconfigured, the retro look is lost.
