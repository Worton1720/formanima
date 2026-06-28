# Дипломный проект — FORMANIMA

Репозиторий выпускной квалификационной работы (ВКР). Тема — веб-приложение **FORMANIMA** для трекинга привычек и целей с элементами геймификации, а также модулями финансов и подсчёта калорий.

## Содержимое репозитория

| Путь               | Описание                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------- |
| [client/](client/) | Frontend — SPA на Vue 3 + Tailwind CSS v4                                                 |
| [server/](server/) | Backend — REST API на NestJS + Prisma                                                     |
| [docs/](docs/)     | Техническая и проектная документация (ТЗ, архитектура, тестирование, развёртывание, API)  |

## Приложение

**FORMANIMA** — монорепозиторий из двух частей:

| Слой               | Технологии                                            |
| ------------------ | ----------------------------------------------------- |
| Frontend (`client`) | Vue 3, Tailwind CSS v4, Pinia, Vue Router 4, Vite     |
| Backend (`server`)  | NestJS 11, Prisma ORM, JWT (access + refresh), bcrypt |
| База данных         | PostgreSQL 16 (Docker Compose)                        |

**Возможности:** цели и привычки, ежедневный трекинг, система геймификации (XP, уровни, ранги, достижения), учёт финансов (транзакции, бюджеты, накопления), дневник питания и КБЖУ, аналитика и админ-панель.

## Быстрый старт

```bash
# 1. База данных
docker compose up -d db

# 2. Сервер (http://localhost:3000/api, Swagger — /api/docs)
cd server && cp .env.example .env && npm install && npx prisma migrate dev && npm run start:dev

# 3. Клиент (http://localhost:5173)
cd ../client && cp .env.example .env && npm install && npm run dev
```

Подробные инструкции по развёртыванию — в [docs/07-deployment.md](docs/07-deployment.md).

## Документация

Полный набор документации находится в [docs/](docs/), оглавление — [docs/00-documentation-index.md](docs/00-documentation-index.md).
