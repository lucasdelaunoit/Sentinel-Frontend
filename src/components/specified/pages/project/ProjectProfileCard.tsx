import { Card } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { CalendarDays, Target, Users, PlayCircle } from "lucide-react";
import ProjectStatusBadge from "@/components/specified/models/projects/badges/ProjectStatusBadge.tsx";
import DataDisplay from "@/components/common/data/DataDisplay.tsx";
import { formatDate } from "@/utils/formatters/date.ts";
import type { ProjectDetailResponse } from "@/types/dashboard";

interface ProjectProfileCardProps {
  project: ProjectDetailResponse;
  onSimulate?: () => void;
}

export default function ProjectProfileCard({ project, onSimulate }: ProjectProfileCardProps) {
  const teamSize = project.users?.length ?? project.users_count ?? 0;
  const idTag = String(project.id).slice(-2).padStart(2, "0");

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-xl font-bold text-white shadow-md">
            {idTag}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{project.name}</h2>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={onSimulate}>
          <PlayCircle className="size-4" />
          Edit
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <DataDisplay icon={CalendarDays} label="Start Date" value={formatDate(project.started_at)} />
        <DataDisplay icon={Target} label="Deadline" value={formatDate(project.deadline)} />
        <DataDisplay icon={Users} label="Team Size" value={teamSize > 0 ? String(teamSize) : null} />
      </div>
    </Card>
  );
}

ProjectProfileCard.Skeleton = function ProjectProfileCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <Skeleton className="size-20 rounded-2xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <DataDisplay.Skeleton icon={CalendarDays} label="Start Date" />
        <DataDisplay.Skeleton icon={Target} label="Deadline" />
        <DataDisplay.Skeleton icon={Users} label="Team Size" />
      </div>
    </Card>
  );
};
