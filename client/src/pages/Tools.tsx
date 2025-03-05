import { ToolGrid } from "@/components/ToolGrid";
import { ToolComparison } from "@/components/ToolComparison";
import { motion } from "framer-motion";

export default function Tools() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">Инструменты и технологии</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Сравнительный анализ и обзор используемых технологий в наших проектах
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Сравнение производительности</h2>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <ToolComparison />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Наш технологический стек</h2>
          <ToolGrid />
        </section>
      </motion.div>
    </div>
  );
}