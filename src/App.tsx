import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dhikr from "./pages/Dhikr";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { initTelegramWebApp } from "./lib/telegram";
import { ConsentDialog } from "./components/qaza/ConsentDialog";
import { startAutoSync, setupOnlineListener } from "./lib/offline-sync";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Инициализация Telegram WebApp при загрузке
    initTelegramWebApp();
    
    // Инициализация офлайн-синхронизации
    setupOnlineListener((online) => {
      console.log("Connection status:", online ? "online" : "offline");
    });
    startAutoSync();
    
    // Очистка при размонтировании
    return () => {
      // stopAutoSync будет вызван автоматически
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConsentDialog />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dhikr" element={<Dhikr />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
