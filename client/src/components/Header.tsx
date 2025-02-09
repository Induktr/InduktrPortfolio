import { Link } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { SiGithub } from "react-icons/si";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold">Induktr</a>
        </Link>
        
        <nav className="flex items-center space-x-8">
          <Link href="/projects">
            <a className="hover:text-primary transition-colors">Projects</a>
          </Link>
          <Link href="/tools">
            <a className="hover:text-primary transition-colors">Tools</a>
          </Link>
          <Link href="/blog">
            <a className="hover:text-primary transition-colors">Blog</a>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/induktr" target="_blank" rel="noopener noreferrer">
                <SiGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
