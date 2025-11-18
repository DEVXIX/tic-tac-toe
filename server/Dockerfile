FROM oven/bun:1.2 AS base
WORKDIR /app

# Install postgresql-client for database connectivity checks
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/db
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN bunx prisma generate

COPY . .

EXPOSE 3001

# Create an entrypoint script that handles database migration
RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
until pg_isready -h postgres -p 5432 -U beaconred-quiz; do\n\
  echo "Database is unavailable - sleeping"\n\
  sleep 2\n\
done\n\
echo "Database is ready!"\n\
echo "Running Prisma migrations..."\n\
bunx prisma migrate deploy\n\
echo "Starting server..."\n\
exec bun --env-file=.env index.js' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
