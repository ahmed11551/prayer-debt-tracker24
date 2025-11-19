// Компонент AI-плана восполнения

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, TrendingUp, Calendar, Target, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { DebtSnapshot } from "@/types/prayer-debt";
import {
  generatePersonalizedPlan,
  generateMotivationalMessage,
  detectMissedPrayerPatterns,
} from "@/lib/ai-functions";

interface RepaymentPlan {
  recommendations: Array<{
    time: string;
    action: string;
    count: number;
  }>;
  currentPace: number; // намазов в день
  estimatedCompletion: {
    months: number;
    days: number;
  };
  weeklyGoal: number;
}

// AI-оптимизатор расписания (упрощенная версия)
function optimizeRepaymentSchedule(snapshot: DebtSnapshot | null): RepaymentPlan {
  if (!snapshot) {
    return {
      recommendations: [],
      currentPace: 0,
      estimatedCompletion: { months: 0, days: 0 },
      weeklyGoal: 0,
    };
  }

  const totalRemaining =
    Object.values(snapshot.remaining_prayers).reduce((sum, val) => sum + val, 0) +
    Object.values(snapshot.debt_calculation.travel_prayers).reduce((sum, val) => sum + val, 0);

  // Расчет текущего темпа (на основе прогресса)
  const totalCompleted = Object.values(snapshot.repayment_progress.completed_prayers).reduce(
    (sum, val) => sum + val,
    0
  );
  const daysSinceStart = Math.max(
    1,
    Math.floor(
      (new Date().getTime() - new Date(snapshot.debt_calculation.period.start).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  const currentPace = Math.round(totalCompleted / daysSinceStart) || 10;

  // Расчет времени до завершения
  const daysToComplete = Math.ceil(totalRemaining / currentPace);
  const months = Math.floor(daysToComplete / 30);
  const days = daysToComplete % 30;

  // Генерация рекомендаций через AI
  const recommendations = generatePersonalizedPlan(snapshot);

  // Еженедельная цель
  const weeklyGoal = currentPace * 7;

  return {
    recommendations,
    currentPace,
    estimatedCompletion: { months, days },
    weeklyGoal,
  };
}

export const RepaymentPlanSection = () => {
  const [plan, setPlan] = useState<RepaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null);
  const [patternWarning, setPatternWarning] = useState<string | null>(null);

  useEffect(() => {
    // Загрузка данных из localStorage или API
    const loadPlan = async () => {
      try {
        // В реальном приложении здесь будет запрос к API
        // Для демо используем localStorage
        const savedData = localStorage.getItem("userPrayerDebt");
        if (savedData) {
          const userData = JSON.parse(savedData);
          const snapshot: DebtSnapshot = {
            user_id: userData.user_id,
            debt_calculation: userData.debt_calculation,
            repayment_progress: userData.repayment_progress,
            overall_progress_percent: 0,
            remaining_prayers: {
              fajr: userData.debt_calculation.missed_prayers.fajr - userData.repayment_progress.completed_prayers.fajr,
              dhuhr: userData.debt_calculation.missed_prayers.dhuhr - userData.repayment_progress.completed_prayers.dhuhr,
              asr: userData.debt_calculation.missed_prayers.asr - userData.repayment_progress.completed_prayers.asr,
              maghrib: userData.debt_calculation.missed_prayers.maghrib - userData.repayment_progress.completed_prayers.maghrib,
              isha: userData.debt_calculation.missed_prayers.isha - userData.repayment_progress.completed_prayers.isha,
              witr: userData.debt_calculation.missed_prayers.witr - userData.repayment_progress.completed_prayers.witr,
            },
          };

          const calculatedPlan = optimizeRepaymentSchedule(snapshot);
          setPlan(calculatedPlan);

          // AI-мотиватор
          const totalCompleted = Object.values(snapshot.repayment_progress.completed_prayers).reduce(
            (sum, val) => sum + val,
            0
          );
          const totalMissed = Object.values(snapshot.debt_calculation.missed_prayers).reduce(
            (sum, val) => sum + val,
            0
          );
          const progressPercent = totalMissed > 0 ? Math.round((totalCompleted / totalMissed) * 100) : 0;
          const message = generateMotivationalMessage(progressPercent, totalCompleted);
          setMotivationalMessage(message);

          // Умный трекер пропусков
          const warning = detectMissedPrayerPatterns(
            snapshot.repayment_progress,
            snapshot.debt_calculation.missed_prayers
          );
          setPatternWarning(warning);
        } else {
          // Дефолтный план, если данных нет
          setPlan({
            recommendations: [
              { time: "После Фаджра", action: "+1 каза", count: 1 },
              { time: "После Асра", action: "+2 каза", count: 2 },
              { time: "В выходные", action: "+5 каза", count: 5 },
            ],
            currentPace: 10,
            estimatedCompletion: { months: 8, days: 12 },
            weeklyGoal: 70,
          });
        }
      } catch (error) {
        console.error("Failed to load plan:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">Загрузка плана...</div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Motivational Message */}
      {motivationalMessage && (
        <Alert className="border-primary/30 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="font-medium">{motivationalMessage}</AlertDescription>
        </Alert>
      )}

      {/* Pattern Warning */}
      {patternWarning && (
        <Alert className="border-accent/30 bg-accent/5">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription>{patternWarning}</AlertDescription>
        </Alert>
      )}

      {/* AI Plan Header */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle>AI-план восполнения</CardTitle>
          </div>
          <CardDescription>
            Персональные рекомендации для эффективного восполнения пропущенных намазов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recommendations */}
          <div className="space-y-3">
            {plan.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">{rec.time}</div>
                    <div className="text-sm text-muted-foreground">{rec.action}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {rec.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Текущий темп</span>
              </div>
              <div className="text-3xl font-bold gradient-text">
                {plan.currentPace}
              </div>
              <p className="text-sm text-muted-foreground">намазов/день</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-4 h-4" />
                <span className="text-sm">Еженедельная цель</span>
              </div>
              <div className="text-3xl font-bold gradient-text">
                {plan.weeklyGoal}
              </div>
              <p className="text-sm text-muted-foreground">намазов/неделя</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">До завершения</span>
              </div>
              <div className="text-2xl font-bold gradient-text">
                {plan.estimatedCompletion.months} мес. {plan.estimatedCompletion.days} дн.
              </div>
              <p className="text-sm text-muted-foreground">при текущем темпе</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-accent">Примечание:</strong> План автоматически обновляется на
            основе вашего текущего прогресса. Рекомендации оптимизированы для равномерного
            распределения нагрузки и учитывают ваши привычки в молитве.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

