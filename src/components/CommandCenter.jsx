import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { useSyncEngine } from '../hooks/useSyncEngine';
import { useTimingData } from '../hooks/useTimingData';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import Header from './Header';
import StreamPlayer from './StreamPlayer';
import Leaderboard from './Leaderboard';
import TelemetryWidget from './TelemetryWidget';
import SyncControls from './SyncControls';
import SettingsPanel from './SettingsPanel';

const LAYOUT_LABELS = {
  pip:    '⧉ PiP',
  split:  '⊞ Split',
  single: '◻ Single',
};

export default function CommandCenter() {
  // Bootstrap timing data polling
  useTimingData();

  const layout            = useStore((s) => s.layout);
  const setLayout         = useStore((s) => s.setLayout);
  const primaryVideoId    = useStore((s) => s.primaryVideoId);
  const secondaryVideoId  = useStore((s) => s.secondaryVideoId);
  const secondaryOffset   = useStore((s) => s.secondaryOffset);

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync engine
  const { primaryRef, secondaryRef, play, pause, seekTo, togglePlayPause, isPlaying } = useSyncEngine();

  // Keyboard shortcuts
  useKeyboardShortcuts({ togglePlayPause, seekTo: (delta) => {
    const p = primaryRef?.current?.getInternalPlayer?.();
    if (p) {
      const t = p.getCurrentTime?.() ?? 0;
      seekTo(Math.max(0, t + delta));
    }
  }});

  // Expose primary player globally for keyboard seek
  function onPrimaryReady(e) {
    window.__nrdash_primaryPlayer = e.target;
  }

  // ── Layout rendering helpers ─────────────────────────────────────
  function renderStreams() {
    if (layout === 'single') {
      return (
        <div className="relative w-full h-full">
          <StreamPlayer ref={primaryRef} videoId={primaryVideoId} label="Primary" onReady={onPrimaryReady} />
        </div>
      );
    }

    if (layout === 'split') {
      return (
        <div className="grid grid-cols-2 gap-2 w-full h-full">
          <StreamPlayer ref={primaryRef} videoId={primaryVideoId} label="Primary" onReady={onPrimaryReady} />
          <StreamPlayer ref={secondaryRef} videoId={secondaryVideoId} label="Onboard" />
        </div>
      );
    }

    // PiP (default)
    return (
      <div className="relative w-full h-full">
        <StreamPlayer ref={primaryRef} videoId={primaryVideoId} label="Primary" onReady={onPrimaryReady} />
        {/* PiP overlay – bottom-right */}
        <div className="absolute bottom-3 right-3 w-1/3 aspect-video z-20 shadow-2xl border border-nr-border rounded-lg overflow-hidden">
          <StreamPlayer ref={secondaryRef} videoId={secondaryVideoId} label="Onboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-nr-dark overflow-hidden">
      {/* Top header bar */}
      <Header />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-nr-panel border-b border-nr-border shrink-0">
        {/* Layout toggles */}
        <div className="flex gap-1">
          {(['pip', 'split', 'single']).map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`px-3 py-1 text-xs rounded font-mono transition-colors
                ${layout === l ? 'bg-nr-red text-white' : 'bg-nr-border text-gray-400 hover:bg-gray-700'}
              `}
            >
              {LAYOUT_LABELS[l]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="px-3 py-1 text-xs bg-nr-border text-gray-300 hover:bg-gray-700 rounded transition-colors"
        >
          ⚙ Settings
        </button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Stream area */}
        <div className="flex-1 p-2 overflow-hidden">
          {renderStreams()}
        </div>

        {/* Sidebar */}
        <aside className="w-72 shrink-0 flex flex-col border-l border-nr-border overflow-hidden">
          {/* Leaderboard takes remaining height */}
          <div className="flex-1 overflow-hidden">
            <Leaderboard />
          </div>

          {/* Telemetry at the bottom */}
          <div className="border-t border-nr-border shrink-0 overflow-y-auto">
            <TelemetryWidget />
          </div>
        </aside>
      </div>

      {/* Bottom sync controls */}
      <SyncControls
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onSeek={(delta) => {
          const p = primaryRef?.current?.getInternalPlayer?.();
          const t = p?.getCurrentTime?.() ?? 0;
          seekTo(Math.max(0, t + delta));
        }}
      />

      {/* Settings modal */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
