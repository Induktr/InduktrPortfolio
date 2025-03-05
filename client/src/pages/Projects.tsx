import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "../data/projects.json";
import { motion } from "framer-motion";

export default function Projects() {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}