import { Badge } from "@/components/ui/badge.tsx";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const STATUS_VARIANTS: Record<UserStatus, { style: string; text: string }> = {
  available: { style: "bg-success", text: "Available" },
  away: { style: "bg-danger", text: "Away" },
};

const DEFAULT_STATUS = { style: "bg-gray-200", text: "Unknown" };

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const statusVariant = status && STATUS_VARIANTS[status] ? STATUS_VARIANTS[status] : DEFAULT_STATUS;

  return <Badge className={statusVariant.style}>{statusVariant.text}</Badge>;
}
