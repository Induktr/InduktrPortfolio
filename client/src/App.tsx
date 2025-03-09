import { useLocation } from "wouter";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./lib/theme-provider";
import { AuthProvider } from "./lib/auth-context";
import { PageTransition } from "@/components/PageTransition";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Tools from "@/pages/Tools";
import Blog from "@/pages/Blog";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import TestConnectionPage from './pages/TestConnectionPage';
import { Footer } from '@/components/Footer';

function Router() {
  const [location] = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Switch key={location}>
          <Route path="/" component={Home} />
          <Route path="/projects" component={Projects} />
          <Route path="/tools" component={Tools} />
          <Route path="/blog" component={Blog} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/profile" component={Profile} />
          <Route path="/test-connection" component={TestConnectionPage} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="app-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <PageTransition>
              <Router />
            </PageTransition>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;