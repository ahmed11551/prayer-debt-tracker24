import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-state";
import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SkipToMain } from "@/components/layout/SkipToMain";
import { WelcomeDialog } from "@/components/qaza/WelcomeDialog";
import { cn } from "@/lib/utils";

// Lazy loading для тяжелых компонентов
const CalculatorSection = lazy(() => import("@/components/qaza/CalculatorSection").then(m => ({ default: m.CalculatorSection })));
const ProgressSection = lazy(() => import("@/components/qaza/ProgressSection").then(m => ({ default: m.ProgressSection })));
const TravelPrayersSection = lazy(() => import("@/components/qaza/TravelPrayersSection").then(m => ({ default: m.TravelPrayersSection })));
const ReportsSection = lazy(() => import("@/components/qaza/ReportsSection").then(m => ({ default: m.ReportsSection })));
const RepaymentPlanSection = lazy(() => import("@/components/qaza/RepaymentPlanSection").then(m => ({ default: m.RepaymentPlanSection })));
const TermsDictionary = lazy(() => import("@/components/qaza/TermsDictionary").then(m => ({ default: m.TermsDictionary })));
const ShareAndFriends = lazy(() => import("@/components/qaza/ShareAndFriends").then(m => ({ default: m.ShareAndFriends })));
const SmartGoalsSection = lazy(() => import("@/components/qaza/SmartGoalsSection").then(m => ({ default: m.SmartGoalsSection })));
const CompactGoalsCalendar = lazy(() => import("@/components/qaza/CompactGoalsCalendar").then(m => ({ default: m.CompactGoalsCalendar })));
const PrayerCalendar = lazy(() => import("@/components/qaza/PrayerCalendar").then(m => ({ default: m.PrayerCalendar })));
const RemindersManager = lazy(() => import("@/components/qaza/RemindersManager").then(m => ({ default: m.RemindersManager })));
const BadgesSection = lazy(() => import("@/components/qaza/BadgesSection").then(m => ({ default: m.BadgesSection })));
const DailyPrayerTracker = lazy(() => import("@/components/qaza/DailyPrayerTracker").then(m => ({ default: m.DailyPrayerTracker })));
const QadaDebtSection = lazy(() => import("@/components/qaza/QadaDebtSection").then(m => ({ default: m.QadaDebtSection })));

const Index = () => {
  const [activeTab, setActiveTab] = useState("plan");
  const tabsListRef = useRef<HTMLDivElement>(null);

  const handleNavigateToCalculator = () => {
    setActiveTab("calculator");
  };

  // Слушаем событие навигации к табу
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      const tab = event.detail?.tab;
      if (tab && ["plan", "progress", "travel", "reports", "calculator", "goals", "calendar"].includes(tab)) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);

  // Auto-scroll to active tab
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      if (tabsListRef.current) {
        const activeTabElement = tabsListRef.current.querySelector(
          `[data-state="active"]`
        ) as HTMLElement;
        if (activeTabElement) {
          const container = tabsListRef.current;
          const tabLeft = activeTabElement.offsetLeft;
          const tabWidth = activeTabElement.offsetWidth;
          const containerWidth = container.offsetWidth;
          const scrollLeft = container.scrollLeft;
          const scrollWidth = container.scrollWidth;
          
          // Calculate if tab is fully visible
          const tabRight = tabLeft + tabWidth;
          const visibleLeft = scrollLeft;
          const visibleRight = scrollLeft + containerWidth;
          
          // Padding for better visibility
          const padding = 16;
          
          let scrollTo = scrollLeft;
          
          // Check if tab is fully visible (with padding)
          const isFullyVisible = tabLeft >= visibleLeft + padding && tabRight <= visibleRight - padding;
          
          if (!isFullyVisible) {
            // If tab is cut off on the left, scroll to show it fully with padding
            if (tabLeft < visibleLeft + padding) {
              scrollTo = Math.max(0, tabLeft - padding);
            }
            // If tab is cut off on the right, scroll to show it fully with padding
            else if (tabRight > visibleRight - padding) {
              scrollTo = Math.min(
                scrollWidth - containerWidth,
                tabRight - containerWidth + padding
              );
            }
            
            // Only scroll if needed and if it makes sense
            if (Math.abs(scrollTo - scrollLeft) > 1) {
              container.scrollTo({
                left: scrollTo,
                behavior: "smooth",
              });
            }
          }
          // If tab is already fully visible, don't scroll (preserve current position)
        }
      }
    }, 150); // Delay for better reliability

    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  // Ensure scroll starts at 0 on mount and after render
  useEffect(() => {
    const resetScroll = () => {
      if (tabsListRef.current) {
        // Reset scroll to start
        tabsListRef.current.scrollLeft = 0;
      }
    };
    
    // Reset immediately
    resetScroll();
    
    // Also reset after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(resetScroll, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Also reset scroll when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (tabsListRef.current) {
        // Only reset if we're at the start or if content fits
        const container = tabsListRef.current;
        if (container.scrollWidth <= container.offsetWidth) {
          container.scrollLeft = 0;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-mosque pb-20 sm:pb-0 relative">
      <SkipToMain />
      {/* Enhanced background overlay for better content visibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none z-0" />
      <div className="relative z-10">
        <MainHeader />
        <WelcomeDialog onNavigateToCalculator={handleNavigateToCalculator} />

        {/* Main Content */}
        <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl pb-24 sm:pb-6 space-y-6 lg:space-y-8" role="main">
                {/* Компактный календарь целей на главном экране */}
                {activeTab === "plan" && (
                  <div className="mb-6">
                    <CompactGoalsCalendar />
                  </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Tabs Container */}
          <div className="relative mb-6 overflow-visible">
            <TabsList 
              ref={tabsListRef}
              className={cn(
                "relative flex w-full h-auto items-center",
                "px-2 sm:px-3 py-2 gap-1.5 sm:gap-2",
                "overflow-x-auto overflow-y-visible",
                // Темно-коричневый фон как в отчетах
                "bg-[hsl(30_40%_20%)] backdrop-blur-md",
                // Золотисто-коричневая рамка
                "rounded-2xl border-2 border-[hsl(42_65%_50%)]/60",
                "shadow-xl shadow-[hsl(30_40%_10%)/0.4]",
                "scroll-smooth snap-x snap-mandatory",
                "min-h-[48px] sm:min-h-[52px]",
                "tabs-scroll-container"
              )}
              style={{ 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x',
                overscrollBehaviorX: 'auto'
              }}
            >
              <TabsTrigger 
                value="plan"
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center relative",
                  "min-w-[70px] sm:min-w-[80px] px-3 sm:px-5 py-2 sm:py-2.5",
                  "text-center rounded-xl",
                  "transition-all duration-300 ease-out",
                  "whitespace-nowrap",
                  "text-xs sm:text-sm font-semibold",
                  "snap-start",
                  "overflow-visible",
                  // Inactive state - desaturated blue-grey как в отчетах
                  "text-[hsl(210_20%_60%)] bg-transparent",
                  "hover:text-[hsl(210_25%_70%)]",
                  "hover:shadow-sm",
                  "active:scale-[0.98]",
                  // Active state - золотисто-коричневая линия под текстом
                  "data-[state=active]:text-[hsl(42_50%_95%)]",
                  "data-[state=active]:bg-transparent",
                  "data-[state=active]:pb-1",
                  "data-[state=active]:font-bold",
                  "data-[state=active]:z-10",
                  // Линия под активным табом
                  "data-[state=active]:after:content-['']",
                  "data-[state=active]:after:absolute",
                  "data-[state=active]:after:bottom-0",
                  "data-[state=active]:after:left-1/2",
                  "data-[state=active]:after:-translate-x-1/2",
                  "data-[state=active]:after:w-[calc(100%-1rem)]",
                  "data-[state=active]:after:h-[2px]",
                  "data-[state=active]:after:bg-[hsl(42_65%_50%)]",
                  "data-[state=active]:after:rounded-full"
                )}
              >
                <span className="relative z-10">План</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="progress"
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center relative",
                  "min-w-[85px] sm:min-w-[100px] px-3 sm:px-5 py-2 sm:py-2.5",
                  "text-center rounded-xl",
                  "transition-all duration-300 ease-out",
                  "whitespace-nowrap",
                  "text-xs sm:text-sm font-semibold",
                  "snap-start",
                  "overflow-visible",
                  // Inactive state - desaturated blue-grey
                  "text-[hsl(210_20%_60%)] bg-transparent",
                  "hover:text-[hsl(210_25%_70%)]",
                  "hover:shadow-sm",
                  "active:scale-[0.98]",
                  // Active state
                  "data-[state=active]:text-[hsl(42_50%_95%)]",
                  "data-[state=active]:bg-transparent",
                  "data-[state=active]:pb-1",
                  "data-[state=active]:font-bold",
                  "data-[state=active]:z-10",
                  "data-[state=active]:after:content-['']",
                  "data-[state=active]:after:absolute",
                  "data-[state=active]:after:bottom-0",
                  "data-[state=active]:after:left-1/2",
                  "data-[state=active]:after:-translate-x-1/2",
                  "data-[state=active]:after:w-[calc(100%-1rem)]",
                  "data-[state=active]:after:h-[2px]",
                  "data-[state=active]:after:bg-[hsl(42_65%_50%)]",
                  "data-[state=active]:after:rounded-full"
                )}
              >
                <span className="relative z-10">Прогресс</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="travel"
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center relative",
                  "min-w-[75px] sm:min-w-[90px] px-3 sm:px-5 py-2 sm:py-2.5",
                  "text-center rounded-xl",
                  "transition-all duration-300 ease-out",
                  "whitespace-nowrap",
                  "text-xs sm:text-sm font-semibold",
                  "snap-start",
                  "overflow-visible",
                  // Inactive state - desaturated blue-grey
                  "text-[hsl(210_20%_60%)] bg-transparent",
                  "hover:text-[hsl(210_25%_70%)]",
                  "hover:shadow-sm",
                  "active:scale-[0.98]",
                  // Active state
                  "data-[state=active]:text-[hsl(42_50%_95%)]",
                  "data-[state=active]:bg-transparent",
                  "data-[state=active]:pb-1",
                  "data-[state=active]:font-bold",
                  "data-[state=active]:z-10",
                  "data-[state=active]:after:content-['']",
                  "data-[state=active]:after:absolute",
                  "data-[state=active]:after:bottom-0",
                  "data-[state=active]:after:left-1/2",
                  "data-[state=active]:after:-translate-x-1/2",
                  "data-[state=active]:after:w-[calc(100%-1rem)]",
                  "data-[state=active]:after:h-[2px]",
                  "data-[state=active]:after:bg-[hsl(42_65%_50%)]",
                  "data-[state=active]:after:rounded-full"
                )}
              >
                <span className="relative z-10 whitespace-nowrap">Сафар</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="reports"
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center relative",
                  "min-w-[85px] sm:min-w-[100px] px-3 sm:px-5 py-2 sm:py-2.5",
                  "text-center rounded-xl",
                  "transition-all duration-300 ease-out",
                  "whitespace-nowrap",
                  "text-xs sm:text-sm font-semibold",
                  "snap-start",
                  "overflow-visible",
                  // Inactive state - desaturated blue-grey
                  "text-[hsl(210_20%_60%)] bg-transparent",
                  "hover:text-[hsl(210_25%_70%)]",
                  "hover:shadow-sm",
                  "active:scale-[0.98]",
                  // Active state
                  "data-[state=active]:text-[hsl(42_50%_95%)]",
                  "data-[state=active]:bg-transparent",
                  "data-[state=active]:pb-1",
                  "data-[state=active]:font-bold",
                  "data-[state=active]:z-10",
                  "data-[state=active]:after:content-['']",
                  "data-[state=active]:after:absolute",
                  "data-[state=active]:after:bottom-0",
                  "data-[state=active]:after:left-1/2",
                  "data-[state=active]:after:-translate-x-1/2",
                  "data-[state=active]:after:w-[calc(100%-1rem)]",
                  "data-[state=active]:after:h-[2px]",
                  "data-[state=active]:after:bg-[hsl(42_65%_50%)]",
                  "data-[state=active]:after:rounded-full"
                )}
              >
                <span className="relative z-10">Отчёты</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="calculator"
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center relative",
                  "min-w-[100px] sm:min-w-[120px] px-3 sm:px-5 py-2 sm:py-2.5",
                  "text-center rounded-xl",
                  "transition-all duration-300 ease-out",
                  "whitespace-nowrap",
                  "text-xs sm:text-sm font-semibold",
                  "snap-start",
                  "overflow-visible",
                  // Inactive state - desaturated blue-grey
                  "text-[hsl(210_20%_60%)] bg-transparent",
                  "hover:text-[hsl(210_25%_70%)]",
                  "hover:shadow-sm",
                  "active:scale-[0.98]",
                  // Active state
                  "data-[state=active]:text-[hsl(42_50%_95%)]",
                  "data-[state=active]:bg-transparent",
                  "data-[state=active]:pb-1",
                  "data-[state=active]:font-bold",
                  "data-[state=active]:z-10",
                  "data-[state=active]:after:content-['']",
                  "data-[state=active]:after:absolute",
                  "data-[state=active]:after:bottom-0",
                  "data-[state=active]:after:left-1/2",
                  "data-[state=active]:after:-translate-x-1/2",
                  "data-[state=active]:after:w-[calc(100%-1rem)]",
                  "data-[state=active]:after:h-[2px]",
                  "data-[state=active]:after:bg-[hsl(42_65%_50%)]",
                  "data-[state=active]:after:rounded-full"
                )}
              >
                <span className="relative z-10">Калькулятор</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="goals"
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center relative",
                  "min-w-[70px] sm:min-w-[80px] px-3 sm:px-5 py-2 sm:py-2.5",
                  "text-center rounded-xl",
                  "transition-all duration-300 ease-out",
                  "whitespace-nowrap",
                  "text-xs sm:text-sm font-semibold",
                  "snap-start",
                  "overflow-visible",
                  // Inactive state - desaturated blue-grey
                  "text-[hsl(210_20%_60%)] bg-transparent",
                  "hover:text-[hsl(210_25%_70%)]",
                  "hover:shadow-sm",
                  "active:scale-[0.98]",
                  // Active state
                  "data-[state=active]:text-[hsl(42_50%_95%)]",
                  "data-[state=active]:bg-transparent",
                  "data-[state=active]:pb-1",
                  "data-[state=active]:font-bold",
                  "data-[state=active]:z-10",
                  "data-[state=active]:after:content-['']",
                  "data-[state=active]:after:absolute",
                  "data-[state=active]:after:bottom-0",
                  "data-[state=active]:after:left-1/2",
                  "data-[state=active]:after:-translate-x-1/2",
                  "data-[state=active]:after:w-[calc(100%-1rem)]",
                  "data-[state=active]:after:h-[2px]",
                  "data-[state=active]:after:bg-[hsl(42_65%_50%)]",
                  "data-[state=active]:after:rounded-full"
                )}
              >
                <span className="relative z-10">Цели</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="calendar"
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center relative",
                  "min-w-[90px] sm:min-w-[110px] px-3 sm:px-5 py-2 sm:py-2.5",
                  "text-center rounded-xl",
                  "transition-all duration-300 ease-out",
                  "whitespace-nowrap",
                  "text-xs sm:text-sm font-semibold",
                  "snap-start",
                  "overflow-visible",
                  // Inactive state - desaturated blue-grey
                  "text-[hsl(210_20%_60%)] bg-transparent",
                  "hover:text-[hsl(210_25%_70%)]",
                  "hover:shadow-sm",
                  "active:scale-[0.98]",
                  // Active state
                  "data-[state=active]:text-[hsl(42_50%_95%)]",
                  "data-[state=active]:bg-transparent",
                  "data-[state=active]:pb-1",
                  "data-[state=active]:font-bold",
                  "data-[state=active]:z-10",
                  "data-[state=active]:after:content-['']",
                  "data-[state=active]:after:absolute",
                  "data-[state=active]:after:bottom-0",
                  "data-[state=active]:after:left-1/2",
                  "data-[state=active]:after:-translate-x-1/2",
                  "data-[state=active]:after:w-[calc(100%-1rem)]",
                  "data-[state=active]:after:h-[2px]",
                  "data-[state=active]:after:bg-[hsl(42_65%_50%)]",
                  "data-[state=active]:after:rounded-full"
                )}
              >
                <span className="relative z-10">Календарь</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="plan" className="space-y-6 mt-6">
            <Suspense fallback={<LoadingCard message="Загрузка плана..." />}>
              <section aria-labelledby="plan-heading">
                <h2 id="plan-heading" className="sr-only">План восполнения намазов</h2>
                <RepaymentPlanSection />
              </section>
            </Suspense>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            <Suspense fallback={<LoadingCard message="Загрузка прогресса..." />}>
              <section aria-labelledby="progress-heading">
                <h2 id="progress-heading" className="sr-only">Прогресс восполнения</h2>
                <DailyPrayerTracker />
                <QadaDebtSection />
                <ProgressSection />
              </section>
            </Suspense>
          </TabsContent>

          <TabsContent value="travel" className="space-y-6 mt-6">
            <Suspense fallback={<LoadingCard message="Загрузка намазов в пути..." />}>
              <section aria-labelledby="travel-heading">
                <h2 id="travel-heading" className="sr-only">Намазы в путешествии</h2>
                <TravelPrayersSection />
              </section>
            </Suspense>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 mt-6">
            <Suspense fallback={<LoadingCard message="Загрузка отчётов..." />}>
              <section aria-labelledby="reports-heading">
                <h2 id="reports-heading" className="sr-only">Отчёты и статистика</h2>
                <ReportsSection />
                <BadgesSection />
                <ShareAndFriends />
              </section>
            </Suspense>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6 mt-6">
            <Suspense fallback={<LoadingCard message="Загрузка калькулятора..." />}>
              <section aria-labelledby="calculator-heading">
                <h2 id="calculator-heading" className="sr-only">Калькулятор долга намазов</h2>
                <CalculatorSection />
                <TermsDictionary />
              </section>
            </Suspense>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <Suspense fallback={<LoadingCard message="Загрузка целей..." />}>
              <section aria-labelledby="goals-heading">
                <h2 id="goals-heading" className="sr-only">Цели и привычки</h2>
                <SmartGoalsSection />
              </section>
            </Suspense>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6 mt-6">
            <Suspense fallback={<LoadingCard message="Загрузка календаря..." />}>
              <section aria-labelledby="calendar-heading">
                <h2 id="calendar-heading" className="sr-only">Календарь намазов</h2>
                <PrayerCalendar />
                <RemindersManager />
              </section>
            </Suspense>
          </TabsContent>
        </Tabs>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
