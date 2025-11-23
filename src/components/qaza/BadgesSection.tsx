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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500 w-full max-w-full overflow-hidden">
      {/* Заголовок и статистика */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">Достижения</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
            {stats.unlocked} из {stats.total} бейджей разблокировано
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
        </div>
      </div>

      {/* Общий прогресс */}
      <Card className="bg-card/95 shadow-lg border-border/80 backdrop-blur-sm w-full">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Общий прогресс</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="break-words">Разблокировано бейджей</span>
              <span className="font-semibold flex-shrink-0 ml-2">{stats.unlocked} / {stats.total}</span>
            </div>
            <Progress value={stats.progress} className="h-2 sm:h-3 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Текущие streaks */}
      {(currentStreaks.prayer > 0 || currentStreaks.zikr > 0 || currentStreaks.quran > 0) && (
        <Card className="bg-card/95 shadow-lg border-border/80 backdrop-blur-sm w-full">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
              <span>Активные серии</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as BadgeCategory | "all")} className="w-full">
          <TabsList className="w-full sm:w-auto inline-flex h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto scrollbar-hide">
            <TabsTrigger value="all" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">Все</TabsTrigger>
            <TabsTrigger value="prayer" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">Намазы</TabsTrigger>
            <TabsTrigger value="quran" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">Коран</TabsTrigger>
            <TabsTrigger value="zikr" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">Зикры</TabsTrigger>
            <TabsTrigger value="sadaqa" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">Садака</TabsTrigger>
            <TabsTrigger value="streak" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">Серии</TabsTrigger>
            <TabsTrigger value="completion" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">Завершение</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Список бейджей */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
        {filteredBadges.map((badge) => {
          const isUnlocked = !!badge.unlocked_at;
          const colorClass = getBadgeColor(badge.level);

          return (
            <Card
              key={badge.id}
              className={cn(
                "bg-card/95 shadow-lg border-border/80 backdrop-blur-sm transition-all duration-300 w-full min-h-[180px] sm:min-h-[200px] flex flex-col",
                isUnlocked 
                  ? "border-primary/50 shadow-glow" 
                  : "opacity-60"
              )}
            >
              <CardHeader className="pb-2 sm:pb-4 flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "text-2xl sm:text-4xl p-2 sm:p-3 rounded-full border-2 flex-shrink-0",
                      colorClass
                    )}>
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg break-words line-clamp-2">{badge.name}</CardTitle>
                      <CardDescription className="text-xs break-words line-clamp-1">
                        {getBadgeCategoryLabel(badge.category)}
                      </CardDescription>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 flex-1 flex flex-col pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground break-words line-clamp-2 flex-shrink-0">{badge.description}</p>
                
                <div className="space-y-1 sm:space-y-2 flex-shrink-0">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-semibold flex-shrink-0 ml-2">{Math.round(badge.progress)}%</span>
                  </div>
                  <Progress value={badge.progress} className="h-1.5 sm:h-2 w-full" />
                </div>

                <div className="flex items-center justify-between gap-2 mt-auto pt-2 flex-shrink-0">
                  <Badge variant="outline" className={cn("text-xs flex-shrink-0", colorClass)}>
                    {getBadgeLevelLabel(badge.level)}
                  </Badge>
                  {isUnlocked && badge.unlocked_at && (
                    <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
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

