# Use the oven/bun image as the base
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Build the application
RUN bun build --compile --minify --bytecode --sourcemap ./src/index.ts --outfile ./dist/compiled/main

# Install additional dependencies for node-qrcode and node-canvas
# You may need to install system packages required by node-canvas
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Expose the port the app runs on
EXPOSE 3000

# Set up a health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["bun", "run", "healthcheck"]  # Adjust the healthcheck command as necessary

# Run the application
CMD ["/app/dist/compiled/main"]
