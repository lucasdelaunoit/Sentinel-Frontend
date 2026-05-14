import { Badge } from "@/components/ui/badge.tsx";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const STATUS_VARIANTS: Record<ProjectStatus, { style: string; text: string }> = {
  planned: { style: "bg-violet-500/15 text-violet-600 ring-1 ring-violet-500/20", text: "Planned" },
  active: { style: "bg-primary", text: "Active" },
  paused: { style: "bg-warning-foreground text-warning", text: "Paused" },
  completed: { style: "bg-info-foreground text-info ", text: "Completed" },
  archived: { style: "bg-muted text-muted-foreground", text: "Archived" },
};

const DEFAULT_STATUS = { style: "bg-gray-200", text: "Unknown" };

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const variant = status && STATUS_VARIANTS[status] ? STATUS_VARIANTS[status] : DEFAULT_STATUS;
  return <Badge className={variant.style}>{variant.text}</Badge>;
}
