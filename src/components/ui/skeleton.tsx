import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton loader компонент для состояний загрузки
 * Улучшает воспринимаемую производительность
 */
export const Skeleton = ({
  className,
  variant = "default",
  width,
  height,
  style,
  ...props
}: SkeletonProps) => {
  const variantClasses = {
    default: "rounded-lg",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  const customStyle: React.CSSProperties = {
    ...style,
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && { height: typeof height === "number" ? `${height}px` : height }),
  };

  return (
    <div
      className={cn(
        "skeleton bg-muted",
        variantClasses[variant],
        className
      )}
      style={customStyle}
      aria-busy="true"
      aria-label="Загрузка..."
      {...props}
    />
  );
};
