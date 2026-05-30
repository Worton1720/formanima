# Схема базы данных FORMANIMA (ERD)

Документ описывает структуру базы данных PostgreSQL 16, управляемой через Prisma ORM. Источник истины — [schema.prisma](../server/prisma/schema.prisma). Текстовое описание архитектуры данных см. в [02-architecture.md](02-architecture.md); здесь приведена ER-диаграмма и справочник по каждой модели с ограничениями.

Все идентификаторы — `cuid` (строки). Каскадное удаление настроено от `User` ко всем дочерним сущностям (`onDelete: Cascade`).

---

## ER-диаграмма

```mermaid
erDiagram
    User ||--o| UserRank : "имеет"
    User ||--o{ UserAchievement : "получает"
    User ||--o{ Goal : "владеет"
    User ||--o{ GoalProgress : "ведёт"
    User ||--o{ Transaction : "владеет"
    User ||--o{ Budget : "владеет"
    User ||--o{ SavingsGoal : "владеет"
    User ||--o{ FoodEntry : "владеет"
    User ||--o| CalorieProfile : "имеет"
    User ||--o{ Habit : "владеет"

    Goal ||--o{ Milestone : "содержит"
    Goal ||--o{ GoalProgress : "отслеживается"
    Goal ||--o| SavingsGoal : "связана"
    Milestone ||--o{ GoalProgress : "отмечается"

    Habit ||--o{ Action : "содержит"

    User {
        string id PK
        string email UK
        string passwordHash
        string name
        string refreshToken "nullable"
        string role "default user"
        datetime createdAt
        datetime updatedAt
    }
    UserRank {
        string id PK
        string userId UK,FK
        int xp "default 0"
        int level "default 1"
        int totalStrikes "default 0"
        string rank "default apprentice"
    }
    UserAchievement {
        string id PK
        string userId FK
        string achievementId
        datetime unlockedAt
    }
    Goal {
        string id PK
        string userId FK
        string title
        string description "nullable"
        GoalType type "default habit"
        GoalStatus status "default active"
        string category
        float targetValue "nullable"
        float currentValue
        string frequency
        date deadline "nullable"
    }
    Milestone {
        string id PK
        string goalId FK
        string title
        int order
        bool isDone
        datetime doneAt "nullable"
    }
    GoalProgress {
        string id PK
        string goalId FK
        string userId FK
        string milestoneId "nullable, FK"
        date date
        float value
        string note "nullable"
        datetime completedAt
    }
    SavingsGoal {
        string id PK
        string userId FK
        string goalId UK "nullable, FK"
        string title
        float targetAmount
        float currentAmount
        date deadline "nullable"
    }
    Transaction {
        string id PK
        string userId FK
        string type
        float amount
        string category
        string description "nullable"
        date date
        bool isRecurring
        string recurringInterval "nullable"
        string recurringParentId "nullable"
    }
    Budget {
        string id PK
        string userId FK
        string category
        string month
        float amount
    }
    FoodEntry {
        string id PK
        string userId FK
        string name
        MealType mealType
        float calories
        float protein
        float fat
        float carbs
        float weight "nullable"
        date date
    }
    CalorieProfile {
        string id PK
        string userId UK,FK
        float targetCalories
        float targetProtein
        float targetFat
        float targetCarbs
    }
    Habit {
        string id PK
        string userId FK
        string title
        string category
        string frequency
        bool isArchived
    }
    Action {
        string id PK
        string habitId FK
        string title
        int order
    }
```

> Обозначения: `PK` — первичный ключ, `FK` — внешний ключ, `UK` — уникальное поле. `||--o{` — связь «один ко многим», `||--o|` — «один к одному (опционально)».

---

## Перечисления (enums)

| Enum | Значения |
|------|----------|
| `GoalType` | `habit`, `project`, `nutrition`, `finance`, `fitness`, `other` |
| `GoalStatus` | `active`, `completed`, `archived`, `paused` |
| `MealType` | `breakfast`, `lunch`, `dinner`, `snack` |

Роль пользователя хранится как строка (`User.role`, по умолчанию `"user"`), используемые значения — `user` и `admin`.

---

## Справочник по моделям

### User
Центральная сущность. Поля: `email` (уникальный), `passwordHash` (bcrypt), `name`, `refreshToken` (хеш refresh-токена), `role`, временные метки. Каскадно владеет всеми пользовательскими данными.

### UserRank
Состояние геймификации, **1:1** с User (`userId` уникален): `xp`, `level`, `totalStrikes`, `rank`.

### UserAchievement
Разблокированные достижения. Ограничение `@@unique([userId, achievementId])` исключает повторную выдачу одного достижения. Индекс по `userId`.

### Goal
Универсальная цель/привычка. Тип (`GoalType`) и статус (`GoalStatus`) — enum'ы; есть оформление (`color`, `icon`), целевое и текущее значение, частота, дедлайн. Индексы: `[userId, status]`, `[userId, type]`.

### Milestone
Веха внутри цели (`goalId`), с порядком `order` и флагом `isDone`. Индекс по `goalId`.

### GoalProgress
Запись прогресса по цели за дату. `milestoneId` опционален (отметка может относиться к вехе или к цели в целом). Индексы: `[userId, date]`, `[goalId, date]`. Из-за nullable `milestoneId` дедупликация записей выполняется на уровне сервиса (`findFirst`), а не уникальным индексом.

### SavingsGoal
Накопительная цель: `targetAmount`, `currentAmount`, опциональный `deadline`. Может быть связана с `Goal` через уникальный `goalId` (`onDelete: SetNull`). Индекс по `userId`.

### Transaction
Финансовая операция: `type` (доход/расход), `amount`, `category`, `date`, опциональное описание и поля повторения (`isRecurring`, `recurringInterval`, `recurringParentId`). Индексы: `[userId, date]`, `[userId, isRecurring]`.

### Budget
Месячный бюджет по категории. Ограничение `@@unique([userId, category, month])` — один бюджет на категорию в месяц. Индекс `[userId, month]`.

### FoodEntry
Запись дневника питания: `mealType` (enum), `calories`, БЖУ (`protein`, `fat`, `carbs`), опциональный `weight`, `date`. Индексы: `[userId, date]`, `[userId, mealType, date]`.

### CalorieProfile
Дневные нормы КБЖУ, **1:1** с User (`userId` уникален), значения по умолчанию: 2000 ккал / 150 Б / 65 Ж / 250 У.

### Habit, Action (legacy)
Старые модели простых привычек (`Habit`) с подзадачами (`Action`). Сохранены для совместимости с модулями `habits` и `stats`; новая функциональность реализована через `Goal`/`Milestone`/`GoalProgress`.
