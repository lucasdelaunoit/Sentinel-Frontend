import { Badge } from "@/components/ui/badge.tsx";
import { USER_STATUS_BG, USER_STATUS_LABEL } from "@/lib/theme/userStatus.ts";
import { UNKNOWN_STATUS_BG, UNKNOWN_STATUS_LABEL } from "@/lib/theme/status.ts";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const known = status && USER_STATUS_BG[status];
  return (
    <Badge className={known || UNKNOWN_STATUS_BG}>
      {known ? USER_STATUS_LABEL[status] : UNKNOWN_STATUS_LABEL}
    </Badge>
  );
}
