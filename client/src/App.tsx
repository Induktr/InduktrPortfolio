import { Switch, Route, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
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
        <Route path="/">
          <PageTransition>
            <Home />
          </PageTransition>
        </Route>
        <Route path="/projects">
          <PageTransition>
            <Projects />
          </PageTransition>
        </Route>
        <Route path="/tools">
          <PageTransition>
            <Tools />
          </PageTransition>
        </Route>
        <Route path="/blog">
          <PageTransition>
            <Blog />
          </PageTransition>
        </Route>
        <Route>
          <PageTransition>
            <NotFound />
          </PageTransition>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Router />
      <Toaster />
    </div>
  );
}

export default App;