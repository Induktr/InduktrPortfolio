import { ProjectCard } from "@/components/ProjectCard";
import { ProjectCategories } from "@/components/ProjectCategories";
import { projects, categories } from "../data/projects.json";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Projects() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredProjects = selectedCategories.length === 0
    ? projects
    : projects.filter(project => 
        project.categories.some(category => 
          selectedCategories.includes(category)
        )
      );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">Проекты</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Портфолио наших инновационных веб-разработок и технологических решений
        </p>

        <ProjectCategories
          categories={categories}
          selectedCategories={selectedCategories}
          onSelectCategory={handleCategorySelect}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}