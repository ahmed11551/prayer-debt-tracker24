/**
 * Хук для работы с ежедневным трекингом намазов
 * Автоматически отслеживает выполнение намазов и накапливает долг
 */

import { useState, useEffect, useCallback } from "react";
import type { PrayerType, DailyPrayerRecord } from "@/lib/daily-prayer-tracker";
import {
  getDailyRecord,
  markPrayerCompleted,
  getCurrentPrayer,
  isPrayerTimePast,
  handleDayTransition,
  getPrayerHistory,
  getDateKey,
} from "@/lib/daily-prayer-tracker";
import { useToast } from "@/hooks/use-toast";
import { localStorageAPI } from "@/lib/api";

export function useDailyPrayerTracker() {
  const { toast } = useToast();
  const [todayRecord, setTodayRecord] = useState<DailyPrayerRecord | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerType | null>(null);

  // Загружаем запись на сегодня
  useEffect(() => {
    const record = getDailyRecord();
    setTodayRecord(record);
    setCurrentPrayer(getCurrentPrayer());
  }, []);

  // Проверяем смену дня каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      const transition = handleDayTransition();
      
      if (transition.newDayStarted) {
        // Новый день начался
        const record = getDailyRecord();
        setTodayRecord(record);
        setCurrentPrayer(getCurrentPrayer());
        
        // Уведомление о новом дне (опционально)
        const totalMissed = Object.values(transition.missedPrayers).reduce((sum, val) => sum + val, 0);
        if (totalMissed > 0) {
          toast({
            title: "Новый день",
            description: `Вчера пропущено ${totalMissed} намазов. Они добавлены в долг.`,
            variant: "default",
          });
        }
      }
      
      // Обновляем текущий намаз
      setCurrentPrayer(getCurrentPrayer());
    }, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, [toast]);

  // Отметить намаз как выполненный
  const completePrayer = useCallback(
    (prayerType: PrayerType, isQada: boolean = false) => {
      markPrayerCompleted(prayerType, new Date(), isQada);
      
      // Обновляем локальное состояние
      const record = getDailyRecord();
      setTodayRecord(record);
      
      // Если это восстановление долга, обновляем счетчики и уменьшаем долг
      if (isQada) {
        const userData = localStorageAPI.getUserData();
        if (userData) {
          // Увеличиваем счетчик восстановленных
          if (userData.repayment_progress) {
            const current = userData.repayment_progress.completed_prayers[prayerType] || 0;
            userData.repayment_progress.completed_prayers[prayerType] = current + 1;
            userData.repayment_progress.last_updated = new Date();
          }
          
          // Уменьшаем долг
          if (userData.debt_calculation && userData.debt_calculation.missed_prayers) {
            const currentDebt = userData.debt_calculation.missed_prayers[prayerType] || 0;
            if (currentDebt > 0) {
              userData.debt_calculation.missed_prayers[prayerType] = currentDebt - 1;
            }
          }
          
          localStorageAPI.saveUserData(userData);
          
          // Отправляем событие обновления данных
          window.dispatchEvent(new CustomEvent('userDataUpdated'));
        }
      }
      
      toast({
        title: "Намаз отмечен",
        description: `${prayerType} ${isQada ? "(восстановление)" : ""} выполнен`,
      });
    },
    [toast]
  );

  // Проверить, выполнен ли намаз сегодня
  const isPrayerCompleted = useCallback(
    (prayerType: PrayerType): boolean => {
      if (!todayRecord) return false;
      return todayRecord.prayers[prayerType]?.completed || false;
    },
    [todayRecord]
  );

  // Получить статистику за сегодня
  const getTodayStats = useCallback(() => {
    if (!todayRecord) {
      return { completed: 0, total: 6, percentage: 0 };
    }

    const prayers = Object.values(todayRecord.prayers);
    const completed = prayers.filter((p) => p.completed).length;
    const total = prayers.length;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [todayRecord]);

  return {
    todayRecord,
    currentPrayer,
    completePrayer,
    isPrayerCompleted,
    getTodayStats,
    refresh: () => {
      const record = getDailyRecord();
      setTodayRecord(record);
      setCurrentPrayer(getCurrentPrayer());
    },
  };
}

