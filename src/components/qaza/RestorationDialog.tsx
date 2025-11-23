/**
 * Диалог для восстановления долга (Qada)
 * Позволяет отметить восстановленные намазы
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { prayerDebtAPI, localStorageAPI } from "@/lib/api";
import { logPrayerAdded, logProgressUpdate } from "@/lib/audit-log";
import { getTelegramUserId } from "@/lib/telegram";
import type { PrayerType } from "@/lib/daily-prayer-tracker";
import { markPrayerCompleted } from "@/lib/daily-prayer-tracker";

interface RestorationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  remainingDebt: Array<{
    name: string;
    completed: number;
    total: number;
    remaining: number;
    emoji: string;
  }>;
}

const PRAYER_MAP: Record<string, PrayerType> = {
  Фаджр: "fajr",
  Зухр: "dhuhr",
  Аср: "asr",
  Магриб: "maghrib",
  Иша: "isha",
  Витр: "witr",
};

export const RestorationDialog = ({
  open,
  onOpenChange,
  onUpdate,
  remainingDebt,
}: RestorationDialogProps) => {
  const { toast } = useToast();
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Инициализируем счетчики только для намазов с долгом
  const initializeCounts = () => {
    const initial: Record<string, number> = {};
    remainingDebt.forEach((prayer) => {
      if (prayer.remaining > 0) {
        initial[prayer.name] = 0;
      }
    });
    setCounts(initial);
  };

  // Инициализация при открытии
  useEffect(() => {
    if (open) {
      initializeCounts();
    }
  }, [open]);

  const increment = (name: string, max: number) => {
    setCounts((prev) => ({
      ...prev,
      [name]: Math.min((prev[name] || 0) + 1, max),
    }));
  };

  const decrement = (name: string) => {
    setCounts((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) - 1),
    }));
  };

  const handleSave = async () => {
    const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      toast({
        title: "Не выбрано намазов",
        description: "Выберите хотя бы один намаз для восстановления",
        variant: "destructive",
      });
      return;
    }

    try {
      // Получаем данные до обновления
      const userDataBefore = localStorageAPI.getUserData();
      const beforeProgress = userDataBefore?.repayment_progress.completed_prayers;

      // Подготовка запроса для обновления прогресса
      const entries = Object.entries(counts)
        .filter(([_, value]) => value > 0)
        .map(([name, amount]) => {
          const prayerType = PRAYER_MAP[name];
          return {
            type: prayerType,
            amount,
          };
        });

      // Попытка обновить через API
      try {
        await prayerDebtAPI.updateProgress({ entries });
      } catch (apiError) {
        // Если API недоступен, обновляем localStorage
        const userData = localStorageAPI.getUserData();
        if (userData && userData.repayment_progress) {
          Object.entries(counts).forEach(([name, count]) => {
            if (count > 0) {
              const prayerType = PRAYER_MAP[name] as keyof typeof userData.repayment_progress.completed_prayers;
              if (prayerType && userData.repayment_progress.completed_prayers[prayerType] !== undefined) {
                userData.repayment_progress.completed_prayers[prayerType] += count;
              }
            }
          });
          userData.repayment_progress.last_updated = new Date();
          localStorageAPI.saveUserData(userData);
        }
      }

      // Отмечаем намазы как восстановленные в ежедневном трекере
      Object.entries(counts).forEach(([name, count]) => {
        if (count > 0) {
          const prayerType = PRAYER_MAP[name];
          if (prayerType) {
            // Отмечаем каждый восстановленный намаз
            for (let i = 0; i < count; i++) {
              markPrayerCompleted(prayerType, new Date(), true); // isQada = true
            }
          }
        }
      });

      // Обновляем долг - уменьшаем на восстановленное количество
      const userData = localStorageAPI.getUserData();
      if (userData && userData.debt_calculation) {
        Object.entries(counts).forEach(([name, count]) => {
          if (count > 0) {
            const prayerType = PRAYER_MAP[name] as keyof typeof userData.debt_calculation.missed_prayers;
            if (prayerType && userData.debt_calculation.missed_prayers[prayerType] !== undefined) {
              const current = userData.debt_calculation.missed_prayers[prayerType] || 0;
              userData.debt_calculation.missed_prayers[prayerType] = Math.max(0, current - count);
            }
          }
        });
        localStorageAPI.saveUserData(userData);
      }

      // Логирование
      const userId = getTelegramUserId() || userData?.user_id;
      if (userId && beforeProgress) {
        const afterProgress = userData?.repayment_progress?.completed_prayers;
        if (afterProgress) {
          logProgressUpdate(userId, beforeProgress, afterProgress, counts);
        }
      }

      Object.entries(counts).forEach(([prayer, count]) => {
        if (count > 0) {
          const prayerType = PRAYER_MAP[prayer];
          if (prayerType && userId) {
            logPrayerAdded(userId, prayerType, count);
          }
        }
      });

      toast({
        title: "Долг восстановлен",
        description: `Восстановлено ${total} намазов. Долг уменьшен.`,
      });

      setCounts({});
      onOpenChange(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to restore debt:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось восстановить долг",
        variant: "destructive",
      });
    }
  };

  const prayersWithDebt = remainingDebt.filter((p) => p.remaining > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Восстановление долга (Каза)
          </DialogTitle>
          <DialogDescription>
            Отметьте количество восстановленных намазов. Долг будет автоматически уменьшен.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {prayersWithDebt.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет долга для восстановления
            </div>
          ) : (
            prayersWithDebt.map((prayer) => (
              <div key={prayer.name} className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base flex-1">
                  <span>{prayer.emoji}</span>
                  <div>
                    <span>{prayer.name}</span>
                    <div className="text-xs text-muted-foreground">
                      Осталось: {prayer.remaining}
                    </div>
                  </div>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decrement(prayer.name)}
                    className="h-8 w-8"
                    disabled={(counts[prayer.name] || 0) === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={counts[prayer.name] || 0}
                    onChange={(e) =>
                      setCounts((prev) => ({
                        ...prev,
                        [prayer.name]: Math.max(
                          0,
                          Math.min(
                            parseInt(e.target.value) || 0,
                            prayer.remaining
                          )
                        ),
                      }))
                    }
                    className="w-16 text-center"
                    min={0}
                    max={prayer.remaining}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => increment(prayer.name, prayer.remaining)}
                    className="h-8 w-8"
                    disabled={(counts[prayer.name] || 0) >= prayer.remaining}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setCounts({});
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:opacity-90"
            disabled={Object.values(counts).reduce((sum, val) => sum + val, 0) === 0}
          >
            Восстановить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

