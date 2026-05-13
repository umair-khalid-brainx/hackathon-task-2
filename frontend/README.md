# Frontend — Jira Tickets Converter

Single-page React (Vite) app for PMO-style use: paste a client brief, call the backend, and review **instructions** (bulleted breakdown) and **tickets** (prioritized, lifecycle-oriented dev tasks).

## Requirements

- Node.js (LTS recommended)
- npm
- The backend running and reachable (see `../backend/README.md`).

## Environment variables

Create a `.env` file in this directory.

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | Yes | Base URL of the Nest API **without** a trailing slash (e.g. `http://localhost:3000`) |

Vite is configured with `envPrefix: ['VITE_', 'API_']` so `API_URL` is exposed to the client as `import.meta.env.API_URL`.

## Install and run

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). Ensure `API_URL` matches the backend host and port, and that the backend allows this origin in CORS (defaults cover localhost Vite).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Behavior

- **Header:** product title “Jira Tickets Converter.”
- **Main:** large textarea for the brief, submit to convert.
- **Results** (below the form): two columns on wide viewports — **instructions** as a bulleted list, **tickets** as cards with **high / medium / low** badges and red / yellow / green emphasis.

The app calls:

`POST ${API_URL}/api/briefs/convert`

with body `{ "text": "<brief>" }`.

## Project layout (high level)

- `src/App.tsx` — Page UI and state.
- `src/App.css` — Layout and styling.
- `src/api/convertBrief.ts` — Fetch helper and response types.
- `src/vite-env.d.ts` — TypeScript typing for `import.meta.env.API_URL`.
