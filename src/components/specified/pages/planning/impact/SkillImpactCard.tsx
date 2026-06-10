import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";

interface SkillImpactCardProps {
  skills: SkillImpact[];
}

export default function SkillImpactCard({ skills }: SkillImpactCardProps) {
  const order: Severity[] = ["critical", "warning", "ok"];
  const sorted = [...skills].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Impacted Skills</span>
          <CountDisplay count={skills.length} />
        </div>
      }
    >
      {skills.length === 0 ? (
        <Feedback variant="success" title="No project impact" description="All skills remain covered." />
      ) : (
        <div className="divide-y divide-border/40">
          {sorted.map((s) => (
            <div key={s.skill_id} className="px-5 py-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("size-2 rounded-full shrink-0" /*, SEVERITY_SURFACE[s.severity].dot*/)} />
                  <span className="text-[12px] font-semibold text-foreground truncate">{s.name}</span>
                  {s.is_critical_for_org && (
                    <Badge variant="destructive" className="h-4 px-1.5 text-[9px]">
                      Critical
                    </Badge>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]" /*, SEVERITY_SURFACE[s.severity].text, SEVERITY_SURFACE[s.severity].border*/,
                  )}
                >
                  {s.owners_left}/{s.owners_total} owners
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Coverage {s.coverage_pct_before}% →{" "}
                <span
                  className={cn(
                    s.coverage_pct_after < s.coverage_pct_before && "text-destructive-foreground font-semibold",
                  )}
                >
                  {s.coverage_pct_after}%
                </span>
                {s.projects_impacted.length > 0 &&
                  ` · ${s.projects_impacted.length} project${s.projects_impacted.length === 1 ? "" : "s"}`}
              </p>
              {s.dates_uncovered.length > 0 && (
                <p className="text-[10px] text-destructive-foreground">
                  Uncovered: {s.dates_uncovered.slice(0, 4).join(", ")}
                  {s.dates_uncovered.length > 4 ? ` +${s.dates_uncovered.length - 4}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

SkillImpactCard.Skeleton = function SkillImpactCardSkeleton() {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Impacted Skills</span>
          <CountDisplay isLoading count={0} />
        </div>
      }
    >
      <div className="divide-y divide-border/40">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-5 py-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Skeleton className="size-2 rounded-full shrink-0" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-2.5 w-40" />
          </div>
        ))}
      </div>
    </ComposedCard>
  );
};
