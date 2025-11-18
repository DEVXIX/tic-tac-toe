FROM oven/bun:1.2 AS base
WORKDIR /app

ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/db
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN bunx prisma generate

COPY . .

EXPOSE 3001
CMD ["bun", "run", "start"]
