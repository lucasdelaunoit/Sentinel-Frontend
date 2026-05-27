import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import UserStatusBadge from "@/components/specified/models/employees/badges/UserStatusBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { getFullName } from "@/utils/formatters/persons.ts";

interface MediumUserRowProps {
  user: User;
  className?: string;
  onClick?: () => void;
}

export default function MediumUserRow({ user, className, onClick }: MediumUserRowProps) {
  return (
    <SecondaryCard
      className={className}
      onClick={onClick}
      before={<UserAvatar firstname={user.firstname} lastname={user.lastname} variant={user.status} />}
      title={getFullName(user.firstname, user.lastname)}
      description={user.department?.name ?? "—"}
      action={<UserStatusBadge status={user.status} />}
    />
  );
}

MediumUserRow.Skeleton = function MediumUserRowSkeleton() {
  return (
    <SecondaryCard
      before={<UserAvatar.Skeleton />}
      title={<Skeleton className="h-3.5 w-32" />}
      description={<Skeleton className="h-3 w-20" />}
      action={<Skeleton className="h-5 w-16 rounded-full" />}
    />
  );
};
