import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { PrayerProgressCard } from "./PrayerProgressCard";
import { AddPrayerDialog } from "./AddPrayerDialog";
import { useUserData } from "@/hooks/useUserData";
import { getPrayersArray, calculateProgressStats, formatNumber } from "@/lib/prayer-utils";
import { LoadingCard } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

export const ProgressSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { userData, loading, refreshData } = useUserData();

  // Обновление данных после добавления намазов
  const handleDataUpdate = () => {
    refreshData();
  };

  // Мемоизация массива намазов
  const prayers = useMemo(() => getPrayersArray(userData), [userData]);

  // Мемоизация статистики
  const stats = useMemo(() => calculateProgressStats(userData), [userData]);

  // Показываем загрузку
  if (loading) {
    return <LoadingCard message="Загрузка данных..." />;
  }

  // Если данных нет, показываем empty state
  if (!userData) {
    return (
      <EmptyState
        title="Нет данных"
        message="Для отображения прогресса необходимо сначала рассчитать долг намазов"
        actionLabel="Перейти к расчёту"
        onAction={() => {
          const calculatorTab = document.querySelector('[value="calculator"]') as HTMLElement;
          if (calculatorTab) calculatorTab.click();
        }}
      />
    );
  }


  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in-50 duration-500">
      {/* Overall Progress Card */}
      <Card className="bg-card/98 shadow-xl border-2 border-primary/30 backdrop-blur-md hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl text-foreground mb-2">
                Общий прогресс
              </CardTitle>
              <CardDescription className="text-foreground/90 text-base sm:text-lg">
                Восполнено {formatNumber(stats.totalCompleted)} из {formatNumber(stats.totalMissed)} намазов
              </CardDescription>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-1">
                {stats.overallProgress}%
              </div>
              <div className="text-sm sm:text-base text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stats.dailyPace} намазов/день
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={stats.overallProgress} className="h-3 sm:h-4" />
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between gap-2 text-sm sm:text-base text-muted-foreground">
            <span>Начато {stats.startDate.toLocaleDateString("ru-RU")}</span>
            <span className="font-semibold">Осталось {formatNumber(stats.remaining)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Add Prayer Button */}
      <Button
        onClick={() => setDialogOpen(true)}
        size="lg"
        className="w-full sm:w-auto sm:mx-auto sm:px-8 bg-primary hover:opacity-90 transition-all shadow-glow hover:shadow-glow-gold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Отметить восполненные намазы
      </Button>

      {/* Individual Prayer Progress */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {prayers.map((prayer) => (
          <PrayerProgressCard key={prayer.name} {...prayer} />
        ))}
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-dusk text-white shadow-strong hover:shadow-glow transition-shadow duration-300">
        <CardContent className="pt-6 sm:pt-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">{stats.dailyPace}</div>
              <div className="text-sm sm:text-base opacity-90">Намазов/день</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">{stats.weeklyPace}</div>
              <div className="text-sm sm:text-base opacity-90">Намазов/неделя</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                {stats.monthsToComplete > 0 ? `${stats.monthsToComplete} мес.` : `${stats.daysToComplete} дн.`}
              </div>
              <div className="text-sm sm:text-base opacity-90">До завершения</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddPrayerDialog open={dialogOpen} onOpenChange={setDialogOpen} onUpdate={handleDataUpdate} />
    </div>
  );
};
