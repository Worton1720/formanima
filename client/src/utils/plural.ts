/**
 * Выбор формы русского существительного по числу.
 * plural(1, 'день', 'дня', 'дней')  → 'день'
 * plural(2, 'день', 'дня', 'дней')  → 'дня'
 * plural(5, 'день', 'дня', 'дней')  → 'дней'
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/** Удобные обёртки с самим числом: 1 день / 2 дня / 5 дней. */
export const pluralDays = (n: number): string => `${n} ${plural(n, 'день', 'дня', 'дней')}`;
export const pluralTimes = (n: number): string => `${n} ${plural(n, 'раз', 'раза', 'раз')}`;
