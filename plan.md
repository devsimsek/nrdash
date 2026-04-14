# NRDash – 4-Phase Execution Plan

## Phase 1 – Project Setup
- [x] Initialise Git repository
- [x] Create documentation (skills.md, plan.md, memory.md)
- [x] Scaffold React + Vite project at repository root
- [x] Install Tailwind CSS and configure `tailwind.config.js`
- [x] Install `react-youtube`, `zustand`, `axios`
- [x] Set up ESLint + Prettier

## Phase 2 – UI Layout (Command Center)
- [x] Design base dark-theme layout with Tailwind
- [x] Build `<CommandCenter>` root component with CSS Grid
  - Main stream area (left / top, ~70 % width)
  - Sidebar (right / bottom, ~30 % width)
- [x] Build `<StreamPlayer>` wrapping YouTube IFrame API
  - Expose `play()`, `pause()`, `seekTo(seconds)` via ref/callback
  - Show stream label, connection status badge
- [x] Build PiP overlay: secondary stream floats over primary (draggable)
- [x] Build split-view grid: primary and secondary side-by-side
- [x] Toggle button between PiP and split-view modes
- [x] `<Leaderboard>` sidebar component – table with position, car #, driver, gap, last lap
- [x] `<TelemetryWidget>` – speed, gear, throttle bar, brake bar, tyre compound badges
- [x] `<Header>` – race name, session type, clock, flags

## Phase 3 – Data Integration
- [x] Define `TimingData` TypeScript interface (position, car, driver, gap, bestLap, lastLap, tyre)
- [x] Implement `useTimingData` hook – polls `/api/timing` every 5 s via Axios
- [x] Implement `DataConnector` service (Node.js scraper)
  - Fetch 24h-Rennen live-timing JSON (`https://livetiming.raceresults.nu/…`)
  - Parse JSON into `TimingData[]`
  - Expose `GET /api/timing` endpoint via Express
  - Schedule polling every 5 s with `node-schedule`
- [x] Fallback: serve mock/fixture data when race is not live
- [x] Wire `useTimingData` into `<Leaderboard>` and `<TelemetryWidget>`
- [x] Display car #3 (MV3) highlighted row in leaderboard

## Phase 4 – Sync Logic
- [x] Build `useSyncEngine` hook
  - Holds refs to both YouTube player instances
  - `syncAll(action, payload)` broadcasts play/pause/seek to both players
  - Compensates for per-stream offset (configurable delta in seconds)
- [x] `<SyncControls>` transport bar
  - Global Play / Pause / Seek slider
  - Per-stream offset adjuster (±60 s)
  - Live / VOD mode indicator
- [x] Keyboard shortcuts (Space = play/pause, ← / → = ±10 s seek)
- [x] Persist offset and last stream URLs to `localStorage`
- [x] End-to-end smoke test: open dashboard, toggle layout, seek both streams
