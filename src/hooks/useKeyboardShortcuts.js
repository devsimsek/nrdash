import { useEffect } from 'react';

/**
 * useKeyboardShortcuts
 * Space     → play/pause
 * ArrowLeft → seek -10 s
 * ArrowRight→ seek +10 s
 */
export function useKeyboardShortcuts({ togglePlayPause, seekTo }) {
  useEffect(() => {
    function handleKey(e) {
      // Ignore when typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const p = window.__nrdash_primaryPlayer;
        if (p) {
          const t = p.getCurrentTime?.() ?? 0;
          seekTo(Math.max(0, t - 10));
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const p = window.__nrdash_primaryPlayer;
        if (p) {
          const t = p.getCurrentTime?.() ?? 0;
          seekTo(t + 10);
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlayPause, seekTo]);
}
