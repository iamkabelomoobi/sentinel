FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock turbo.json ./
COPY apps/api/package.json apps/api/package.json

COPY . .

RUN yarn install --immutable
RUN yarn workspace api db:generate
RUN yarn workspace api build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY package.json yarn.lock ./
COPY apps/api/package.json apps/api/package.json

RUN yarn install --immutable --production

COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/prisma apps/api/prisma
COPY --from=builder /app/apps/api/src/generated apps/api/src/generated

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/main.js"]