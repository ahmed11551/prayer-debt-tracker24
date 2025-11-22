import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, User } from "lucide-react";
import { TimerDisplay } from "./TimerDisplay";
import { ProfileDialog } from "@/components/profile/ProfileDialog";

export const MainHeader = () => {
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const getTitle = () => {
    if (location.pathname === "/dhikr") return "Зикры";
    return "Трекер намазов";
  };

  const getDescription = () => {
    if (location.pathname === "/dhikr") return "Дуа, азкары, салаваты и калимы";
    return "Prayer-Debt";
  };

  // Приоритет: CDN → локальный SVG
  const logoUrl = "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/cc/e2/51/cce2511d-7436-95af-c944-7dda394c0c3b/AppIcon-0-0-1x_U007emarketing-0-8-0-0-85-220.png/1200x630wa.png";
  const fallbackLogoUrl = "/logo.svg";

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:py-4 max-w-5xl">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Таймер слева */}
          <TimerDisplay />
          
          {/* Центральный контент (скрыт на мобильных, если нужно) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-1 justify-center">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full animate-pulse" />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden shadow-glow bg-primary flex items-center justify-center">
                {!logoError ? (
                  <img 
                    src={logoUrl}
                    alt="Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn("CDN logo failed, trying fallback");
                      if (e.currentTarget.src !== fallbackLogoUrl) {
                        e.currentTarget.src = fallbackLogoUrl;
                      } else {
                        console.error("Both logo sources failed");
                        setLogoError(true);
                      }
                    }}
                    onLoad={() => {
                      console.log("Logo loaded successfully");
                      setLogoError(false);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold gradient-text truncate">
                {getTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{getDescription()}</p>
            </div>
          </div>
          
          {/* Иконка профиля справа */}
          <button
            onClick={() => setProfileOpen(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/90 backdrop-blur-sm border border-primary/50 flex items-center justify-center text-accent hover:bg-primary transition-colors shadow-sm"
            aria-label="Профиль"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
      
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
};
