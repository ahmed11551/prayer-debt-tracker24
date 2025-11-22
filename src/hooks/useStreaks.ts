// Хук для работы со streaks

import { useCallback } from "react";
import { updateStreak, getCurrentStreak, type BadgeCategory } from "@/lib/badges-utils";
import { useToast } from "@/hooks/use-toast";

export function useStreaks() {
  const { toast } = useToast();

  const updateStreakForCategory = useCallback((category: BadgeCategory, showNotification: boolean = false) => {
    const streak = updateStreak(category);
    
    if (showNotification && streak.current > 1) {
      // Показываем уведомление только если streak больше 1
      if (streak.current === 7) {
        toast({
          title: "🔥 Неделя подряд!",
          description: `У вас ${streak.current} дней подряд в категории "${getCategoryLabel(category)}"`,
        });
      } else if (streak.current === 30) {
        toast({
          title: "🔥 Месяц подряд!",
          description: `У вас ${streak.current} дней подряд в категории "${getCategoryLabel(category)}"`,
        });
      } else if (streak.current === 100) {
        toast({
          title: "🔥 Сто дней подряд!",
          description: `Невероятно! У вас ${streak.current} дней подряд в категории "${getCategoryLabel(category)}"`,
        });
      }
    }
    
    return streak;
  }, [toast]);

  const getStreak = useCallback((category: BadgeCategory) => {
    return getCurrentStreak(category);
  }, []);

  return {
    updateStreakForCategory,
    getStreak,
  };
}

function getCategoryLabel(category: BadgeCategory): string {
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
    default:
      return "";
  }
}

