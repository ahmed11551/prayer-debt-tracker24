import { useState } from "react";
import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DuaSection } from "@/components/dhikr/DuaSection";
import { AdhkarSection } from "@/components/dhikr/AdhkarSection";
import { SalawatSection } from "@/components/dhikr/SalawatSection";
import { KalimaSection } from "@/components/dhikr/KalimaSection";

const Dhikr = () => {
  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <MainHeader />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs defaultValue="dua" className="w-full">
          <TabsList className="flex w-full mb-6 glass shadow-medium h-auto px-3 py-2 gap-2 overflow-x-auto overflow-y-visible bg-white/90 backdrop-blur-sm rounded-lg border border-border/50 scroll-smooth snap-x snap-mandatory">
            <TabsTrigger 
              value="dua"
              className="flex-shrink-0 min-w-fit text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-900 data-[state=active]:text-white data-[state=active]:font-semibold hover:text-gray-900 hover:bg-primary/10 snap-start"
            >
              Дуа
            </TabsTrigger>
            <TabsTrigger 
              value="adhkar"
              className="flex-shrink-0 min-w-fit text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-900 data-[state=active]:text-white data-[state=active]:font-semibold hover:text-gray-900 hover:bg-primary/10 snap-start"
            >
              Азкары
            </TabsTrigger>
            <TabsTrigger 
              value="salawat"
              className="flex-shrink-0 min-w-fit text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-900 data-[state=active]:text-white data-[state=active]:font-semibold hover:text-gray-900 hover:bg-primary/10 snap-start"
            >
              Салаваты
            </TabsTrigger>
            <TabsTrigger 
              value="kalima"
              className="flex-shrink-0 min-w-fit text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-900 data-[state=active]:text-white data-[state=active]:font-semibold hover:text-gray-900 hover:bg-primary/10 snap-start"
            >
              Калимы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dua">
            <DuaSection />
          </TabsContent>

          <TabsContent value="adhkar">
            <AdhkarSection />
          </TabsContent>

          <TabsContent value="salawat">
            <SalawatSection />
          </TabsContent>

          <TabsContent value="kalima">
            <KalimaSection />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dhikr;
