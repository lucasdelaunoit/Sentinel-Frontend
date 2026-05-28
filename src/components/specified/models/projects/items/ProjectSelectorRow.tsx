import { Skeleton } from "@/components/ui/skeleton";
import SelectorRow from "@/components/common/inputs/SelectorRow";
import ProjectAvatar from "@/components/specified/models/projects/avatars/ProjectAvatar";
import ProjectStatusBadge from "@/components/specified/models/projects/badges/ProjectStatusBadge";
import { HighlightMatch } from "@/utils/useHighlightableText";

interface ProjectSelectorRowProps {
  project: Project;
  selected: boolean;
  onToggle: () => void;
  searchTerm?: string;
}

export default function ProjectSelectorRow({ project, selected, onToggle, searchTerm = "" }: ProjectSelectorRowProps) {
  return (
    <SelectorRow active={selected} onClick={onToggle}>
      <ProjectAvatar name={project.name} variant={project.status} size="base" />
      <div className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-foreground truncate">
          <HighlightMatch text={project.name} searchTerm={searchTerm} />
        </span>
        {project.description && (
          <span className="block text-[11.5px] text-muted-foreground truncate">
            <HighlightMatch text={project.description} searchTerm={searchTerm} />
          </span>
        )}
      </div>
      <ProjectStatusBadge status={project.status} />
    </SelectorRow>
  );
}

ProjectSelectorRow.Skeleton = function ProjectSelectorRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <Skeleton className="size-6 rounded-md shrink-0" />
      <Skeleton className="size-8 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
    </div>
  );
};
