import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoadingCard } from "./components/ui/loading-state";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy loading для оптимизации производительности
const Index = lazy(() => import("./pages/Index"));
const Dhikr = lazy(() => import("./pages/Dhikr"));
const Goals = lazy(() => import("./pages/Goals"));
const Reports = lazy(() => import("./pages/Reports"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { initTelegramWebApp } from "./lib/telegram";
import { ConsentDialog } from "./components/qaza/ConsentDialog";
import { startAutoSync, setupOnlineListener } from "./lib/offline-sync";
import { analytics } from "./lib/analytics";
import { notificationManager } from "./lib/notifications";

// Настройка React Query с обработкой ошибок
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Инициализация Telegram WebApp при загрузке
    initTelegramWebApp();
    
    // Инициализация аналитики (если указан ID в env)
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      analytics.init(gaId);
      analytics.trackPageView(window.location.pathname);
    }
    
    // Инициализация уведомлений (запрос разрешения при первом запуске)
    if (notificationManager.isNotificationSupported()) {
      // Запрашиваем разрешение только если пользователь уже взаимодействовал с приложением
      const hasInteracted = localStorage.getItem("user_has_interacted") === "true";
      if (hasInteracted && !notificationManager.hasPermission()) {
        notificationManager.requestPermission().then((permission) => {
          if (permission === "granted") {
            analytics.trackEvent({
              action: "notification_permission_granted",
              category: "engagement",
            });
          }
        });
      }
    }
    
    // Инициализация офлайн-синхронизации
    setupOnlineListener((online) => {
      console.log("Connection status:", online ? "online" : "offline");
      
      // Отправка события в аналитику
      analytics.trackEvent({
        action: "network_status_change",
        category: "system",
        label: online ? "online" : "offline",
      });
    });
    startAutoSync();
    
    // Отслеживание взаимодействия пользователя
    const handleUserInteraction = () => {
      localStorage.setItem("user_has_interacted", "true");
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
    window.addEventListener("click", handleUserInteraction, { once: true });
    window.addEventListener("touchstart", handleUserInteraction, { once: true });
    
    // Обработка необработанных ошибок
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      analytics.trackException(
        event.error?.message || "Unhandled error",
        true
      );
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      analytics.trackException(
        event.reason?.message || "Unhandled promise rejection",
        false
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  // Обработчик ошибок для Error Boundary
  const handleErrorBoundaryError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Здесь можно добавить отправку в Sentry, LogRocket и т.д.
    console.error("Error reported to ErrorBoundary:", error, errorInfo);
    
    // Отправка в аналитику
    analytics.trackException(error.message, false);
  };

  return (
    <ErrorBoundary onError={handleErrorBoundaryError}>
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
    </ErrorBoundary>
  );
};

export default App;
