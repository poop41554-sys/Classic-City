import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import VehiclesPage from "@/pages/VehiclesPage";
import FeaturesPage from "@/pages/FeaturesPage";
import OwnershipPage from "@/pages/OwnershipPage";
import PurchasesPage from "@/pages/PurchasesPage";
import AdminPage from "@/pages/AdminPage";
import type { User } from "@shared/schema";

function Router() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Route path="*" component={LoginPage} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <HomePage user={user} />} />
      <Route path="/vehicles" component={() => <VehiclesPage user={user} />} />
      <Route path="/features" component={() => <FeaturesPage user={user} />} />
      <Route path="/ownership" component={() => <OwnershipPage user={user} />} />
      <Route path="/purchases" component={() => <PurchasesPage user={user} />} />
      <Route path="/admin" component={() => <AdminPage user={user} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
