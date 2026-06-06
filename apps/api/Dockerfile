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
RUN corepack enable
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/src/storage/migrations ./apps/api/dist/storage/migrations
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
