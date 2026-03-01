# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:4032
npm run build        # Production build: static site → build/, library → dist/
npm run preview      # Preview the production build
npm run check        # svelte-check type errors across .ts and .svelte files
npm run lint         # Biome linter
npm run format       # Biome auto-formatter (writes in place)
npm run test         # Vitest browser mode, single run (headless Chromium via Playwright)
npm run test:watch   # Vitest in watch mode
npm run validate     # Full CI gate: format → lint → test → check
npm run prepack      # Build the library package only (outputs to dist/)
```

To run a single test file:
```bash
npx vitest run src/lib/stores/__tests__/gameState.test.ts
```

## Code Style

Biome enforces formatting and linting. Key style rules:
- **Indentation**: tabs (width 2)
- **Line width**: 100
- **Quotes**: single quotes in JS/TS, double quotes in JSX/Svelte attributes
- **Semicolons**: always
- **Trailing commas**: none

Biome `noUnusedVariables` and `noUnusedImports` are disabled for `.svelte` files (Svelte's compiler handles these). Run `npm run format` before committing.

## Architecture

This repo serves two roles simultaneously:

1. **SvelteKit static site** — the playable app, output to `build/`, deployed via `@sveltejs/adapter-static`
2. **npm library** — exports a `SubakGame` Svelte component (`import { SubakGame } from 'subak-game'`), output to `dist/` via `svelte-package`

The library entry point is `src/lib/index.ts`.

### Physics & Game Loop

The game is built on **Rapier2D** (WASM rigid-body physics). The central class is `GameState` in `src/lib/stores/game.svelte.ts`:

- Uses Svelte 5 `$state` runes throughout (it's a class, not a store)
- Owns the Rapier `World`, the physics accumulator loop, collision event queue, and fruit spawn/merge logic
- `Fruit` objects (`src/lib/game/Fruit.ts`) wrap Rapier rigid bodies and colliders; merging destroys two `Fruit` instances and creates a new one of the next index
- `Boundary` (`src/lib/game/Boundary.ts`) creates the static wall/floor colliders
- Physics units are in **meters** (`GAME_WIDTH = 0.6m`); pixel conversion happens in the rendering layer

### Svelte 5 Patterns

All reactive state uses Svelte 5 runes (`$state`, `$derived`, `$effect`). Classes like `GameState`, `LeaderboardClient`, `TelemetryState`, and `AudioManager` are instantiated and hold `$state` properties — they are passed around as objects, not imported as module-level stores.

### Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|---|---|
| `VITE_POSTHOG_TOKEN` | PostHog analytics (optional) |
| `PUBLIC_SHARED_CLIENT_SALT` | Anti-cheat hash salt |
| `PUBLIC_LEADERBOARD_URL` | Leaderboard API base URL (defaults to `http://localhost:3001`) |

The leaderboard is fully optional — `LeaderboardClient` (`src/lib/api/leaderboard-client.svelte.ts`) gracefully handles unavailable servers.

### Testing

Tests live in `__tests__/` directories adjacent to source files. Vitest runs in **browser mode** (real Chromium via Playwright) because the game uses browser APIs. The vitest config (`vitest.config.ts`) stubs out:
- `*.svg?component` imports (SvelteKit-only plugin not available in Vitest)
- `$env/dynamic/public` → `src/__mocks__/env.ts`

### SVG Assets

Fruit sprites and UI icons in `src/lib/svg/` and `src/lib/icons/` are imported as Svelte components using the `@poppanator/sveltekit-svg` plugin (e.g., `import Icon from './icon.svg?component'`). This import style only works in the SvelteKit app context; Vitest stubs them.

### Dual Build Notes

`npm run build` runs both `vite build` (static site) and `svelte-package` (library). When modifying public APIs of components/stores, check `src/lib/index.ts` to see what's exported as part of the library.
