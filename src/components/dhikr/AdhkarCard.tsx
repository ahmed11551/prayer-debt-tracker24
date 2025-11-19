import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdhkarCardProps {
  dhikr: {
    id: string;
    title: string;
    icon: any;
    color: string;
    text: string;
    transcription: string;
    translation: string;
    count: number;
    category: string;
  };
}

export const AdhkarCard = ({ dhikr }: AdhkarCardProps) => {
  const [currentCount, setCurrentCount] = useState(0);

  const handleClick = () => {
    if (currentCount < dhikr.count) {
      setCurrentCount(currentCount + 1);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentCount(0);
  };

  const progress = (currentCount / dhikr.count) * 100;
  const isComplete = currentCount === dhikr.count;

  return (
    <Card
      className={cn(
        "glass shadow-medium border-border/50 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-strong",
        isComplete && "shadow-glow border-primary/50"
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "h-1 bg-gradient-to-r transition-all duration-500",
          isComplete ? "from-primary to-accent" : "from-muted to-transparent"
        )}
        style={{ width: `${progress}%` }}
      />
      <CardContent className="pt-6 space-y-4">
        {/* Icon and Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <dhikr.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{dhikr.title}</h3>
              <p className="text-xs text-muted-foreground">{dhikr.category}</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleReset}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Arabic Text */}
        <div className="text-center py-4">
          <p className="text-4xl font-arabic text-foreground" style={{ fontFamily: "'Amiri', serif" }}>
            {dhikr.text}
          </p>
        </div>

        {/* Transcription */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground italic">{dhikr.transcription}</p>
          <p className="text-sm text-foreground mt-1">{dhikr.translation}</p>
        </div>

        {/* Counter */}
        <div className="text-center">
          <div
            className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-300",
              isComplete
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border/30 bg-secondary/30"
            )}
          >
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold transition-colors",
                isComplete ? "gradient-text" : "text-foreground"
              )}>
                {currentCount}
              </div>
              <div className="text-xs text-muted-foreground">/ {dhikr.count}</div>
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="text-center">
            <p className="text-sm gradient-text-gold font-semibold animate-pulse">
              ✨ Завершено! Ма ша Аллах
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
