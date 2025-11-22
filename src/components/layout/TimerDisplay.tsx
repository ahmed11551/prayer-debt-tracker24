// Компонент таймера для header (00.00.00)

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  className?: string;
}

export const TimerDisplay = ({ className }: TimerDisplayProps) => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      // Можно использовать реальное время или таймер сессии
      // Пока используем статическое время для демонстрации
      const now = new Date();
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  return (
    <div
      className={cn(
        "px-3 py-1.5 rounded-lg",
        "bg-primary/90 backdrop-blur-sm",
        "border border-primary/50",
        "text-accent font-mono text-sm font-semibold",
        "shadow-sm",
        className
      )}
    >
      {formatTime(time.hours)}.{formatTime(time.minutes)}.{formatTime(time.seconds)}
    </div>
  );
};



