# stage 1
FROM oven/bun:latest AS builder

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

RUN bun db:generate

RUN apt update && \
    apt install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["bun"]

CMD ["run", "./src/index.ts"]

EXPOSE 3000