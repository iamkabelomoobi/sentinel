# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps

WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN --mount=type=cache,target=/root/.yarn yarn install --immutable

FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/docs/node_modules ./apps/docs/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY . .

RUN yarn workspace api db:generate
RUN yarn workspace api build

FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable
RUN yarn global add pm2

ENV NODE_ENV=production

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY apps/api/package.json apps/api/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/generated apps/api/generated
COPY --from=builder /app/apps/api/prisma apps/api/prisma
COPY infra/pm2/api.ecosystem.config.cjs infra/pm2/api.ecosystem.config.cjs

RUN yarn workspaces focus api

EXPOSE 4000

CMD ["pm2-runtime", "infra/pm2/api.ecosystem.config.cjs"]
