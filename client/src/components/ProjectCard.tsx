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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsDialogOpen(true)}
      >
        <Card className="overflow-hidden h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.02]">
          <div className="aspect-video relative">
            <img
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-full"
            />
            <Badge 
              className="absolute top-2 right-2"
              variant={project.status === "completed" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>

          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <p className="text-muted-foreground mb-4">{project.shortDescription}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              {project.links.github && (
                <Button size="sm" variant="outline" asChild>
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
                <Button size="sm" asChild>
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