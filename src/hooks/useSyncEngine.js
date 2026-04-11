import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

/**
 * useSyncEngine
 *
 * Manages two YouTube player refs and exposes sync actions:
 *   play(), pause(), seekTo(seconds), togglePlayPause()
 *
 * The secondary stream can have a configurable time offset
 * (secondaryOffset) to stay in sync with the primary broadcast.
 */
export function useSyncEngine() {
  const primaryRef   = useRef(null);
  const secondaryRef = useRef(null);

  const isPlaying       = useStore((s) => s.isPlaying);
  const setIsPlaying    = useStore((s) => s.setIsPlaying);
  const secondaryOffset = useStore((s) => s.secondaryOffset);

  const getPlayer = (ref) => ref?.current?.getInternalPlayer?.();

  const play = useCallback(() => {
    getPlayer(primaryRef)?.playVideo?.();
    getPlayer(secondaryRef)?.playVideo?.();
    setIsPlaying(true);
  }, [setIsPlaying]);

  const pause = useCallback(() => {
    getPlayer(primaryRef)?.pauseVideo?.();
    getPlayer(secondaryRef)?.pauseVideo?.();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const seekTo = useCallback((seconds) => {
    getPlayer(primaryRef)?.seekTo?.(seconds, true);
    getPlayer(secondaryRef)?.seekTo?.(seconds + secondaryOffset, true);
  }, [secondaryOffset]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pause(); else play();
  }, [isPlaying, play, pause]);

  return { primaryRef, secondaryRef, play, pause, seekTo, togglePlayPause, isPlaying };
}
