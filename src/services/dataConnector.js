/**
 * DataConnector – live timing service for getraceresults.com / 24H Series.
 *
 * Live timing page  : https://livetiming.getraceresults.com/24hseries#screen-results
 * API base          : https://livetiming.getraceresults.com   (endpoints discovered below)
 *
 * Strategy
 * ────────
 * 1. Poll the REST snapshot endpoint every POLL_INTERVAL ms.
 * 2. If the REST call succeeds → parse + return normalised data.
 * 3. If it fails (CORS, network, no race) → return null so the UI can
 *    show an "offline / no active race" state instead of fake data.
 *
 * NOTE: Exact endpoint paths will be confirmed once web-access is enabled
 * for the Copilot agent (see repo Settings → Copilot → Firewall).  The
 * candidate URLs below are ordered by likelihood; the first one that
 * returns a 2xx JSON response wins.
 */

// ── Endpoint candidates ───────────────────────────────────────────────────────

const BASE = 'https://livetiming.getraceresults.com';
const SERIES = '24hseries';

/** Ordered list of REST snapshot URLs to try. */
const CANDIDATE_URLS = [
  `${BASE}/api/${SERIES}/results`,
  `${BASE}/api/${SERIES}/timing`,
  `${BASE}/${SERIES}/api/results`,
  `${BASE}/${SERIES}/data.json`,
  `${BASE}/data/${SERIES}/results.json`,
];

/**
 * The iframe URL shown in the leaderboard sidebar when we cannot parse the
 * API response.  This always shows real live data from the official source.
 */
export const LIVE_TIMING_IFRAME_URL = `${BASE}/${SERIES}#screen-results`;

// ── REST fetch ────────────────────────────────────────────────────────────────

/**
 * Try each candidate URL in order; return normalised data on the first
 * successful JSON response, or null if all fail.
 */
export async function fetchTimingData() {
  for (const url of CANDIDATE_URLS) {
    try {
      const res = await fetch(url, {
        mode: 'cors',
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const normalised = normaliseTimingResponse(data);
      if (normalised) return normalised;
    } catch {
      // try next candidate
    }
  }
  return null;
}

/** Telemetry is not exposed by the public live timing feed. */
export async function fetchTelemetry() {
  return null;
}

// ── Response normaliser ───────────────────────────────────────────────────────

/**
 * Map the raw API JSON to the internal TimingData shape.
 *
 * getraceresults.com field names observed in similar series:
 *   { position, carNo, teamName, driverNames, classCode,
 *     gap, lastLapTime, bestLapTime, tyreCompound, lapsCompleted, status }
 *
 * We accept several naming variants so minor API changes don't break things.
 */
function normaliseTimingResponse(data) {
  if (!data) return null;

  const rawRows = (
    data.results   ??
    data.timing    ??
    data.entries   ??
    data.rows      ??
    data.standings ??
    []
  );

  if (!Array.isArray(rawRows) || rawRows.length === 0) return null;

  const rawSession = data.session ?? data.sessionInfo ?? data.event ?? {};

  const timing = rawRows.map((r, i) => ({
    pos:     r.position    ?? r.pos      ?? i + 1,
    car:     String(r.carNo ?? r.car ?? r.number ?? r.carNumber ?? ''),
    team:    r.teamName    ?? r.team     ?? '',
    driver:  r.driverNames ?? r.driver   ?? r.driverName ?? '',
    class:   r.classCode   ?? r.class    ?? r.carClass   ?? 'GT3',
    gap:     r.gap         ?? (i === 0 ? 'LEADER' : ''),
    lastLap: r.lastLapTime ?? r.lastLap  ?? r.last_lap   ?? '--:--.---',
    bestLap: r.bestLapTime ?? r.bestLap  ?? r.best_lap   ?? '--:--.---',
    tyre:    r.tyreCompound ?? r.tyre    ?? r.compound   ?? '',
    laps:    r.lapsCompleted ?? r.laps   ?? r.lapCount   ?? 0,
    status:  r.status      ?? 'racing',
  }));

  const session = {
    name:      rawSession.eventName   ?? rawSession.name      ?? 'Live Session',
    session:   rawSession.sessionType ?? rawSession.session   ?? rawSession.type ?? 'RACE',
    elapsed:   rawSession.elapsedTime ?? rawSession.elapsed   ?? '--:--:--',
    remaining: rawSession.remainingTime ?? rawSession.remaining ?? '--:--:--',
    flag:      rawSession.flagState   ?? rawSession.flag      ?? 'GREEN',
    weather:   rawSession.weather     ?? 'DRY',
    trackTemp: rawSession.trackTemp   ?? rawSession.track_temp ?? '--',
    airTemp:   rawSession.airTemp     ?? rawSession.air_temp  ?? '--',
  };

  return { timing, session };
}

// ── Demo / mock helpers (opt-in via the Demo toggle in the toolbar) ───────────

import { MOCK_TIMING, MOCK_TELEMETRY, SESSION_INFO } from '../data/mockTiming';

function addSeconds(timeStr, seconds) {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    const total = m * 60 + s + seconds;
    const nm = Math.floor(total / 60);
    const ns = (total % 60).toFixed(3).padStart(6, '0');
    return `${nm}:${ns}`;
  }
  return timeStr;
}

export function fetchDemoTimingData() {
  const rows = MOCK_TIMING.map((row) => ({
    ...row,
    lastLap: addSeconds(row.lastLap, (Math.random() - 0.5) * 2),
  }));
  return { timing: rows, session: SESSION_INFO };
}

export function fetchDemoTelemetry() {
  return {
    ...MOCK_TELEMETRY,
    speed:    Math.max(0,   MOCK_TELEMETRY.speed    + Math.round((Math.random() - 0.5) * 20)),
    throttle: Math.min(100, Math.max(0, MOCK_TELEMETRY.throttle + Math.round((Math.random() - 0.5) * 10))),
    brake:    Math.min(100, Math.max(0, Math.round(Math.random() * 5))),
    rpm:      Math.max(1000, MOCK_TELEMETRY.rpm     + Math.round((Math.random() - 0.5) * 400)),
  };
}
