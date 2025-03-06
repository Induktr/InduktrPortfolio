import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, ZoomIn, ZoomOut, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectGalleryProps {
  project: {
    title: string;
    description: string;
    image: string;
    video?: string;
    features: string[];
    techStack: string[];
    additionalTech?: {
      mediaTools?: {
        title: string;
        items: string[];
      };
      formTools?: {
        title: string;
        items: string[];
      };
      cmsTools?: {
        title: string;
        items: string[];
      };
      performanceTools?: {
        title: string;
        items: string[];
      };
      testingTools?: {
        title: string;
        items: string[];
      };
      devopsTools?: {
        title: string;
        items: string[];
      };
      developmentTools?: {
        title: string;
        items: string[];
      };
    };
  };
}

export function ProjectGallery({ project }: ProjectGalleryProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [showVideo, setShowVideo] = useState(false);

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
          className="bg-background/80 backdrop-blur-sm"
          onClick={() => setShowVideo(!showVideo)}
        >
          {showVideo ? <Image className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Media Display */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {showVideo && project.video ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black"
            >
              <video
                src={project.video}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            </motion.div>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage: `url(${project.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `scale(${scale})`,
                transition: "transform 0.3s ease-out",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Project Details */}
      <div className="bg-background/95 backdrop-blur-sm p-4 border-t">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="ml-2"
          >
            {isDetailsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <AnimatePresence>
          {isDetailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Описание</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Ключевые функции</h4>
                  <ul className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Технологии</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {project.techStack.map((tech, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {project.additionalTech && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Дополнительные технологии</h4>
                      <div className="space-y-3">
                        {project.additionalTech.mediaTools && (
                          <div>
                            <h5 className="text-xs font-medium text-primary">{project.additionalTech.mediaTools.title}</h5>
                            <ul className="text-xs text-muted-foreground">
                              {project.additionalTech.mediaTools.items.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {project.additionalTech.formTools && (
                          <div>
                            <h5 className="text-xs font-medium text-primary">{project.additionalTech.formTools.title}</h5>
                            <ul className="text-xs text-muted-foreground">
                              {project.additionalTech.formTools.items.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {project.additionalTech.developmentTools && (
                          <div>
                            <h5 className="text-xs font-medium text-primary">{project.additionalTech.developmentTools.title}</h5>
                            <ul className="text-xs text-muted-foreground">
                              {project.additionalTech.developmentTools.items.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}