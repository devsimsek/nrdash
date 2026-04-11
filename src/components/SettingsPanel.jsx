import { useState } from 'react';
import { useStore } from '../store/useStore';

/**
 * SettingsPanel – slide-in panel for configuring stream URLs and tracked car.
 */
export default function SettingsPanel({ isOpen, onClose }) {
  const primaryVideoId    = useStore((s) => s.primaryVideoId);
  const secondaryVideoId  = useStore((s) => s.secondaryVideoId);
  const setPrimaryVideoId = useStore((s) => s.setPrimaryVideoId);
  const setSecondaryVideoId = useStore((s) => s.setSecondaryVideoId);
  const trackedCar        = useStore((s) => s.trackedCar);
  const setTrackedCar     = useStore((s) => s.setTrackedCar);

  const [primaryDraft, setPrimaryDraft]     = useState(primaryVideoId);
  const [secondaryDraft, setSecondaryDraft] = useState(secondaryVideoId);
  const [carDraft, setCarDraft]             = useState(trackedCar);

  function parseVideoId(input) {
    // Accept full URL or bare ID
    const match = input.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : input.trim();
  }

  function handleApply() {
    setPrimaryVideoId(parseVideoId(primaryDraft));
    setSecondaryVideoId(parseVideoId(secondaryDraft));
    setTrackedCar(carDraft.trim());
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-nr-panel border border-nr-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Stream Settings</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Primary stream */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Primary Stream (YouTube URL or ID)</label>
          <input
            type="text"
            value={primaryDraft}
            onChange={(e) => setPrimaryDraft(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
            className="w-full bg-nr-dark border border-nr-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-nr-red"
          />
        </div>

        {/* Secondary stream */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Onboard Stream (YouTube URL or ID)</label>
          <input
            type="text"
            value={secondaryDraft}
            onChange={(e) => setSecondaryDraft(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
            className="w-full bg-nr-dark border border-nr-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-nr-red"
          />
        </div>

        {/* Tracked car */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Tracked Car #</label>
          <input
            type="text"
            value={carDraft}
            onChange={(e) => setCarDraft(e.target.value)}
            placeholder="3"
            className="w-full bg-nr-dark border border-nr-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-nr-red"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleApply}
            className="flex-1 py-2 bg-nr-red hover:bg-red-700 text-white text-sm font-bold rounded transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-nr-border hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
