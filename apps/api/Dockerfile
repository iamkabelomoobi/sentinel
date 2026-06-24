FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY . .

RUN yarn install --immutable
RUN yarn workspace api db:generate
RUN yarn workspace api build

FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable

COPY . .
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY infra/pm2/api.ecosystem.config.cjs infra/pm2/api.ecosystem.config.cjs

RUN yarn workspaces focus api --production

WORKDIR /app

EXPOSE 4000

CMD ["yarn", "pm2-runtime", "infra/pm2/api.ecosystem.config.cjs"]
