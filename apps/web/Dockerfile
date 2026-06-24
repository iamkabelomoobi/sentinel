FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY . .

RUN yarn install --immutable
RUN yarn workspace web build

FROM node:22-alpine AS runner

WORKDIR /app
RUN corepack enable

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY apps/web/ecosystem.config.cjs apps/web/ecosystem.config.cjs

RUN yarn add pm2

EXPOSE 3000

CMD ["yarn", "pm2-runtime", "apps/web/ecosystem.config.cjs"]