import { Card } from "@/components/ui/card.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import { getInitials } from "@/utils/formatters/persons.ts";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Mail, User, CalendarDays, Phone, PenSquare } from "lucide-react";
import UserStatusBadge from "@/components/specified/models/employees/badges/UserStatusBadge.tsx";

interface UserProfileCardProps {
  user: User;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <UserAvatar initials={getInitials(`${user.firstname} ${user.lastname}`)} size="2xl" variant={user.status} />
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

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoChip icon={<Mail className="size-3.5" />} label="Email" value={user.email} />
        <InfoChip icon={<Phone className="size-3.5" />} label="Phone" value={user.phone ?? "—"} />
        <InfoChip
          icon={<User className="size-3.5" />}
          label="Manager"
          value={user.manager ? `${user.manager.firstname} ${user.manager.lastname}` : "—"}
        />
        <InfoChip
          icon={<CalendarDays className="size-3.5" />}
          label="Start Date"
          value={/*fmtDate(user.start_date)*/ "ss"}
        />
      </div>
    </Card>
  );
}

/* ─── InfoChip ────────────────────────────────────────────── */

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className="text-[13px] font-medium text-foreground truncate">{value}</p>
    </div>
  );
}
