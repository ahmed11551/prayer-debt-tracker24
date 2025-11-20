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
          <TabsList className="flex w-full mb-6 glass shadow-medium h-auto px-2 py-2 gap-2 overflow-x-auto bg-white/90 backdrop-blur-sm rounded-lg border border-border/50">
            <TabsTrigger 
              value="dua"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-foreground/80 data-[state=active]:font-semibold hover:text-foreground hover:bg-primary/10"
            >
              Дуа
            </TabsTrigger>
            <TabsTrigger 
              value="adhkar"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-foreground/80 data-[state=active]:font-semibold hover:text-foreground hover:bg-primary/10"
            >
              Азкары
            </TabsTrigger>
            <TabsTrigger 
              value="salawat"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-foreground/80 data-[state=active]:font-semibold hover:text-foreground hover:bg-primary/10"
            >
              Салаваты
            </TabsTrigger>
            <TabsTrigger 
              value="kalima"
              className="flex-shrink-0 min-w-[110px] text-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow rounded-lg transition-all duration-300 whitespace-nowrap px-3 py-2 text-sm font-medium text-foreground/80 data-[state=active]:font-semibold hover:text-foreground hover:bg-primary/10"
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
