import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ 
  title = "Произошла ошибка",
  message = "Не удалось загрузить данные. Пожалуйста, попробуйте еще раз.",
  onRetry,
  className 
}: ErrorStateProps) => {
  return (
    <Card className={cn(
      "bg-card/98 shadow-xl border-2 border-[hsl(var(--error))]/30 backdrop-blur-md",
      "animate-in fade-in-50 duration-500",
      className
    )}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-4 text-center">
          <div className="relative">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[hsl(var(--error))] animate-pulse" />
            <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[hsl(var(--error))]/20 animate-ping" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">{message}</p>
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="border-[hsl(var(--error))]/50 hover:bg-[hsl(var(--error))]/10 hover:border-[hsl(var(--error))] transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

