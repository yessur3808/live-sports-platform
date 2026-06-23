FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM base AS dev

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build

COPY . .

RUN npm run build
