import YouTube from 'react-youtube';
import { forwardRef, useEffect } from 'react';

/**
 * StreamPlayer
 *
 * Props:
 *   videoId  – YouTube video ID
 *   label    – "PRIMARY" | "ONBOARD" etc.
 *   playerRef – ref forwarded from parent (react-youtube ref)
 *   onReady  – callback(event)
 *   className – extra Tailwind classes
 */
const StreamPlayer = forwardRef(function StreamPlayer({ videoId, label, onReady, className = '' }, ref) {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      origin: window.location.origin,
    },
  };

  return (
    <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Label badge */}
      <span className="absolute top-2 left-2 z-10 text-xs font-mono font-bold px-2 py-0.5 bg-nr-red text-white rounded uppercase tracking-widest shadow">
        {label}
      </span>

      {/* YouTube embed */}
      <YouTube
        ref={ref}
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        className="yt-wrapper absolute inset-0 w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
});

export default StreamPlayer;
