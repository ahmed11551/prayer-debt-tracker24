import { Component, ReactNode } from "react";
import { MainHeader } from "@/components/layout/MainHeader";
import { BottomNav } from "@/components/layout/BottomNav";
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
    <div className="min-h-screen bg-mosque pb-20 sm:pb-0 relative">
      {/* Enhanced background overlay for better content visibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none z-0" />
      <div className="relative z-10">
        <MainHeader />
        
        <main className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl pb-24 sm:pb-6">
          <div className="space-y-6">
            <ErrorBoundary>
              <ReportsSection />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <BadgesSection />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <ShareAndFriends />
            </ErrorBoundary>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Reports;

