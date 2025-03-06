import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProjectGallery } from "./ProjectGallery";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";

interface ProjectDialogProps {
  project: {
    title: string;
    description: string;
    image: string;
    video?: string;
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
    links: {
      github?: string;
      live?: string;
      srcbook?: string;
      cursor?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDialog({ project, isOpen, onClose }: ProjectDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "active":
        return "bg-blue-500";
      case "upcoming":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
            <Badge
              variant="outline"
              className={`${getStatusColor(project.status)} text-white border-none`}
            >
              {project.status === "in-development" ? "В разработке" : project.status}
            </Badge>
          </div>
          <DialogDescription className="text-lg">
            {project.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6 flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="timeline">Таймлайн</TabsTrigger>
            <TabsTrigger value="tech">Технологии</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent
              value="overview"
              className="mt-0 data-[state=active]:h-full"
            >
              <div className="aspect-video relative overflow-hidden rounded-lg mb-6">
                {project.video ? (
                  <video
                    src={project.video}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${project.image})` }}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ключевые функции</h3>
                  <ul className="space-y-2">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Начало проекта</h3>
                  <p>
                    {new Date(project.timeline.start).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Фазы проекта</h3>
                  <div className="space-y-4">
                    {project.timeline.phases.map((phase, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 relative overflow-hidden"
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(
                            phase.status
                          )}`}
                        />
                        <h4 className="font-medium">{phase.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {phase.duration}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-2 ${getStatusColor(
                            phase.status
                          )} text-white border-none`}
                        >
                          {phase.status === "completed"
                            ? "Завершено"
                            : phase.status === "active"
                            ? "В процессе"
                            : "Предстоит"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tech" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Основной стек</h3>
                  <ul className="space-y-2">
                    {project.techStack.map((tech, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {project.additionalTech && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Дополнительные технологии</h3>
                    <div className="space-y-4">
                      {project.additionalTech.mediaTools && (
                        <div>
                          <h4 className="font-medium text-primary">{project.additionalTech.mediaTools.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {project.additionalTech.mediaTools.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {project.additionalTech.formTools && (
                        <div>
                          <h4 className="font-medium text-primary">{project.additionalTech.formTools.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {project.additionalTech.formTools.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {project.additionalTech.cmsTools && (
                        <div>
                          <h4 className="font-medium text-primary">{project.additionalTech.cmsTools.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {project.additionalTech.cmsTools.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {project.additionalTech.performanceTools && (
                        <div>
                          <h4 className="font-medium text-primary">{project.additionalTech.performanceTools.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {project.additionalTech.performanceTools.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {project.additionalTech.testingTools && (
                        <div>
                          <h4 className="font-medium text-primary">{project.additionalTech.testingTools.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {project.additionalTech.testingTools.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {project.additionalTech.devopsTools && (
                        <div>
                          <h4 className="font-medium text-primary">{project.additionalTech.devopsTools.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {project.additionalTech.devopsTools.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="mr-2 text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {project.additionalTech.developmentTools && (
                        <div>
                          <h4 className="font-medium text-primary">{project.additionalTech.developmentTools.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {project.additionalTech.developmentTools.items.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="mr-2 text-primary">•</span>
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
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <div className="flex gap-2">
            {project.links.github && (
              <Button variant="outline" asChild>
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            )}
            {project.links.live && (
              <Button asChild>
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Demo
                </a>
              </Button>
            )}
            {project.links.srcbook && (
              <Button variant="outline" asChild>
                <a
                  href={project.links.srcbook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4v16h16V4H4zm2 14V6h12v12H6z" />
                    <path d="M8 8h8v2H8zM8 11h8v2H8zM8 14h5v2H8z" />
                  </svg>
                  Srcbook
                </a>
              </Button>
            )}
            {project.links.cursor && (
              <Button variant="outline" asChild>
                <a
                  href={project.links.cursor}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.92 9.5L9.5 4.5V9.5h4.42zm-5.42 1v10l10-5-10-5z" />
                  </svg>
                  Cursor
                </a>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}