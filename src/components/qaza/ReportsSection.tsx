import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, TrendingUp, Calendar, Target, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ReportsSection = () => {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    toast({
      title: "PDF отчёт формируется",
      description: "Ваш отчёт будет готов через несколько секунд",
    });
  };

  const handleShare = () => {
    toast({
      title: "Поделиться прогрессом",
      description: "Функция обмена будет доступна в следующей версии",
    });
  };

  const stats = [
    {
      icon: Calendar,
      label: "Дата начала",
      value: "15.01.2024",
      description: "Начало отслеживания",
    },
    {
      icon: Target,
      label: "Всего восполнено",
      value: "3,360",
      description: "намазов выполнено",
    },
    {
      icon: TrendingUp,
      label: "Осталось",
      value: "1,440",
      description: "намазов до завершения",
    },
    {
      icon: Clock,
      label: "Средний темп",
      value: "12/день",
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
                <div className="text-3xl font-bold">8</div>
                <div className="text-sm opacity-90">месяцев</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm opacity-90">дней</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">70%</div>
                <div className="text-sm opacity-90">выполнено</div>
              </div>
            </div>
            <p className="text-sm opacity-90 text-center">
              При текущем темпе (12 намазов/день)
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
          size="lg"
          className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
        >
          <Download className="w-5 h-5 mr-2" />
          Скачать PDF отчёт
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
