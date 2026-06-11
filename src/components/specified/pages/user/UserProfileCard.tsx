import { useState } from "react";
import { Card } from "@/components/ui/card.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Mail, Phone, CalendarDays } from "lucide-react";
import { PencilSimpleIcon, BuildingsIcon } from "@phosphor-icons/react";
import UserStatusBadge from "@/components/specified/models/user/badges/UserStatusBadge.tsx";
import DataDisplay from "@/components/common/data/DataDisplay.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import EditUserSheet from "@/components/specified/models/user/sheets/EditUserSheet.tsx";

interface UserProfileCardProps {
  user: User | undefined;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return <UserProfileCard.Skeleton />;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <UserAvatar firstname={user.firstname} lastname={user.lastname} size="2xl" variant={user.status} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{`${user.firstname} ${user.lastname}`}</h2>
              <UserStatusBadge status={user.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{user.title ?? "—"}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <PencilSimpleIcon className="size-4" weight="bold" />
          Edit
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <DataDisplay icon={Mail} label="Email" value={user.email} />
        <DataDisplay icon={Phone} label="Phone" value={user.phone} />
        <DataDisplay icon={BuildingsIcon} label="Department" value={user.department?.name} />
        <DataDisplay icon={CalendarDays} label="Start Date" value={user.created_at} />
      </div>

      <EditUserSheet open={editOpen} onOpenChange={setEditOpen} user={user} />
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
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <DataDisplay.Skeleton icon={Mail} label="Email" />
        <DataDisplay.Skeleton icon={Phone} label="Phone" />
        <DataDisplay.Skeleton icon={BuildingsIcon} label="Department" />
        <DataDisplay.Skeleton icon={CalendarDays} label="Start Date" />
      </div>
    </Card>
  );
};
