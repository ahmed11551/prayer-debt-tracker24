// Индикатор дней подряд (streak)

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp } from "lucide-react";
import { getCurrentStreak } from "@/lib/badges-utils";
import { cn } from "@/lib/utils";

export const StreakIndicator = () => {
  // Получаем streak для намазов
  const streakValue = useMemo(() => {
    return getCurrentStreak("prayer");
  }, []);

  const isActive = streakValue > 0;

  // Определяем уровень streak
  const getStreakLevel = (days: number) => {
    if (days >= 100) return { label: "Легенда", color: "text-purple-500", bg: "bg-purple-500/10" };
    if (days >= 30) return { label: "Мастер", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (days >= 7) return { label: "Сильный", color: "text-green-500", bg: "bg-green-500/10" };
    if (days >= 3) return { label: "Начало", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { label: "Нет", color: "text-muted-foreground", bg: "bg-muted/10" };
  };

  const level = getStreakLevel(streakValue);

  return (
    <Card className={cn(
      "bg-gradient-card border-border/50 shadow-medium transition-all",
      isActive && "border-accent/30 shadow-glow-gold"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Flame className={cn(
            "w-5 h-5",
            isActive ? "text-accent animate-pulse" : "text-muted-foreground"
          )} />
          Дней подряд
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Основной индикатор - круговой с золотым акцентом */}
          <div className="flex items-center justify-center">
            <div className={cn(
              "relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 transition-all",
              isActive
                ? "border-accent bg-accent/10 shadow-glow-gold"
                : "border-muted bg-muted/5"
            )}>
              {/* Внутреннее свечение */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-xl" />
              )}
              
              <div className="relative text-center z-10">
                <div className={cn(
                  "text-5xl sm:text-6xl font-bold gradient-text-gold",
                  !isActive && "text-muted-foreground"
                )}>
                  {streakValue}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  дней
                </div>
              </div>
              
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-75" />
              )}
            </div>
          </div>

          {/* Уровень */}
          <div className={cn(
            "text-center px-4 py-2 rounded-lg",
            level.bg
          )}>
            <div className={cn("text-sm font-semibold", level.color)}>
              {level.label}
            </div>
          </div>

          {/* Мотивационное сообщение */}
          {isActive && (
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                {streakValue === 1 && "Отличное начало! Продолжайте в том же духе 🔥"}
                {streakValue >= 2 && streakValue < 7 && "Отличная работа! Не останавливайтесь! 🔥"}
                {streakValue >= 7 && streakValue < 30 && "Неделя подряд! Вы на правильном пути! 🌟"}
                {streakValue >= 30 && streakValue < 100 && "Месяц подряд! Невероятно! 🎉"}
                {streakValue >= 100 && "Легенда! Вы вдохновляете! 👑"}
              </p>
            </div>
          )}

          {!isActive && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Начните восполнять намазы, чтобы создать streak!
              </p>
            </div>
          )}

          {/* Прогресс к следующему уровню */}
          {isActive && streakValue < 100 && (() => {
            const nextMilestone = streakValue < 3 ? 3 : streakValue < 7 ? 7 : streakValue < 30 ? 30 : 100;
            const daysToNext = nextMilestone - streakValue;
            const progressPercent = Math.min(100, (streakValue / nextMilestone) * 100);
            
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>До следующего уровня:</span>
                  <span className="font-semibold text-foreground">
                    {daysToNext} дней
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500",
                      "shadow-glow-gold"
                    )}
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

