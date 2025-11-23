/**
 * Компонент для ежедневного отслеживания намазов
 * Показывает текущий день и позволяет отмечать намазы
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyPrayerTracker } from "@/hooks/useDailyPrayerTracker";
import { useToast } from "@/hooks/use-toast";
import type { PrayerType } from "@/lib/daily-prayer-tracker";
import { CheckCircle2, Circle, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const PRAYER_INFO: Array<{ type: PrayerType; name: string; emoji: string; time: string }> = [
  { type: "fajr", name: "Фаджр", emoji: "🌅", time: "05:30" },
  { type: "dhuhr", name: "Зухр", emoji: "☀️", time: "12:30" },
  { type: "asr", name: "Аср", emoji: "🌤️", time: "15:30" },
  { type: "maghrib", name: "Магриб", emoji: "🌇", time: "18:00" },
  { type: "isha", name: "Иша", emoji: "🌙", time: "19:30" },
  { type: "witr", name: "Витр", emoji: "✨", time: "20:00" },
];

export const DailyPrayerTracker = () => {
  const { todayRecord, currentPrayer, completePrayer, isPrayerCompleted, getTodayStats } =
    useDailyPrayerTracker();
  const { toast } = useToast();
  const [animatingPrayer, setAnimatingPrayer] = useState<PrayerType | null>(null);

  const stats = getTodayStats();
  const today = new Date();

  const handleCompletePrayer = (type: PrayerType, isQada: boolean) => {
    const wasCompleted = isPrayerCompleted(type);
    completePrayer(type, isQada);
    
    // Анимация и обратная связь
    setAnimatingPrayer(type);
    setTimeout(() => setAnimatingPrayer(null), 600);

    // Toast уведомление
    if (!wasCompleted) {
      toast({
        title: isQada ? "Qada отмечен" : "Намаз отмечен",
        description: `${PRAYER_INFO.find(p => p.type === type)?.name} успешно ${isQada ? "восстановлен" : "выполнен"}`,
        duration: 2000,
      });
    }
  };

  if (!todayRecord) {
    return (
      <Card className="bg-card/95 shadow-lg border-border/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 shadow-lg border-border/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg sm:text-xl">Намазы на сегодня</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {format(today, "d MMMM yyyy", { locale: ru })}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm flex-shrink-0">
            {stats.completed}/{stats.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Прогресс за день */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Прогресс за день</span>
            <span className="font-semibold text-[hsl(var(--success-dark))]">{stats.percentage}%</span>
          </div>
          <Progress 
            value={stats.percentage} 
            className={cn(
              "h-2 sm:h-3 transition-all duration-500",
              stats.percentage === 100 && "bg-[hsl(var(--success))]"
            )} 
          />
        </div>

        {/* Список намазов */}
        <div className="grid gap-2">
          {PRAYER_INFO.map(({ type, name, emoji, time }) => {
            const completed = isPrayerCompleted(type);
            const isCurrent = currentPrayer === type;
            const prayer = todayRecord.prayers[type];

            const isAnimating = animatingPrayer === type;

            return (
              <div
                key={type}
                className={cn(
                  "flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all duration-300",
                  "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                  completed
                    ? "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30 shadow-sm"
                    : isCurrent
                    ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20 shadow-md"
                    : "bg-card/50 border-border/50 hover:border-primary/30",
                  isAnimating && "animate-pulse scale-105"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <span className={cn(
                    "text-xl sm:text-2xl flex-shrink-0 transition-transform",
                    isAnimating && "scale-125"
                  )}>{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm sm:text-base">{name}</span>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Сейчас</span>
                          <span className="sm:hidden">⏰</span>
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{time}</div>
                    {prayer?.isQada && (
                      <Badge variant="outline" className="text-xs mt-1 border-[hsl(var(--warning))]/50 text-[hsl(var(--warning-dark))]">
                        Восстановление
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={completed ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleCompletePrayer(type, false)}
                    className={cn(
                      "min-w-[90px] sm:min-w-[100px] transition-all",
                      completed 
                        ? "bg-[hsl(var(--success))]/20 border-[hsl(var(--success))]/50 hover:bg-[hsl(var(--success))]/30 text-[hsl(var(--success-dark))]"
                        : "hover:shadow-md"
                    )}
                    aria-label={`${completed ? "Отменить" : "Отметить"} ${name}`}
                  >
                    {completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Выполнено</span>
                        <span className="sm:hidden">✓</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-1 sm:mr-2" />
                        Отметить
                      </>
                    )}
                  </Button>
                  {!completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompletePrayer(type, true)}
                      className="min-w-[70px] sm:min-w-[100px] border-[hsl(var(--warning))]/50 hover:bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning-dark))] transition-all hover:shadow-md"
                      aria-label={`Восстановить ${name} (qada)`}
                      title="Восстановление долга"
                    >
                      <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Qada</span>
                      <span className="sm:hidden">Q</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Подсказка */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Невыполненные намазы автоматически переносятся в долг в полночь
        </div>
      </CardContent>
    </Card>
  );
};

