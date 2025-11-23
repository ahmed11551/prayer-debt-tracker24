// Компонент "Мой Духовный Путь" - Умные цели и привычки

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingCard } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  Target, 
  Plus, 
  Calculator, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";
import type { Goal, GoalCategory } from "@/types/goals";
import {
  canCreateGoal,
  getCategoryLabel,
  getCategoryIcon,
  groupGoalsByCategory,
  isGoalOverdue,
  isGoalUrgent,
  getGoalProgress,
  calculateDailyPlan,
  calculateDaysRemaining,
} from "@/lib/goals-utils";
import { CreateGoalDialog } from "./CreateGoalDialog";
import { GoalCard } from "./GoalCard";

const GOALS_STORAGE_KEY = "smart_goals_v2";

export const SmartGoalsSection = () => {
  const { toast } = useToast();
  const { userData } = useUserData();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Загрузка целей из localStorage
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const saved = localStorage.getItem(GOALS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved, (key, value) => {
          if (key === "start_date" || key === "end_date" || key === "created_at" || key === "updated_at") {
            return new Date(value);
          }
          if (key === "history" && Array.isArray(value)) {
            return value.map((entry: any) => ({
              ...entry,
              date: new Date(entry.date),
            }));
          }
          return value;
        });
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      } catch (error) {
        console.error("Failed to parse goals:", error);
        setGoals([]);
      }
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
    window.dispatchEvent(new CustomEvent('goalsUpdated'));
  };

  // Группировка целей по категориям
  const groupedGoals = useMemo(() => groupGoalsByCategory(goals), [goals]);

  // Активные цели (не завершенные)
  const activeGoals = useMemo(() => 
    goals.filter(g => g.status === "active" || g.status === "paused"), 
    [goals]
  );

  // Просроченные цели
  const overdueGoals = useMemo(() => 
    activeGoals.filter(g => isGoalOverdue(g)), 
    [activeGoals]
  );

  // Горящие цели
  const urgentGoals = useMemo(() => 
    activeGoals.filter(g => isGoalUrgent(g) && !isGoalOverdue(g)), 
    [activeGoals]
  );

  // Проверка лимита целей
  const isPremium = false; // TODO: получить из контекста пользователя
  const canCreate = canCreateGoal(goals.length, isPremium);

  // Обработчики
  const handleCreateGoal = (newGoal: Goal) => {
    if (!canCreate) {
      toast({
        title: "Лимит целей достигнут",
        description: `Бесплатно можно создать до ${canCreateGoal(0, false)} целей. Перейдите на PRO версию для неограниченного количества целей.`,
        variant: "destructive",
      });
      return;
    }

    const goal: Goal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
      status: "active",
      current_value: 0,
    };

    saveGoals([...goals, goal]);
    toast({
      title: "Цель создана",
      description: `Цель "${goal.title}" успешно создана`,
    });
    setCreateDialogOpen(false);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    const updated = goals.map(g => g.id === updatedGoal.id ? { ...updatedGoal, updated_at: new Date() } : g);
    saveGoals(updated);
    setSelectedGoal(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter(g => g.id !== goalId);
    saveGoals(updated);
    toast({
      title: "Цель удалена",
      description: "Цель успешно удалена",
    });
  };

  const handleCompleteGoal = (goalId: string) => {
    const updated = goals.map(g => 
      g.id === goalId 
        ? { ...g, status: "completed" as const, updated_at: new Date() }
        : g
    );
    saveGoals(updated);
    toast({
      title: "Цель завершена",
      description: "Поздравляем с достижением цели!",
    });
  };

  const handleNavigateToCalculator = () => {
    // Навигация к калькулятору через событие
    window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'calculator' } }));
    toast({
      title: "Переход к калькулятору",
      description: "Откройте вкладку 'Калькулятор' для расчета пропущенных намазов",
    });
  };

  // Категории для отображения
  const categories: GoalCategory[] = ["prayer", "quran", "zikr", "sadaqa", "knowledge", "asmaul_husna"];

  // Если выбрана категория, показываем список целей этой категории
  if (selectedCategory) {
    const categoryGoals = groupedGoals[selectedCategory] || [];
    return (
      <div className="space-y-4">
        {/* Заголовок с кнопкой назад */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              ← Назад
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{getCategoryLabel(selectedCategory)}</h2>
              <p className="text-sm text-muted-foreground">
                {categoryGoals.length} {categoryGoals.length === 1 ? "цель" : "целей"}
              </p>
            </div>
          </div>
          {canCreate && (
            <Button
              onClick={() => {
                setCreateDialogOpen(true);
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить цель
            </Button>
          )}
        </div>

        {/* Список целей категории */}
        {categoryGoals.length === 0 ? (
          <EmptyState
            title="Нет целей"
            message="Нет целей в этой категории. Создайте первую цель!"
            actionLabel="Создать цель"
            onAction={() => setCreateDialogOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {categoryGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className="cursor-pointer"
              >
                <GoalCard
                  goal={goal}
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                  onComplete={handleCompleteGoal}
                />
              </div>
            ))}
          </div>
        )}

        {/* Диалог создания цели */}
        <CreateGoalDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSave={handleCreateGoal}
          defaultCategory={selectedCategory}
        />

        {/* Диалог просмотра/редактирования цели */}
        {selectedGoal && (
          <GoalCard
            goal={selectedGoal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            onComplete={handleCompleteGoal}
            onClose={() => setSelectedGoal(null)}
            detailed
          />
        )}
      </div>
    );
  }

  // Главный экран с категориями
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Заголовок с кнопкой добавления */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Цели</h1>
          <p className="text-muted-foreground mt-1">
            Отслеживайте свой духовный путь
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить цель
          </Button>
        )}
      </div>

      {/* Блок пропущенных намазов */}
      {userData && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <CardTitle>Пропущенные намазы</CardTitle>
            </div>
            <CardDescription>
              Рассчитайте количество пропущенных намазов для создания цели
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleNavigateToCalculator}
              className="w-full bg-primary"
              variant="default"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Посчитать намазы
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Горящие и просроченные цели */}
      {(urgentGoals.length > 0 || overdueGoals.length > 0) && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <CardTitle>Требуют внимания</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">{goal.title}</span>
                  </div>
                  <Badge variant="destructive">Просрочена</Badge>
                </div>
              </div>
            ))}
            {urgentGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/10 cursor-pointer hover:bg-orange-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold">{goal.title}</span>
                  </div>
                  <Badge variant="outline" className="border-orange-500 text-orange-500">
                    Горящая
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Категории целей */}
      {activeGoals.length === 0 ? (
        <EmptyState
          title="Нет активных целей"
          message="Создайте первую цель для отслеживания вашего духовного пути"
          actionLabel="Создать цель"
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryGoals = groupedGoals[category] || [];
            const activeCategoryGoals = categoryGoals.filter(g => g.status === "active" || g.status === "paused");
            
            return (
              <Card
                key={category}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{getCategoryIcon(category)}</div>
                      <div>
                        <h3 className="text-lg font-semibold">{getCategoryLabel(category)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activeCategoryGoals.length} {activeCategoryGoals.length === 1 ? "активная цель" : "активных целей"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Сообщение о лимите */}
      {!canCreate && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Вы достигли лимита бесплатных целей ({goals.length}/{canCreateGoal(0, false)})
              </p>
              <Button variant="outline" size="sm">
                Перейти на PRO версию
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Диалог создания цели */}
      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreateGoal}
      />
    </div>
  );
};

