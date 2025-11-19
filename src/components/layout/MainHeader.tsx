import { Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

export const MainHeader = () => {
  const location = useLocation();
  
  const getTitle = () => {
    if (location.pathname === "/dhikr") return "Зикры";
    return "Каза Намазы";
  };

  const getDescription = () => {
    if (location.pathname === "/dhikr") return "Дуа, азкары, салаваты и калимы";
    return "Трекер пропущенных намазов";
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-xl rounded-full animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              MubarakWay
            </h1>
            <p className="text-sm text-muted-foreground">{getDescription()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
