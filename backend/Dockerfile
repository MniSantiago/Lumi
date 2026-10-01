# API de Lampi. Construye con: docker build -t lumi-api backend/
FROM node:24-alpine AS build
WORKDIR /app
# El lockfile es de npm 11.
RUN npm install -g npm@11
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
USER node
EXPOSE 3000
# main.js aplica las migraciones pendientes antes de aceptar tráfico.
CMD ["node", "dist/main.js"]
