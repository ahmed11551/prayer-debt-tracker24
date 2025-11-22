// Компактный календарь целей на главном экране

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Target,
  CheckCircle2,
  Trash2,
  Play,
  AlertCircle,
  Flame,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types/goals";
import {
  isGoalOverdue,
  isGoalUrgent,
  getCategoryIcon,
  getCategoryLabel,
  getGoalProgress,
  calculateDaysRemaining,
} from "@/lib/goals-utils";
import { isToday, isTomorrow, addDays, startOfDay } from "date-fns";

const GOALS_STORAGE_KEY = "smart_goals_v2";

interface CompactGoalsCalendarProps {
  onNavigateToGoal?: (goalId: string) => void;
  onNavigateToTasbih?: (goalId: string) => void;
}

export const CompactGoalsCalendar = ({
  onNavigateToGoal,
  onNavigateToTasbih,
}: CompactGoalsCalendarProps) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expanded, setExpanded] = useState(false);

  // Загрузка целей
  useEffect(() => {
    const saved = localStorage.getItem(GOALS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved, (key, value) => {
          if (key === "start_date" || key === "end_date" || key === "created_at" || key === "updated_at") {
            return new Date(value);
          }
          return value;
        });
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      } catch (error) {
        console.error("Failed to parse goals:", error);
      }
    }

    // Слушаем обновления целей
    const handleGoalsUpdate = () => {
      const updated = localStorage.getItem(GOALS_STORAGE_KEY);
      if (updated) {
        try {
          const parsed = JSON.parse(updated, (key, value) => {
            if (key === "start_date" || key === "end_date" || key === "created_at" || key === "updated_at") {
              return new Date(value);
            }
            return value;
          });
          if (Array.isArray(parsed)) {
            setGoals(parsed);
          }
        } catch (error) {
          console.error("Failed to parse goals:", error);
        }
      }
    };

    window.addEventListener('goalsUpdated', handleGoalsUpdate);
    return () => {
      window.removeEventListener('goalsUpdated', handleGoalsUpdate);
    };
  }, []);

  // Активные цели
  const activeGoals = useMemo(() => 
    goals.filter(g => g.status === "active" || g.status === "paused"),
    [goals]
  );

  // Цели на сегодня и завтра
  const todayGoals = useMemo(() => {
    const today = startOfDay(new Date());
    return activeGoals.filter(goal => {
      const endDate = startOfDay(new Date(goal.end_date));
      return endDate <= today || isToday(endDate);
    });
  }, [activeGoals]);

  const tomorrowGoals = useMemo(() => {
    const tomorrow = startOfDay(addDays(new Date(), 1));
    return activeGoals.filter(goal => {
      const endDate = startOfDay(new Date(goal.end_date));
      return isTomorrow(endDate) || endDate <= tomorrow;
    });
  }, [activeGoals]);

  // Горящие и просроченные цели
  const urgentGoals = useMemo(() => 
    activeGoals.filter(g => isGoalUrgent(g) && !isGoalOverdue(g)),
    [activeGoals]
  );

  const overdueGoals = useMemo(() => 
    activeGoals.filter(g => isGoalOverdue(g)),
    [activeGoals]
  );

  // Обработчики
  const handleCompleteGoal = (goalId: string) => {
    const updated = goals.map(g => 
      g.id === goalId 
        ? { ...g, status: "completed" as const, updated_at: new Date() }
        : g
    );
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updated));
    setGoals(updated);
    window.dispatchEvent(new CustomEvent('goalsUpdated'));
    toast({
      title: "Цель завершена",
      description: "Поздравляем с достижением цели!",
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter(g => g.id !== goalId);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updated));
    setGoals(updated);
    window.dispatchEvent(new CustomEvent('goalsUpdated'));
    toast({
      title: "Цель удалена",
      description: "Цель успешно удалена",
    });
  };

  if (activeGoals.length === 0) {
    return null; // Не показываем календарь, если нет активных целей
  }

  // Показываем только горящие и просроченные цели в компактном виде
  const visibleGoals = expanded 
    ? [...overdueGoals, ...urgentGoals, ...todayGoals, ...tomorrowGoals]
    : [...overdueGoals, ...urgentGoals].slice(0, 3);

  return (
    <Card className="bg-gradient-card shadow-medium border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Активные цели</CardTitle>
          </div>
          {activeGoals.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Свернуть" : `Показать все (${activeGoals.length})`}
            </Button>
          )}
        </div>
        <CardDescription>
          {overdueGoals.length > 0 && (
            <span className="text-destructive">
              {overdueGoals.length} просроченных,{" "}
            </span>
          )}
          {urgentGoals.length > 0 && (
            <span className="text-orange-500">
              {urgentGoals.length} горящих
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {visibleGoals.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Нет активных целей на сегодня
          </div>
        ) : (
          visibleGoals.map((goal) => {
            const progress = getGoalProgress(goal);
            const daysRemaining = calculateDaysRemaining(goal);
            const isOverdue = isGoalOverdue(goal);
            const isUrgent = isGoalUrgent(goal) && !isOverdue;

            return (
              <div
                key={goal.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  isOverdue 
                    ? "border-red-500/50 bg-red-500/10" 
                    : isUrgent
                    ? "border-orange-500/50 bg-orange-500/10"
                    : "border-border/50 bg-secondary/50"
                )}
              >
                <div className="space-y-3">
                  {/* Заголовок */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl">{getCategoryIcon(goal.category)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{goal.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {getCategoryLabel(goal.category)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Просрочена
                        </Badge>
                      )}
                      {isUrgent && !isOverdue && (
                        <Badge variant="outline" className="border-orange-500 text-orange-500 text-xs">
                          <Flame className="w-3 h-3 mr-1" />
                          Горящая
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Прогресс */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {goal.current_value} / {goal.target_value}
                      </span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Информация */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {isOverdue 
                          ? `Просрочена на ${Math.abs(daysRemaining)} дн.`
                          : daysRemaining > 0
                          ? `Осталось ${daysRemaining} дн.`
                          : "Сегодня"}
                      </span>
                    </div>
                  </div>

                  {/* Быстрые действия */}
                  <div className="flex gap-2 pt-2">
                    {goal.category === "prayer" && goal.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updated = goals.map(g => 
                            g.id === goal.id 
                              ? { ...g, current_value: Math.min(g.current_value + 1, g.target_value), updated_at: new Date() }
                              : g
                          );
                          localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updated));
                          setGoals(updated);
                          window.dispatchEvent(new CustomEvent('goalsUpdated'));
                        }}
                        className="flex-1 text-xs"
                      >
                        Выполнил +1
                      </Button>
                    )}
                    {goal.linked_counter_type && goal.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (onNavigateToTasbih) {
                            onNavigateToTasbih(goal.id);
                          } else {
                            window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'dhikr' } }));
                          }
                        }}
                        className="flex-1 text-xs"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Тасбих
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (onNavigateToGoal) {
                          onNavigateToGoal(goal.id);
                        } else {
                          window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'goals' } }));
                        }
                      }}
                      className="flex-1 text-xs"
                    >
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Открыть
                    </Button>
                    {goal.status === "active" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCompleteGoal(goal.id)}
                        className="text-xs"
                        title="Завершить"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-xs text-destructive"
                      title="Удалить"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Кнопка перехода к целям */}
        {activeGoals.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'goals' } }));
            }}
          >
            <Target className="w-4 h-4 mr-2" />
            Все цели ({activeGoals.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

