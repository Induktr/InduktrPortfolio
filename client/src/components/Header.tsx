import { Link } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { SiGithub, SiTelegram } from "react-icons/si";
import { motion } from "framer-motion";
import { MobileNav } from "./MobileNav";

const navItemVariants = {
  hover: { scale: 1.05, color: "hsl(var(--primary))" },
  tap: { scale: 0.95 }
};

const logoVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export function Header() {
  return (
    <motion.header 
      className="border-b"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/">
            <motion.span 
              className="text-2xl font-bold cursor-pointer"
              variants={logoVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Induktr
            </motion.span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/projects">
            <motion.span 
              className="cursor-pointer"
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Projects
            </motion.span>
          </Link>
          <Link href="/tools">
            <motion.span 
              className="cursor-pointer"
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Tools
            </motion.span>
          </Link>
          <Link href="/blog">
            <motion.span 
              className="cursor-pointer"
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Blog
            </motion.span>
          </Link>

          <div className="flex items-center space-x-4">
            <motion.a
              href="https://t.me/induktr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SiTelegram className="h-5 w-5" />
              <span className="sr-only">Telegram</span>
            </motion.a>
            <motion.a
              href="https://github.com/induktr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SiGithub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </motion.a>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </motion.header>
  );
}