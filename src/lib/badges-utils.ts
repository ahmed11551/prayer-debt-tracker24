// Утилиты для работы с бейджами и streaks

import type { Badge, Streak, BadgeCategory } from "@/types/badges";
import type { Goal } from "@/types/goals";
import { PREDEFINED_BADGES } from "@/types/badges";
import { differenceInDays, isToday, isYesterday, startOfDay } from "date-fns";

const BADGES_STORAGE_KEY = "user_badges_v1";
const STREAKS_STORAGE_KEY = "user_streaks_v1";

// Загрузка бейджей пользователя
export function loadUserBadges(): Badge[] {
  try {
    const saved = localStorage.getItem(BADGES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved, (key, value) => {
        if (key === "unlocked_at") {
          return value ? new Date(value) : undefined;
        }
        return value;
      });
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load badges:", error);
  }
  
  // Инициализируем все бейджи с прогрессом 0
  return PREDEFINED_BADGES.map(badge => ({
    ...badge,
    progress: 0,
  }));
}

// Сохранение бейджей
export function saveUserBadges(badges: Badge[]) {
  try {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badges));
  } catch (error) {
    console.error("Failed to save badges:", error);
  }
}

// Загрузка streaks
export function loadUserStreaks(): Streak[] {
  try {
    const saved = localStorage.getItem(STREAKS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved, (key, value) => {
        if (key === "last_date" || key === "start_date") {
          return value ? new Date(value) : undefined;
        }
        return value;
      });
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load streaks:", error);
  }
  
  return [];
}

// Сохранение streaks
export function saveUserStreaks(streaks: Streak[]) {
  try {
    localStorage.setItem(STREAKS_STORAGE_KEY, JSON.stringify(streaks));
  } catch (error) {
    console.error("Failed to save streaks:", error);
  }
}

// Обновление streak для категории
export function updateStreak(category: BadgeCategory, activityDate: Date = new Date()): Streak {
  const streaks = loadUserStreaks();
  const today = startOfDay(activityDate);
  
  let streak = streaks.find(s => s.category === category);
  
  if (!streak) {
    // Создаем новый streak
    streak = {
      id: `streak-${category}-${Date.now()}`,
      category,
      current: 1,
      longest: 1,
      last_date: today,
      start_date: today,
    };
    streaks.push(streak);
  } else {
    const lastDate = startOfDay(new Date(streak.last_date));
    const daysDiff = differenceInDays(today, lastDate);
    
    if (daysDiff === 0) {
      // Та же дата - ничего не меняем
      return streak;
    } else if (daysDiff === 1) {
      // Продолжаем streak
      streak.current += 1;
      streak.longest = Math.max(streak.longest, streak.current);
      streak.last_date = today;
    } else {
      // Streak прерван - начинаем заново
      streak.current = 1;
      streak.start_date = today;
      streak.last_date = today;
    }
  }
  
  saveUserStreaks(streaks);
  return streak;
}

// Получить текущий streak для категории
export function getCurrentStreak(category: BadgeCategory): number {
  const streaks = loadUserStreaks();
  const streak = streaks.find(s => s.category === category);
  
  if (!streak) return 0;
  
  const lastDate = startOfDay(new Date(streak.last_date));
  const today = startOfDay(new Date());
  const daysDiff = differenceInDays(today, lastDate);
  
  // Если последняя активность была сегодня или вчера, возвращаем текущий streak
  if (daysDiff <= 1) {
    return streak.current;
  }
  
  // Streak прерван
  return 0;
}

// Обновление прогресса бейджа
export function updateBadgeProgress(
  badgeId: string,
  progress: number,
  unlocked: boolean = false
): Badge | null {
  const badges = loadUserBadges();
  const badge = badges.find(b => b.id === badgeId);
  
  if (!badge) return null;
  
  badge.progress = Math.min(100, Math.max(0, progress));
  
  if (unlocked && !badge.unlocked_at) {
    badge.unlocked_at = new Date();
  }
  
  saveUserBadges(badges);
  return badge;
}

// Вычисление прогресса бейджа на основе данных
export function calculateBadgeProgress(
  badge: Badge,
  stats: {
    prayerCount?: number;
    quranSurahs?: number;
    zikrCount?: number;
    sadaqaCount?: number;
    completedGoals?: number;
    streak?: number;
  }
): number {
  const { requirement } = badge;
  const { type, value } = requirement;
  
  switch (type) {
    case "count":
      if (requirement.unit === "prayers" && stats.prayerCount !== undefined) {
        return Math.min(100, (stats.prayerCount / value) * 100);
      }
      if (requirement.unit === "surahs" && stats.quranSurahs !== undefined) {
        return Math.min(100, (stats.quranSurahs / value) * 100);
      }
      if (requirement.unit === "zikrs" && stats.zikrCount !== undefined) {
        return Math.min(100, (stats.zikrCount / value) * 100);
      }
      if (requirement.unit === "acts" && stats.sadaqaCount !== undefined) {
        return Math.min(100, (stats.sadaqaCount / value) * 100);
      }
      break;
      
    case "streak":
      if (stats.streak !== undefined) {
        return Math.min(100, (stats.streak / value) * 100);
      }
      break;
      
    case "completion":
      if (stats.completedGoals !== undefined) {
        return Math.min(100, (stats.completedGoals / value) * 100);
      }
      break;
  }
  
  return badge.progress;
}

// Обновление всех бейджей на основе текущих данных
export function updateAllBadges(
  goals: Goal[],
  prayerStats?: { totalCompleted: number },
  zikrStats?: { totalCount: number },
  sadaqaStats?: { totalCount: number }
): Badge[] {
  const badges = loadUserBadges();
  const completedGoals = goals.filter(g => g.status === "completed").length;
  
  // Собираем статистику по категориям
  const prayerCount = prayerStats?.totalCompleted || 0;
  const zikrCount = zikrStats?.totalCount || 0;
  const sadaqaCount = sadaqaStats?.totalCount || 0;
  
  // Получаем streaks
  const prayerStreak = getCurrentStreak("prayer");
  const zikrStreak = getCurrentStreak("zikr");
  
  const updatedBadges = badges.map(badge => {
    const stats = {
      prayerCount,
      zikrCount,
      sadaqaCount,
      completedGoals,
      streak: badge.category === "streak" && badge.id.includes("prayer") 
        ? prayerStreak 
        : badge.category === "streak" && badge.id.includes("zikr")
        ? zikrStreak
        : undefined,
    };
    
    const newProgress = calculateBadgeProgress(badge, stats);
    const wasUnlocked = !!badge.unlocked_at;
    const shouldUnlock = newProgress >= 100 && !wasUnlocked;
    
    return {
      ...badge,
      progress: newProgress,
      unlocked_at: shouldUnlock ? new Date() : badge.unlocked_at,
    };
  });
  
  saveUserBadges(updatedBadges);
  return updatedBadges;
}

// Получить цвет бейджа по уровню
export function getBadgeColor(level: Badge["level"]): string {
  switch (level) {
    case "bronze":
      return "text-amber-600 border-amber-500 bg-amber-50";
    case "silver":
      return "text-gray-600 border-gray-400 bg-gray-50";
    case "gold":
      return "text-yellow-600 border-yellow-500 bg-yellow-50";
    default:
      return "text-muted-foreground border-border bg-secondary";
  }
}

// Получить название уровня
export function getBadgeLevelLabel(level: Badge["level"]): string {
  switch (level) {
    case "bronze":
      return "Бронза";
    case "silver":
      return "Серебро";
    case "gold":
      return "Золото";
    default:
      return "";
  }
}

// Получить название категории
export function getBadgeCategoryLabel(category: BadgeCategory): string {
  switch (category) {
    case "prayer":
      return "Намазы";
    case "quran":
      return "Коран";
    case "zikr":
      return "Зикры";
    case "sadaqa":
      return "Садака";
    case "knowledge":
      return "Знания";
    case "streak":
      return "Серии";
    case "completion":
      return "Завершение";
    default:
      return "";
  }
}

