# Stage 1: install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: build the standalone output
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time values inlined into the bundle (see next.config.mjs `env`).
ARG ENV=prod
ARG GATEWAY_API_URL
ENV ENV=$ENV
ENV GATEWAY_API_URL=$GATEWAY_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# Stage 3: minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodera && adduser --system --uid 1001 nodera

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nodera:nodera /app/.next/standalone ./
COPY --from=builder --chown=nodera:nodera /app/.next/static ./.next/static

USER nodera

EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
