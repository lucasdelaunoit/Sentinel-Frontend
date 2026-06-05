import { Skeleton } from "@/components/ui/skeleton.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar";
import SeveredSkillBadge from "@/components/specified/models/skill/badges/SeveredSkillBadge.tsx";
import { TONE_BG, TONE_TEXT } from "@/lib/scoring.ts";
import { cn } from "@/lib/utils.ts";

interface MediumAbsenceImpactRowProps {
  firstname: string;
  lastname: string;
  status: UserStatus;
  lost: string[];
  weakened: string[];
}

export default function MediumAbsenceImpactRow({
  firstname,
  lastname,
  status,
  lost,
  weakened,
}: MediumAbsenceImpactRowProps) {
  const noImpact = lost.length === 0 && weakened.length === 0;

  return (
    <SecondaryCard
      before={<UserAvatar firstname={firstname} lastname={lastname} variant={status} />}
      title={`${firstname} ${lastname}`}
      description={
        noImpact ? (
          <span className={cn("text-[11px] font-medium", TONE_TEXT.success)}>All skills remain covered</span>
        ) : (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {lost.map((s) => (
              <SeveredSkillBadge key={s} name={s} severity="critical" />
            ))}
            {weakened.map((s) => (
              <SeveredSkillBadge key={s} name={s} />
            ))}
          </div>
        )
      }
      action={<ImpactPill lost={lost.length} weakened={weakened.length} />}
    />
  );
}

MediumAbsenceImpactRow.Skeleton = function MediumAbsenceImpactRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-tertiary p-3">
      <UserAvatar.Skeleton />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
};

interface ImpactPillProps {
  lost: number;
  weakened: number;
}

function ImpactPill({ lost, weakened }: ImpactPillProps) {
  if (lost > 0) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={cn("size-1.5 rounded-full shrink-0", TONE_BG.danger)} />
        <span className={cn("text-xs font-semibold", TONE_TEXT.danger)}>
          {lost} skill{lost !== 1 ? "s" : ""} lost
        </span>
      </div>
    );
  }

  if (weakened > 0) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={cn("size-1.5 rounded-full shrink-0", TONE_BG.warning)} />
        <span className={cn("text-xs font-semibold", TONE_TEXT.warning)}>
          {weakened} skill{weakened !== 1 ? "s" : ""} → silo
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full shrink-0", TONE_BG.success)} />
      <span className={cn("text-xs font-medium", TONE_TEXT.success)}>No impact</span>
    </div>
  );
}
