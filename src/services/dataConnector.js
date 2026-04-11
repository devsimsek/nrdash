/**
 * DataConnector – scraper/polling service.
 *
 * In production this would call a backend relay (Node.js + Cheerio/Puppeteer)
 * that scrapes https://livetiming.raceresults.nu/livetiming/ and exposes a
 * clean JSON endpoint at /api/timing.
 *
 * For now it returns mock data with realistic delta simulation.
 */

import { MOCK_TIMING, MOCK_TELEMETRY, SESSION_INFO } from '../data/mockTiming';

// Tiny delta so the leaderboard looks "live" on each poll
let tick = 0;

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

export async function fetchTimingData() {
  tick++;
  // Simulate some lap-time variance
  const rows = MOCK_TIMING.map((row) => ({
    ...row,
    lastLap: addSeconds(row.lastLap, (Math.random() - 0.5) * 2),
  }));
  return { timing: rows, session: SESSION_INFO };
}

export async function fetchTelemetry() {
  return {
    ...MOCK_TELEMETRY,
    speed: Math.max(0, MOCK_TELEMETRY.speed + Math.round((Math.random() - 0.5) * 20)),
    throttle: Math.min(100, Math.max(0, MOCK_TELEMETRY.throttle + Math.round((Math.random() - 0.5) * 10))),
    brake: Math.min(100, Math.max(0, Math.round(Math.random() * 5))),
    rpm: Math.max(1000, MOCK_TELEMETRY.rpm + Math.round((Math.random() - 0.5) * 400)),
  };
}
