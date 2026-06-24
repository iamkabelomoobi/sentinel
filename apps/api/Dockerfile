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
COPY --from=builder /app/apps/api/src/generated apps/api/src/generated

RUN yarn install --immutable --production

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["yarn", "pm2-runtime", "ecosystem.config.cjs"]