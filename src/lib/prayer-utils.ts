import type { UserPrayerDebt } from "@/types/prayer-debt";

/**
 * Утилиты для работы с данными о намазах
 * Устраняет дублирование кода и улучшает читаемость
 */

export interface PrayerStats {
  name: string;
  completed: number;
  total: number;
  color: string;
  emoji: string;
}

export interface ProgressStats {
  totalCompleted: number;
  totalMissed: number;
  remaining: number;
  overallProgress: number;
  dailyPace: number;
  weeklyPace: number;
  daysToComplete: number;
  monthsToComplete: number;
  daysRemaining: number;
  startDate: Date;
  daysSinceStart: number;
}

/**
 * Получить массив данных о намазах для отображения
 */
export function getPrayersArray(userData: UserPrayerDebt | null): PrayerStats[] {
  if (!userData) {
    return [];
  }

  const missedPrayers = userData.debt_calculation?.missed_prayers || {};
  const completedPrayers = userData.repayment_progress?.completed_prayers || {};

  return [
    {
      name: "Фаджр",
      completed: completedPrayers.fajr || 0,
      total: missedPrayers.fajr || 0,
      color: "prayer-fajr",
      emoji: "🌅",
    },
    {
      name: "Зухр",
      completed: completedPrayers.dhuhr || 0,
      total: missedPrayers.dhuhr || 0,
      color: "prayer-dhuhr",
      emoji: "☀️",
    },
    {
      name: "Аср",
      completed: completedPrayers.asr || 0,
      total: missedPrayers.asr || 0,
      color: "prayer-asr",
      emoji: "🌤️",
    },
    {
      name: "Магриб",
      completed: completedPrayers.maghrib || 0,
      total: missedPrayers.maghrib || 0,
      color: "prayer-maghrib",
      emoji: "🌇",
    },
    {
      name: "Иша",
      completed: completedPrayers.isha || 0,
      total: missedPrayers.isha || 0,
      color: "prayer-isha",
      emoji: "🌙",
    },
    {
      name: "Витр",
      completed: completedPrayers.witr || 0,
      total: missedPrayers.witr || 0,
      color: "prayer-witr",
      emoji: "✨",
    },
  ];
}

/**
 * Рассчитать статистику прогресса
 */
export function calculateProgressStats(userData: UserPrayerDebt | null): ProgressStats {
  if (!userData) {
    return {
      totalCompleted: 0,
      totalMissed: 0,
      remaining: 0,
      overallProgress: 0,
      dailyPace: 0,
      weeklyPace: 0,
      daysToComplete: 0,
      monthsToComplete: 0,
      daysRemaining: 0,
      startDate: new Date(),
      daysSinceStart: 0,
    };
  }

  const completedPrayers = userData.repayment_progress?.completed_prayers || {};
  const missedPrayers = userData.debt_calculation?.missed_prayers || {};
  
  const totalCompleted = Object.values(completedPrayers).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const totalMissed = Object.values(missedPrayers).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const remaining = totalMissed - totalCompleted;
  const overallProgress = totalMissed > 0 ? Math.round((totalCompleted / totalMissed) * 100) : 0;

  const startDate = userData.debt_calculation?.period?.start
    ? new Date(userData.debt_calculation.period.start)
    : new Date();
  
  const daysSinceStart = Math.max(
    1,
    Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const dailyPace = Math.round(totalCompleted / daysSinceStart) || 0;
  const weeklyPace = dailyPace * 7;
  const daysToComplete = dailyPace > 0 ? Math.ceil(remaining / dailyPace) : 0;
  const monthsToComplete = Math.floor(daysToComplete / 30);
  const daysRemaining = daysToComplete % 30;

  return {
    totalCompleted,
    totalMissed,
    remaining,
    overallProgress,
    dailyPace,
    weeklyPace,
    daysToComplete,
    monthsToComplete,
    daysRemaining,
    startDate,
    daysSinceStart,
  };
}

/**
 * Форматировать дату для отображения
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Форматировать число с разделителями тысяч
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("ru-RU");
}

