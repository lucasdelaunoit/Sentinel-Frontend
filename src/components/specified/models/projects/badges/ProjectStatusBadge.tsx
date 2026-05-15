import { Badge } from "@/components/ui/badge.tsx";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const STATUS_VARIANTS: Record<ProjectStatus, { style: string; text: string }> = {
  planned: { style: "bg-planned", text: "Planned" },
  active: { style: "bg-primary", text: "Active" },
  paused: { style: "bg-warning", text: "Paused" },
  completed: { style: "bg-info ", text: "Completed" },
  archived: { style: "bg-muted text-muted-foreground", text: "Archived" },
};

const DEFAULT_STATUS = { style: "bg-gray-200", text: "Unknown" };

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const variant = status && STATUS_VARIANTS[status] ? STATUS_VARIANTS[status] : DEFAULT_STATUS;
  return <Badge className={variant.style}>{variant.text}</Badge>;
}
