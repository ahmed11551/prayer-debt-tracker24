import { useLocation } from "react-router-dom";

export const MainHeader = () => {
  const location = useLocation();
  
  const getTitle = () => {
    if (location.pathname === "/dhikr") return "Зикры";
    return "Трекер намазов";
  };

  const getDescription = () => {
    if (location.pathname === "/dhikr") return "Дуа, азкары, салаваты и калимы";
    return "Prayer-Debt";
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-glow">
              <img 
                src="https://cdn1.ozone.ru/s3/multimedia-v/6091638319.jpg" 
                alt="MubarakWay Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {getTitle()}
            </h1>
            <p className="text-sm text-muted-foreground">{getDescription()}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
