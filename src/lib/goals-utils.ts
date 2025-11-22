// Утилиты для работы с целями

import type { Goal, GoalCategory, GoalPeriod, GoalType } from "@/types/goals";

const MAX_FREE_GOALS = 7;

export function canCreateGoal(currentGoalsCount: number, isPremium: boolean = false): boolean {
  if (isPremium) return true;
  return currentGoalsCount < MAX_FREE_GOALS;
}

export function calculateDailyPlan(goal: Goal): number {
  // Для бессрочных привычек возвращаем 0 (нет ежедневного плана)
  if (goal.type === "infinite") {
    return 0;
  }
  
  const now = new Date();
  const endDate = new Date(goal.end_date);
  const daysRemaining = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const remaining = goal.target_value - goal.current_value;
  if (remaining <= 0) return 0;
  
  return Math.ceil(remaining / daysRemaining);
}

export function calculateDaysRemaining(goal: Goal): number {
  const now = new Date();
  const endDate = new Date(goal.end_date);
  return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function isGoalOverdue(goal: Goal): boolean {
  if (goal.status === "completed") return false;
  const now = new Date();
  const endDate = new Date(goal.end_date);
  return now > endDate && goal.current_value < goal.target_value;
}

export function isGoalUrgent(goal: Goal): boolean {
  if (goal.status === "completed" || isGoalOverdue(goal)) return false;
  const daysRemaining = calculateDaysRemaining(goal);
  const dailyPlan = calculateDailyPlan(goal);
  
  // Горящая цель: осталось меньше 3 дней или нужно делать больше чем обычно
  return daysRemaining <= 3 || dailyPlan > goal.target_value * 0.1;
}

export function getGoalProgress(goal: Goal): number {
  if (goal.target_value === 0) return 0;
  return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
}

// Определение статуса выполнения плана: опережает, по плану, отстает
export type PlanStatus = "ahead" | "on_track" | "behind";

export function getPlanStatus(goal: Goal): PlanStatus {
  if (goal.type === "infinite" || goal.status === "completed") {
    return "on_track";
  }
  
  const dailyPlan = calculateDailyPlan(goal);
  if (dailyPlan === 0) return "on_track";
  
  const now = new Date();
  const startDate = new Date(goal.start_date);
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Ожидаемое значение на текущий момент
  const expectedValue = dailyPlan * daysElapsed;
  const actualValue = goal.current_value;
  
  // Разница в процентах
  const difference = actualValue - expectedValue;
  const percentDifference = (difference / expectedValue) * 100;
  
  // Опережает: больше чем на 10% от ожидаемого
  if (percentDifference > 10) return "ahead";
  // Отстает: меньше чем на 10% от ожидаемого
  if (percentDifference < -10) return "behind";
  // По плану: в пределах ±10%
  return "on_track";
}

export function getCategoryLabel(category: GoalCategory): string {
  const labels: Record<GoalCategory, string> = {
    prayer: "Намазы",
    quran: "Коран",
    zikr: "Зикры",
    sadaqa: "Садака",
    knowledge: "Знания",
    asmaul_husna: "99 имен Аллаха",
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: GoalCategory): string {
  const icons: Record<GoalCategory, string> = {
    prayer: "🕌",
    quran: "📖",
    zikr: "📿",
    sadaqa: "💝",
    knowledge: "📚",
    asmaul_husna: "✨",
  };
  return icons[category] || "🎯";
}

export function getPeriodLabel(period: GoalPeriod): string {
  const labels: Record<GoalPeriod, string> = {
    week: "Неделя",
    month: "Месяц",
    "40_days": "40 дней",
    year: "Год",
    custom: "Произвольный период",
  };
  return labels[period] || period;
}

export function calculateEndDate(startDate: Date, period: GoalPeriod, customDays?: number): Date {
  const endDate = new Date(startDate);
  
  switch (period) {
    case "week":
      endDate.setDate(endDate.getDate() + 7);
      break;
    case "month":
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "40_days":
      endDate.setDate(endDate.getDate() + 40);
      break;
    case "year":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case "custom":
      if (customDays) {
        endDate.setDate(endDate.getDate() + customDays);
      }
      break;
  }
  
  return endDate;
}

export function groupGoalsByCategory(goals: Goal[]): Record<GoalCategory, Goal[]> {
  const grouped: Record<GoalCategory, Goal[]> = {
    prayer: [],
    quran: [],
    zikr: [],
    sadaqa: [],
    knowledge: [],
    asmaul_husna: [],
  };
  
  goals.forEach(goal => {
    if (grouped[goal.category]) {
      grouped[goal.category].push(goal);
    }
  });
  
  return grouped;
}

