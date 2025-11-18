# Tic-Tac-Toe Multiplayer

Real-time Tic-Tac-Toe built with Bun, Express, Socket.io, Prisma, React, and Tailwind.

## Prerequisites

- [Bun](https://bun.sh) 1.2+
- Docker + Docker Compose
- Recent browser (Chrome, Edge, etc.)

## 1. Prepare environment files

Templates live next to each app; copy them before running anything:

```sh
cp postgres.env.example postgres.env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

- `postgres.env` controls the Postgres container (db name, user, password).
- `server/.env` must point `DATABASE_URL` at that database. When running via Docker Compose, set the host to `postgres` (e.g., `postgresql://user:pass@postgres:5432/db`). When running the server on your machine, `localhost` is fine. Use `CLIENT_URL` (or comma-separated `CLIENT_URLS`) to list the front-end origins allowed via CORS.
- `client/.env` needs `VITE_SERVER_URL` (defaults to `http://localhost:3001`).

## 2. Option A – run everything with Docker

`docker-compose.yml` now includes Postgres, the Bun API, and the static client (served by Nginx).

```sh
docker compose up -d --build
```

- Postgres: `5432` → container `postgres`
- API: `http://localhost:3001`
- Client: `http://localhost:4173`

Once the stack finishes building, visit `http://localhost:4173` in your browser—this serves the production React build that talks to the API on port 3001.

If you change Postgres credentials, mirror the same values inside `docker-compose.yml` (server service `DATABASE_URL`).

Stop the stack when finished:

```sh
docker compose down
```

Need to pre-build without starting containers? Run:

```sh
docker compose build
```

Then launch whenever you’re ready with `docker compose up -d`.

## 3. Option B – run locally with Bun

1. Start (or keep) the Postgres container:

   ```sh
   docker compose up -d postgres
   ```

2. Install dependencies once per workspace:

   ```sh
   cd server && bun install
   cd ../client && bun install
   ```

3. Run both dev servers in separate terminals:

   ```sh
   # Backend
   cd server && bun run dev

   # Frontend
   cd client && bun run dev
   ```

Backend → `http://localhost:3001`, Frontend → `http://localhost:3000`.

## Troubleshooting

- `DATABASE_URL undefined`: ensure `server/.env` is UTF-8 encoded (no UTF-16 BOM) and matches your Postgres credentials. Recopy the example if needed.
- Prisma schema changes: `cd server && bun run db:migrate`.
- Docker stack feels stale: `docker compose down -v` clears containers + volumes (you’ll lose DB data).
- Logs: `docker compose logs -f server`, `docker compose logs -f client`, or `docker compose logs -f postgres`.
