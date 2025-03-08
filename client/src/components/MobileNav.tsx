import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SiGithub, SiTelegram } from "react-icons/si";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export function MobileNav() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] sm:w-[380px] bg-background border-r">
        <nav className="flex flex-col h-full justify-between py-6">
          {user && (
            <div className="flex items-center gap-3 px-4 pb-4 mb-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || undefined} alt={user.username || ''} />
                <AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.username || 'Пользователь'}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          )}

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
            className="flex flex-col space-y-1"
          >
            <motion.div variants={navItemVariants}>
              <Link href="/projects">
                <div className="block px-4 py-3 text-lg hover:text-primary hover:bg-muted rounded-md cursor-pointer transition-colors">
                  Projects
                </div>
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link href="/tools">
                <div className="block px-4 py-3 text-lg hover:text-primary hover:bg-muted rounded-md cursor-pointer transition-colors">
                  Tools
                </div>
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link href="/blog">
                <div className="block px-4 py-3 text-lg hover:text-primary hover:bg-muted rounded-md cursor-pointer transition-colors">
                  Blog
                </div>
              </Link>
            </motion.div>

            {user ? (
              <>
                <motion.div variants={navItemVariants}>
                  <Link href="/profile">
                    <div className="flex items-center px-4 py-3 text-lg hover:text-primary hover:bg-muted rounded-md cursor-pointer transition-colors">
                      <User className="mr-2 h-5 w-5" />
                      Профиль
                    </div>
                  </Link>
                </motion.div>
                <motion.div variants={navItemVariants}>
                  <div 
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-3 text-lg hover:text-primary hover:bg-muted rounded-md cursor-pointer transition-colors"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Выйти
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={navItemVariants}>
                  <Link href="/signin">
                    <div className="block px-4 py-3 text-lg hover:text-primary hover:bg-muted rounded-md cursor-pointer transition-colors">
                      Войти
                    </div>
                  </Link>
                </motion.div>
                <motion.div variants={navItemVariants}>
                  <Link href="/signup">
                    <div className="block px-4 py-3 text-lg hover:text-primary hover:bg-muted rounded-md cursor-pointer transition-colors">
                      Регистрация
                    </div>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.div
            variants={navItemVariants}
            className="flex items-center gap-4 px-4 pt-4 border-t"
          >
            <motion.a
              href="https://t.me/induktr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
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
              className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted"
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