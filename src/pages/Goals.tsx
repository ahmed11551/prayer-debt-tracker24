import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SkipToMain } from "@/components/layout/SkipToMain";
import { SmartGoalsSection } from "@/components/qaza/SmartGoalsSection";

const Goals = () => {
  return (
    <div className="min-h-screen bg-mosque pb-20 sm:pb-0 relative">
      <SkipToMain />
      {/* Enhanced background overlay for better content visibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none z-0" />
      <div className="relative z-10">
        <MainHeader />
        
        <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl pb-24 sm:pb-6" role="main">
          <div className="space-y-6 lg:space-y-8">
            <section aria-labelledby="goals-heading">
              <h2 id="goals-heading" className="sr-only">Цели и привычки</h2>
              <SmartGoalsSection />
            </section>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Goals;

