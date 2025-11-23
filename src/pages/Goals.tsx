import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SmartGoalsSection } from "@/components/qaza/SmartGoalsSection";

const Goals = () => {
  return (
    <div className="min-h-screen bg-mosque pb-20 sm:pb-0 relative">
      {/* Enhanced background overlay for better content visibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none z-0" />
      <div className="relative z-10">
        <MainHeader />
        
        <main className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl pb-24 sm:pb-6">
          <div className="space-y-6">
            <SmartGoalsSection />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Goals;

