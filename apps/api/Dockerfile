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

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Workspace manifest files (needed for pnpm filter to resolve the api package)
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

# Install ONLY production deps for the api package (clean, no fragile symlinks)
RUN pnpm install --prod --filter @devinsights/api... --no-frozen-lockfile

# Built artifacts
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/src/storage/migrations ./apps/api/dist/storage/migrations
COPY --from=build /app/apps/web/dist ./apps/web/dist

EXPOSE 3001
CMD ["pnpm", "--filter", "@devinsights/api", "start"]
