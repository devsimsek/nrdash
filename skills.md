# NRDash – Technical Stack Requirements

## Frontend Framework
- **React 18** – Component-based UI, hooks for state/lifecycle management
- **Vite** – Fast HMR dev server and optimised production builds
- **Tailwind CSS v3** – Utility-first styling; dark-mode, responsive grid, animations

## Streaming / Video
- **YouTube IFrame API** – Embed, control playback (play/pause/seek/mute) and query state for both streams
- **react-youtube** – Lightweight React wrapper around the IFrame API

## Live Data
- **Axios** – HTTP client for polling the timing API / proxy endpoint
- **Cheerio** – Server-side HTML scraping (Node.js scraper service)
- **Puppeteer** (optional) – Headless Chrome for JavaScript-rendered timing pages
- **socket.io-client** – Real-time push updates when paired with a Node.js relay server

## State Management
- **Zustand** – Lightweight global store for stream URLs, sync state, and timing data

## Tooling
- **ESLint + Prettier** – Code quality and formatting
- **Vite Plugin React** – Fast Refresh

## Back-end Scraper Service (optional Node.js relay)
- **Node.js 20 LTS**
- **Express** – Thin REST/SSE relay server
- **Cheerio / Puppeteer** – Scrape 24h-Rennen live-timing JSON feed
- **node-schedule** – Cron-style polling (every 5 s during race)

## Infrastructure (optional)
- **Docker + docker-compose** – Containerise scraper and frontend dev server
- **Vercel / Netlify** – Zero-config frontend deployment

## Browser APIs
- **Fullscreen API** – Full-screen toggle per stream
- **Picture-in-Picture API** – Native browser PiP for the secondary stream
