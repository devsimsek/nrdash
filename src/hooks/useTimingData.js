import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import {
  fetchTimingData,
  fetchTelemetry,
  fetchDemoTimingData,
  fetchDemoTelemetry,
} from '../services/dataConnector';

const POLL_INTERVAL = 5000; // ms

export function useTimingData() {
  const setTimingData  = useStore((s) => s.setTimingData);
  const setTelemetry   = useStore((s) => s.setTelemetry);
  const setFlagState   = useStore((s) => s.setFlagState);
  const setDataStatus  = useStore((s) => s.setDataStatus);
  const isDemoMode     = useStore((s) => s.isDemoMode);

  // Keep a ref to the latest isDemoMode so the interval closure always
  // sees the current value without needing to be recreated.
  const demoRef = useRef(isDemoMode);
  useEffect(() => { demoRef.current = isDemoMode; }, [isDemoMode]);

  useEffect(() => {
    let mounted = true;

    async function poll() {
      if (demoRef.current) {
        // ── Demo mode: use mock data ──────────────────────────────────────
        const timing   = fetchDemoTimingData();
        const telemetry = fetchDemoTelemetry();
        if (!mounted) return;
        setTimingData(timing);
        setTelemetry(telemetry);
        if (timing.session?.flag) setFlagState(timing.session.flag);
        setDataStatus('demo');
        return;
      }

      // ── Live mode: attempt real fetch ───────────────────────────────────
      try {
        const [timing, telemetry] = await Promise.all([fetchTimingData(), fetchTelemetry()]);
        if (!mounted) return;

        if (timing) {
          setTimingData(timing);
          if (timing.session?.flag) setFlagState(timing.session.flag);
          setDataStatus('live');
        } else {
          // No data returned – clear any stale rows and go offline
          setTimingData({ timing: [], session: null });
          setDataStatus('offline');
        }

        setTelemetry(telemetry ?? null);
      } catch (err) {
        console.warn('[useTimingData] poll error', err);
        if (mounted) {
          setTimingData({ timing: [], session: null });
          setDataStatus('offline');
        }
      }
    }

    setDataStatus('connecting');
    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => { mounted = false; clearInterval(timer); };
    // Re-run only when demo mode is toggled. Zustand setters (setTimingData,
    // setTelemetry, setFlagState, setDataStatus) are stable references that
    // never change between renders, so omitting them is intentional and safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);
}
