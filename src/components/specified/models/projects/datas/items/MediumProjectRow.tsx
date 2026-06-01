import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import ProjectAvatar from "@/components/specified/models/projects/avatars/ProjectAvatar.tsx";
import FragilityBadge from "@/components/specified/models/projects/datas/FragilityBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ProjectFragilityAvatar from "@/components/specified/models/projects/avatars/ProjectFragilityAvatar.tsx";

interface MediumProjectRowProps {
  project: Project;
  className?: string;
  onClick?: () => void;
}

export default function MediumProjectRow({ project, className, onClick }: MediumProjectRowProps) {
  return (
    <SecondaryCard
      className={className}
      onClick={onClick}
      before={<ProjectFragilityAvatar name={project.name} fragilitySeverity={project.fragility.severity} />}
      title={project.name}
      description={project.description || "—"}
      action={<FragilityBadge fragility={project.fragility} />}
    />
  );
}

MediumProjectRow.Skeleton = function MediumProjectRowSkeleton() {
  return (
    <SecondaryCard
      before={<ProjectAvatar.Skeleton />}
      title={<Skeleton className="h-3.5 w-32" />}
      description={<Skeleton className="h-3 w-24" />}
      action={<FragilityBadge.Skeleton size="sm" />}
    />
  );
};
