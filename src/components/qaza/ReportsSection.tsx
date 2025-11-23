import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, TrendingUp, Calendar, Target, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eReplikaAPI } from "@/lib/api";
import { useUserData } from "@/hooks/useUserData";
import { calculateProgressStats, formatNumber } from "@/lib/prayer-utils";
import { WeeklyChart } from "./WeeklyChart";
import { StreakIndicator } from "./StreakIndicator";
import { useDebounce } from "@/hooks/useDebounce";
import { LoadingCard } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

export const ReportsSection = () => {
  const { toast } = useToast();
  const { userData, loading: userDataLoading, refreshData } = useUserData();
  const [loading, setLoading] = useState(false);

  // Обновляем данные при монтировании и при событиях обновления
  useEffect(() => {
    const handleDataUpdate = () => {
      refreshData();
    };

    window.addEventListener('userDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleDataUpdate);
    };
  }, [refreshData]);

  // Валидация данных перед расчетом статистики
  const isValidUserData = useMemo(() => {
    if (!userData) return false;
    
    // Проверяем наличие обязательных полей
    const hasDebtCalculation = userData.debt_calculation && 
      typeof userData.debt_calculation === 'object' &&
      userData.debt_calculation.missed_prayers &&
      typeof userData.debt_calculation.missed_prayers === 'object';
    
    const hasRepaymentProgress = userData.repayment_progress &&
      typeof userData.repayment_progress === 'object' &&
      userData.repayment_progress.completed_prayers &&
      typeof userData.repayment_progress.completed_prayers === 'object';
    
    return hasDebtCalculation && hasRepaymentProgress;
  }, [userData]);

  // Мемоизация статистики с обработкой ошибок
  const stats = useMemo(() => {
    try {
      if (!isValidUserData) {
        return calculateProgressStats(null);
      }
      return calculateProgressStats(userData);
    } catch (error) {
      console.error("Error calculating stats:", error);
      return calculateProgressStats(null);
    }
  }, [userData, isValidUserData]);

  const handleDownloadPDFInternal = async () => {
    if (!userData) {
      toast({
        title: "Ошибка",
        description: "Нет данных для формирования отчёта",
        variant: "destructive",
      });
      return;
    }

    if (loading) return; // Защита от повторного клика

    setLoading(true);
    try {
      // Генерация через e-Replika API
      const userId = userData.user_id || `user_${Date.now()}`;
      const blob = await eReplikaAPI.generatePDFReport(userId, userData);
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
      console.error("Failed to generate PDF:", error);
      toast({
        title: "Ошибка генерации PDF",
        description: error instanceof Error ? error.message : "Не удалось сгенерировать PDF отчёт. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Защита от двойного клика
  const handleDownloadPDF = useDebounce(handleDownloadPDFInternal, 1000);

  const handleShare = useDebounce(() => {
    toast({
      title: "Поделиться прогрессом",
      description: "Используйте функцию 'Поделиться' в разделе достижений",
    });
  }, 300);

  // Показываем загрузку
  if (userDataLoading) {
    return <LoadingCard message="Загрузка данных..." />;
  }

  // Показываем сообщение, если нет данных или данные невалидны
  if (!userData || !isValidUserData) {
    return (
      <EmptyState
        title={!userData ? "Нет данных" : "Неполные данные"}
        message={
          !userData 
            ? "Для отображения отчётов необходимо сначала рассчитать долг намазов"
            : "Данные неполные. Пожалуйста, выполните расчет заново."
        }
        actionLabel="Перейти к калькулятору"
        onAction={() => {
          const calculatorTab = document.querySelector('[value="calculator"]') as HTMLElement;
          if (calculatorTab) calculatorTab.click();
        }}
      />
    );
  }

  // Мемоизация массива статистики с безопасной обработкой даты
  const statsArray = useMemo(() => {
    try {
      const startDate = stats.startDate instanceof Date && !isNaN(stats.startDate.getTime())
        ? stats.startDate
        : new Date();
      
      return [
        {
          icon: Calendar,
          label: "Дата начала",
          value: startDate.toLocaleDateString("ru-RU", { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          description: "Начало отслеживания",
        },
        {
          icon: Target,
          label: "Всего восполнено",
          value: formatNumber(stats.totalCompleted),
          description: "намазов выполнено",
        },
        {
          icon: TrendingUp,
          label: "Осталось",
          value: formatNumber(stats.remaining),
          description: "намазов до завершения",
        },
        {
          icon: Clock,
          label: "Средний темп",
          value: `${stats.dailyPace}/день`,
          description: "намазов в день",
        },
      ];
    } catch (error) {
      console.error("Error creating stats array:", error);
      return [
        {
          icon: Calendar,
          label: "Дата начала",
          value: new Date().toLocaleDateString("ru-RU"),
          description: "Начало отслеживания",
        },
        {
          icon: Target,
          label: "Всего восполнено",
          value: "0",
          description: "намазов выполнено",
        },
        {
          icon: TrendingUp,
          label: "Осталось",
          value: "0",
          description: "намазов до завершения",
        },
        {
          icon: Clock,
          label: "Средний темп",
          value: "0/день",
          description: "намазов в день",
        },
      ];
    }
  }, [stats]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 w-full">
      {/* Header Card */}
      <Card className="bg-card/95 shadow-lg border-border/80 backdrop-blur-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl break-words">Ваш духовный путь</CardTitle>
          <CardDescription className="break-words">
            Детальная статистика восполнения пропущенных намазов
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid - Fixed heights for stability */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {statsArray.map((stat) => (
          <Card key={stat.label} className="bg-gradient-to-br from-card/95 to-card/90 shadow-lg border-2 border-primary/20 backdrop-blur-sm w-full min-h-[140px] sm:min-h-[160px] flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="pt-4 sm:pt-6 flex-1 flex flex-col">
              <div className="space-y-2 sm:space-y-3 flex-1">
                <div className="flex items-center gap-2 text-muted-foreground min-h-[20px]">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm break-words line-clamp-2 font-medium">{stat.label}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold gradient-text break-words min-h-[40px] flex items-center">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground break-words line-clamp-2 leading-relaxed">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-dusk text-white shadow-strong w-full border-2 border-primary/30 hover:shadow-glow transition-shadow duration-300">
        <CardContent className="pt-6 sm:pt-8">
          <div className="space-y-4 sm:space-y-6 w-full">
            <h3 className="text-lg sm:text-xl font-bold break-words text-center">Прогноз завершения</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center w-full">
              <div className="space-y-2 min-h-[90px] flex flex-col justify-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold break-words">{stats.monthsToComplete}</div>
                <div className="text-xs sm:text-sm opacity-90 font-medium">месяцев</div>
              </div>
              <div className="space-y-2 min-h-[90px] flex flex-col justify-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold break-words">{stats.daysRemaining}</div>
                <div className="text-xs sm:text-sm opacity-90 font-medium">дней</div>
              </div>
              <div className="space-y-2 min-h-[90px] flex flex-col justify-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold break-words">{stats.overallProgress}%</div>
                <div className="text-xs sm:text-sm opacity-90 font-medium">выполнено</div>
              </div>
            </div>
            <p className="text-xs sm:text-sm opacity-90 text-center break-words font-medium">
              При текущем темпе ({stats.dailyPace} намазов/день)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Chart and Streak Indicator */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
        {(() => {
          try {
            return <div className="w-full min-w-0"><WeeklyChart userData={userData} /></div>;
          } catch (error) {
            console.error("Error rendering WeeklyChart:", error);
            return (
              <Card className="bg-card/98 shadow-xl border-2 border-primary/30 backdrop-blur-md w-full min-h-[300px]">
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Не удалось загрузить график
                  </div>
                </CardContent>
              </Card>
            );
          }
        })()}
        {(() => {
          try {
            return <div className="w-full min-w-0"><StreakIndicator /></div>;
          } catch (error) {
            console.error("Error rendering StreakIndicator:", error);
            return (
              <Card className="bg-card/98 shadow-xl border-2 border-primary/30 backdrop-blur-md w-full min-h-[300px]">
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Не удалось загрузить индикатор
                  </div>
                </CardContent>
              </Card>
            );
          }
        })()}
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
        <Button
          onClick={handleDownloadPDF}
          disabled={loading}
          size="lg"
          className="bg-primary hover:opacity-90 transition-opacity shadow-glow w-full min-h-[44px]"
          aria-label="Скачать PDF отчёт"
        >
          <Download className="w-5 h-5 mr-2" aria-hidden="true" />
          <span className="break-words">{loading ? "Формирование..." : "Скачать PDF отчёт"}</span>
        </Button>
        <Button
          onClick={handleShare}
          size="lg"
          variant="outline"
          className="border-primary hover:bg-primary/10 w-full min-h-[44px]"
          aria-label="Поделиться прогрессом"
        >
          <Share2 className="w-5 h-5 mr-2" aria-hidden="true" />
          <span className="break-words">Поделиться прогрессом</span>
        </Button>
      </div>

      {/* Achievements Card */}
      <Card className="border-accent/30 bg-accent/5 w-full">
        <CardHeader>
          <CardTitle className="text-accent break-words">🏆 Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="text-center p-4 rounded-lg bg-card min-h-[120px] flex flex-col justify-center">
              <div className="text-3xl mb-2" aria-hidden="true">✨</div>
              <div className="text-sm font-semibold break-words line-clamp-2">Первые 100</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card min-h-[120px] flex flex-col justify-center">
              <div className="text-3xl mb-2" aria-hidden="true">🔥</div>
              <div className="text-sm font-semibold break-words line-clamp-2">7 дней подряд</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card opacity-50 min-h-[120px] flex flex-col justify-center">
              <div className="text-3xl mb-2" aria-hidden="true">🌟</div>
              <div className="text-sm font-semibold break-words line-clamp-2">1000 намазов</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card opacity-50 min-h-[120px] flex flex-col justify-center">
              <div className="text-3xl mb-2" aria-hidden="true">🎯</div>
              <div className="text-sm font-semibold break-words line-clamp-2">50% пути</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
