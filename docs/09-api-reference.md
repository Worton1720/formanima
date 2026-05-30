# Справочник REST API FORMANIMA

Документ перечисляет все эндпоинты REST API. Источник истины — контроллеры в [formanima/server/src](../server/src) (`*.controller.ts`). Интерактивная версия с моделями запросов/ответов доступна в Swagger UI.

- **Базовый URL:** `http://localhost:3000/api`
- **Swagger UI:** `http://localhost:3000/api/docs`
- **Формат:** JSON
- **Авторизация:** Bearer-токен (`Authorization: Bearer <accessToken>`) для защищённых эндпоинтов

В колонке «Авторизация»: 🔓 — публичный, 🔒 — требуется JWT, 👑 — требуется роль `admin`.

---

## Auth — `/api/auth`

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| POST | `/auth/register` | 🔓 | Регистрация (имя, e-mail, пароль), возвращает токены |
| POST | `/auth/login` | 🔓 | Вход по e-mail и паролю |
| POST | `/auth/refresh` | 🔓 | Обновление пары токенов по refresh-токену |
| GET | `/auth/me` | 🔒 | Текущий пользователь |
| PATCH | `/auth/profile` | 🔒 | Обновление профиля |
| POST | `/auth/logout` | 🔒 | Выход (сброс refresh-токена) |

---

## Goals — `/api/goals`

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| GET | `/goals` | 🔒 | Все активные цели пользователя |
| GET | `/goals/archived` | 🔒 | Архивные цели |
| GET | `/goals/today` | 🔒 | Цели на сегодня |
| GET | `/goals/:id` | 🔒 | Цель по id |
| POST | `/goals` | 🔒 | Создать цель |
| PATCH | `/goals/:id` | 🔒 | Обновить цель |
| DELETE | `/goals/:id` | 🔒 | Удалить цель |
| PATCH | `/goals/:id/archive` | 🔒 | Архивировать цель |
| PATCH | `/goals/:id/restore` | 🔒 | Восстановить из архива |
| GET | `/goals/:id/milestones` | 🔒 | Вехи цели |
| POST | `/goals/:id/milestones` | 🔒 | Создать веху |
| PATCH | `/goals/:id/milestones/:milestoneId` | 🔒 | Обновить веху |
| DELETE | `/goals/:id/milestones/:milestoneId` | 🔒 | Удалить веху |
| PATCH | `/goals/:id/milestones/:milestoneId/complete` | 🔒 | Отметить веху выполненной |
| POST | `/goals/:id/progress` | 🔒 | Добавить отметку прогресса |
| DELETE | `/goals/:id/progress` | 🔒 | Удалить отметку (по дате/вехе) |
| GET | `/goals/:id/progress` | 🔒 | История прогресса (`startDate`, `endDate`) |

---

## Habits — `/api/habits` (legacy)

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| GET | `/habits` | 🔒 | Список привычек |
| GET | `/habits/:id` | 🔒 | Привычка по id |
| POST | `/habits` | 🔒 | Создать привычку |
| PATCH | `/habits/:id` | 🔒 | Обновить привычку |
| PATCH | `/habits/:id/archive` | 🔒 | Архивировать привычку |
| POST | `/habits/:id/actions` | 🔒 | Добавить действие (подзадачу) |
| DELETE | `/habits/:id/actions/:actionId` | 🔒 | Удалить действие |

---

## Gamification — `/api/gamification`

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| GET | `/gamification/profile` | 🔒 | Профиль геймификации (XP, уровень, ранг, достижения) |

---

## Finance — `/api/finance`

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| GET | `/finance/transactions` | 🔒 | Транзакции (фильтр `month`) |
| POST | `/finance/transactions` | 🔒 | Создать транзакцию |
| DELETE | `/finance/transactions/:id` | 🔒 | Удалить транзакцию |
| GET | `/finance/recurring` | 🔒 | Повторяющиеся транзакции |
| GET | `/finance/summary` | 🔒 | Сводка за месяц (доход/расход/баланс) |
| GET | `/finance/breakdown` | 🔒 | Разбивка расходов по категориям |
| GET | `/finance/trends` | 🔒 | Тренды за N месяцев (`months`, по умолчанию 6) |
| GET | `/finance/budgets` | 🔒 | Бюджеты за месяц (`month`) |
| PUT | `/finance/budgets` | 🔒 | Создать/обновить бюджет |
| DELETE | `/finance/budgets/:id` | 🔒 | Удалить бюджет |
| GET | `/finance/goals` | 🔒 | Накопительные цели |
| POST | `/finance/goals` | 🔒 | Создать накопительную цель |
| PUT | `/finance/goals/:id` | 🔒 | Обновить накопительную цель |
| PUT | `/finance/goals/:id/contribute` | 🔒 | Пополнить накопительную цель |
| DELETE | `/finance/goals/:id` | 🔒 | Удалить накопительную цель |

---

## Calories — `/api/calories`

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| GET | `/calories/entries` | 🔒 | Записи питания за дату (`date`) |
| POST | `/calories/entries` | 🔒 | Добавить запись питания |
| DELETE | `/calories/entries/:id` | 🔒 | Удалить запись |
| GET | `/calories/profile` | 🔒 | Профиль КБЖУ |
| PUT | `/calories/profile` | 🔒 | Обновить нормы КБЖУ |
| GET | `/calories/summary` | 🔒 | Дневная сводка (`date`) |
| GET | `/calories/weekly` | 🔒 | Недельная сводка (`startDate`) |

---

## Stats — `/api/stats`

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| GET | `/stats/streak/:habitId` | 🔒 | Текущий стрик по привычке |
| GET | `/stats/overview` | 🔒 | Обзор выполнения (`days`, по умолчанию 7) |
| GET | `/stats/daily` | 🔒 | Дневная статистика (`days`, по умолчанию 30) |
| GET | `/stats/heatmap/:habitId` | 🔒 | Heatmap по привычке (`days`, 1–365, по умолчанию 90) |

---

## Admin — `/api/admin`

Все эндпоинты требуют роль `admin` (`JwtAuthGuard` + `RolesGuard`).

| Метод | Путь | Авторизация | Описание |
|-------|------|-------------|----------|
| GET | `/admin/users` | 👑 | Список пользователей |
| PUT | `/admin/users/:id/block` | 👑 | Заблокировать пользователя |
| DELETE | `/admin/users/:id` | 👑 | Удалить пользователя (нельзя удалить себя) |
| GET | `/admin/stats` | 👑 | Системная статистика |

---

## Экспорт OpenAPI

Спецификация OpenAPI настраивается в [main.ts](../server/src/main.ts) (`DocumentBuilder`, заголовок «FORMANIMA API», версия `1.0`, Bearer-авторизация) и публикуется на `/api/docs`.

JSON-описание доступно по адресу Swagger UI с суффиксом `-json`:

```bash
curl http://localhost:3000/api/docs-json -o openapi.json
```

Либо сгенерировать файл без запуска HTTP-сервера — небольшим скриптом, переиспользующим конфигурацию из `main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { AppModule } from './src/app.module';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('FORMANIMA API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  writeFileSync('openapi.json', JSON.stringify(doc, null, 2));
  await app.close();
}
generate();
```
