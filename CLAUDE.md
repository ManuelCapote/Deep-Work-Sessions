# CLAUDE.md — AI agent instructions for TE Pomodoro

## Project in one line
A client-only React 19 + Vite Pomodoro PWA. No backend, no router, no UI library. State lives in hooks and `localStorage`.

## About the owner
Alejandro is learning React (coming from Vue) by building this app. When explaining code, favor:
- **Logic/hook concepts** over component markup.
- **Vue → React analogies** where useful (e.g. `ref` → `useState`, `computed` → `useMemo`, `watch` → `useEffect`).
- Building things hands-on rather than abstract theory.

## Commands
- `npm run dev` — dev server (Vite, HMR)
- `npm run build` — `tsc -b && vite build` (typecheck is part of build)
- `npm run lint` — ESLint
- `npm run preview` — serve the built `dist/`

Always run `npm run build` before declaring a task done — it's the source of truth for type errors.

## Conventions
- **One folder per component** under `src/components/ComponentName/` with a `.tsx` + `.module.css`.
- **CSS Modules only** — no Tailwind, no styled-components, no global styles beyond `index.css` / `App.css`.
- **All state lives in hooks** under `src/hooks/`. Components should be as dumb as possible — props in, JSX out.
- **Persistence** is `localStorage`, read/written inside the relevant hook (e.g. `useSettings`, `useSessions`). Don't touch `localStorage` from components.
- **Types** shared across files go in `src/types/`. Component-local types stay in the component file.
- **Pure helpers** (no React) go in `src/utils/`.

## Patterns to follow
- Prefer `useCallback` / `useMemo` when passing handlers into memoized children or effect deps.
- Apply theme / side effects on `document` inside `useEffect` (see `App.tsx` for the pattern).
- When adding a new feature, ask: *does this need a new hook, or does it extend an existing one?* Usually the answer is "extend."

## Things to avoid
- **Don't add dependencies** without asking. The app is deliberately minimal (React + React DOM only).
- **Don't introduce a router, state library, or backend.** Tabs are just `useState`.
- **Don't write tests** unless asked — there's no test setup yet.
- **Don't create docs files** (`.md`) unless the user asks. Keep README / ARCHITECTURE / ROADMAP current instead of sprouting new ones.
- **Don't add comments** that just describe what the code does. Only explain non-obvious *why*.

## Before finishing a task
1. `npm run build` must pass.
2. If you changed UX, mention what to manually verify (you can't run a browser).
3. Update `ROADMAP.md` if you completed or added a roadmap item.
