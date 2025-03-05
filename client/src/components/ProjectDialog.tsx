import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface ProjectDialogProps {
  project: {
    title: string;
    description: string;
    image: string;
    status: string;
    timeline: {
      start: string;
      phases: Array<{
        name: string;
        duration: string;
        status: string;
      }>;
    };
    features: string[];
    techStack: string[];
    tags: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function ProjectDialog({ project, isOpen, onClose }: ProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Image */}
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-full"
            />
            <Badge 
              className="absolute top-4 right-4"
              variant={project.status === "completed" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>

          {/* Project Description */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold mb-2">О проекте</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </motion.div>

            {/* Timeline */}
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold mb-4">График проекта</h3>
              <div className="space-y-3">
                {project.timeline.phases.map((phase) => (
                  <div key={phase.name} className="flex items-center space-x-4">
                    <div className="w-32 flex-shrink-0">
                      <Badge variant={phase.status === "active" ? "default" : "outline"}>
                        {phase.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{phase.name}</p>
                      <p className="text-sm text-muted-foreground">{phase.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold mb-2">Ключевые функции</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Tech Stack */}
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold mb-2">Технологии</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
