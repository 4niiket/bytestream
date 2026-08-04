# Production Environment Variables

This file documents the environment variables required when deploying ByteStream (frontend + backend) to Vercel or another hosting provider.

Frontend (Vite)
- `VITE_API_URL` (optional)
  - Example: `https://api.bytestream.example` or `https://bytestream.vercel.app`
  - When present, the frontend API client (`frontend/src/lib/api.ts`) will use this as the base URL.
  - When omitted, the client defaults to `/api` (same-origin) which works with Vercel service rewrites.

Backend
- `DATABASE_URL` (required in production)
  - Postgres connection string for Prisma, e.g. `postgresql://user:pass@host:5432/dbname`.
  - The server will log a warning and fall back to a local development URL if this is not set.
- `FRONTEND_URL` (recommended)
  - The origin allowed by CORS, e.g. `https://bytestream.app`.
  - If omitted, the backend falls back to `http://localhost:5173` for development.
- `REDIS_URL` (optional)
  - Redis connection string, e.g. `redis://:password@redis-host:6379`.
- `PISTON_URL` (optional)
  - URL of the Piston code-execution service, e.g. `http://piston:2000` or `https://piston.example`.
  - If omitted the server will attempt to reach `http://localhost:2000` (development) and may fall back to local execution depending on `ALLOW_LOCAL_EXEC_FALLBACK`.
- `ALLOW_LOCAL_EXEC_FALLBACK` (optional)
  - `true` or `false`. When `true` and Piston is unreachable, the server will attempt to execute code locally (dev-only fallback). Defaults to `true` outside production.
- `JWT_SECRET` (required)
  - Signing secret for JWTs used by the backend.
- `PORT` (optional)
  - Port the backend listens on. Vercel service runner usually injects this; default is `3001`.

Deployment notes
- For Vercel, prefer using service rewrites so the frontend and backend share the same origin. See `vercel.json` which rewrites `/api` to the backend service.
- Place any assets that must be referenced by absolute URL (for example `/logo.png`) into `frontend/public/` so Vite will serve them from the root.
- Ensure `VITE_API_URL` is set for local development when your API is running on a different host/port than the frontend dev server.

Example minimal `.env` for production (do NOT commit secrets):

DATABASE_URL=postgresql://user:secret@db-host:5432/bytestream
FRONTEND_URL=https://bytestream.example
REDIS_URL=redis://:password@redis-host:6379
PISTON_URL=https://piston.example
JWT_SECRET=very-secret-value


