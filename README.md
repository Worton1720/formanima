# FORMANIMA

Веб-приложение для трекинга привычек и целей с элементами геймификации, модулями финансов и подсчёта калорий. Дипломный проект.

## Стек технологий

| Слой | Технологии |
|------|-----------|
| Frontend | Vue 3, Tailwind CSS v4, Pinia, Vue Router 4, Vite, @headlessui/vue, Chart.js, Day.js |
| Backend | NestJS 11, Prisma ORM, Passport + JWT (access + refresh), bcrypt |
| База данных | PostgreSQL 16 |
| Инфраструктура | Docker Compose (только БД), npm workspaces |

## Структура монорепозитория

```
formanima/
├── client/            — SPA (Vue 3 + Tailwind CSS v4)
├── server/            — REST API (NestJS + Prisma)
├── docs/              — техническая и проектная документация
└── docker-compose.yml — PostgreSQL для разработки
```

## Быстрый старт

> Подробное руководство — [docs/07-deployment.md](docs/07-deployment.md).

### 1. База данных

```bash
docker compose up -d db
```

PostgreSQL поднимается на порту `5433`, БД `formanima`, пользователь `formanima`, пароль `secret`. Сервер и клиент запускаются через npm (в `docker-compose.yml` определён только сервис `db`).

### 2. Сервер

```bash
cd server
cp .env.example .env       # заполнить секреты
npm install
npx prisma migrate dev
npm run start:dev          # автоматически поднимает Docker БД и запускает watch-режим
```

API доступно на `http://localhost:3000/api`.
Swagger UI — `http://localhost:3000/api/docs`.

### 3. Клиент

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Приложение доступно на `http://localhost:5173`.

## Переменные окружения

### Server (`server/.env`)

```env
DATABASE_URL="postgresql://formanima:secret@localhost:5433/formanima"
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
PORT=3000
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

## API модули

| Модуль | Префикс | Описание |
|--------|---------|----------|
| Auth | `/api/auth` | Регистрация, вход, refresh, профиль, выход |
| Goals | `/api/goals` | Цели/привычки (CRUD, вехи, прогресс, архив) |
| Habits | `/api/habits` | Привычки с действиями (legacy-модуль) |
| Gamification | `/api/gamification` | XP, уровень, ранг, достижения |
| Finance | `/api/finance` | Транзакции, бюджеты, накопительные цели, аналитика |
| Calories | `/api/calories` | Дневник питания, профиль КБЖУ, сводки |
| Stats | `/api/stats` | Стрик, обзор, heatmap |
| Admin | `/api/admin` | Управление пользователями и статистика (только admin) |

Полный справочник эндпоинтов — [docs/09-api-reference.md](docs/09-api-reference.md).

## Геймификация

**Ранги** (по суммарному количеству выполнений `totalStrikes`):

| Ранг | Порог |
|------|-------|
| apprentice | 0 |
| journeyman | ≥ 100 |
| master | ≥ 500 |
| grandmaster | ≥ 1500 |

**XP:** `totalStrikes × 10 + perfectDayCount × 50 + Σ(achievementXP)`
**Уровень:** `floor(sqrt(xp / 100)) + 1`

**Достижения — 12 шт.** (ACH-001…ACH-012). Полная таблица условий — в [docs/02-architecture.md](docs/02-architecture.md#5-система-геймификации) (источник истины — [achievements.config.ts](server/src/gamification/achievements.config.ts)).

## Страницы клиента

| Маршрут | Описание | Доступ |
|---------|----------|--------|
| `/` | Лендинг | Все |
| `/login` | Вход | Гости |
| `/register` | Регистрация | Гости |
| `/dashboard` | Ежедневный трекинг + геймификация | Авторизованные |
| `/habits` | Список привычек | Авторизованные |
| `/habits/:id` | Детали привычки, действия, стрик | Авторизованные |
| `/goals` | Список целей | Авторизованные |
| `/goals/:id` | Детали цели, вехи, прогресс | Авторизованные |
| `/calories` | Дневник питания и КБЖУ | Авторизованные |
| `/finance` | Транзакции, бюджеты, накопления | Авторизованные |
| `/analytics` | Heatmap и аналитика выполнения | Авторизованные |
| `/achievements` | Прогресс по достижениям | Авторизованные |
| `/profile` | Профиль, тема | Авторизованные |
| `/admin` | Управление пользователями | Только admin |

## Роли пользователей

Поле `User.role` (строка, по умолчанию `"user"`):

| Роль | Описание |
|------|----------|
| `user` | Обычный пользователь (по умолчанию) |
| `admin` | Доступ к админ-панели `/admin` |

## Команды разработки

```bash
# Сервер (из server)
npm run start:dev      # dev-режим (поднимает БД + watch)
npm run build          # сборка
npm run start:prod     # node dist/main
npm test               # unit-тесты
npm run test:cov       # с покрытием
npm run test:e2e       # e2e-тесты
npm run lint
npm run format

# Prisma
npx prisma migrate dev # применить миграции
npx prisma studio      # GUI для БД

# Клиент (из client)
npm run dev            # dev-сервер → http://localhost:5173
npm run build          # vue-tsc + vite build
npm run preview        # предпросмотр прод-сборки
```

## Документация

| Документ | Описание |
|----------|----------|
| [docs/00-documentation-index.md](docs/00-documentation-index.md) | Оглавление всего набора документации |
| [docs/01-technical-specification.md](docs/01-technical-specification.md) | Техническое задание (требования, стек) |
| [docs/02-architecture.md](docs/02-architecture.md) | Архитектура, схема БД, геймификация |
| [docs/03-testing.md](docs/03-testing.md) | Тестирование и качество |
| [docs/04-target-audience.md](docs/04-target-audience.md) | Целевая аудитория и опрос |
| [docs/05-economic-efficiency.md](docs/05-economic-efficiency.md) | Экономическая эффективность |
| [docs/06-user-guide.md](docs/06-user-guide.md) | Руководство пользователя |
| [docs/07-deployment.md](docs/07-deployment.md) | Установка и развёртывание |
| [docs/08-database-schema.md](docs/08-database-schema.md) | Схема БД (ERD) |
| [docs/09-api-reference.md](docs/09-api-reference.md) | Справочник REST API |
