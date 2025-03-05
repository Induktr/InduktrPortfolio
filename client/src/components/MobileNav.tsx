import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SiGithub, SiTelegram } from "react-icons/si";
import { ThemeToggle } from "./ThemeToggle";

const navItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] sm:w-[380px]">
        <nav className="flex flex-col space-y-6 mt-6">
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="flex flex-col space-y-4"
          >
            <Link href="/projects">
              <motion.span
                variants={navItemVariants}
                className="block px-2 py-1 text-lg hover:text-primary cursor-pointer"
              >
                Projects
              </motion.span>
            </Link>
            <Link href="/tools">
              <motion.span
                variants={navItemVariants}
                className="block px-2 py-1 text-lg hover:text-primary cursor-pointer"
              >
                Tools
              </motion.span>
            </Link>
            <Link href="/blog">
              <motion.span
                variants={navItemVariants}
                className="block px-2 py-1 text-lg hover:text-primary cursor-pointer"
              >
                Blog
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            variants={navItemVariants}
            className="flex items-center space-x-4 px-2"
          >
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
          </motion.div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
