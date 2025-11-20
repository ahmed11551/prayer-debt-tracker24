import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorSection } from "@/components/qaza/CalculatorSection";
import { ProgressSection } from "@/components/qaza/ProgressSection";
import { TravelPrayersSection } from "@/components/qaza/TravelPrayersSection";
import { ReportsSection } from "@/components/qaza/ReportsSection";
import { RepaymentPlanSection } from "@/components/qaza/RepaymentPlanSection";
import { TermsDictionary } from "@/components/qaza/TermsDictionary";
import { ShareAndFriends } from "@/components/qaza/ShareAndFriends";
import { GoalsAndHabits } from "@/components/qaza/GoalsAndHabits";
import { PrayerCalendar } from "@/components/qaza/PrayerCalendar";
import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { WelcomeDialog } from "@/components/qaza/WelcomeDialog";

const Index = () => {
  const [activeTab, setActiveTab] = useState("plan");

  const handleNavigateToCalculator = () => {
    setActiveTab("calculator");
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <MainHeader />
      <WelcomeDialog onNavigateToCalculator={handleNavigateToCalculator} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full mb-6 glass shadow-medium h-auto px-2 py-2 gap-2 overflow-x-auto bg-white/80 backdrop-blur-sm rounded-2xl">
            <TabsTrigger 
              value="plan" 
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:font-semibold"
            >
              План
            </TabsTrigger>
            <TabsTrigger 
              value="progress"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:font-semibold"
            >
              Прогресс
            </TabsTrigger>
            <TabsTrigger 
              value="travel"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:font-semibold"
            >
              Сафар
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:font-semibold"
            >
              Отчёты
            </TabsTrigger>
            <TabsTrigger 
              value="calculator"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:font-semibold"
            >
              Калькулятор
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:font-semibold"
            >
              Цели
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:font-semibold"
            >
              Календарь
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan">
            <RepaymentPlanSection />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressSection />
          </TabsContent>

          <TabsContent value="travel">
            <TravelPrayersSection />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsSection />
            <ShareAndFriends />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <CalculatorSection />
            <TermsDictionary />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsAndHabits />
          </TabsContent>

          <TabsContent value="calendar">
            <PrayerCalendar />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
