import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { PrayerProgressCard } from "./PrayerProgressCard";
import { AddPrayerDialog } from "./AddPrayerDialog";

export const ProgressSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data - будет заменено на реальные данные из API
  const prayers = [
    { name: "Фаджр", completed: 700, total: 1000, color: "prayer-fajr", emoji: "🌅" },
    { name: "Зухр", completed: 600, total: 1000, color: "prayer-dhuhr", emoji: "☀️" },
    { name: "Аср", completed: 550, total: 1000, color: "prayer-asr", emoji: "🌤️" },
    { name: "Магриб", completed: 700, total: 1000, color: "prayer-maghrib", emoji: "🌇" },
    { name: "Иша", completed: 800, total: 1000, color: "prayer-isha", emoji: "🌙" },
    { name: "Витр", completed: 600, total: 1000, color: "prayer-witr", emoji: "✨" },
  ];

  const totalCompleted = prayers.reduce((sum, p) => sum + p.completed, 0);
  const totalPrayers = prayers.reduce((sum, p) => sum + p.total, 0);
  const overallProgress = Math.round((totalCompleted / totalPrayers) * 100);

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
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {overallProgress}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12 сегодня
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-4" />
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>Начато {new Date().toLocaleDateString("ru-RU")}</span>
            <span>Осталось {(totalPrayers - totalCompleted).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Add Prayer Button */}
      <Button
        onClick={() => setDialogOpen(true)}
        size="lg"
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
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
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm opacity-90">Намазов/день</div>
            </div>
            <div>
              <div className="text-2xl font-bold">84</div>
              <div className="text-sm opacity-90">Намазов/неделя</div>
            </div>
            <div>
              <div className="text-2xl font-bold">8 мес.</div>
              <div className="text-sm opacity-90">До завершения</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddPrayerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};
