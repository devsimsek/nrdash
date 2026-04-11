import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { fetchTimingData, fetchTelemetry } from '../services/dataConnector';

const POLL_INTERVAL = 5000; // ms

export function useTimingData() {
  const setTimingData = useStore((s) => s.setTimingData);
  const setTelemetry  = useStore((s) => s.setTelemetry);
  const setFlagState  = useStore((s) => s.setFlagState);

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const [timing, telemetry] = await Promise.all([fetchTimingData(), fetchTelemetry()]);
        if (!mounted) return;
        setTimingData(timing);
        setTelemetry(telemetry);
        if (timing.session?.flag) setFlagState(timing.session.flag);
      } catch (err) {
        console.warn('[useTimingData] poll error', err);
      }
    }

    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => { mounted = false; clearInterval(timer); };
  }, [setTimingData, setTelemetry, setFlagState]);
}
