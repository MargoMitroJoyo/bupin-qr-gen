# stage 1
FROM oven/bun:latest AS builder

WORKDIR /app

COPY . .

RUN bun install

RUN bun db:generate

ENTRYPOINT ["bun"]

CMD ["run", "./src/index.ts"]

EXPOSE 3000