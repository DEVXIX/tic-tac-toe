FROM oven/bun:1.2 AS build
WORKDIR /app

ARG VITE_SERVER_URL=http://localhost:3001
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
