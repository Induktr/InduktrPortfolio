import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectGallery } from "./ProjectGallery";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDialog({ project, isOpen, onClose }: ProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{project.title}</DialogTitle>
        </DialogHeader>
        <ProjectGallery project={project} />
      </DialogContent>
    </Dialog>
  );
}