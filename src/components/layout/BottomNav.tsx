import { Target, BarChart3, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";

export const BottomNav = () => {
  const location = useLocation();
  const { isMobile } = useMobile();

  const navItems = [
    { path: "/", icon: Sparkles, label: "Тасбих" },
    { path: "/goals", icon: Target, label: "Цели" },
    { path: "/reports", icon: BarChart3, label: "Отчёты" },
  ];

  // Скрываем навигацию на десктопе, если не в Telegram Mini App
  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 backdrop-blur-xl z-50 safe-area-inset-bottom shadow-lg bg-card/80">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-around items-center h-16 sm:h-18">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                aria-label={`Перейти на страницу ${label}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 sm:px-6 py-2 rounded-xl transition-all duration-300 group relative min-w-[80px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  isActive
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-accent/10 rounded-xl shadow-inner" />
                )}
                <Icon className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 relative z-10",
                  isActive ? "scale-110 text-accent" : "group-hover:scale-105"
                )} />
                <span className={cn(
                  "text-xs sm:text-sm font-semibold relative z-10 leading-tight",
                  isActive && "text-accent"
                )}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-accent rounded-full shadow-glow-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
