/**
 * Улучшенная система отслеживания ежедневных намазов
 * Автоматически накапливает долг за пропущенные намазы
 */

import type { UserPrayerDebt, MissedPrayers, CompletedPrayers } from "@/types/prayer-debt";
import { localStorageAPI } from "@/lib/api";

export type PrayerType = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "witr";

export interface DailyPrayerRecord {
  date: string; // YYYY-MM-DD
  prayers: {
    [key in PrayerType]: {
      completed: boolean;
      completedTime?: Date;
      isQada?: boolean; // Восстановление прошлого долга
    };
  };
}

export interface PrayerHistory {
  [date: string]: DailyPrayerRecord;
}

/**
 * Получить ключ даты в формате YYYY-MM-DD
 */
export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Проверить, прошло ли время намаза
 */
export function isPrayerTimePast(prayerType: PrayerType, date: Date = new Date()): boolean {
  const now = date;
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Примерные времена намазов (можно улучшить с API времени намазов)
  const prayerTimes: Record<PrayerType, { hour: number; minute: number }> = {
    fajr: { hour: 5, minute: 30 },
    dhuhr: { hour: 12, minute: 30 },
    asr: { hour: 15, minute: 30 },
    maghrib: { hour: 18, minute: 0 },
    isha: { hour: 19, minute: 30 },
    witr: { hour: 20, minute: 0 },
  };

  const prayerTime = prayerTimes[prayerType];
  const prayerTimeInMinutes = prayerTime.hour * 60 + prayerTime.minute;

  return timeInMinutes >= prayerTimeInMinutes;
}

/**
 * Определить текущий намаз по времени
 */
export function getCurrentPrayer(date: Date = new Date()): PrayerType | null {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Примерные времена намазов
  if (timeInMinutes >= 5 * 60 + 30 && timeInMinutes < 12 * 60 + 30) return "fajr";
  if (timeInMinutes >= 12 * 60 + 30 && timeInMinutes < 15 * 60 + 30) return "dhuhr";
  if (timeInMinutes >= 15 * 60 + 30 && timeInMinutes < 18 * 60) return "asr";
  if (timeInMinutes >= 18 * 60 && timeInMinutes < 19 * 60 + 30) return "maghrib";
  if (timeInMinutes >= 19 * 60 + 30 && timeInMinutes < 20 * 60) return "isha";
  if (timeInMinutes >= 20 * 60 && timeInMinutes < 24 * 60) return "witr";
  if (timeInMinutes >= 0 && timeInMinutes < 5 * 60 + 30) return "witr"; // Ночь

  return null;
}

/**
 * Получить историю намазов из localStorage
 */
export function getPrayerHistory(): PrayerHistory {
  try {
    const stored = localStorage.getItem("prayer_history");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Конвертируем даты из строк
      Object.keys(parsed).forEach((date) => {
        Object.values(parsed[date].prayers).forEach((prayer: any) => {
          if (prayer.completedTime) {
            prayer.completedTime = new Date(prayer.completedTime);
          }
        });
      });
      return parsed;
    }
  } catch (error) {
    console.error("Error loading prayer history:", error);
  }
  return {};
}

/**
 * Сохранить историю намазов в localStorage
 */
export function savePrayerHistory(history: PrayerHistory): void {
  try {
    localStorage.setItem("prayer_history", JSON.stringify(history));
  } catch (error) {
    console.error("Error saving prayer history:", error);
  }
}

/**
 * Получить запись намазов за день
 */
export function getDailyRecord(date: Date = new Date()): DailyPrayerRecord {
  const dateKey = getDateKey(date);
  const history = getPrayerHistory();

  if (history[dateKey]) {
    return history[dateKey];
  }

  // Создаем новую запись
  const prayers: DailyPrayerRecord["prayers"] = {
    fajr: { completed: false },
    dhuhr: { completed: false },
    asr: { completed: false },
    maghrib: { completed: false },
    isha: { completed: false },
    witr: { completed: false },
  };

  return {
    date: dateKey,
    prayers,
  };
}

/**
 * Отметить намаз как выполненный
 */
export function markPrayerCompleted(
  prayerType: PrayerType,
  date: Date = new Date(),
  isQada: boolean = false
): void {
  const dateKey = getDateKey(date);
  const history = getPrayerHistory();
  const record = getDailyRecord(date);

  record.prayers[prayerType] = {
    completed: true,
    completedTime: new Date(),
    isQada,
  };

  history[dateKey] = record;
  savePrayerHistory(history);

  // Если это восстановление долга, уменьшаем долг
  if (isQada) {
    const userData = localStorageAPI.getUserData();
    if (userData && userData.debt_calculation) {
      const currentDebt = userData.debt_calculation.missed_prayers[prayerType] || 0;
      if (currentDebt > 0) {
        userData.debt_calculation.missed_prayers[prayerType] = currentDebt - 1;
        localStorageAPI.saveUserData(userData);
      }
    }
  }
}

/**
 * Перенести невыполненные намазы в долг
 */
export function moveMissedPrayersToDebt(date: Date = new Date()): MissedPrayers {
  const dateKey = getDateKey(date);
  const record = getDailyRecord(date);
  const missed: MissedPrayers = {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  };

  // Проверяем каждый намаз
  (Object.keys(record.prayers) as PrayerType[]).forEach((prayerType) => {
    const prayer = record.prayers[prayerType];
    
    // Если намаз не выполнен и время прошло
    if (!prayer.completed && isPrayerTimePast(prayerType, date)) {
      missed[prayerType] = 1;
    }
  });

  // Обновляем долг в основных данных
  const userData = localStorageAPI.getUserData();
  if (userData && userData.debt_calculation) {
    const currentDebt = userData.debt_calculation.missed_prayers;
    userData.debt_calculation.missed_prayers = {
      fajr: (currentDebt.fajr || 0) + missed.fajr,
      dhuhr: (currentDebt.dhuhr || 0) + missed.dhuhr,
      asr: (currentDebt.asr || 0) + missed.asr,
      maghrib: (currentDebt.maghrib || 0) + missed.maghrib,
      isha: (currentDebt.isha || 0) + missed.isha,
      witr: (currentDebt.witr || 0) + missed.witr,
    };
    localStorageAPI.saveUserData(userData);
  }

  return missed;
}

/**
 * Автоматическая смена дня
 * Вызывается при переходе на новый день
 */
export function handleDayTransition(): {
  missedPrayers: MissedPrayers;
  newDayStarted: boolean;
} {
  const today = new Date();
  const todayKey = getDateKey(today);
  
  // Проверяем, был ли уже обработан сегодняшний день
  const lastProcessedDate = localStorage.getItem("last_processed_date");
  
  if (lastProcessedDate === todayKey) {
    return { missedPrayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 }, newDayStarted: false };
  }

  // Если это новый день, обрабатываем вчерашний день
  if (lastProcessedDate && lastProcessedDate !== todayKey) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Переносим невыполненные намазы вчерашнего дня в долг
    const missedPrayers = moveMissedPrayersToDebt(yesterday);
    
    // Обновляем дату последней обработки
    localStorage.setItem("last_processed_date", todayKey);
    
    return { missedPrayers, newDayStarted: true };
  }

  // Первый запуск - инициализируем
  localStorage.setItem("last_processed_date", todayKey);
  return { missedPrayers: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 }, newDayStarted: false };
}

/**
 * Получить статистику за период
 */
export function getPeriodStats(startDate: Date, endDate: Date): {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  missedPrayers: MissedPrayers;
  completedPrayers: CompletedPrayers;
} {
  const history = getPrayerHistory();
  const missed: MissedPrayers = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
  const completed: CompletedPrayers = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
  
  let totalDays = 0;
  let completedDays = 0;

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = getDateKey(currentDate);
    const record = history[dateKey];
    
    if (record) {
      totalDays++;
      let dayCompleted = true;
      
      (Object.keys(record.prayers) as PrayerType[]).forEach((prayerType) => {
        if (record.prayers[prayerType].completed) {
          completed[prayerType]++;
        } else {
          missed[prayerType]++;
          dayCompleted = false;
        }
      });
      
      if (dayCompleted) {
        completedDays++;
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return {
    totalDays,
    completedDays,
    completionRate,
    missedPrayers: missed,
    completedPrayers: completed,
  };
}

/**
 * Инициализировать систему отслеживания
 * Должна вызываться при загрузке приложения
 */
export function initializeDailyTracker(): void {
  // Обрабатываем смену дня
  handleDayTransition();
  
  // Устанавливаем интервал для проверки смены дня (каждую минуту)
  setInterval(() => {
    handleDayTransition();
  }, 60000); // Проверка каждую минуту
}

