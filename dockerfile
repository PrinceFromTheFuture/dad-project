# Use Node.js 18 on Alpine (small image)
FROM oven/bun:alpine

# Set working directory
WORKDIR /app

# Install dependencies first (only package*.json)
COPY package.json ./
COPY bun.lockb ./

RUN bun install

# Copy rest of the source
COPY . .

RUN bun run build



# Expose Next.js default port
EXPOSE 3000


# Run in development mode (hot reload)
CMD ["bun", "run", "start"]
