# NRDash – Project Memory / State Log

## Car of Interest
| Field         | Value                              |
|---------------|------------------------------------|
| Car Number    | #3                                 |
| Team Code     | MV3                                |
| Full Team     | Manthey EMA                        |
| Class         | GT3                                |
| Driver(s)     | TBC per race entry list            |

## Session Types
| Code | Description              |
|------|--------------------------|
| FP1  | Free Practice 1          |
| FP2  | Free Practice 2          |
| QF   | Qualifying                |
| WU   | Warm-Up                  |
| RACE | Race (24 h endurance)    |

## Stream URLs
| Label          | YouTube Video ID  | Notes                        |
|----------------|-------------------|------------------------------|
| Primary (Main) | `dQw4w9WgXcQ`     | Replace with live broadcast  |
| Secondary (OB) | `dQw4w9WgXcQ`     | Replace with onboard feed    |

> **Update these IDs** before each session from the official ADAC Motorsport YouTube channel.

## Data Sources
| Source                            | URL / Endpoint                                      | Format |
|-----------------------------------|-----------------------------------------------------|--------|
| 24h-Rennen Live Timing            | https://livetiming.raceresults.nu/livetiming/       | JSON   |
| ADAC Motorsport YouTube Channel   | https://www.youtube.com/@ADACMotorsport              | –      |

## Phase Status
| Phase | Status     | Notes                                    |
|-------|------------|------------------------------------------|
| 1     | ✅ Done    | Repo scaffolded, docs created            |
| 2     | ✅ Done    | All UI components implemented            |
| 3     | ✅ Done    | Data integration complete (mock + live)  |
| 4     | ✅ Done    | Sync engine, keyboard shortcuts, localStorage |

## Change Log
| Date       | Change                                      |
|------------|---------------------------------------------|
| 2026-04-11 | Repository initialised; skills/plan/memory created |
| 2026-04-11 | React + Vite project scaffolded             |
| 2026-04-11 | CommandCenter, StreamPlayer, Leaderboard, TelemetryWidget, SyncControls implemented |
| 2026-04-11 | DataConnector mock service + useTimingData hook |
| 2026-04-11 | useSyncEngine, keyboard shortcuts, localStorage persistence |
| 2026-04-14 | Fixed CI build: updated Node.js 18 → 20 in GitHub Actions workflow (vite v8 requires Node 20.19+) |
