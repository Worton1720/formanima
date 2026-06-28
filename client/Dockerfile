# ─── Сборка ──────────────────────────────────────────────────────────────────
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# URL API вшивается в бандл на этапе сборки (Vite). Браузер обращается к серверу
# по адресу, проброшенному на хост, поэтому по умолчанию это localhost:3000.
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ─── Рантайм (статика через nginx) ───────────────────────────────────────────
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
