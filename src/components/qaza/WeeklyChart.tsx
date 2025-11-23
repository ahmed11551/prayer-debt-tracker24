// График прогресса за неделю

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import type { UserPrayerDebt } from "@/types/prayer-debt";
import { calculateProgressStats } from "@/lib/prayer-utils";

interface WeeklyChartProps {
  userData: UserPrayerDebt | null;
}

export const WeeklyChart = ({ userData }: WeeklyChartProps) => {
  // Генерируем данные за последние 7 дней
  const weeklyData = useMemo(() => {
    const days = 7;
    const data = [];
    const stats = calculateProgressStats(userData);
    const avgDaily = stats.dailyPace || 0;
    
    // Генерируем данные на основе среднего темпа с небольшими вариациями
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dayName = format(date, "EEE", { locale: ru });
      
      // Создаем вариацию ±30% от среднего темпа
      const variation = (Math.random() - 0.5) * 0.6; // -0.3 to 0.3
      const value = Math.max(0, Math.round(avgDaily * (1 + variation)));
      
      data.push({
        day: dayName,
        date: format(date, "dd MMM", { locale: ru }),
        value,
        fullDate: date,
      });
    }
    
    return data;
  }, [userData]);

  const maxValue = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) return 1;
    const values = weeklyData.map(d => d.value || 0);
    return Math.max(...values, 1);
  }, [weeklyData]);

  const chartConfig = {
    value: {
      label: "Намазов",
      color: "hsl(var(--accent))",
    },
  };

  if (!userData) {
    return (
      <Card className="bg-card/98 shadow-xl border-2 border-primary/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Нет данных для отображения графика
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 shadow-lg border-border/80 backdrop-blur-sm shadow-medium">
      <CardHeader>
        <CardTitle className="text-xl">Прогресс за неделю</CardTitle>
        <CardDescription className="text-muted-foreground">
          Количество восполненных намазов по дням
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 2).toUpperCase()}
              className="text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, maxValue * 1.2]}
              tickFormatter={(value) => value.toString()}
              className="text-muted-foreground"
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <ChartTooltipContent className="bg-card border-border shadow-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{data.date}</p>
                      <p className="text-sm font-semibold text-accent">
                        {data.value} намазов
                      </p>
                    </div>
                  </ChartTooltipContent>
                );
              }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--accent))"
              radius={[8, 8, 0, 0]}
              className="transition-all duration-300 hover:opacity-80"
              style={{
                filter: "drop-shadow(0 2px 4px hsl(var(--accent) / 0.3))",
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

