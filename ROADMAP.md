# Roadmap

## Shipped

### Phase 0 — Foundation
- Vite + React 19 + TypeScript scaffold
- Core pomodoro timer (work / short break / long break)
- Responsive layout (portrait + landscape), planning tab

### Phase 1 — Polish & Core UX
- Mode selector, controls, session counter
- Theme (light / dark / auto)
- Keyboard shortcuts
- Browser notifications on timer completion

### Phase 2 — Analytics & Insights
- Stats view with daily goal tracking
- Session aggregations (`utils/stats.ts`)

### Phase 3 — Productivity features
- Active + archived work sessions with todos
- Tags, notes, distractions log
- Planning view → start session from plan
- Session export

### Phase 4 — PWA, branding, offline
- Web App Manifest, icons
- Service worker (offline-capable)
- Brand/logo, installable on iOS + Android + desktop

### Phase 5 — Lo-fi beats, sound mixing, tips, focus mode
- Tick sound, ambient noise, lo-fi mixes
- Master + tick volume controls
- Rotating focus tips while running
- Focus mode (hide UI while timer runs)
- Onboarding overlay

### Phase 6 — Responsive layout overhaul (2026-04-12)
- Width-based responsive tiers replacing orientation-only breakpoints:
  phone (< 720px) → tablet portrait (720–819px, 600px column) → two-column
  layout (≥ 820px, up to 1100px) → large desktop (≥ 1200px, up to 1200px).
- Desktop card no longer capped at 900×580 — grows to the right pane's
  natural content height, up to 92–94vh.
- Switched the two-column layout from CSS Grid with a fixed card height to
  `display: flex; flex-wrap: wrap; align-content: flex-start`. The third
  flex line sizes to max(left, right) content, so the card height equals
  the right pane's content. The left pane stretches to match via default
  `align-items: stretch`.
- TimerDisplay now grows via `flex: 1` inside the left pane — big centered
  timer on desktop, clamped at `clamp(64px, 8vw, 112px)`.
- Fixed SoundControls ambient grid: LO-FI (alone in row 4 of a 10-item,
  3-column grid) was missing 2/3 of its top border. Old
  `:nth-last-child(-n+3)` was stripping bottom borders from FIRE and
  BINARL in row 3; replaced with `:last-child` which only targets LO-FI.
- Project documentation overhaul: replaced the stock Vite README with a
  real one, added CLAUDE.md (agent instructions), ARCHITECTURE.md (hook +
  component map), and this ROADMAP.md.
- UI/UX audit produced during this phase identified further gaps (type
  scale in rem, focus-visible styles, touch-target sizes, safe-area
  insets, `prefers-reduced-motion`) — captured in "Next up" below.

## Next up (ideas — not committed)

### Accessibility & polish (from Phase 6 audit)
- [ ] Migrate type sizes to `rem` with a scale + 11px minimum
- [ ] Global `:focus-visible` outline for keyboard users
- [ ] Grow icon buttons (gear, close, todo delete) to 44×44 touch targets
- [ ] `prefers-reduced-motion` escape hatch for timer pulse + digit slide
- [ ] Safe-area insets (`env(safe-area-inset-*)`) for iOS notch/home bar
- [ ] `color-scheme: light dark` + dynamic `theme-color` meta for dark mode
- [ ] Remove nested scroll in `SessionsView` archive list
- [ ] Fluid noise grid (`repeat(auto-fit, minmax(…))`) replacing fixed 3-col

### Features
- [ ] Data export/import (JSON) for sessions + settings backup
- [ ] More granular stats (weekly / monthly / by tag)
- [ ] Custom ambient sound upload
- [ ] Session templates (save a plan as a reusable template)
- [ ] Tests — at least for the hooks (`useTimer`, `useSessions`, `usePlanning`)

## Known gaps
- No automated tests
- `v1.0` shown in the header while `package.json` is at `0.4.0` — decide which is canonical
- Broken reference: `index.html` links `/apple-touch-icon.png` but only the `.svg` exists
- SoundControls ambient grid border rules assume a fixed 10-item `NOISE_OPTIONS`; adding/removing options changes the last-row count and may require revisiting `:last-child` logic

## Version history
- `0.4.0` — current; Phases 0–6 complete
