# stage 1
FROM oven/bun:latest AS builder

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

RUN bun db:generate

RUN bun build --compile --minify --bytecode --sourcemap ./src/index.ts --outfile ./dist/compiled/main

RUN rm -rf src tests README.md

# stage 2
FROM debian:bookworm-slim AS runner

RUN apt update && \
    apt install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist/compiled/main /app/main
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/assets /app/assets

ENTRYPOINT ["/app/main"]

CMD ["--port", "3000"]

EXPOSE 3000