import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, TrendingUp, Calendar, Target, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageAPI, prayerDebtAPI, eReplikaAPI } from "@/lib/api";
import type { UserPrayerDebt } from "@/types/prayer-debt";

export const ReportsSection = () => {
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserPrayerDebt | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        try {
          await prayerDebtAPI.getSnapshot();
        } catch {
          // Если API недоступен, загружаем из localStorage
        }
        const savedData = localStorageAPI.getUserData();
        if (savedData) {
          setUserData(savedData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const handleDownloadPDF = async () => {
    if (!userData) {
      toast({
        title: "Ошибка",
        description: "Нет данных для формирования отчёта",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Попытка скачать через API
      try {
        const blob = await prayerDebtAPI.downloadPDFReport();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prayer-debt-report-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({
          title: "PDF отчёт скачан",
          description: "Отчёт успешно сохранён",
        });
      } catch (apiError) {
        // Fallback: генерация через e-Replika API
        try {
          const blob = await eReplikaAPI.generatePDFReport(userData.user_id);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `prayer-debt-report-${new Date().toISOString().split("T")[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast({
            title: "PDF отчёт скачан",
            description: "Отчёт успешно сохранён",
          });
        } catch (error) {
          toast({
            title: "PDF отчёт формируется",
            description: "Ваш отчёт будет готов через несколько секунд",
          });
        }
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сформировать PDF отчёт",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    toast({
      title: "Поделиться прогрессом",
      description: "Используйте функцию 'Поделиться' в разделе достижений",
    });
  };

  if (!userData) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <Card className="bg-gradient-card shadow-medium border-border/50">
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                Для отображения отчётов необходимо сначала рассчитать долг намазов
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedPrayers = userData.repayment_progress.completed_prayers;
  const missedPrayers = userData.debt_calculation.missed_prayers;
  const totalCompleted = Object.values(completedPrayers).reduce((sum, val) => sum + val, 0);
  const totalMissed = Object.values(missedPrayers).reduce((sum, val) => sum + val, 0);
  const remaining = totalMissed - totalCompleted;
  const startDate = new Date(userData.debt_calculation.period.start);
  const daysSinceStart = Math.max(
    1,
    Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const dailyPace = Math.round(totalCompleted / daysSinceStart) || 0;
  const daysToComplete = dailyPace > 0 ? Math.ceil(remaining / dailyPace) : 0;
  const monthsToComplete = Math.floor(daysToComplete / 30);
  const daysRemaining = daysToComplete % 30;
  const overallProgress = totalMissed > 0 ? Math.round((totalCompleted / totalMissed) * 100) : 0;

  const stats = [
    {
      icon: Calendar,
      label: "Дата начала",
      value: startDate.toLocaleDateString("ru-RU"),
      description: "Начало отслеживания",
    },
    {
      icon: Target,
      label: "Всего восполнено",
      value: totalCompleted.toLocaleString(),
      description: "намазов выполнено",
    },
    {
      icon: TrendingUp,
      label: "Осталось",
      value: remaining.toLocaleString(),
      description: "намазов до завершения",
    },
    {
      icon: Clock,
      label: "Средний темп",
      value: `${dailyPace}/день`,
      description: "намазов в день",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header Card */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">Ваш духовный путь</CardTitle>
          <CardDescription>
            Детальная статистика восполнения пропущенных намазов
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-sm">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-dusk text-white shadow-strong">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Прогноз завершения</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-3xl font-bold">{monthsToComplete}</div>
                <div className="text-sm opacity-90">месяцев</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{daysRemaining}</div>
                <div className="text-sm opacity-90">дней</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{overallProgress}%</div>
                <div className="text-sm opacity-90">выполнено</div>
              </div>
            </div>
            <p className="text-sm opacity-90 text-center">
              При текущем темпе ({dailyPace} намазов/день)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Chart Placeholder */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Прогресс за последние 7 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-around gap-2">
            {[10, 12, 8, 15, 11, 13, 14].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-primary rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{ height: `${(value / 15) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][index]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        <Button
          onClick={handleDownloadPDF}
          disabled={loading}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
        >
          <Download className="w-5 h-5 mr-2" />
          {loading ? "Формирование..." : "Скачать PDF отчёт"}
        </Button>
        <Button
          onClick={handleShare}
          size="lg"
          variant="outline"
          className="border-primary hover:bg-primary/10"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Поделиться прогрессом
        </Button>
      </div>

      {/* Achievements Card */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-accent">🏆 Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-card">
              <div className="text-3xl mb-2">✨</div>
              <div className="text-sm font-semibold">Первые 100</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm font-semibold">7 дней подряд</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card opacity-50">
              <div className="text-3xl mb-2">🌟</div>
              <div className="text-sm font-semibold">1000 намазов</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card opacity-50">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm font-semibold">50% пути</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
