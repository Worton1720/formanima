# PROJECT MAP — FORMANIMA

Быстрый поиск: где что реализовано. Номера строк актуальны на момент последнего обновления.

---

## БЫСТРЫЙ ПОИСК

| Что ищу | Файл | Строка |
|---|---|---|
| Регистрация / логин | `server/src/auth/auth.service.ts` | 16 / 28 |
| JWT стратегия | `server/src/auth/jwt.strategy.ts` | — |
| Guard для роутов | `server/src/auth/jwt-auth.guard.ts` | — |
| Guard для админа | `server/src/admin/roles.guard.ts` | — |
| XP / уровень / ранг | `server/src/gamification/gamification.service.ts` | 9–24 |
| Пересчёт геймификации | `server/src/gamification/gamification.service.ts` | 24 |
| Список достижений | `server/src/gamification/achievements.config.ts` | 14 |
| Стрик (серия дней) | `server/src/stats/stats.service.ts` | 12 |
| Тепловая карта | `server/src/stats/stats.service.ts` | 106 |
| Добавить прогресс к цели | `server/src/goals/goals.service.ts` | 189 |
| Отметить цель как выполненную сегодня | `client/src/stores/goals.store.ts` | 130 |
| Бюджет по категории | `server/src/finance/finance.service.ts` | 118 |
| Накопительная цель | `server/src/finance/finance.service.ts` | 134 |
| Калории — дневной итог | `server/src/calories/calories.service.ts` | 99 |
| Роуты клиента | `client/src/router/index.ts` | 13 |
| Навигационный guard | `client/src/router/index.ts` | 85 |
| XP-анимация (burst) | `client/src/components/common/XpBurstDialog.vue` | — |
| Axios-клиент | `client/src/api/client.ts` | — |

---

## SERVER — NestJS

Точка входа: [server/src/main.ts](server/src/main.ts) · [server/src/app.module.ts](server/src/app.module.ts)

### auth — Аутентификация
```
server/src/auth/
  auth.service.ts       — бизнес-логика
  auth.controller.ts    — HTTP-эндпоинты (префикс /api/auth)
  jwt.strategy.ts       — валидация JWT-токена
  jwt-auth.guard.ts     — декоратор @UseGuards(JwtAuthGuard)
  auth.module.ts
  dto/
    register.dto.ts
    login.dto.ts
    refresh.dto.ts
    update-profile.dto.ts
```

**auth.service.ts**
| Метод | Строка | Описание |
|---|---|---|
| `register` | 16 | Создать пользователя, выдать токены |
| `login` | 28 | Проверить пароль, выдать токены |
| `refresh` | 40 | Обновить access по refresh-токену |
| `getMe` | 59 | Профиль текущего пользователя |
| `updateProfile` | 66 | Изменить имя / аватар |
| `logout` | 74 | Инвалидировать refresh-токен |
| `issueTokens` *(private)* | 81 | Сгенерировать пару токенов |

**auth.controller.ts**
| Метод | Строка | HTTP |
|---|---|---|
| `register` | 14 | POST /api/auth/register |
| `login` | 19 | POST /api/auth/login |
| `getMe` | 25 | GET /api/auth/me |
| `updateProfile` | 31 | PATCH /api/auth/me |
| `refresh` | 36 | POST /api/auth/refresh |
| `logout` | 42 | POST /api/auth/logout |

---

### goals — Цели и привычки
```
server/src/goals/
  goals.service.ts
  goals.controller.ts   — префикс /api/goals
  goals.module.ts
  dto/
    create-goal.dto.ts
    update-goal.dto.ts
    create-milestone.dto.ts
    update-milestone.dto.ts
    add-progress.dto.ts
    remove-progress.dto.ts
```

**goals.service.ts**
| Метод | Строка | Описание |
|---|---|---|
| `findAll` | 20 | Все активные цели пользователя |
| `findArchived` | 28 | Архивные цели |
| `findOne` | 36 | Одна цель по id |
| `findToday` | 51 | Цели-привычки для отметки сегодня |
| `create` | 67 | Создать цель |
| `update` | 78 | Изменить цель |
| `remove` | 92 | Удалить цель |
| `archive` | 100 | Архивировать цель |
| `restore` | 111 | Восстановить из архива |
| `getMilestones` | 124 | Список этапов цели |
| `createMilestone` | 135 | Создать этап |
| `updateMilestone` | 145 | Изменить этап |
| `removeMilestone` | 160 | Удалить этап |
| `completeMilestone` | 172 | Отметить этап выполненным |
| `addProgress` | 189 | Добавить запись прогресса (+ триггер геймификации) |
| `removeProgress` | 236 | Отменить запись прогресса |
| `getProgress` | 263 | История прогресса |
| `todayUtcRange` *(private)* | 284 | UTC-диапазон текущего дня |
| `updateGoalCurrentValue` *(private)* | 292 | Пересчитать currentValue цели |

---

### gamification — Геймификация
```
server/src/gamification/
  gamification.service.ts
  gamification.controller.ts   — GET /api/gamification/profile
  achievements.config.ts       — список всех достижений
  gamification.module.ts
```

**gamification.service.ts**
| Метод | Строка | Описание |
|---|---|---|
| `getRank` *(private)* | 9 | Определить ранг по уровню |
| `getLevel` *(private)* | 16 | Уровень из суммарного XP |
| `xpFloor` *(private)* | 20 | Минимальный XP для уровня |
| `recalculate` | 24 | Пересчитать XP + уровень + достижения пользователя |
| `getProfile` | 177 | Полный профиль геймификации |

**achievements.config.ts** — строка 14: массив `ACHIEVEMENTS` из 12 достижений.
Каждый объект: `{ id, name, description, icon, check: (stats) => boolean }`

---

### stats — Статистика
```
server/src/stats/
  stats.service.ts
  stats.controller.ts   — префикс /api/stats
  stats.module.ts
```

**stats.service.ts**
| Метод | Строка | Описание |
|---|---|---|
| `getStreak` | 12 | Текущая серия дней подряд |
| `getOverview` | 66 | Сводка: всего целей, выполнено, процент |
| `getHeatmap` | 106 | Данные для тепловой карты (год) |
| `getDailyStats` | 129 | Статистика по дням за период |
| `buildDateRange` *(private)* | 147 | Генератор диапазона дат |

---

### finance — Финансы
```
server/src/finance/
  finance.service.ts
  finance.controller.ts   — префикс /api/finance
  finance.module.ts
  dto/
    create-transaction.dto.ts
    upsert-budget.dto.ts
    create-goal.dto.ts
    update-savings-goal.dto.ts
```

**finance.service.ts**
| Метод | Строка | Раздел |
|---|---|---|
| `getTransactions` | 22 | Транзакции |
| `getSummary` | 37 | Сумма доходов/расходов |
| `getCategoryBreakdown` | 44 | Расходы по категориям |
| `createTransaction` | 55 | Создать транзакцию |
| `deleteTransaction` | 70 | Удалить транзакцию |
| `getRecurringTransactions` | 76 | Регулярные платежи |
| `getTrends` | 83 | Тренды по месяцам |
| `getBudgets` | 114 | Бюджеты по категориям |
| `upsertBudget` | 118 | Создать / обновить бюджет |
| `deleteBudget` | 126 | Удалить бюджет |
| `getGoals` | 134 | Накопительные цели |
| `createGoal` | 138 | Создать накопительную цель |
| `contribute` | 144 | Пополнить накопительную цель |
| `updateSavingsGoal` | 155 | Изменить накопительную цель |
| `syncSavingsGoalWithGoal` | 164 | Синхронизировать с целью из goals |
| `deleteGoal` | 175 | Удалить накопительную цель |

---

### calories — Калории
```
server/src/calories/
  calories.service.ts
  calories.controller.ts   — префикс /api/calories
  calories.module.ts
  dto/
    create-food-entry.dto.ts
    update-calorie-profile.dto.ts
```

**calories.service.ts**
| Метод | Строка | Описание |
|---|---|---|
| `getEntries` | 30 | Записи за день |
| `createEntry` | 38 | Добавить приём пищи |
| `deleteEntry` | 56 | Удалить запись |
| `getProfile` | 69 | Профиль питания (норма КБЖУ) |
| `updateProfile` | 77 | Обновить норму КБЖУ |
| `getDailySummary` | 99 | Итог за день (факт vs норма) |
| `getWeeklySummary` | 111 | Итог за неделю |
| `syncWithNutritionGoal` *(private)* | 158 | Синхронизировать с целью из goals |

---

### admin — Администрирование
```
server/src/admin/
  admin.service.ts
  admin.controller.ts   — префикс /api/admin
  roles.guard.ts        — @UseGuards(RolesGuard) — проверка role === ADMIN
  admin.module.ts
```

---

## CLIENT — Vue 3

Точка входа: [client/src/main.ts](client/src/main.ts)

### Роуты — client/src/router/index.ts

| Путь | Компонент | Строка |
|---|---|---|
| `/` | LandingPage | 14 |
| `/login` | LoginPage | 15 |
| `/register` | RegisterPage | 16 |
| `/dashboard` | DashboardPage | 19 |
| `/habits` | HabitsPage | 24 |
| `/profile` | ProfilePage | 34 |
| `/achievements` | AchievementsPage | 39 |
| `/analytics` | AnalyticsPage | 44 |
| `/finance` | FinancePage | 49 |
| `/goals` | GoalsPage | 55 |
| `/archive` | ArchivePage | 61 |
| `/goals/:id` | GoalDetailPage | 67 |
| `/calories` | CaloriesPage | 73 |
| `/admin` | AdminPage | 78 |

**Navigation guard** `beforeEach` — строка 85: редирект на `/login` если нет токена, редирект на `/dashboard` если авторизован и идёт на `/login`.

---

### Stores — client/src/stores/

**auth.store.ts** (`useAuthStore`)
| Экшен | Строка | Описание |
|---|---|---|
| `isAuthenticated` | 14 | computed — есть ли токен |
| `saveTokens` | 16 | Сохранить access+refresh в localStorage |
| `login` | 25 | Логин → сохранить токены → загрузить профиль |
| `register` | 42 | Регистрация → сохранить токены |
| `refresh` | 53 | Обновить access-токен |
| `logout` | 60 | Очистить токены, сбросить стейт |

**gamification.store.ts** (`useGamificationStore`)
| Экшен / computed | Строка | Описание |
|---|---|---|
| `fetchProfile` | 11 | Загрузить профиль геймификации |
| `setProfile` | 20 | Установить профиль (вызывается после recalculate) |
| `rank` | 24 | computed — текущий ранг |
| `level` | 25 | computed — текущий уровень |
| `unlockedAchievements` | 26 | computed — разблокированные достижения |
| `showBurst` | 30 | Показать XP-анимацию |
| `clearBurst` | 33 | Скрыть XP-анимацию |

**goals.store.ts** (`useGoalsStore`)
| Экшен / computed | Строка | Описание |
|---|---|---|
| `habitGoals` | 15 | computed — цели типа HABIT |
| `isMarkedToday` | 17 | Отмечена ли цель сегодня |
| `fetchGoals` | 23 | Загрузить все активные цели |
| `fetchArchivedGoals` | 36 | Загрузить архив |
| `fetchTodayGoals` | 49 | Цели для отметки сегодня |
| `fetchGoal` | 62 | Загрузить одну цель |
| `createGoal` | 75 | Создать цель |
| `updateGoal` | 81 | Изменить цель |
| `deleteGoal` | 88 | Удалить цель |
| `archiveGoal` | 94 | Архивировать |
| `restoreGoal` | 100 | Восстановить из архива |
| `addProgress` | 106 | Добавить прогресс |
| `removeProgress` | 121 | Отменить прогресс |
| `toggleTodayProgress` | 130 | Переключить отметку за сегодня |

**finance.store.ts** — `client/src/stores/finance.store.ts`

**calories.store.ts** — `client/src/stores/calories.store.ts`

---

### API-клиенты — client/src/api/

| Файл | Описание |
|---|---|
| `client.ts` | axios instance, интерцептор для JWT |
| `auth.api.ts` | register, login, refresh, logout, getMe, updateProfile |
| `goals.api.ts` | CRUD целей, прогресс, этапы |
| `gamification.api.ts` | getProfile |
| `stats.api.ts` | getStreak, getOverview, getHeatmap, getDailyStats |
| `finance.api.ts` | транзакции, бюджеты, накопительные цели |
| `calories.api.ts` | записи еды, профиль питания, сводки |
| `admin.api.ts` | административные методы |

---

### Компоненты — client/src/components/

```
common/
  AppLayout.vue         — обёртка с сайдбаром и навигацией
  XpBurstDialog.vue     — анимация получения XP
  MotivationCard.vue    — мотивирующая карточка
  GoalIcon.vue          — иконка цели по типу

gamification/
  GamificationHero.vue  — большой блок: уровень + прогресс-бар + ранг
  GamificationWidget.vue — компактный виджет для дашборда

habits/
  HabitCard.vue         — карточка привычки с кнопкой отметки
  HabitForm.vue         — форма создания / редактирования

stats/
  HeatmapCalendar.vue   — тепловая карта активности за год

ui/                     — переиспользуемые UI-примитивы
  UiButton.vue, UiCard.vue, UiDialog.vue, UiInput.vue,
  UiSelect.vue, UiProgress.vue, UiBadge.vue, UiSpinner.vue,
  UiSwitch.vue, UiTextarea.vue, UiDisclosure.vue
  index.ts              — реэкспорт всех ui-компонентов
```

---

### Страницы — client/src/pages/

| Файл | Путь | Описание |
|---|---|---|
| `LandingPage.vue` | `/` | Лендинг для неавторизованных |
| `LoginPage.vue` | `/login` | Форма входа |
| `RegisterPage.vue` | `/register` | Форма регистрации |
| `DashboardPage.vue` | `/dashboard` | Главная: привычки дня + виджеты |
| `HabitsPage.vue` | `/habits` | Список всех привычек |
| `GoalsPage.vue` | `/goals` | Список целей |
| `GoalDetailPage.vue` | `/goals/:id` | Детальная страница цели + этапы |
| `ArchivePage.vue` | `/archive` | Архивированные цели |
| `AchievementsPage.vue` | `/achievements` | Галерея достижений |
| `AnalyticsPage.vue` | `/analytics` | Статистика и тепловая карта |
| `FinancePage.vue` | `/finance` | Финансы: транзакции, бюджет, накопления |
| `CaloriesPage.vue` | `/calories` | Дневник питания |
| `ProfilePage.vue` | `/profile` | Профиль пользователя |
| `AdminPage.vue` | `/admin` | Панель администратора |

---

### Прочее — client/src/

```
composables/
  useBreakpoint.ts      — адаптивность (мобайл / десктоп)
  useNotify.ts          — toast-уведомления
  useFaviconAnimation.ts — анимация иконки вкладки

utils/
  iconMap.ts            — маппинг типа цели → иконка
  plural.ts             — склонение слов по числительным

types/index.ts          — общие TypeScript-типы

plugins/vuetify.ts      — конфигурация Vuetify
styles/main.css         — глобальные стили (Tailwind v4)
```

---

## ИНФРАСТРУКТУРА

```
formanima/
  docker-compose.yml          — PostgreSQL + server + client
  server/
    prisma/schema.prisma      — схема БД (модели, отношения, enum-ы)
    src/seed.ts               — начальные данные
    scripts/
      migrate-habits-to-goals.ts   — разовая миграция данных
      reset-qa-user.ts             — сброс тестового пользователя
    .env.example
  client/
    vite.config.ts
    .env.example
docs/                         — техническая документация (09 разделов)
```
