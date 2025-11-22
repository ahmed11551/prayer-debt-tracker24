// Компонент для отображения прогресса ежедневных азкаров (5x99)

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PrayerSegment, DailyAzkar } from "@/types/tasbih";
import { useToast } from "@/hooks/use-toast";

interface DailyAzkarProgressProps {
  dailyAzkar: DailyAzkar | null;
  onSegmentClick: (segment: PrayerSegment) => void;
}

const PRAYER_SEGMENTS: { key: PrayerSegment; label: string; emoji: string }[] = [
  { key: "fajr", label: "Фаджр", emoji: "🌅" },
  { key: "dhuhr", label: "Зухр", emoji: "☀️" },
  { key: "asr", label: "Аср", emoji: "🌤️" },
  { key: "maghrib", label: "Магриб", emoji: "🌆" },
  { key: "isha", label: "Иша", emoji: "🌙" },
];

export const DailyAzkarProgress = ({ dailyAzkar, onSegmentClick }: DailyAzkarProgressProps) => {
  const { toast } = useToast();
  const TARGET_COUNT = 99;

  const getProgress = (segment: PrayerSegment): number => {
    if (!dailyAzkar) return 0;
    const count = dailyAzkar[segment] || 0;
    return Math.min(100, (count / TARGET_COUNT) * 100);
  };

  const isComplete = (segment: PrayerSegment): boolean => {
    if (!dailyAzkar) return false;
    return (dailyAzkar[segment] || 0) >= TARGET_COUNT;
  };

  const getCount = (segment: PrayerSegment): number => {
    if (!dailyAzkar) return 0;
    return dailyAzkar[segment] || 0;
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Ежедневные азкары (5×99)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {PRAYER_SEGMENTS.map(({ key, label, emoji }) => {
          const progress = getProgress(key);
          const complete = isComplete(key);
          const count = getCount(key);
          const remaining = TARGET_COUNT - count;

          return (
            <div
              key={key}
              className={cn(
                "p-3 rounded-lg border transition-all cursor-pointer",
                complete
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-secondary/30 border-border/50 hover:border-primary/50"
              )}
              onClick={() => onSegmentClick(key)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <span className="font-semibold">{label}</span>
                </div>
                <div className="text-right">
                  {complete ? (
                    <span className="text-sm font-bold text-green-500">✓ Завершено</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {count} / {TARGET_COUNT}
                    </span>
                  )}
                </div>
              </div>
              <Progress 
                value={progress} 
                className={cn(
                  "h-2",
                  complete && "bg-green-500"
                )}
              />
              {!complete && (
                <div className="text-xs text-muted-foreground mt-1">
                  Осталось: {remaining}
                </div>
              )}
            </div>
          );
        })}
        
        {dailyAzkar && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Всего сегодня:</span>
              <span className="font-semibold text-accent">
                {dailyAzkar.total} / {PRAYER_SEGMENTS.length * TARGET_COUNT}
              </span>
            </div>
            <Progress 
              value={(dailyAzkar.total / (PRAYER_SEGMENTS.length * TARGET_COUNT)) * 100} 
              className="h-2 mt-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};



