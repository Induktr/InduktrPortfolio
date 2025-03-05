import { Switch, Route, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/lib/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Tools from "@/pages/Tools";
import Blog from "@/pages/Blog";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/tools" component={Tools} />
        <Route path="/blog" component={Blog} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="app-theme">
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <PageTransition>
            <Router />
          </PageTransition>
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;