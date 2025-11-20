// Компонент календаря намазов с интеграцией каза-намазов

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { localStorageAPI } from "@/lib/api";
import { logPrayerAdded } from "@/lib/audit-log";
import { getTelegramUserId } from "@/lib/telegram";
import type { UserPrayerDebt } from "@/types/prayer-debt";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CalendarEntry {
  date: string; // YYYY-MM-DD
  qazaPrayers: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
    witr: number;
  };
  total: number;
}

const CALENDAR_STORAGE_KEY = "prayer_calendar_entries";

export const PrayerCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Record<string, CalendarEntry>>({});
  const [userData, setUserData] = useState<UserPrayerDebt | null>(null);

  useEffect(() => {
    loadCalendarData();
    loadUserData();
  }, []);

  const loadCalendarData = () => {
    const saved = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setEntries(parsed);
        } else {
          console.warn("Calendar data is not an object, resetting to empty");
          setEntries({});
        }
      } catch (error) {
        console.error("Failed to parse calendar data from localStorage:", error);
        setEntries({});
      }
    }
  };

  const saveCalendarData = (updatedEntries: Record<string, CalendarEntry>) => {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
  };

  const loadUserData = () => {
    const data = localStorageAPI.getUserData();
    if (data) {
      setUserData(data);
    }
  };

  const getDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  const addQazaToCalendar = (date: Date, prayerType: string, count: number = 1) => {
    const dateKey = getDateKey(date);
    const currentEntry = entries[dateKey] || {
      date: dateKey,
      qazaPrayers: {
        fajr: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
        witr: 0,
      },
      total: 0,
    };

    const updatedEntry = {
      ...currentEntry,
      qazaPrayers: {
        ...currentEntry.qazaPrayers,
        [prayerType]: currentEntry.qazaPrayers[prayerType as keyof typeof currentEntry.qazaPrayers] + count,
      },
    };

    updatedEntry.total = Object.values(updatedEntry.qazaPrayers).reduce((sum, val) => sum + val, 0);

    const updatedEntries = {
      ...entries,
      [dateKey]: updatedEntry,
    };

    saveCalendarData(updatedEntries);

    // Обновляем прогресс в основных данных
    if (userData?.repayment_progress?.completed_prayers) {
      const prayerKey = prayerType as keyof typeof userData.repayment_progress.completed_prayers;
      if (userData.repayment_progress.completed_prayers[prayerKey] !== undefined) {
        userData.repayment_progress.completed_prayers[prayerKey] = 
          (userData.repayment_progress.completed_prayers[prayerKey] || 0) + count;
        userData.repayment_progress.last_updated = new Date();
        localStorageAPI.saveUserData(userData);
        setUserData(userData);
      }

      // Логирование в AuditLog
      const userId = getTelegramUserId() || userData.user_id;
      logPrayerAdded(userId, prayerType, count);
    }

    toast({
      title: "Добавлено в календарь",
      description: `${count} ${prayerType} добавлено на ${format(date, "dd.MM.yyyy")}`,
    });
  };

  const getEntryForDate = (date: Date): CalendarEntry | null => {
    return entries[getDateKey(date)] || null;
  };

  const getTotalForMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    let total = 0;

    Object.values(entries).forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        total += entry.total;
      }
    });

    return total;
  };

  const selectedEntry = getEntryForDate(selectedDate);
  const currentMonthTotal = getTotalForMonth(selectedDate);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Calendar Card */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <CardTitle>Календарь намазов</CardTitle>
          </div>
          <CardDescription>
            Отслеживайте восполнение каза-намазов по дням
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasQaza: (date) => {
                  const entry = getEntryForDate(date);
                  return entry !== null && entry.total > 0;
                },
              }}
              modifiersClassNames={{
                hasQaza: "bg-primary/20 border-primary",
              }}
            />

            {/* Month Summary */}
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Всего за {format(selectedDate, "MMMM yyyy")}
                </span>
                <Badge variant="outline" className="text-lg">
                  {currentMonthTotal} намазов
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card className="bg-gradient-card shadow-medium border-border/50">
        <CardHeader>
            <CardTitle>
              {format(selectedDate, "dd MMMM yyyy")}
            </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEntry && selectedEntry.total > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-semibold mb-3">
                Восполнено намазов: {selectedEntry.total}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(selectedEntry.qazaPrayers).map(([prayer, count]) => {
                  if (count === 0) return null;
                  const prayerNames: Record<string, string> = {
                    fajr: "Фаджр",
                    dhuhr: "Зухр",
                    asr: "Аср",
                    maghrib: "Магриб",
                    isha: "Иша",
                    witr: "Витр",
                  };
                  return (
                    <div
                      key={prayer}
                      className="p-2 rounded border border-border bg-secondary/50 text-center"
                    >
                      <div className="text-xs text-muted-foreground">{prayerNames[prayer]}</div>
                      <div className="text-lg font-bold">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              На этот день нет записей о восполненных намазах
            </div>
          )}

          {/* Quick Add */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-sm font-semibold mb-3">Быстрое добавление</div>
            <div className="grid grid-cols-3 gap-2">
              {["fajr", "dhuhr", "asr", "maghrib", "isha", "witr"].map((prayer) => {
                const prayerNames: Record<string, string> = {
                  fajr: "Фаджр",
                  dhuhr: "Зухр",
                  asr: "Аср",
                  maghrib: "Магриб",
                  isha: "Иша",
                  witr: "Витр",
                };
                return (
                  <Button
                    key={prayer}
                    variant="outline"
                    size="sm"
                    onClick={() => addQazaToCalendar(selectedDate, prayer, 1)}
                    className="h-auto py-2 flex flex-col gap-1"
                  >
                    <span className="text-xs">{prayerNames[prayer]}</span>
                    <Plus className="w-3 h-3" />
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-gradient-dusk text-white shadow-strong">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {Object.keys(entries).length}
              </div>
              <div className="text-sm opacity-90">Дней с намазами</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.values(entries).reduce((sum, e) => sum + e.total, 0)}
              </div>
              <div className="text-sm opacity-90">Всего намазов</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.values(entries).length > 0
                  ? Math.round(
                      Object.values(entries).reduce((sum, e) => sum + e.total, 0) /
                        Object.keys(entries).length
                    )
                  : 0}
              </div>
              <div className="text-sm opacity-90">Среднее/день</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

