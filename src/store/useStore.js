import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'nrdash-state';

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Stream URLs ────────────────────────────────────────────────
      primaryVideoId: 'dQw4w9WgXcQ',
      secondaryVideoId: 'dQw4w9WgXcQ',
      setPrimaryVideoId: (id) => set({ primaryVideoId: id }),
      setSecondaryVideoId: (id) => set({ secondaryVideoId: id }),

      // ── Layout ─────────────────────────────────────────────────────
      // 'pip' | 'split' | 'single'
      layout: 'pip',
      setLayout: (layout) => set({ layout }),

      // ── Sync engine ────────────────────────────────────────────────
      isPlaying: false,
      setIsPlaying: (v) => set({ isPlaying: v }),
      secondaryOffset: 0,   // seconds offset for secondary vs primary
      setSecondaryOffset: (v) => set({ secondaryOffset: v }),

      // ── Timing data ────────────────────────────────────────────────
      timingRows: [],
      sessionInfo: null,
      setTimingData: ({ timing, session }) => set({ timingRows: timing, sessionInfo: session }),

      // ── Telemetry ──────────────────────────────────────────────────
      telemetry: null,
      setTelemetry: (t) => set({ telemetry: t }),

      // ── Tracked car ────────────────────────────────────────────────
      trackedCar: '3',
      setTrackedCar: (n) => set({ trackedCar: n }),

      // ── Flags ──────────────────────────────────────────────────────
      flagState: 'GREEN',
      setFlagState: (f) => set({ flagState: f }),

      // ── Data status ────────────────────────────────────────────────
      // 'connecting' | 'live' | 'offline' | 'demo'
      dataStatus: 'connecting',
      setDataStatus: (s) => set({ dataStatus: s }),

      // ── Demo mode ──────────────────────────────────────────────────
      isDemoMode: false,
      setDemoMode: (v) => set({ isDemoMode: v }),
    }),
    {
      name: STORAGE_KEY,
      partialState: ({ primaryVideoId, secondaryVideoId, layout, secondaryOffset, trackedCar }) => ({
        primaryVideoId, secondaryVideoId, layout, secondaryOffset, trackedCar,
      }),
    }
  )
);
