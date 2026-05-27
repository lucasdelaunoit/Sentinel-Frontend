import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import ProjectAvatar from "@/components/specified/models/projects/avatars/ProjectAvatar.tsx";
import FragilityBadge from "@/components/specified/models/projects/datas/FragilityBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface MediumProjectRowProps {
  project: Project;
  className?: string;
  onClick?: () => void;
}

function fragilityScore(metric?: MetricResult): number | null {
  const raw = metric?.value_raw;
  return typeof raw === "number" ? raw : null;
}

export default function MediumProjectRow({ project, className, onClick }: MediumProjectRowProps) {
  return (
    <SecondaryCard
      className={className}
      onClick={onClick}
      before={<ProjectAvatar name={project.name} variant={project.status} />}
      title={project.name}
      description={project.description || "—"}
      action={<FragilityBadge value={fragilityScore(project.fragility)} size="sm" />}
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
