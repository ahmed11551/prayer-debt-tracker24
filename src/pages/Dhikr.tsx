import { useState } from "react";
import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DuaSection } from "@/components/dhikr/DuaSection";
import { AdhkarSection } from "@/components/dhikr/AdhkarSection";
import { SalawatSection } from "@/components/dhikr/SalawatSection";
import { KalimaSection } from "@/components/dhikr/KalimaSection";
import { cn } from "@/lib/utils";

const Dhikr = () => {
  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <MainHeader />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs defaultValue="dua" className="w-full">
          {/* Enhanced Tabs Container */}
          <div className="relative mb-6">
            {/* Background with gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-xl opacity-50" />
            
            <TabsList className="relative flex w-full h-auto px-2 py-2 gap-2 overflow-x-auto overflow-y-visible bg-white/95 backdrop-blur-md rounded-2xl border border-border/60 shadow-lg shadow-primary/5 scroll-smooth snap-x snap-mandatory">
              <TabsTrigger 
                value="dua"
                className={cn(
                  "flex-shrink-0 min-w-fit text-center rounded-xl transition-all duration-300 ease-out",
                  "whitespace-nowrap px-5 py-3 text-sm font-semibold",
                  "snap-start",
                  // Inactive state
                  "text-foreground/80 bg-transparent",
                  "hover:text-foreground hover:bg-primary/5",
                  "active:scale-95",
                  // Active state
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90",
                  "data-[state=active]:text-white",
                  "data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30",
                  "data-[state=active]:scale-105",
                  "data-[state=active]:font-bold"
                )}
              >
                <span className="relative z-10">Дуа</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="adhkar"
                className={cn(
                  "flex-shrink-0 min-w-fit text-center rounded-xl transition-all duration-300 ease-out",
                  "whitespace-nowrap px-5 py-3 text-sm font-semibold",
                  "snap-start",
                  // Inactive state
                  "text-foreground/80 bg-transparent",
                  "hover:text-foreground hover:bg-primary/5",
                  "active:scale-95",
                  // Active state
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90",
                  "data-[state=active]:text-white",
                  "data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30",
                  "data-[state=active]:scale-105",
                  "data-[state=active]:font-bold"
                )}
              >
                <span className="relative z-10">Азкары</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="salawat"
                className={cn(
                  "flex-shrink-0 min-w-fit text-center rounded-xl transition-all duration-300 ease-out",
                  "whitespace-nowrap px-5 py-3 text-sm font-semibold",
                  "snap-start",
                  // Inactive state
                  "text-foreground/80 bg-transparent",
                  "hover:text-foreground hover:bg-primary/5",
                  "active:scale-95",
                  // Active state
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90",
                  "data-[state=active]:text-white",
                  "data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30",
                  "data-[state=active]:scale-105",
                  "data-[state=active]:font-bold"
                )}
              >
                <span className="relative z-10">Салаваты</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="kalima"
                className={cn(
                  "flex-shrink-0 min-w-fit text-center rounded-xl transition-all duration-300 ease-out",
                  "whitespace-nowrap px-5 py-3 text-sm font-semibold",
                  "snap-start",
                  // Inactive state
                  "text-foreground/80 bg-transparent",
                  "hover:text-foreground hover:bg-primary/5",
                  "active:scale-95",
                  // Active state
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90",
                  "data-[state=active]:text-white",
                  "data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30",
                  "data-[state=active]:scale-105",
                  "data-[state=active]:font-bold"
                )}
              >
                <span className="relative z-10">Калимы</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dua" className="mt-0">
            <DuaSection />
          </TabsContent>

          <TabsContent value="adhkar" className="mt-0">
            <AdhkarSection />
          </TabsContent>

          <TabsContent value="salawat" className="mt-0">
            <SalawatSection />
          </TabsContent>

          <TabsContent value="kalima" className="mt-0">
            <KalimaSection />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dhikr;
