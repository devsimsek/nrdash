/**
 * DataConnector – live timing service for getraceresults.com / 24H Series.
 *
 * Live timing page  : https://livetiming.getraceresults.com/24hseries#screen-results
 *
 * Protocol (reverse-engineered)
 * ─────────────────────────────
 * 1. HTTP GET  /lt/negotiate?clientProtocol=1.5&_tk=<tenantId>&_gr=w
 *    → { ConnectionToken, Url, TryWebSockets, ... }
 *
 * 2. WebSocket wss://livetiming.getraceresults.com/lt/connect
 *    ?transport=webSockets&clientProtocol=1.5&_tk=<tenantId>&_gr=w
 *    &connectionToken=<token>&tid=<rand>
 *
 * 3. HTTP GET  /lt/start?... (SignalR handshake – completes the connection)
 *
 * 4. Server pushes SignalR frames: { C, M: [[method, arg], ...] }
 *    - method "_"   → LZString.decompressFromUTF16 → JSON array of [method,arg]
 *    - method "r_l" → column header definitions
 *    - method "r_i" → initial results data
 *    - method "r_c" → incremental cell updates (format: [rowIdx, colKey, value])
 *    - method "h_h" → heat / session state update
 *
 * CORS: the server explicitly allows the devsimsek.github.io origin.
 */

import LZString from 'lz-string';

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE        = 'https://livetiming.getraceresults.com';
const TENANT_ID   = '07f2794d98ad48089a9a2c9e17e7ef6e'; // 24hseries tenant
const GROUP       = 'w';   // liveTimingWebsite subscription group
const RECONNECT_DELAY_MS = 12_000;

export const LIVE_TIMING_IFRAME_URL = `${BASE}/24hseries#screen-results`;

// ── Formatting helpers ────────────────────────────────────────────────────────

/** Format microseconds as M:SS.mmm (lap-time style). */
function formatLapTime(raw) {
  const us = parseInt(raw, 10);
  if (!us || us <= 0 || us >= 9_000_000_000_000) return '--:--.---';
  const totalMs   = us / 1000;
  const minutes   = Math.floor(totalMs / 60_000);
  const secs      = ((totalMs % 60_000) / 1000).toFixed(3).padStart(6, '0');
  return `${minutes}:${secs}`;
}

/** Format microseconds as HH:MM:SS. */
function formatHMS(raw) {
  const us = parseInt(raw, 10);
  if (!us || us < 0) return '--:--:--';
  const totalSec = Math.floor(us / 1_000_000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Flag codes sent in h_h.f  →  internal flag name used by the UI
const FLAG_MAP = {
  '-1': 'GREEN',
  '0':  'GREEN',
  '1':  'WARMUP',
  '2':  'RED',
  '3':  'YELLOW',
  '4':  'YELLOW',   // Code-60 / VSC
  '5':  'CHEQUERED',
  '6':  'GREEN',
  '7':  'YELLOW',
};

// marker column value  →  entry status for the leaderboard dot
const MARKER_STATUS = { 4: 'pit', 5: 'pit', 6: 'out', 7: 'out' };

// ── Connector factory ─────────────────────────────────────────────────────────

/**
 * Create a live-timing WebSocket connector.
 *
 * @param {object} opts
 * @param {(data: {timing, session}) => void} opts.onData   – called on every data update
 * @param {(status: string) => void}          opts.onStatus – 'connecting' | 'live' | 'offline'
 * @param {(flag: string) => void}            [opts.onFlag] – called when flag changes
 * @returns {{ start(): void, stop(): void }}
 */
export function createTimingConnector({ onData, onStatus, onFlag }) {
  let ws              = null;
  let reconnectTimer  = null;
  let stopped         = false;

  // ── In-memory state ──────────────────────────────────────────────────────
  /** Column names indexed by column-key integer, e.g. columns[0] = 'position'. */
  let columns = [];
  /** Entry data: rows[rowIdx][colName] = value */
  let rows    = {};
  /** Session / heat state from h_h messages */
  let heat    = {};

  // ── Emit helpers ─────────────────────────────────────────────────────────

  function emitData() {
    const sorted = Object.values(rows)
      .filter((r) => r.position != null && parseInt(r.position) > 0)
      .sort((a, b) => (parseInt(a.position) || 9999) - (parseInt(b.position) || 9999));

    const timing = sorted.map((r) => ({
      pos:     parseInt(r.position) || '',
      car:     String(r.startnumber ?? ''),
      team:    r['Team name'] ?? r.name ?? '',
      driver:  r.CurrentDriver ?? r.driver ?? '',
      class:   r.class ?? '',
      gap:     r.hole  ?? '',
      lastLap: formatLapTime(r.lastRoundTime),
      bestLap: formatLapTime(r.fastestRoundTime),
      tyre:    '',
      laps:    parseInt(r.fastestRoundNumber ?? 0) || 0,
      status:  MARKER_STATUS[parseInt(r.marker)] ?? 'racing',
    }));

    const elapsed   = parseInt(heat.e ?? 0);
    const timeLimit = parseInt(heat.lt ?? 0);
    const remaining = timeLimit > elapsed && elapsed > 0 ? timeLimit - elapsed : timeLimit;

    const session = heat.n
      ? {
          name:      heat.n,
          session:   'RACE',
          elapsed:   formatHMS(elapsed),
          remaining: formatHMS(remaining),
          flag:      FLAG_MAP[String(heat.f)] ?? 'GREEN',
          weather:   'DRY',
          trackTemp: '--',
          airTemp:   '--',
        }
      : null;

    onData({ timing, session });
  }

  // ── Message dispatch ──────────────────────────────────────────────────────

  function dispatch(method, arg) {
    switch (method) {
      case 'r_l': handleRaceLayout(arg);  break;
      case 'r_i': handleRaceInit(arg);    break;
      case 'r_c': handleRaceChange(arg);  break;
      case 'h_h':
      case 'h_i': handleHeatState(arg);   break;
      default:    break;
    }
  }

  function handleRaceLayout(data) {
    if (!data?.h) return;
    columns = data.h.map((h) => (h.p ? `${h.n}_${h.p}` : h.n));
  }

  function handleRaceInit(data) {
    if (!data) return;
    if (data.l) handleRaceLayout(data.l);
    rows = {};
    if (data.r?.length) handleRaceChange(data.r);
    emitData();
  }

  function handleRaceChange(updates) {
    if (!Array.isArray(updates)) return;
    for (const update of updates) {
      const rowIdx = update[0];
      const colKey = update[1];
      const value  = update[2];
      if (!rows[rowIdx]) rows[rowIdx] = {};
      const colName = columns[colKey] ?? `col${colKey}`;
      rows[rowIdx][colName] = value;
    }
    emitData();
  }

  function handleHeatState(data) {
    if (!data || typeof data !== 'object') return;
    // Iterate own keys only, excluding __proto__ to prevent prototype pollution
    for (const key of Object.keys(data)) {
      if (key !== '__proto__' && key !== 'constructor') {
        heat[key] = data[key];
      }
    }
    if (data.f !== undefined && onFlag) {
      onFlag(FLAG_MAP[String(data.f)] ?? 'GREEN');
    }
    emitData();
  }

  // ── Frame processing ──────────────────────────────────────────────────────

  function processFrame(rawData) {
    let msg;
    try { msg = JSON.parse(rawData); } catch { return; }
    if (!msg.M?.length) return;

    for (const item of msg.M) {
      const [method, arg] = item;

      if (method === '_') {
        // LZString-compressed batch of [method, arg] pairs
        let payload = arg;
        const sep = payload.lastIndexOf('::');
        if (sep !== -1) payload = payload.substring(0, sep);
        try {
          const json     = LZString.decompressFromUTF16(payload);
          const updates  = JSON.parse(json);
          // Dispatch layout before results so r_i can rely on up-to-date columns
          for (let i = 0; i < updates.length; i++) {
            dispatch(updates[i][0], updates[i][1]);
          }
        } catch (err) {
          console.warn('[LiveTiming] decompress error', err);
        }
      } else {
        dispatch(method, arg);
      }
    }
  }

  // ── Connection lifecycle ──────────────────────────────────────────────────

  async function connect() {
    if (stopped) return;
    onStatus('connecting');

    // Step 1: negotiate
    let connectionToken;
    try {
      const res = await fetch(
        `${BASE}/lt/negotiate?clientProtocol=1.5&_tk=${TENANT_ID}&_gr=${GROUP}&_=${Date.now()}`,
        { credentials: 'omit', signal: AbortSignal.timeout(10_000) },
      );
      if (!res.ok) throw new Error(`negotiate ${res.status}`);
      ({ ConnectionToken: connectionToken } = await res.json());
    } catch (err) {
      console.warn('[LiveTiming] negotiate failed', err);
      scheduleReconnect();
      return;
    }

    // Step 2: open WebSocket
    const encodedToken = encodeURIComponent(connectionToken);
    const tid          = Math.floor(Math.random() * 11);
    const wsUrl =
      `wss://livetiming.getraceresults.com/lt/connect` +
      `?transport=webSockets&clientProtocol=1.5` +
      `&_tk=${TENANT_ID}&_gr=${GROUP}` +
      `&connectionToken=${encodedToken}&tid=${tid}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = async () => {
      if (stopped) { ws.close(); return; }
      // Step 3: complete SignalR handshake (non-critical)
      try {
        await fetch(
          `${BASE}/lt/start?transport=webSockets&clientProtocol=1.5` +
          `&_tk=${TENANT_ID}&_gr=${GROUP}&connectionToken=${encodedToken}&_=${Date.now()}`,
          { credentials: 'omit', signal: AbortSignal.timeout(8_000) },
        );
      } catch { /* start failing is non-fatal */ }
      onStatus('live');
    };

    ws.onmessage = ({ data }) => processFrame(data);

    ws.onclose = () => {
      if (!stopped) scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.warn('[LiveTiming] WebSocket error', err);
    };
  }

  function scheduleReconnect() {
    if (stopped) return;
    onStatus('offline');
    reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
  }

  return {
    start() { connect(); },
    stop() {
      stopped = true;
      clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}

// ── Demo / mock helpers (opt-in via the Demo toggle in the toolbar) ───────────

import { MOCK_TIMING, MOCK_TELEMETRY, SESSION_INFO } from '../data/mockTiming';

function addSeconds(timeStr, seconds) {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    const total  = m * 60 + s + seconds;
    const nm     = Math.floor(total / 60);
    const ns     = (total % 60).toFixed(3).padStart(6, '0');
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
