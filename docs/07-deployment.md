# Установка и развёртывание FORMANIMA

Документ описывает развёртывание приложения FORMANIMA в среде разработки и подготовку к продакшен-сборке. Проект — монорепозиторий (`formanima/`) с двумя пакетами: `server` (NestJS) и `client` (Vue 3).

---

## 1. Требования

| Компонент | Версия | Назначение |
|-----------|--------|-----------|
| Node.js | ≥ 20 LTS | Сервер и сборка клиента |
| npm | ≥ 10 | Менеджер пакетов |
| Docker + Docker Compose | v3.9 | PostgreSQL для разработки |
| PostgreSQL | 16 | СУБД (поднимается через Docker или внешняя) |

> Браузеры для клиента: современные версии с поддержкой ES2020 (Chrome, Firefox, Edge, Safari).

---

## 2. Структура и порты

```
formanima/
├── client/            — SPA (Vite dev-сервер :5173)
├── server/            — REST API (NestJS :3000, префикс /api)
└── docker-compose.yml — сервис db (PostgreSQL :5433 → 5432)
```

| Сервис | Адрес |
|--------|-------|
| Клиент (dev) | `http://localhost:5173` |
| API | `http://localhost:3000/api` |
| Swagger UI | `http://localhost:3000/api/docs` |
| PostgreSQL | `localhost:5433`, БД/пользователь `formanima`, пароль `secret` |

> **Важно:** в `docker-compose.yml` определён только сервис `db`. Сервер и клиент запускаются вручную через npm — Dockerfile'ов для них в проекте нет.

---

## 3. База данных

Из каталога `formanima/`:

```bash
docker compose up -d db
```

PostgreSQL 16 (alpine) поднимется на порту `5433`, данные хранятся в именованном томе `pgdata`. Остановка и удаление:

```bash
docker compose down        # остановить
docker compose down -v     # остановить и удалить данные (том pgdata)
```

При использовании внешней СУБД пропустите этот шаг и укажите свою строку подключения в `DATABASE_URL`.

---

## 4. Сервер (NestJS)

Из каталога `formanima/server/`:

```bash
cp .env.example .env        # заполнить секреты (см. раздел 6)
npm install
npx prisma migrate dev      # применить миграции и сгенерировать клиент Prisma
npm run start:dev           # dev-режим: поднимает Docker БД и запускает watch
```

Альтернативные команды:

```bash
npm run build               # сборка в dist/
npm run start:prod          # запуск собранного приложения (node dist/main)
npx prisma studio           # GUI для просмотра БД
```

После старта проверьте Swagger UI: `http://localhost:3000/api/docs`.

---

## 5. Клиент (Vue 3 + Vite)

Из каталога `formanima/client/`:

```bash
cp .env.example .env
npm install
npm run dev                 # dev-сервер → http://localhost:5173
```

Прод-сборка:

```bash
npm run build               # vue-tsc + vite build → dist/
npm run preview             # локальный предпросмотр прод-сборки
```

---

## 6. Переменные окружения

### Server (`formanima/server/.env`)

| Переменная | Назначение | Пример |
|------------|-----------|--------|
| `DATABASE_URL` | Строка подключения PostgreSQL | `postgresql://formanima:secret@localhost:5433/formanima` |
| `JWT_ACCESS_SECRET` | Секрет access-токена | случайная строка |
| `JWT_REFRESH_SECRET` | Секрет refresh-токена | случайная строка |
| `JWT_ACCESS_EXPIRES` | Время жизни access-токена | `15m` |
| `JWT_REFRESH_EXPIRES` | Время жизни refresh-токена | `7d` |
| `PORT` | Порт сервера (необязательно) | `3000` |

Сгенерировать секрет:

```bash
openssl rand -hex 32
```

### Client (`formanima/client/.env`)

| Переменная | Назначение | Пример |
|------------|-----------|--------|
| `VITE_API_URL` | Базовый URL API (с `/api`) | `http://localhost:3000/api` |

Шаблоны — в файлах [server/.env.example](../server/.env.example) и [client/.env.example](../client/.env.example).

---

## 7. Развёртывание в продакшене

1. **База данных.** Поднимите PostgreSQL 16 (управляемый сервис или Docker) и пропишите `DATABASE_URL`. Примените миграции:
   ```bash
   npx prisma migrate deploy
   ```
2. **Сервер.** Соберите и запустите:
   ```bash
   npm ci && npm run build && npm run start:prod
   ```
   Используйте надёжные значения `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`. При смене домена клиента обновите настройку CORS в [server/src/main.ts](../server/src/main.ts) (сейчас разрешён только `http://localhost:5173`).
3. **Клиент.** Соберите статику `npm run build` и отдавайте каталог `dist/` любым статическим сервером (nginx, CDN). Перед сборкой задайте `VITE_API_URL`, указывающий на публичный адрес API.

---

## 8. Типичные проблемы

| Симптом | Причина и решение |
|---------|-------------------|
| `Can't reach database server` | Не поднята БД — выполните `docker compose up -d db`, проверьте `DATABASE_URL` и порт `5433` |
| CORS-ошибка в браузере | Адрес клиента не совпадает с разрешённым в `main.ts` — обновите `enableCors` |
| 401 на защищённых эндпоинтах | Отсутствует/просрочен токен — повторите вход; проверьте JWT-секреты |
| Ошибки миграций Prisma | Выполните `npx prisma migrate dev` (dev) или `migrate deploy` (prod) после правок схемы |
| Клиент не видит API | Проверьте `VITE_API_URL` в `client/.env` и доступность сервера на `:3000` |
