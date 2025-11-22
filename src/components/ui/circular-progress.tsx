// Компонент кругового прогресса для целей

import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: "default" | "success" | "warning" | "danger";
  showValue?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  color = "default",
  showValue = true,
  children,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Цвета в зависимости от состояния
  const colorClasses = {
    default: {
      stroke: "stroke-accent",
      bg: "stroke-accent/20",
      text: "text-accent",
    },
    success: {
      stroke: "stroke-green-500",
      bg: "stroke-green-500/20",
      text: "text-green-500",
    },
    warning: {
      stroke: "stroke-yellow-500",
      bg: "stroke-yellow-500/20",
      text: "text-yellow-500",
    },
    danger: {
      stroke: "stroke-red-500",
      bg: "stroke-red-500/20",
      text: "text-red-500",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Фоновое кольцо */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={colors.bg}
        />
        {/* Прогресс-кольцо */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            colors.stroke,
            "transition-all duration-500 ease-out"
          )}
          style={{
            filter: value === 100 ? "drop-shadow(0 0 4px currentColor)" : undefined,
          }}
        />
      </svg>
      
      {/* Контент в центре */}
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {children || (
          showValue && (
            <span className={cn("text-2xl font-bold", colors.text)}>
              {Math.round(value)}%
            </span>
          )
        )}
      </div>
    </div>
  );
};



