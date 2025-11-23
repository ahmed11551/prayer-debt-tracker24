import { Loader2 } from "lucide-react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingState = ({ 
  message = "Загрузка...", 
  className,
  size = "md" 
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-8 space-y-4", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

interface LoadingCardProps {
  message?: string;
  className?: string;
}

export const LoadingCard = ({ message = "Загрузка...", className }: LoadingCardProps) => {
  return (
    <Card className={cn("bg-card/98 shadow-xl border-2 border-primary/30 backdrop-blur-md", className)}>
      <CardContent className="pt-6">
        <LoadingState message={message} />
      </CardContent>
    </Card>
  );
};

