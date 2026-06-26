# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps

WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN --mount=type=cache,target=/root/.yarn yarn install --immutable

FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

ARG NEXT_PUBLIC_API_URL=https://api.sentinel.bbbsoftware.co.za
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/docs/node_modules ./apps/docs/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY . .

RUN yarn workspace web build

FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable
RUN yarn global add pm2

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY infra/pm2/web.ecosystem.config.cjs infra/pm2/web.ecosystem.config.cjs

EXPOSE 3000

CMD ["pm2-runtime", "infra/pm2/web.ecosystem.config.cjs"]
