# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.mjs file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install build tools for native modules (libsql needs these)
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm for installing native deps if needed
RUN corepack enable pnpm
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Remove this line if you do not have this folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Create directory for SQLite database (will be overridden by mounted volume)
RUN mkdir -p /app/data
RUN chown nextjs:nodejs /app/data
RUN chmod 755 /app/data

# Copy seed directory (includes seed database if it exists)
COPY --from=builder --chown=nextjs:nodejs /app/seed ./seed

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install production dependencies to ensure native modules (libsql) are available
# This is more space-efficient than copying the entire node_modules
# We need to install deps here because standalone output doesn't include native deps
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* /app/yarn.lock* /app/package-lock.json* ./
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production; \
  elif [ -f package-lock.json ]; then npm ci --only=production; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile --prod; \
  else echo "Lockfile not found." && exit 1; \
  fi && \
  # Remove build tools after installation to reduce image size
  apk del python3 make g++ && \
  # Clean up package manager cache
  rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.cache

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_PATH=/app/node_modules

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
# Copy seed DB to persistent volume on first boot if it doesn't exist
# Ensure directory exists, is writable, and database file is accessible
CMD sh -c 'mkdir -p /app/data && if [ -f /app/seed/multiplicity.db ] && [ ! -f /app/data/multiplicity.db ]; then cp /app/seed/multiplicity.db /app/data/multiplicity.db && echo "✓ Database seeded"; fi && if [ ! -w /app/data ]; then echo "⚠ Warning: /app/data is not writable"; fi && echo "Database path: /app/data/multiplicity.db" && ls -la /app/data/ 2>&1 && HOSTNAME="0.0.0.0" node server.js'
