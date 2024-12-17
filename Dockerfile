ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

FROM node:${NODE_VERSION}-alpine
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app ./
USER node
EXPOSE 3001
CMD ["node", "server.js"]
