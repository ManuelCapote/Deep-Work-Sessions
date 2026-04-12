# TE Pomodoro

A feature-rich Pomodoro timer web app built with React 19, TypeScript, and Vite. Installable as a PWA, works offline, and includes session tracking, planning, stats, and ambient sound.

**Current version:** 0.4.0 — five development phases shipped (core UX, analytics, productivity features, PWA, ambient sound/focus mode).

## Features

- **Timer** — Pomodoro / short break / long break with auto-advance
- **Planning** — Plan a session (target pomodoros + task list) before starting
- **Sessions** — Track active + archived sessions with todos, tags, notes, and distractions
- **Stats** — Daily-goal progress and historical analytics
- **Sound** — Tick sound, ambient noise, lo-fi mixes with master/tick volume
- **Focus mode** — Hide non-essential UI while the timer runs
- **PWA** — Installable, offline-capable via service worker
- **Keyboard shortcuts**, notifications, light/dark/auto theme, onboarding

## Stack

- React 19 + TypeScript
- Vite 8
- CSS Modules (no UI library)
- `localStorage` for persistence (no backend)
- Service worker + Web App Manifest for PWA

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build     # typecheck + production build
npm run lint      # eslint
npm run preview   # preview production build
```

Node 20+ recommended.

## Project layout

```
src/
  App.tsx              # composition root — wires hooks → components
  components/          # one folder per component (CSS Module + .tsx)
  hooks/               # all state & side effects live here
  utils/               # pure helpers (audio, stats, export, tips, lofi)
  types/               # shared TypeScript types
public/                # PWA manifest, icons, service worker
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together, and [ROADMAP.md](ROADMAP.md) for what's shipped and what's next.
