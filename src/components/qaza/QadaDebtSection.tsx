/**
 * Компонент для отображения накопленного долга (Qada)
 * Показывает сколько намазов нужно восстановить
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserData } from "@/hooks/useUserData";
import { getPrayersArray } from "@/lib/prayer-utils";
import { formatNumber } from "@/lib/prayer-utils";
import { AlertCircle, RotateCcw, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { useDailyPrayerTracker } from "@/hooks/useDailyPrayerTracker";
import type { PrayerType } from "@/lib/daily-prayer-tracker";

const PRAYER_EMOJI: Record<string, string> = {
  Фаджр: "🌅",
  Зухр: "☀️",
  Аср: "🌤️",
  Магриб: "🌇",
  Иша: "🌙",
  Витр: "✨",
};

export const QadaDebtSection = () => {
  const { userData } = useUserData();
  const { completePrayer } = useDailyPrayerTracker();

  // Получаем данные о долге
  const debtData = useMemo(() => {
    if (!userData || !userData.debt_calculation) {
      return null;
    }

    const missedPrayers = userData.debt_calculation.missed_prayers || {};
    const completedPrayers = userData.repayment_progress?.completed_prayers || {};

    const prayers = getPrayersArray(userData);
    
    // Рассчитываем остаток долга для каждого намаза
    const debtByPrayer = prayers.map((prayer) => {
      const remaining = Math.max(0, prayer.total - prayer.completed);
      return {
        ...prayer,
        remaining,
        hasDebt: remaining > 0,
      };
    });

    const totalDebt = debtByPrayer.reduce((sum, p) => sum + p.remaining, 0);
    const totalCompleted = debtByPrayer.reduce((sum, p) => sum + p.completed, 0);
    const totalOriginal = debtByPrayer.reduce((sum, p) => sum + p.total, 0);

    return {
      prayers: debtByPrayer,
      totalDebt,
      totalCompleted,
      totalOriginal,
      completionRate: totalOriginal > 0 ? Math.round((totalCompleted / totalOriginal) * 100) : 0,
    };
  }, [userData]);

  if (!debtData) {
    return null;
  }

  // Если долга нет, не показываем секцию
  if (debtData.totalDebt === 0) {
    return (
      <Card className="bg-green-500/10 border-green-500/30 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <TrendingDown className="w-5 h-5" />
            <div>
              <p className="font-semibold">Отлично! Весь долг восстановлен</p>
              <p className="text-sm text-muted-foreground">
                Вы восстановили все {formatNumber(debtData.totalCompleted)} намазов
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Маппинг имен намазов на типы
  const prayerTypeMap: Record<string, PrayerType> = {
    Фаджр: "fajr",
    Зухр: "dhuhr",
    Аср: "asr",
    Магриб: "maghrib",
    Иша: "isha",
    Витр: "witr",
  };

  const handleRestore = (prayerName: string) => {
    const prayerType = prayerTypeMap[prayerName];
    if (prayerType) {
      completePrayer(prayerType, true); // true = это восстановление долга
    }
  };

  return (
    <Card className="bg-card/95 shadow-lg border-border/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Накопленный долг (Qada)
            </CardTitle>
            <CardDescription>
              Намазы, которые нужно восстановить
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {formatNumber(debtData.totalDebt)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Предупреждение */}
        <Alert className="bg-orange-500/10 border-orange-500/30">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            Невыполненные намазы автоматически добавляются в долг в полночь. 
            Восстановите их, отметив как "Восстановление долга".
          </AlertDescription>
        </Alert>

        {/* Список долга по намазам */}
        <div className="space-y-2">
          {debtData.prayers
            .filter((p) => p.hasDebt)
            .map((prayer) => (
              <div
                key={prayer.name}
                className="flex items-center justify-between p-3 rounded-lg border border-orange-500/30 bg-orange-500/5"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{PRAYER_EMOJI[prayer.name] || "📿"}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{prayer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Осталось восстановить: {formatNumber(prayer.remaining)} из {formatNumber(prayer.total)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(prayer.name)}
                  className="min-w-[120px] border-orange-500/50 hover:bg-orange-500/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Восстановить
                </Button>
              </div>
            ))}
        </div>

        {/* Статистика */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Восстановлено:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatNumber(debtData.totalCompleted)} / {formatNumber(debtData.totalOriginal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Осталось восстановить:</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {formatNumber(debtData.totalDebt)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс восстановления:</span>
            <span className="font-semibold">{debtData.completionRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
