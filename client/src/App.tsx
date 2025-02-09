import { Switch, Route } from "wouter";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Tools from "@/pages/Tools";
import Blog from "@/pages/Blog";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/tools" component={Tools} />
      <Route path="/blog" component={Blog} />
      <Route component={NotFound} />
    </Switch>
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
