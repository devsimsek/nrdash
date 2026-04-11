import { useStore } from '../store/useStore';

/**
 * SyncControls – transport bar at the bottom.
 * Exposes play/pause/seek and per-stream offset adjuster.
 */
export default function SyncControls({ onPlay, onPause, onSeek, isPlaying }) {
  const secondaryOffset    = useStore((s) => s.secondaryOffset);
  const setSecondaryOffset = useStore((s) => s.setSecondaryOffset);

  function handleOffsetChange(delta) {
    setSecondaryOffset(secondaryOffset + delta);
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-nr-panel border-t border-nr-border shrink-0 select-none">
      {/* Play / Pause */}
      <div className="flex items-center gap-2">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-nr-red hover:bg-red-700 text-white font-bold text-sm transition-colors shadow"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* Seek nudge */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSeek(-30)}
          className="px-2 py-1 text-xs bg-nr-border hover:bg-gray-700 rounded text-gray-300 transition-colors"
          title="Seek -30s (←)"
        >
          ◀◀ 30s
        </button>
        <button
          onClick={() => onSeek(-10)}
          className="px-2 py-1 text-xs bg-nr-border hover:bg-gray-700 rounded text-gray-300 transition-colors"
          title="Seek -10s (←)"
        >
          ◀ 10s
        </button>
        <button
          onClick={() => onSeek(10)}
          className="px-2 py-1 text-xs bg-nr-border hover:bg-gray-700 rounded text-gray-300 transition-colors"
          title="Seek +10s (→)"
        >
          10s ▶
        </button>
        <button
          onClick={() => onSeek(30)}
          className="px-2 py-1 text-xs bg-nr-border hover:bg-gray-700 rounded text-gray-300 transition-colors"
          title="Seek +30s (→)"
        >
          30s ▶▶
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-nr-border" />

      {/* Secondary stream offset */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase text-gray-500 tracking-wider">OB Offset</span>
        <button
          onClick={() => handleOffsetChange(-1)}
          className="w-6 h-6 text-xs bg-nr-border hover:bg-gray-700 rounded text-gray-300 transition-colors"
        >
          −
        </button>
        <span className="font-mono text-xs text-nr-green min-w-[40px] text-center">
          {secondaryOffset >= 0 ? '+' : ''}{secondaryOffset}s
        </span>
        <button
          onClick={() => handleOffsetChange(1)}
          className="w-6 h-6 text-xs bg-nr-border hover:bg-gray-700 rounded text-gray-300 transition-colors"
        >
          +
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Keyboard hint */}
      <span className="hidden sm:block text-[10px] text-gray-600">
        Space = play/pause &nbsp;·&nbsp; ← / → = ±10 s
      </span>
    </div>
  );
}
