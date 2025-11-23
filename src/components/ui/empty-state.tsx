import { Inbox, Plus } from "lucide-react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ 
  title = "Нет данных",
  message = "Здесь пока ничего нет. Создайте первую запись.",
  actionLabel = "Создать",
  onAction,
  className,
  icon
}: EmptyStateProps) => {
  return (
    <Card className={cn("bg-card/98 shadow-xl border-2 border-border/50 backdrop-blur-md", className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
          {icon || <Inbox className="w-12 h-12 text-muted-foreground" />}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
          </div>
          {onAction && (
            <Button onClick={onAction} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

