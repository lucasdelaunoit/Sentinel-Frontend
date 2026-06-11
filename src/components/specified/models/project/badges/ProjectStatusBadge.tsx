import { Badge } from "@/components/ui/badge.tsx";
import { PROJECT_STATUS_BG, PROJECT_STATUS_LABEL } from "@/lib/theme/projectStatus.ts";
import { UNKNOWN_STATUS_BG, UNKNOWN_STATUS_LABEL } from "@/lib/theme/status.ts";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const known = status && PROJECT_STATUS_BG[status];
  return (
    <Badge className={known || UNKNOWN_STATUS_BG}>
      {known ? PROJECT_STATUS_LABEL[status] : UNKNOWN_STATUS_LABEL}
    </Badge>
  );
}
