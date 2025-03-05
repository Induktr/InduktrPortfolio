import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { useState } from "react";
import { ProjectDialog } from "./ProjectDialog";

interface ProjectCardProps {
  project: {
    title: string;
    description: string;
    shortDescription: string;
    image: string;
    tags: string[];
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
    links: {
      github?: string;
      live?: string;
    };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <motion.div
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={cardVariants}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsDialogOpen(true)}
      >
        <Card className="overflow-hidden h-full flex flex-col cursor-pointer bg-gradient-to-br from-background to-accent/5">
          <div className="aspect-video relative overflow-hidden">
            <motion.img
              variants={imageVariants}
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-full"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
              animate={{ opacity: isHovered ? 0.9 : 0.6 }}
              transition={{ duration: 0.3 }}
            />
            <Badge 
              className="absolute top-4 right-4 backdrop-blur-sm"
              variant={project.status === "completed" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <p className="text-muted-foreground mb-4 line-clamp-2">{project.shortDescription}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-background/50 backdrop-blur-sm">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              {project.links.github && (
                <Button size="sm" variant="outline" asChild className="backdrop-blur-sm">
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}
              {project.links.live && (
                <Button size="sm" asChild className="backdrop-blur-sm">
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ProjectDialog
        project={project}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}