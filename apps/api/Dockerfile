FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter @devinsights/api... --filter @devinsights/web... --no-frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @devinsights/web build
RUN pnpm --filter @devinsights/api build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/src/storage/migrations ./dist/storage/migrations
COPY --from=build /app/apps/web/dist ./web/dist
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/server.js"]
