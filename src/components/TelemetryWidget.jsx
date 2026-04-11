import { useStore } from '../store/useStore';

function Bar({ value, max = 100, colorClass }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-150 ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TyreBadge({ pos, temp }) {
  const color = temp >= 95 ? 'text-red-400' : temp >= 80 ? 'text-yellow-400' : 'text-nr-green';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] text-gray-500 uppercase">{pos}</span>
      <span className={`font-mono text-xs font-bold ${color}`}>{temp}°</span>
    </div>
  );
}

export default function TelemetryWidget() {
  const telemetry = useStore((s) => s.telemetry);
  const trackedCar = useStore((s) => s.trackedCar);

  if (!telemetry) {
    return (
      <div className="p-4 text-xs text-gray-600 text-center">
        Telemetry unavailable
      </div>
    );
  }

  const { speed, gear, rpm, throttle, brake, tyreTempFL, tyreTempFR, tyreTempRL, tyreTempRR, fuelLoad, lapTime, sector } = telemetry;

  return (
    <div className="bg-nr-panel p-3 space-y-3 text-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-nr-border pb-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-300">Telemetry</h2>
        <span className="font-mono text-nr-red font-bold">#{trackedCar}</span>
      </div>

      {/* Speed + Gear */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase leading-none">Speed</p>
          <p className="font-mono text-2xl font-bold text-white leading-none">{speed}</p>
          <p className="text-[10px] text-gray-500">km/h</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase leading-none">Gear</p>
          <p className="font-mono text-4xl font-bold text-nr-green leading-none">{gear}</p>
        </div>
      </div>

      {/* RPM */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase">RPM</span>
          <span className="font-mono text-[10px] text-gray-300">{rpm.toLocaleString()}</span>
        </div>
        <Bar value={rpm} max={9000} colorClass="bg-nr-green" />
      </div>

      {/* Throttle */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase">Throttle</span>
          <span className="font-mono text-[10px] text-nr-green">{throttle}%</span>
        </div>
        <Bar value={throttle} colorClass="bg-nr-green" />
      </div>

      {/* Brake */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase">Brake</span>
          <span className="font-mono text-[10px] text-nr-red">{brake}%</span>
        </div>
        <Bar value={brake} colorClass="bg-nr-red" />
      </div>

      {/* Tyre temps */}
      <div>
        <p className="text-[10px] text-gray-500 uppercase mb-2">Tyre Temps (°C)</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <TyreBadge pos="FL" temp={tyreTempFL} />
          <TyreBadge pos="FR" temp={tyreTempFR} />
          <TyreBadge pos="RL" temp={tyreTempRL} />
          <TyreBadge pos="RR" temp={tyreTempRR} />
        </div>
      </div>

      {/* Fuel + Lap */}
      <div className="flex items-center justify-between border-t border-nr-border pt-2">
        <div>
          <p className="text-[10px] text-gray-500 uppercase">Fuel</p>
          <p className="font-mono text-sm font-bold text-nr-accent">{fuelLoad.toFixed(1)} L</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase">Lap Time</p>
          <p className="font-mono text-sm font-bold text-white">{lapTime}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase">Sector</p>
          <p className="font-mono text-sm font-bold text-nr-green">S{sector}</p>
        </div>
      </div>
    </div>
  );
}
