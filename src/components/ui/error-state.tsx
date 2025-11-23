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
    <Card className={cn("bg-card/98 shadow-xl border-2 border-destructive/30 backdrop-blur-md", className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

