# ─── Сборка ──────────────────────────────────────────────────────────────────
FROM node:22-slim AS build
WORKDIR /app

# openssl нужен движку Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

# ─── Рантайм ─────────────────────────────────────────────────────────────────
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# node_modules переносим из стадии сборки — там уже собраны нативные модули
# (bcrypt) и сгенерирован Prisma Client под ту же ОС/архитектуру
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

EXPOSE 3000

# Перед стартом применяем миграции к БД.
# Точка входа — dist/src/main.js: nest build кладёт вывод в dist/src,
# т.к. в компиляцию попадают prisma.config.ts и scripts/ вне каталога src.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
