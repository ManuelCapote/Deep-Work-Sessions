# Architecture

TE Pomodoro is a single-page React app with no backend. All state lives in browser memory + `localStorage`. The design goal is **"hooks do the thinking, components do the showing."**

## High-level shape

```
         ┌──────────────────────────┐
         │        App.tsx           │   composition root
         │  (wires hooks → views)   │
         └──────────┬───────────────┘
                    │ props
     ┌──────────────┼──────────────────┐
     │              │                  │
  Left pane     Right pane          Modals
  (timer)       (tab content)       (Settings, Onboarding)
```

`App.tsx` is deliberately the only "smart" component. Everything else is presentational.

## Hooks (the logic layer)

Each hook owns one slice of state and any side effects / persistence for that slice.

| Hook | Owns | Persists to localStorage |
|---|---|---|
| `useTimer` | mode, secondsLeft, isRunning, sessionCount, auto-advance | no (ephemeral) |
| `useSettings` | durations, theme, volumes, focus mode, daily goal, tags, onboarding flag | yes |
| `useSessions` | active + archived work sessions (todos, tags, notes, distractions) | yes |
| `usePlanning` | the draft plan (name, target, tasks) you start from | yes |
| `useSounds` | tick / noise / lo-fi mix playback, driven by timer state | no |
| `useNotifications` | browser notification permission + `notify()` | no |
| `useKeyboardShortcuts` | global keydown handlers → action callbacks | no |

**Rule:** if you need to read or write `localStorage`, do it inside the hook that owns that slice — never from a component.

## Components

Under `src/components/`, one folder per component:

- **TimerDisplay / Controls / ModeSelector / SessionCounter** — the timer core (left pane)
- **TabSwitcher** — switches the right pane between `timer | plan | sessions | stats`
- **PlanningView** — compose a plan → hand off to `useSessions.startFromPlan`
- **SessionsView** — active + archived sessions, todos, tags, notes, distractions
- **StatsView** — analytics charts from `utils/stats.ts`
- **SettingsPanel** — modal for `useSettings` values
- **SoundControls** — tick / noise / mix UI bound to `useSounds`
- **FocusTip** — rotating tip shown while running (from `utils/tips.ts`)
- **Onboarding** — first-run overlay, dismiss persisted in settings

All styles are CSS Modules (`ComponentName.module.css`).

## Utilities (`src/utils/`)
- `audio.ts` — Web Audio API wrapper for tick
- `sounds.ts` / `lofi.ts` — ambient noise + lo-fi loop generation
- `stats.ts` — aggregations for StatsView
- `tips.ts` — focus tip strings
- `export.ts` — export sessions data

These are pure and have no React imports.

## Types (`src/types/`)
- `session.ts` — `WorkSession`, `Todo`, `Distraction`, `PlanTask`
- `settings.ts` — user settings shape
- `stats.ts` — derived stats shapes

## Data flow: a session from plan to archive

1. User fills in `PlanningView` → stored in `usePlanning` (persisted).
2. User clicks "Start" → `startFromPlan(name, tasks, target)` creates an active `WorkSession` in `useSessions`.
3. `useTimer` runs independently; `sessionCount` increments on each completed pomodoro.
4. `useSessions` reads `sessionCount` and computes `pomodorosInSession` = `sessionCount - startPomodoroCount`.
5. User clicks "Finish session" → snapshots `finishedPomodoroCount`, sets `status: 'finished'`, moves to `archivedSessions`.
6. `StatsView` reads `[activeSession, ...archivedSessions]` to render analytics.

## Rendering / layout
- **Landscape:** timer is always visible (left pane); right pane shows the active tab.
- **Portrait:** the timer hides when a non-timer tab is active (to save vertical space).
- **Focus mode:** when enabled *and* timer is running, everything except the timer core is hidden.

Detected via a small `useIsLandscape` hook in `App.tsx`.

## PWA
- `public/manifest.json` — app metadata + icons
- `public/sw.js` — service worker for offline caching
- Icons: `icon-192.svg`, `icon-512.svg`, `apple-touch-icon.svg`, `favicon.svg`

The app is fully client-side, so offline "just works" once the SW caches assets.

## Non-goals (by design)
- No backend, no auth, no sync across devices
- No router — tabs are `useState`
- No state library (Redux / Zustand / etc.)
- No UI kit — CSS Modules only
- No tests yet (intentional; will add when learning curve flattens)
