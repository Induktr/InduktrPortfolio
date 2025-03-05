import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectGalleryProps {
  project: {
    title: string;
    description: string;
    image: string;
    features: string[];
    techStack: string[];
  };
}

export function ProjectGallery({ project }: ProjectGalleryProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Gallery Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="backdrop-blur-sm bg-background/50"
        >
          {isDetailsOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="backdrop-blur-sm bg-background/50"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="backdrop-blur-sm bg-background/50"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${project.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          drag
          dragConstraints={{
            top: -100,
            left: -100,
            right: 100,
            bottom: 100,
          }}
        />
      </div>

      {/* Project Details */}
      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-6 rounded-t-xl"
          >
            <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Ключевые функции</h3>
                <ul className="space-y-1">
                  {project.features.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Технологии</h3>
                <ul className="space-y-1">
                  {project.techStack.map((tech, index) => (
                    <motion.li
                      key={tech}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {tech}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
