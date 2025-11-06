# stage 1
FROM oven/bun AS builder

WORKDIR /app

COPY . .

RUN bun install

RUN bun run db:generate

RUN bun run compile

# stage 2
FROM gcr.io/distroless/cc-debian11 AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules/.prisma/client/libquery_* /app/node_modules/.prisma/client/
COPY --from=builder /app/node_modules/@img/sharp-libvips-linux-x64/ /app/node_modules/@img/sharp-libvips-linux-x64/
COPY --from=builder /app/node_modules/@img/sharp-linux-x64/ /app/node_modules/@img/sharp-linux-x64/
COPY --from=builder /app/assets/ /app/assets/
COPY --from=builder /app/data/ /app/data/
COPY --from=builder /app/dist/ /app/

ENTRYPOINT ["/app/main"]

EXPOSE 3000