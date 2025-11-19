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

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <MainHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 glass shadow-medium h-auto p-1 overflow-x-auto">
            <TabsTrigger 
              value="calculator" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              Расчёт
            </TabsTrigger>
            <TabsTrigger 
              value="progress"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              Прогресс
            </TabsTrigger>
            <TabsTrigger 
              value="plan"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              План
            </TabsTrigger>
            <TabsTrigger 
              value="travel"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              Сафар
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              Отчёты
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              Цели
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap"
            >
              Календарь
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <CalculatorSection />
            <TermsDictionary />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressSection />
          </TabsContent>

          <TabsContent value="plan">
            <RepaymentPlanSection />
          </TabsContent>

          <TabsContent value="travel">
            <TravelPrayersSection />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsSection />
            <ShareAndFriends />
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
