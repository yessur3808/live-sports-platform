FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

FROM base AS dev

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]

FROM base AS build

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/index.js"]
