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
          <TabsList className="grid w-full grid-cols-4 mb-6 glass shadow-medium h-auto p-1.5 gap-1">
            <TabsTrigger 
              value="dua"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 px-3 py-2 text-sm font-medium"
            >
              Дуа
            </TabsTrigger>
            <TabsTrigger 
              value="adhkar"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 px-3 py-2 text-sm font-medium"
            >
              Азкары
            </TabsTrigger>
            <TabsTrigger 
              value="salawat"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 px-3 py-2 text-sm font-medium"
            >
              Салаваты
            </TabsTrigger>
            <TabsTrigger 
              value="kalima"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow rounded-lg transition-all duration-300 px-3 py-2 text-sm font-medium"
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
