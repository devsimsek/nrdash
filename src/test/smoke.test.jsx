/**
 * Smoke test – NRDash Command Center
 *
 * Verifies:
 *   1. Dashboard renders with all major UI regions.
 *   2. Layout can be toggled between PiP, Split, and Single.
 *   3. Seek controls dispatch seekTo() on both YouTube player stubs.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef, useImperativeHandle } from 'react';

// ---------------------------------------------------------------------------
// Mock react-youtube with a controllable player stub
// ---------------------------------------------------------------------------
const mockPlayerAPI = {
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  seekTo: vi.fn(),
  getCurrentTime: vi.fn(() => 100),
};

vi.mock('react-youtube', () => {
  const YouTube = forwardRef(function YouTube({ videoId, onReady, className }, ref) {
    useImperativeHandle(ref, () => ({
      getInternalPlayer: () => mockPlayerAPI,
    }));
    // Trigger onReady so window.__nrdash_primaryPlayer is set
    if (onReady) onReady({ target: mockPlayerAPI });
    return <div data-testid="youtube-player" data-video-id={videoId} className={className} />;
  });
  return { default: YouTube };
});

import App from '../App';

// Reset mock state and localStorage before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// 1. Dashboard renders
// ---------------------------------------------------------------------------
describe('Dashboard renders', () => {
  it('shows the race header name', () => {
    render(<App />);
    // Header always shows the event name (from sessionInfo fallback or live data)
    expect(screen.getByText(/24h-Rennen/i)).toBeInTheDocument();
  });

  it('shows the leaderboard heading', () => {
    render(<App />);
    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
  });

  it('shows layout toggle buttons', () => {
    render(<App />);
    expect(screen.getByText(/PiP/i)).toBeInTheDocument();
    expect(screen.getByText(/Split/i)).toBeInTheDocument();
    expect(screen.getByText(/Single/i)).toBeInTheDocument();
  });

  it('shows the demo toggle button', () => {
    render(<App />);
    expect(screen.getByTitle(/demo/i)).toBeInTheDocument();
  });

  it('renders at least one YouTube player stub', () => {
    render(<App />);
    const players = screen.getAllByTestId('youtube-player');
    expect(players.length).toBeGreaterThanOrEqual(1);
  });

  it('shows no-race state when not in demo mode', () => {
    render(<App />);
    const matches = screen.getAllByText(/no active race|connecting/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 2. Toggle layout
// ---------------------------------------------------------------------------
describe('Layout toggle', () => {
  it('starts in PiP mode with two player stubs', () => {
    render(<App />);
    const players = screen.getAllByTestId('youtube-player');
    expect(players.length).toBe(2);
  });

  it('switches to Split mode (two players side-by-side)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText(/Split/i));
    expect(screen.getAllByTestId('youtube-player').length).toBe(2);
  });

  it('switches to Single mode (one player only)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText(/Single/i));
    expect(screen.getAllByTestId('youtube-player').length).toBe(1);
  });

  it('switches back to PiP mode (two players)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText(/Single/i));
    await user.click(screen.getByText(/PiP/i));
    expect(screen.getAllByTestId('youtube-player').length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 3. Seek both streams
// ---------------------------------------------------------------------------
describe('Seek controls', () => {
  it('calls seekTo on the primary player when +10s button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTitle(/Seek \+10s/i));
    expect(mockPlayerAPI.seekTo).toHaveBeenCalled();
  });

  it('calls seekTo on the primary player when -10s button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTitle(/Seek -10s/i));
    expect(mockPlayerAPI.seekTo).toHaveBeenCalled();
  });

  it('calls seekTo on the primary player when +30s button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTitle(/Seek \+30s/i));
    expect(mockPlayerAPI.seekTo).toHaveBeenCalled();
  });

  it('calls seekTo on the primary player when -30s button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTitle(/Seek -30s/i));
    expect(mockPlayerAPI.seekTo).toHaveBeenCalled();
  });

  it('Space key triggers play', () => {
    render(<App />);
    fireEvent.keyDown(window, { code: 'Space' });
    expect(mockPlayerAPI.playVideo).toHaveBeenCalled();
  });

  it('Space key a second time triggers pause', () => {
    render(<App />);
    // First Space → play
    fireEvent.keyDown(window, { code: 'Space' });
    // Second Space → pause
    fireEvent.keyDown(window, { code: 'Space' });
    expect(mockPlayerAPI.pauseVideo).toHaveBeenCalled();
  });
});

