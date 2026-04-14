import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import {
  createTimingConnector,
  fetchDemoTimingData,
  fetchDemoTelemetry,
} from '../services/dataConnector';

const DEMO_INTERVAL_MS = 5000;

export function useTimingData() {
  const setTimingData = useStore((s) => s.setTimingData);
  const setTelemetry  = useStore((s) => s.setTelemetry);
  const setFlagState  = useStore((s) => s.setFlagState);
  const setDataStatus = useStore((s) => s.setDataStatus);
  const isDemoMode    = useStore((s) => s.isDemoMode);

  // ── Live WebSocket connector ────────────────────────────────────────────
  useEffect(() => {
    if (isDemoMode) return;

    const connector = createTimingConnector({
      onData: ({ timing, session }) => {
        setTimingData({ timing, session });
        if (session?.flag) setFlagState(session.flag);
      },
      onStatus: setDataStatus,
      onFlag:   setFlagState,
    });

    connector.start();
    return () => connector.stop();
    // Zustand setters are stable references – omitting them is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  // ── Demo mode polling ───────────────────────────────────────────────────
  const demoRef = useRef(isDemoMode);
  useEffect(() => { demoRef.current = isDemoMode; }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) return;

    function pollDemo() {
      const timing    = fetchDemoTimingData();
      const telemetry = fetchDemoTelemetry();
      setTimingData(timing);
      setTelemetry(telemetry);
      if (timing.session?.flag) setFlagState(timing.session.flag);
      setDataStatus('demo');
    }

    pollDemo();
    const timer = setInterval(pollDemo, DEMO_INTERVAL_MS);
    return () => {
      clearInterval(timer);
      // Clear stale demo rows when leaving demo mode
      setTimingData({ timing: [], session: null });
      setDataStatus('offline');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);
}
