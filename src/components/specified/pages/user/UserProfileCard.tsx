import { Card } from "@/components/ui/card.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import { getInitials } from "@/utils/formatters/persons.ts";
import { Button } from "@/components/ui/button.tsx";
import { Mail, Phone, User as UserIcon, CalendarDays, PenSquare } from "lucide-react";
import UserStatusBadge from "@/components/specified/models/employees/badges/UserStatusBadge.tsx";
import DataDisplay from "@/components/common/data/DataDisplay.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface UserProfileCardProps {
  user: User;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <UserAvatar initials={getInitials(user)} size="2xl" variant={user.status} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{`${user.firstname} ${user.lastname}`}</h2>
              <UserStatusBadge status={user.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.title} · {user.department?.name ?? "—"}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <PenSquare className="size-4" />
          Edit profile
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <DataDisplay icon={Mail} label="Email" value={user.email} />
        <DataDisplay icon={Phone} label="Phone" value={user.phone} />
        <DataDisplay icon={UserIcon} label="Manager" value={user.phone} />
        <DataDisplay icon={CalendarDays} label="Start Date" value={user.created_at} />
      </div>
    </Card>
  );
}

UserProfileCard.Skeleton = function UserProfileCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <UserAvatar.Skeleton size="2xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <DataDisplay.Skeleton icon={Mail} label="Email" />
        <DataDisplay.Skeleton icon={Phone} label="Phone" />
        <DataDisplay.Skeleton icon={UserIcon} label="Manager" />
        <DataDisplay.Skeleton icon={CalendarDays} label="Start Date" />
      </div>
    </Card>
  );
};
