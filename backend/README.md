# Backend — Jira Tickets Converter API

NestJS service that turns unstructured client briefs into **instruction strings** and **developer tickets** using the OpenAI API. There is no database; responses are generated per request.

## Requirements

- Node.js (LTS recommended)
- npm
- An OpenAI API key and a chat model that supports **Structured Outputs** (`json_schema` with `strict: true`), for example a recent GPT‑4o class model.

## Environment variables

Create a `.env` file in this directory.

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_MODEL` | Yes | Model id for chat completions (e.g. `gpt-4o`) |
| `PORT` | No | HTTP port (default `3000`) |
| `CORS_ORIGINS` | No | Comma-separated allowed browser origins (defaults include Vite dev URLs) |

## Install and run

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:${PORT:-3000}`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Development server with watch |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled app (`node dist/main`) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Jest) |
| `npm run test:e2e` | End-to-end tests |

## HTTP API

### `POST /api/briefs/convert`

Converts raw brief text into structured instructions and tickets.

**Request**

- Header: `Content-Type: application/json`
- Body:

```json
{
  "text": "Paste the full client or PM brief here."
}
```

**Response** (`200`)

```json
{
  "instructions": [
    "Atomic developer-ready step…",
    "Another step…"
  ],
  "tickets": [
    { "text": "Implement …", "priority": "high" },
    { "text": "Build …", "priority": "medium" },
    { "text": "Add …", "priority": "low" }
  ]
}
```

`priority` is always one of: `low`, `medium`, `high`.

**Errors**

- `400` — Invalid body (missing `text`, too long, or unknown fields).
- `502` — OpenAI failure, invalid JSON from the model, or validation rules (for example too few tickets for a long instruction list). Retrying the request is often successful.

### `GET /`

Default Nest “Hello World” health-style route (if still enabled in `AppController`).

## Project layout (high level)

- `src/openai/` — Reusable OpenAI client (`OPENAI_API_KEY`, `OPENAI_MODEL`).
- `src/brief-conversion/` — Prompt, JSON schema for structured output, DTO, service, controller, ticket sanitization, and minimum ticket counts.
- `src/main.ts` — Global `ValidationPipe`, CORS, port.

## CORS

By default, origins `http://localhost:5173` and `http://127.0.0.1:5173` are allowed for the Vite frontend. Override with `CORS_ORIGINS` (comma-separated) for other dev or staging URLs.
