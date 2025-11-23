import { Component, ReactNode } from "react";
import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SkipToMain } from "@/components/layout/SkipToMain";
import { ReportsSection } from "@/components/qaza/ReportsSection";
import { BadgesSection } from "@/components/qaza/BadgesSection";
import { ShareAndFriends } from "@/components/qaza/ShareAndFriends";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// Простой Error Boundary компонент
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Card className="bg-card/98 shadow-xl border-2 border-destructive/30 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <h2 className="text-xl font-bold text-foreground">Произошла ошибка</h2>
              <p className="text-muted-foreground">
                {this.state.error?.message || "Неизвестная ошибка"}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Обновить страницу
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

const Reports = () => {
  return (
    <div className="min-h-screen bg-mosque pb-20 sm:pb-0 relative w-full overflow-x-hidden">
      <SkipToMain />
      {/* Enhanced background overlay for better content visibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none z-0" />
      <div className="relative z-10 w-full max-w-full">
        <MainHeader />
        
        <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl pb-24 sm:pb-6" role="main">
          <div className="space-y-6 lg:space-y-8">
            <ErrorBoundary>
              <section aria-labelledby="reports-heading">
                <h2 id="reports-heading" className="sr-only">Отчёты и статистика</h2>
                <ReportsSection />
              </section>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <section aria-labelledby="badges-heading">
                <h2 id="badges-heading" className="sr-only">Достижения</h2>
                <BadgesSection />
              </section>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <section aria-labelledby="share-heading">
                <h2 id="share-heading" className="sr-only">Поделиться и друзья</h2>
                <ShareAndFriends />
              </section>
            </ErrorBoundary>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Reports;

