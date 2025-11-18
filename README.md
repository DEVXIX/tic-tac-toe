# Tic-Tac-Toe Multiplayer

Small real-time Tic-Tac-Toe built with Bun, Express, Socket.io, Prisma, React, and Tailwind. Follow the steps below to spin up the full stack locally.

## Prerequisites

- [Bun](https://bun.sh) 1.2+
- Docker + Docker Compose
- Node-compatible browser (Chrome, Edge, etc.)

## 1. Configure PostgreSQL

1. Copy the provided template and fill in your own credentials if needed:

   ```powershell
   Copy-Item postgres.env.example postgres.env
   ```

2. Update `postgres.env` with your desired database name, username, and password. The backend expects the same values that are already referenced in `server/.env.example`.

3. Start the database container:

   ```powershell
   docker compose up -d
   ```

   The `postgres` service now exposes port `5432` with the credentials from `postgres.env`.

## 2. Environment files

Create `.env` files for both the server and the client using their examples. Each file only needs the variables already listed.

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

- `server/.env` must point `DATABASE_URL` to the Postgres instance from the previous step.
- `client/.env` should include the backend URL (defaults to `http://localhost:3001`).

## 3. Install dependencies

Run Bun install inside each workspace folder once.

```powershell
cd server
bun install

cd ../client
bun install
```

## 4. Run the stack

Start the backend first so Socket.io and Prisma are ready, then start the React client.

```powershell
# Terminal 1
cd server
bun run dev

# Terminal 2
cd client
bun run dev
```

- Server listens on `http://localhost:3001` (configurable via `server/.env`).
- Client Vite dev server runs on `http://localhost:3000`.

Open `http://localhost:3000` in two browser windows to create a lobby, join games, and play in real time. Game records write to Postgres after each match, and the lobby shows the latest history plus active games.

## Troubleshooting tips

- If the backend errors with `DATABASE_URL undefined`, re-check that `server/.env` is saved in UTF-8 (no UTF-16 BOM) and matches your Postgres credentials.
- Run `bun run db:migrate` inside `server/` if you need to recreate the Prisma schema or after changing the database connection.
- Use `docker compose logs postgres -f` to verify the database is healthy.
