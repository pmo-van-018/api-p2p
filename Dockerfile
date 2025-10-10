ARG NODE_VERSION=16.19.0
ARG NODE_VERSION_ALPINE=16.19.0-alpine

# Build Stage 1
# This build created a staging docker image
FROM node:$NODE_VERSION as appbuild

WORKDIR /app

COPY package.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Build Stage 2
# This build installs production dependencies
FROM node:$NODE_VERSION as dependencies

WORKDIR /app

COPY --from=appbuild /app/package.json .

RUN npm install --omit=dev --legacy-peer-deps

# Build Stage 3
# This build takes the production build from staging build, and production dependencies
FROM node:$NODE_VERSION_ALPINE as main

WORKDIR /app

ENV NODE_ENV production

COPY --from=dependencies /app/package.json .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=appbuild /app/fix-module-alias.js .
COPY --from=appbuild /app/dist ./dist
COPY --from=appbuild /app/.env.example .env

ENV PORT=3000

EXPOSE $PORT

CMD ["node", "--max-semi-space-size=128", "./dist/app.js"]
