import { useState } from "react";
import { Card } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { PencilSimpleIcon, ArchiveIcon, CalendarDotsIcon, TargetIcon, UsersIcon } from "@phosphor-icons/react";
import DataDisplay from "@/components/common/data/DataDisplay.tsx";
import EditProjectSheet from "@/components/specified/models/project/sheets/EditProjectSheet.tsx";
import { formatDate } from "@/utils/formatters/date.ts";
import ProjectAvatar from "../../models/project/avatars/ProjectAvatar";
import ProjectStatusBadge from "@/components/specified/models/project/badges/ProjectStatusBadge.tsx";

interface ProjectProfileCardProps {
  project: ProjectDetailResponse;
}

export default function ProjectProfileCard({ project }: ProjectProfileCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const teamSize = project.users?.length ?? project.users_count ?? 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <ProjectAvatar name={project.name} variant={project.status} size="2xl" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{project.name}</h2>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <PencilSimpleIcon className="size-4" weight="bold" />
          Edit
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <DataDisplay icon={CalendarDotsIcon} label="Start Date" value={formatDate(project.started_at)} />
        <DataDisplay icon={TargetIcon} label="Deadline" value={formatDate(project.deadline)} />
        <DataDisplay icon={UsersIcon} label="Team Size" value={teamSize > 0 ? String(teamSize) : null} />
        <DataDisplay
          icon={ArchiveIcon}
          label="Archived at"
          value={project.archived_at ? formatDate(project.archived_at) : null}
        />
      </div>

      <EditProjectSheet open={editOpen} onOpenChange={setEditOpen} project={project} />
    </Card>
  );
}

ProjectProfileCard.Skeleton = function ProjectProfileCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <ProjectAvatar.Skeleton size="2xl" />
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
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <DataDisplay.Skeleton icon={CalendarDotsIcon} label="Start Date" />
        <DataDisplay.Skeleton icon={TargetIcon} label="Deadline" />
        <DataDisplay.Skeleton icon={UsersIcon} label="Team Size" />
        <DataDisplay.Skeleton icon={ArchiveIcon} label="Archived at" />
      </div>
    </Card>
  );
};
