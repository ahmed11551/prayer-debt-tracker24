// Карточка цели с детальной информацией

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
  Flame,
  Play,
} from "lucide-react";
import { CreateGoalDialog } from "./CreateGoalDialog";
import { useToast } from "@/hooks/use-toast";
import type { Goal } from "@/types/goals";
import {
  getGoalProgress,
  calculateDailyPlan,
  calculateDaysRemaining,
  isGoalOverdue,
  isGoalUrgent,
  getCategoryLabel,
  getCategoryIcon,
  getPeriodLabel,
  getPlanStatus,
  type PlanStatus,
} from "@/lib/goals-utils";
import { format } from "date-fns";

interface GoalCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onComplete: (goalId: string) => void;
  onClose?: () => void;
  detailed?: boolean; // Показывать детальную информацию
}

export const GoalCard = ({
  goal,
  onUpdate,
  onDelete,
  onComplete,
  onClose,
  detailed = false,
}: GoalCardProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const progress = getGoalProgress(goal);
  const dailyPlan = calculateDailyPlan(goal);
  const daysRemaining = calculateDaysRemaining(goal);
  const isOverdue = isGoalOverdue(goal);
  const isUrgent = isGoalUrgent(goal);
  
  // Определяем цвет прогресса
  const getProgressColor = (): "default" | "success" | "warning" | "danger" => {
    if (goal.status === "completed" || progress === 100) return "success";
    if (isOverdue) return "danger";
    if (isUrgent) return "warning";
    return "default";
  };

  const handleMarkComplete = () => {
    onComplete(goal.id);
    setShowCompleteDialog(false);
  };

  const handleDelete = () => {
    onDelete(goal.id);
    setShowDeleteDialog(false);
  };

  const handleIncrement = (value: number = 1) => {
    const updated: Goal = {
      ...goal,
      current_value: Math.min(goal.current_value + value, goal.target_value),
      updated_at: new Date(),
    };
    
    // Если достигли цели, автоматически завершаем
    if (updated.current_value >= goal.target_value && goal.status === "active") {
      setShowCompleteDialog(true);
      return;
    }
    
    onUpdate(updated);
    toast({
      title: "Прогресс обновлен",
      description: `Выполнено: ${updated.current_value} из ${goal.target_value}`,
    });
  };

  // Компактная версия карточки (для списка)
  if (!detailed) {
    return (
      <Card className={cn(
        "transition-all hover:shadow-md",
        isOverdue && "border-red-500/50 bg-red-500/5",
        isUrgent && !isOverdue && "border-yellow-500/50 bg-yellow-500/5",
        goal.status === "completed" && "border-green-500/50 bg-green-500/5",
        !isOverdue && !isUrgent && goal.status !== "completed" && "border-border"
      )}>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Заголовок */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Просрочена
                  </Badge>
                )}
                {isUrgent && !isOverdue && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs">
                    <Flame className="w-3 h-3 mr-1" />
                    Горящая
                  </Badge>
                )}
                {goal.status === "completed" && (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Завершена
                  </Badge>
                )}
                {goal.status === "paused" && (
                  <Badge variant="outline" className="text-xs">
                    <Pause className="w-3 h-3 mr-1" />
                    Приостановлена
                  </Badge>
                )}
                {/* Меню действий */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </DropdownMenuItem>
                    {goal.status === "active" && (
                      <DropdownMenuItem
                        onClick={() => {
                          const updated: Goal = { ...goal, status: "paused", updated_at: new Date() };
                          onUpdate(updated);
                          toast({
                            title: "Цель приостановлена",
                            description: "Вы можете возобновить её позже",
                          });
                        }}
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Приостановить
                      </DropdownMenuItem>
                    )}
                    {goal.status === "paused" && (
                      <DropdownMenuItem
                        onClick={() => {
                          const updated: Goal = { ...goal, status: "active", updated_at: new Date() };
                          onUpdate(updated);
                          toast({
                            title: "Цель возобновлена",
                            description: "Продолжайте работать над целью",
                          });
                        }}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Возобновить
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Прогресс - круговой */}
            <div className="flex items-center justify-center py-4">
              <CircularProgress
                value={progress}
                size={100}
                strokeWidth={8}
                color={getProgressColor()}
                showValue={false}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {goal.current_value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    / {goal.target_value}
                  </div>
                  <div className={cn(
                    "text-sm font-semibold mt-1",
                    getProgressColor() === "success" && "text-green-500",
                    getProgressColor() === "warning" && "text-yellow-500",
                    getProgressColor() === "danger" && "text-red-500",
                    getProgressColor() === "default" && "text-accent"
                  )}>
                    {progress}%
                  </div>
                </div>
              </CircularProgress>
            </div>

            {/* Ежедневный план и индикатор */}
            {dailyPlan > 0 && goal.status === "active" && goal.type !== "infinite" && (
              <div className="flex items-center justify-between text-xs py-2 px-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Ежедневный план:</span>
                  <span className="font-semibold">{dailyPlan} {goal.metric === "count" ? "в день" : "дней"}</span>
                </div>
                {/* Индикатор выполнения плана */}
                <div className="flex items-center gap-1">
                  {planStatus === "ahead" && (
                    <span className="text-green-500 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Опережаете
                    </span>
                  )}
                  {planStatus === "on_track" && (
                    <span className="text-yellow-500 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      По плану
                    </span>
                  )}
                  {planStatus === "behind" && (
                    <span className="text-red-500 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Отстаете
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Информация */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>До {format(new Date(goal.end_date), "dd MMM")}</span>
              </div>
              {daysRemaining > 0 && goal.type !== "infinite" && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Осталось {daysRemaining} дн.</span>
                </div>
              )}
            </div>

            {/* Кнопка "Перейти к тасбиху" для связанных целей */}
            {goal.linked_counter_type && goal.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Навигация к тасбиху с выбранным типом
                  toast({
                    title: "Переход к тасбиху",
                    description: "Откройте раздел 'Тасбих' для продолжения",
                  });
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Перейти к тасбиху
              </Button>
            )}

            {/* Быстрые действия для намазов */}
            {goal.category === "prayer" && goal.status === "active" && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrement(1);
                  }}
                  className="flex-1"
                >
                  Выполнил +1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrement(5);
                  }}
                  className="flex-1"
                >
                  Выполнил все
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Детальная версия (диалог)
  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getCategoryIcon(goal.category)}</span>
              <div className="flex-1">
                <DialogTitle className="text-2xl">{goal.title}</DialogTitle>
                {goal.description && (
                  <DialogDescription className="mt-1">{goal.description}</DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Статус и метки */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{getCategoryLabel(goal.category)}</Badge>
              <Badge variant="outline">{getPeriodLabel(goal.period)}</Badge>
              {isOverdue && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Просрочена
                </Badge>
              )}
              {isUrgent && !isOverdue && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  <Flame className="w-3 h-3 mr-1" />
                  Горящая
                </Badge>
              )}
              {goal.status === "completed" && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Завершена
                </Badge>
              )}
            </div>

            {/* Прогресс - круговой */}
            <div className="flex flex-col items-center space-y-4 py-4">
              <CircularProgress
                value={progress}
                size={140}
                strokeWidth={10}
                color={getProgressColor()}
                showValue={false}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {goal.current_value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    / {goal.target_value}
                  </div>
                  <div className={cn(
                    "text-lg font-semibold mt-2",
                    getProgressColor() === "success" && "text-green-500",
                    getProgressColor() === "warning" && "text-yellow-500",
                    getProgressColor() === "danger" && "text-red-500",
                    getProgressColor() === "default" && "text-accent"
                  )}>
                    {progress}%
                  </div>
                </div>
              </CircularProgress>
              
              {/* Ежедневный план */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Ежедневный план</div>
                <div className="text-xl font-semibold text-accent">
                  {dailyPlan} {goal.metric === "count" ? "в день" : "дней"}
                </div>
              </div>
            </div>

            {/* Даты */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Начало</div>
                <div className="font-semibold">
                  {format(new Date(goal.start_date), "dd MMMM yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Дедлайн</div>
                <div className="font-semibold">
                  {format(new Date(goal.end_date), "dd MMMM yyyy")}
                </div>
              </div>
            </div>

            {/* Оставшиеся дни */}
            {daysRemaining > 0 && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Осталось {daysRemaining} дней</div>
                    <div className="text-sm text-muted-foreground">
                      Для достижения цели делайте {dailyPlan} {goal.metric === "count" ? "в день" : "дней подряд"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Текст для выучивания (если есть) */}
            {goal.is_learning_goal && (goal.verse_text || goal.linked_item_id) && (
              <div className="p-4 rounded-lg bg-secondary/50 border">
                <div className="text-sm text-muted-foreground mb-2">Текст для выучивания:</div>
                {goal.verse_text && (
                  <div className="text-lg font-arabic text-right" dir="rtl">
                    {goal.verse_text}
                  </div>
                )}
              </div>
            )}

            {/* Действия */}
            <div className="flex gap-2 pt-4 border-t flex-wrap">
              {goal.category === "prayer" && goal.status === "active" && (
                <>
                  <Button
                    onClick={() => handleIncrement(1)}
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                  >
                    Выполнил +1
                  </Button>
                  <Button
                    onClick={() => handleIncrement(5)}
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                  >
                    Выполнил все
                  </Button>
                </>
              )}
              {goal.linked_counter_type && goal.status === "active" && (
                <Button
                  onClick={() => {
                    // TODO: Переход к тасбиху с выбранной целью
                    toast({
                      title: "Переход к тасбиху",
                      description: "Функция будет реализована в следующем этапе",
                    });
                  }}
                  className="flex-1 min-w-[120px] bg-primary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Перейти к тасбиху
                </Button>
              )}
              <Button
                onClick={() => setShowEditDialog(true)}
                variant="outline"
                className="flex-1 min-w-[120px]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              {goal.status === "active" && (
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Завершить
                </Button>
              )}
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="flex-1 min-w-[120px]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить цель?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить цель "{goal.title}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения завершения */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Завершить цель?</AlertDialogTitle>
            <AlertDialogDescription>
              Отметить цель "{goal.title}" как выполненную?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkComplete}>
              Завершить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог редактирования */}
      {showEditDialog && (
        <CreateGoalDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={(updatedGoal) => {
            onUpdate(updatedGoal);
            setShowEditDialog(false);
          }}
          editGoal={goal}
        />
      )}
    </>
  );
};

