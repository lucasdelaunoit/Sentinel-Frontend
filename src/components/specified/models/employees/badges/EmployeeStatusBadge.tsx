import { Badge } from "@/components/ui/badge.tsx";

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

const STATUS_VARIANTS: Record<EmployeeStatus, { style: string; text: string }> = {
  available: { style: "bg-success-foreground", text: "Available" },
  away: { style: "bg-danger-foreground", text: "Away" },
};

const DEFAULT_STATUS = { style: "bg-gray-200", text: "Unknown" };

export default function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const statusVariant = status && STATUS_VARIANTS[status] ? STATUS_VARIANTS[status] : DEFAULT_STATUS;

  return <Badge className={statusVariant.style}>{statusVariant.text}</Badge>;
}
