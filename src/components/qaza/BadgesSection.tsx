// Раздел бейджей и достижений

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Award,
  Target,
  Flame,
  TrendingUp,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge as BadgeType, BadgeCategory } from "@/types/badges";
import {
  loadUserBadges,
  updateAllBadges,
  getBadgeColor,
  getBadgeLevelLabel,
  getBadgeCategoryLabel,
  getCurrentStreak,
} from "@/lib/badges-utils";
import { useUserData } from "@/hooks/useUserData";
import { calculateProgressStats } from "@/lib/prayer-utils";
import { useToast } from "@/hooks/use-toast";

const GOALS_STORAGE_KEY = "smart_goals_v2";

export const BadgesSection = () => {
  const { toast } = useToast();
  const { userData } = useUserData();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | "all">("all");
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // Загрузка целей для статистики
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(GOALS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved, (key, value) => {
          if (key === "start_date" || key === "end_date" || key === "created_at" || key === "updated_at") {
            return new Date(value);
          }
          return value;
        });
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      } catch (error) {
        console.error("Failed to parse goals:", error);
      }
    }

    const handleGoalsUpdate = () => {
      const updated = localStorage.getItem(GOALS_STORAGE_KEY);
      if (updated) {
        try {
          const parsed = JSON.parse(updated, (key, value) => {
            if (key === "start_date" || key === "end_date" || key === "created_at" || key === "updated_at") {
              return new Date(value);
            }
            return value;
          });
          if (Array.isArray(parsed)) {
            setGoals(parsed);
          }
        } catch (error) {
          console.error("Failed to parse goals:", error);
        }
      }
    };

    window.addEventListener('goalsUpdated', handleGoalsUpdate);
    return () => {
      window.removeEventListener('goalsUpdated', handleGoalsUpdate);
    };
  }, []);

  // Обновление бейджей при изменении данных
  useEffect(() => {
    const progressStats = calculateProgressStats(userData || null);
    const prayerStats = {
      totalCompleted: progressStats.totalCompleted,
    };

    // TODO: Добавить статистику зикров и садаки из тасбиха
    const updatedBadges = updateAllBadges(
      goals,
      prayerStats,
      undefined, // zikrStats
      undefined  // sadaqaStats
    );

    setBadges(updatedBadges);
  }, [userData, goals]);

  // Фильтрация бейджей
  const filteredBadges = useMemo(() => {
    let filtered = badges;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }

    if (showOnlyUnlocked) {
      filtered = filtered.filter(b => b.unlocked_at);
    }

    return filtered;
  }, [badges, selectedCategory, showOnlyUnlocked]);

  // Группировка по категориям
  const badgesByCategory = useMemo(() => {
    const grouped: Record<string, BadgeType[]> = {};
    filteredBadges.forEach(badge => {
      const category = badge.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(badge);
    });
    return grouped;
  }, [filteredBadges]);

  // Статистика
  const stats = useMemo(() => {
    const unlocked = badges.filter(b => b.unlocked_at).length;
    const total = badges.length;
    const progress = total > 0 ? (unlocked / total) * 100 : 0;

    return { unlocked, total, progress };
  }, [badges]);

  // Текущие streaks
  const currentStreaks = useMemo(() => {
    return {
      prayer: getCurrentStreak("prayer"),
      zikr: getCurrentStreak("zikr"),
      quran: getCurrentStreak("quran"),
    };
  }, [badges]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Заголовок и статистика */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Достижения</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.unlocked} из {stats.total} бейджей разблокировано
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
      </div>

      {/* Общий прогресс */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Общий прогресс
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Разблокировано бейджей</span>
              <span className="font-semibold">{stats.unlocked} / {stats.total}</span>
            </div>
            <Progress value={stats.progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Текущие streaks */}
      {(currentStreaks.prayer > 0 || currentStreaks.zikr > 0 || currentStreaks.quran > 0) && (
        <Card className="bg-gradient-card shadow-medium border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Активные серии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {currentStreaks.prayer > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{currentStreaks.prayer}</div>
                  <div className="text-xs text-muted-foreground">Намазы</div>
                </div>
              )}
              {currentStreaks.zikr > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{currentStreaks.zikr}</div>
                  <div className="text-xs text-muted-foreground">Зикры</div>
                </div>
              )}
              {currentStreaks.quran > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{currentStreaks.quran}</div>
                  <div className="text-xs text-muted-foreground">Коран</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Фильтры */}
      <div className="flex items-center gap-4">
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as BadgeCategory | "all")}>
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="prayer">Намазы</TabsTrigger>
            <TabsTrigger value="quran">Коран</TabsTrigger>
            <TabsTrigger value="zikr">Зикры</TabsTrigger>
            <TabsTrigger value="sadaqa">Садака</TabsTrigger>
            <TabsTrigger value="streak">Серии</TabsTrigger>
            <TabsTrigger value="completion">Завершение</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Список бейджей */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = !!badge.unlocked_at;
          const colorClass = getBadgeColor(badge.level);

          return (
            <Card
              key={badge.id}
              className={cn(
                "bg-gradient-card shadow-medium border-border/50 transition-all duration-300",
                isUnlocked 
                  ? "border-primary/50 shadow-glow" 
                  : "opacity-60"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "text-4xl p-3 rounded-full border-2",
                      colorClass
                    )}>
                      {badge.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {getBadgeCategoryLabel(badge.category)}
                      </CardDescription>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-semibold">{Math.round(badge.progress)}%</span>
                  </div>
                  <Progress value={badge.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-xs", colorClass)}>
                    {getBadgeLevelLabel(badge.level)}
                  </Badge>
                  {isUnlocked && badge.unlocked_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(badge.unlocked_at).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Нет бейджей в этой категории
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

