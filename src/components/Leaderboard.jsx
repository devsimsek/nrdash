import { useStore } from '../store/useStore';

const CLASS_COLORS = {
  GT3: 'text-nr-green',
  GT4: 'text-nr-accent',
};

const STATUS_DOT = {
  racing: 'bg-green-500',
  pit:    'bg-yellow-400',
  out:    'bg-red-600',
};

const TYRE_COLORS = {
  S: 'bg-red-600',
  M: 'bg-yellow-400 text-black',
  H: 'bg-white text-black',
  I: 'bg-blue-400',
  W: 'bg-blue-700',
};

export default function Leaderboard() {
  const timingRows = useStore((s) => s.timingRows);
  const trackedCar = useStore((s) => s.trackedCar);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-nr-panel border-b border-nr-border">
      {/* Header */}
      <div className="px-3 py-2 border-b border-nr-border shrink-0 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-300">Leaderboard</h2>
        <span className="text-[10px] text-gray-500 font-mono">LIVE</span>
      </div>

      {/* Table */}
      <div className="overflow-y-auto flex-1 text-[11px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-nr-panel z-10">
            <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-nr-border">
              <th className="py-1.5 pl-3 text-left w-6">P</th>
              <th className="py-1.5 text-left w-8">#</th>
              <th className="py-1.5 text-left">Team / Driver</th>
              <th className="py-1.5 text-right pr-1">Lap</th>
              <th className="py-1.5 text-right pr-3">Gap</th>
            </tr>
          </thead>
          <tbody>
            {timingRows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-600">Connecting…</td>
              </tr>
            )}
            {timingRows.map((row) => {
              const isTracked = row.car === trackedCar;
              return (
                <tr
                  key={row.car}
                  className={`border-b border-nr-border/50 transition-colors
                    ${isTracked ? 'bg-nr-red/20 border-l-2 border-l-nr-red' : 'hover:bg-white/5'}
                  `}
                >
                  {/* Position */}
                  <td className="py-1.5 pl-3 font-mono font-bold text-gray-300">{row.pos}</td>

                  {/* Car number */}
                  <td className={`py-1.5 font-mono font-bold ${isTracked ? 'text-nr-red' : CLASS_COLORS[row.class] ?? 'text-white'}`}>
                    {row.car}
                  </td>

                  {/* Team + driver */}
                  <td className="py-1.5 pr-1 max-w-0 w-full">
                    <div className="flex items-center gap-1.5 truncate">
                      {/* Status dot */}
                      <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[row.status] ?? 'bg-gray-500'}`} />
                      {/* Tyre badge */}
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold shrink-0 ${TYRE_COLORS[row.tyre] ?? 'bg-gray-600 text-white'}`}>
                        {row.tyre}
                      </span>
                      <div className="truncate">
                        <p className="text-white truncate leading-none">{row.team}</p>
                        <p className="text-gray-500 truncate leading-none mt-0.5">{row.driver}</p>
                      </div>
                    </div>
                  </td>

                  {/* Last lap */}
                  <td className="py-1.5 font-mono text-gray-300 text-right pr-1 whitespace-nowrap">{row.lastLap}</td>

                  {/* Gap */}
                  <td className={`py-1.5 font-mono text-right pr-3 whitespace-nowrap ${row.pos === 1 ? 'text-nr-green font-bold' : 'text-gray-400'}`}>
                    {row.gap}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
