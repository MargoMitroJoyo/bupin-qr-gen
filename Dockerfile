# stage 1
FROM oven/bun AS builder

WORKDIR /app

COPY . .

RUN bun install

RUN bun run db:generate

RUN bun run compile

# stage 2
FROM gcr.io/distroless/cc-debian12 AS runtime

WORKDIR /app

COPY --from=builder /app/assets/ /app/assets/
COPY --from=builder /app/data/ /app/data/
COPY --from=builder /app/dist/ /app/

ENTRYPOINT ["/app/main"]

EXPOSE 3000