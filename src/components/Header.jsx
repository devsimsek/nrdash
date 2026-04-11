import { useStore } from '../store/useStore';

const FLAG_COLORS = {
  GREEN:  'bg-green-500',
  YELLOW: 'bg-yellow-400 animate-pulse-fast',
  RED:    'bg-nr-red animate-pulse-fast',
  SC:     'bg-yellow-400',
  VSC:    'bg-yellow-300',
  WHITE:  'bg-white',
  CHEQUERED: 'bg-gradient-to-r from-black via-white to-black',
};

export default function Header() {
  const sessionInfo = useStore((s) => s.sessionInfo);
  const flagState   = useStore((s) => s.flagState);

  const info = sessionInfo ?? {
    name: 'ADAC TOTAL 24h-Rennen Nürburgring',
    session: 'RACE',
    elapsed: '--:--:--',
    remaining: '--:--:--',
    flag: 'GREEN',
    weather: '--',
    trackTemp: '--',
    airTemp: '--',
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-nr-panel border-b border-nr-border select-none shrink-0">
      {/* Left: race name */}
      <div className="flex items-center gap-3">
        {/* Flag indicator */}
        <span className={`inline-block w-3 h-5 rounded-sm ${FLAG_COLORS[info.flag] ?? 'bg-gray-500'}`} title={`${info.flag} flag`} />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest leading-none">{info.session}</p>
          <h1 className="text-sm font-bold text-white leading-tight truncate max-w-xs">{info.name}</h1>
        </div>
      </div>

      {/* Centre: timers */}
      <div className="flex gap-6 text-center">
        <div>
          <p className="text-[10px] uppercase text-gray-500 leading-none">Elapsed</p>
          <p className="font-mono text-sm text-nr-green font-semibold">{info.elapsed}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-500 leading-none">Remaining</p>
          <p className="font-mono text-sm text-nr-accent font-semibold">{info.remaining}</p>
        </div>
      </div>

      {/* Right: weather */}
      <div className="flex gap-4 text-right text-xs text-gray-400">
        <span>🌡 Track <span className="text-white">{info.trackTemp}°C</span></span>
        <span>🌤 Air <span className="text-white">{info.airTemp}°C</span></span>
        <span className="uppercase tracking-wide text-nr-green">{info.weather}</span>
      </div>
    </header>
  );
}
