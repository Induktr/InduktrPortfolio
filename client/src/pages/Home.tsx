import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <main className="flex-1">
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Hi, I'm Induktr
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A passionate web developer crafting beautiful and functional digital experiences
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/projects">
                    View Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                    Download Resume
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
