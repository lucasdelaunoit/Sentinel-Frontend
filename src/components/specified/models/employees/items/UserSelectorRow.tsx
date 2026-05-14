import type { UserListItem } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import SelectorRow from "@/components/common/inputs/SelectorRow";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar";
import { HighlightMatch } from "@/utils/useHighlightableText";
import { getFullName, getInitials } from "@/utils/formatters/persons";

interface UserSelectorRowProps {
  user: UserListItem;
  selected: boolean;
  onToggle: () => void;
  searchTerm?: string;
}

export default function UserSelectorRow({ user, selected, onToggle, searchTerm = "" }: UserSelectorRowProps) {
  return (
    <SelectorRow active={selected} onClick={onToggle}>
      <UserAvatar initials={getInitials(user.firstname, user.lastname)} size="base" />
      <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
        <HighlightMatch text={getFullName(user.firstname, user.lastname)} searchTerm={searchTerm} />
      </span>
      {user.department?.name && (
        <span className="text-[11.5px] text-muted-foreground shrink-0">{user.department.name}</span>
      )}
    </SelectorRow>
  );
}

UserSelectorRow.Skeleton = function UserSelectorRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <Skeleton className="size-6 rounded-md shrink-0" />
      <UserAvatar.Skeleton size="base" />
      <Skeleton className="h-3.5 flex-1 max-w-[40%]" />
      <Skeleton className="h-3 w-20 shrink-0" />
    </div>
  );
};
