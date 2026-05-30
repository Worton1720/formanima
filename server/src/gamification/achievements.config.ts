export type AchievementType = 'totalStrikes' | 'streak' | 'perfectWeek' | 'timeBased' | 'calorieStreak' | 'savingsGoalCompleted';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  type: AchievementType;
  threshold?: number;
  timeHourMax?: number; // hour < timeHourMax (Early Bird: < 6)
  timeHourMin?: number; // hour >= timeHourMin (Night Owl: >= 23)
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ACH-001',
    name: 'Первая искра',
    description: 'Выполни первое действие',
    xpReward: 10,
    type: 'totalStrikes',
    threshold: 1,
  },
  {
    id: 'ACH-002',
    name: 'Воин недели',
    description: 'Выполняй привычку 7 дней подряд',
    xpReward: 50,
    type: 'streak',
    threshold: 7,
  },
  {
    id: 'ACH-003',
    name: 'Мастер месяца',
    description: 'Выполняй привычку 30 дней подряд',
    xpReward: 100,
    type: 'streak',
    threshold: 30,
  },
  {
    id: 'ACH-004',
    name: 'Кователь столетия',
    description: 'Выполняй привычку 100 дней подряд',
    xpReward: 200,
    type: 'streak',
    threshold: 100,
  },
  {
    id: 'ACH-005',
    name: 'Железная воля',
    description: 'Набери 500 выполнений',
    xpReward: 150,
    type: 'totalStrikes',
    threshold: 500,
  },
  {
    id: 'ACH-006',
    name: 'Легенда',
    description: 'Набери 1000 выполнений',
    xpReward: 300,
    type: 'totalStrikes',
    threshold: 1000,
  },
  {
    id: 'ACH-007',
    name: 'Идеальная неделя',
    description: 'Выполни все привычки 7 дней подряд',
    xpReward: 75,
    type: 'perfectWeek',
    threshold: 7,
  },
  {
    id: 'ACH-008',
    name: 'Ранняя птица',
    description: 'Выполни действие до 6:00 утра',
    xpReward: 5,
    type: 'timeBased',
    timeHourMax: 6,
  },
  {
    id: 'ACH-009',
    name: 'Ночная сова',
    description: 'Выполни действие после 23:00',
    xpReward: 5,
    type: 'timeBased',
    timeHourMin: 23,
  },
  {
    id: 'ACH-010',
    name: 'Несокрушимый',
    description: 'Набери 1500 выполнений',
    xpReward: 500,
    type: 'totalStrikes',
    threshold: 1500,
  },
  {
    id: 'ACH-011',
    name: 'Неделя в балансе',
    description: '7 дней подряд питался в пределах нормы калорий',
    xpReward: 50,
    type: 'calorieStreak',
    threshold: 7,
  },
  {
    id: 'ACH-012',
    name: 'Финансовый мастер',
    description: 'Достиг первой накопительной цели',
    xpReward: 100,
    type: 'savingsGoalCompleted',
    threshold: 1,
  },
];
