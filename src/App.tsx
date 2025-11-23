import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingCard } from "./components/ui/loading-state";

// Lazy loading для оптимизации производительности
const Index = lazy(() => import("./pages/Index"));
const Dhikr = lazy(() => import("./pages/Dhikr"));
const Goals = lazy(() => import("./pages/Goals"));
const Reports = lazy(() => import("./pages/Reports"));
const NotFound = lazy(() => import("./pages/NotFound"));
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
          <Suspense fallback={<LoadingCard message="Загрузка страницы..." />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dhikr" element={<Dhikr />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/reports" element={<Reports />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
