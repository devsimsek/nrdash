/**
 * DataConnector – live timing fetch service.
 *
 * Attempts to fetch real session data from the live timing endpoint.
 * Returns null when no race is active or the endpoint is unreachable,
 * so the UI can display an appropriate "no active race" state.
 *
 * Live timing source: https://livetiming.raceresults.nu/livetiming/
 * The endpoint below should be updated to the race-specific JSON feed
 * before each event (e.g. https://livetiming.raceresults.nu/livetiming/data.json).
 */

export const LIVE_TIMING_URL = 'https://livetiming.raceresults.nu/livetiming/data.json';

// ── Real fetch ────────────────────────────────────────────────────────────────

/**
 * Fetch live timing data from the configured endpoint.
 * Returns { timing, session } on success, or null when unavailable.
 */
export async function fetchTimingData() {
  try {
    const res = await fetch(LIVE_TIMING_URL, { mode: 'cors', signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    // Normalise the response – adapt field names from the actual API shape
    return normaliseTimingResponse(data);
  } catch {
    return null;
  }
}

/**
 * Fetch telemetry for the tracked car.
 * Returns null when unavailable.
 */
export async function fetchTelemetry() {
  // Telemetry is not available from the public live timing feed
  return null;
}

// ── Response normaliser ───────────────────────────────────────────────────────

/**
 * Convert raw API JSON into the shape the store expects.
 * Adjust field mappings once the real API response shape is known.
 */
function normaliseTimingResponse(data) {
  if (!data || (!data.timing && !data.entries && !data.rows)) return null;

  const rawRows = data.timing ?? data.entries ?? data.rows ?? [];
  const rawSession = data.session ?? data.sessionInfo ?? {};

  const timing = rawRows.map((r, i) => ({
    pos:     r.pos      ?? r.position    ?? i + 1,
    car:     String(r.car ?? r.number ?? r.carNumber ?? ''),
    team:    r.team     ?? r.teamName    ?? '',
    driver:  r.driver   ?? r.driverName  ?? '',
    class:   r.class    ?? r.carClass    ?? 'GT3',
    gap:     r.gap      ?? (i === 0 ? 'LEADER' : ''),
    lastLap: r.lastLap  ?? r.last_lap    ?? '--:--.---',
    bestLap: r.bestLap  ?? r.best_lap    ?? '--:--.---',
    tyre:    r.tyre     ?? r.compound    ?? '',
    laps:    r.laps     ?? r.lapCount    ?? 0,
    status:  r.status   ?? 'racing',
  }));

  const session = {
    name:      rawSession.name       ?? rawSession.eventName ?? 'Live Session',
    session:   rawSession.session    ?? rawSession.type      ?? 'RACE',
    elapsed:   rawSession.elapsed    ?? rawSession.elapsedTime ?? '--:--:--',
    remaining: rawSession.remaining  ?? rawSession.remainingTime ?? '--:--:--',
    flag:      rawSession.flag       ?? rawSession.flagState  ?? 'GREEN',
    weather:   rawSession.weather    ?? 'DRY',
    trackTemp: rawSession.trackTemp  ?? rawSession.track_temp ?? '--',
    airTemp:   rawSession.airTemp    ?? rawSession.air_temp   ?? '--',
  };

  return { timing, session };
}

// ── Demo / mock helpers (opt-in via UI toggle) ────────────────────────────────

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
