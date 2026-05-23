FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/worker/package.json apps/worker/package.json
RUN pnpm install --filter @devinsights/worker... --no-frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @devinsights/worker build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "dist/worker.js"]
