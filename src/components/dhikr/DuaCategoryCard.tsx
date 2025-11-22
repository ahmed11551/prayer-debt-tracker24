import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DuaCategoryCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  count: number;
  description: string;
  onClick: () => void;
  className?: string;
}

export const DuaCategoryCard = memo(({
  id,
  name,
  icon: Icon,
  count,
  description,
  onClick,
  className,
}: DuaCategoryCardProps) => {
  return (
    <Card
      className={cn(
        "bg-white border border-gray-200 shadow-sm rounded-xl cursor-pointer",
        "hover:shadow-md hover:border-green-500/50 transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">
                {description}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
});

DuaCategoryCard.displayName = "DuaCategoryCard";

