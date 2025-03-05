import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectGallery } from "./ProjectGallery";

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

export function ProjectDialog({ project, isOpen, onClose }: ProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden">
        <ProjectGallery project={project} />
      </DialogContent>
    </Dialog>
  );
}