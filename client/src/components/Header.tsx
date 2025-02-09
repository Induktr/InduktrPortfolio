import { Link } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { SiGithub } from "react-icons/si";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-bold cursor-pointer">Induktr</span>
        </Link>

        <nav className="flex items-center space-x-8">
          <Link href="/projects">
            <span className="hover:text-primary transition-colors cursor-pointer">Projects</span>
          </Link>
          <Link href="/tools">
            <span className="hover:text-primary transition-colors cursor-pointer">Tools</span>
          </Link>
          <Link href="/blog">
            <span className="hover:text-primary transition-colors cursor-pointer">Blog</span>
          </Link>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/induktr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
            >
              <SiGithub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}