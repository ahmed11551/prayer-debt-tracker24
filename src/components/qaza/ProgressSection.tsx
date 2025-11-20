import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { PrayerProgressCard } from "./PrayerProgressCard";
import { AddPrayerDialog } from "./AddPrayerDialog";
import { localStorageAPI, prayerDebtAPI } from "@/lib/api";
import type { UserPrayerDebt } from "@/types/prayer-debt";

export const ProgressSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserPrayerDebt | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Попытка загрузить из API
        try {
          const snapshot = await prayerDebtAPI.getSnapshot();
          // Преобразуем snapshot в UserPrayerDebt для отображения
          const savedData = localStorageAPI.getUserData();
          if (savedData) {
            setUserData(savedData);
          }
        } catch {
          // Если API недоступен, загружаем из localStorage
          const savedData = localStorageAPI.getUserData();
          if (savedData) {
            setUserData(savedData);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  // Обновление данных после добавления намазов
  const handleDataUpdate = () => {
    const savedData = localStorageAPI.getUserData();
    if (savedData) {
      setUserData(savedData);
    }
  };

  // Если данных нет, показываем сообщение
  if (!userData) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <Card className="bg-gradient-card shadow-medium border-border/50">
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                Для отображения прогресса необходимо сначала рассчитать долг намазов
              </p>
              <Button
                onClick={() => {
                  // Переключение на вкладку калькулятора
                  const calculatorTab = document.querySelector('[value="calculator"]') as HTMLElement;
                  if (calculatorTab) calculatorTab.click();
                }}
                className="bg-primary"
              >
                Перейти к расчёту
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const missedPrayers = userData.debt_calculation?.missed_prayers || {};
  const completedPrayers = userData.repayment_progress?.completed_prayers || {};

  const prayers = [
    {
      name: "Фаджр",
      completed: completedPrayers.fajr,
      total: missedPrayers.fajr,
      color: "prayer-fajr",
      emoji: "🌅",
    },
    {
      name: "Зухр",
      completed: completedPrayers.dhuhr,
      total: missedPrayers.dhuhr,
      color: "prayer-dhuhr",
      emoji: "☀️",
    },
    {
      name: "Аср",
      completed: completedPrayers.asr,
      total: missedPrayers.asr,
      color: "prayer-asr",
      emoji: "🌤️",
    },
    {
      name: "Магриб",
      completed: completedPrayers.maghrib,
      total: missedPrayers.maghrib,
      color: "prayer-maghrib",
      emoji: "🌇",
    },
    {
      name: "Иша",
      completed: completedPrayers.isha,
      total: missedPrayers.isha,
      color: "prayer-isha",
      emoji: "🌙",
    },
    {
      name: "Витр",
      completed: completedPrayers.witr,
      total: missedPrayers.witr,
      color: "prayer-witr",
      emoji: "✨",
    },
  ];

  const totalCompleted = prayers.reduce((sum, p) => sum + p.completed, 0);
  const totalPrayers = prayers.reduce((sum, p) => sum + p.total, 0);
  const overallProgress = totalPrayers > 0 ? Math.round((totalCompleted / totalPrayers) * 100) : 0;

  // Расчет статистики
  const startDate = userData.debt_calculation?.period?.start 
    ? new Date(userData.debt_calculation.period.start) 
    : new Date();
  const daysSinceStart = Math.max(
    1,
    Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const dailyPace = Math.round(totalCompleted / daysSinceStart) || 0;
  const weeklyPace = dailyPace * 7;
  const remaining = totalPrayers - totalCompleted;
  const daysToComplete = dailyPace > 0 ? Math.ceil(remaining / dailyPace) : 0;
  const monthsToComplete = Math.floor(daysToComplete / 30);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Overall Progress Card */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Общий прогресс</CardTitle>
              <CardDescription>
                Восполнено {totalCompleted.toLocaleString()} из {totalPrayers.toLocaleString()} намазов
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold gradient-text">
                {overallProgress}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {dailyPace} намазов/день
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-4" />
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>Начато {startDate.toLocaleDateString("ru-RU")}</span>
            <span>Осталось {remaining.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Add Prayer Button */}
      <Button
        onClick={() => setDialogOpen(true)}
        size="lg"
        className="w-full bg-primary hover:opacity-90 transition-opacity shadow-glow"
      >
        <Plus className="w-5 h-5 mr-2" />
        Отметить восполненные намазы
      </Button>

      {/* Individual Prayer Progress */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prayers.map((prayer) => (
          <PrayerProgressCard key={prayer.name} {...prayer} />
        ))}
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-dusk text-white shadow-strong">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{dailyPace}</div>
              <div className="text-sm opacity-90">Намазов/день</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{weeklyPace}</div>
              <div className="text-sm opacity-90">Намазов/неделя</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {monthsToComplete > 0 ? `${monthsToComplete} мес.` : `${daysToComplete} дн.`}
              </div>
              <div className="text-sm opacity-90">До завершения</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddPrayerDialog open={dialogOpen} onOpenChange={setDialogOpen} onUpdate={handleDataUpdate} />
    </div>
  );
};
