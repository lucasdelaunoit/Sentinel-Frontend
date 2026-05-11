import { ShieldAlert, Users, Code2, FolderKanban } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import type { UserStats } from "@/types/dashboard";

/* ─── Helpers ─────────────────────────────────────────────── */

function critColor(score: number) {
  if (score >= 70) return "text-rose-500";
  if (score >= 40) return "text-amber-500";
  return "text-emerald-500";
}

function busColor(count: number) {
  if (count >= 3) return "text-rose-500";
  if (count >= 1) return "text-amber-500";
  return "text-emerald-500";
}

function joinNames(items: { name: string }[], max = 2) {
  const names = items.slice(0, max).map((p) => p.name);
  const rest = items.length - max;
  return names.join(", ") + (rest > 0 ? ` +${rest} more` : "");
}

/* ─── Component ───────────────────────────────────────────── */

interface UserStatsSectionProps {
  stats: UserStats;
}

export default function UserStatsSection({ stats }: UserStatsSectionProps) {
  const { criticality, bus_factor_in_org, skills, active_projects } = stats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Criticality Score"
        icon={ShieldAlert}
        isLoading={false}
        value={<span className={critColor(criticality.score)}>{criticality.score}</span>}
        comment={
          <span className="text-[12px] text-muted-foreground">
            {criticality.unique_skills} unique · {criticality.silo_count} silos
          </span>
        }
      />

      <StatCard
        title="Bus Factor in Org"
        icon={Users}
        isLoading={false}
        value={<span className={busColor(bus_factor_in_org.count)}>{bus_factor_in_org.count}</span>}
        comment={
          <span className="text-[12px] text-muted-foreground">
            {bus_factor_in_org.count === 0 ? "No bottlenecks" : joinNames(bus_factor_in_org.projects)}
          </span>
        }
      />

      <StatCard
        title="Skills"
        icon={Code2}
        isLoading={false}
        value={skills.total}
        comment={
          skills.by_category.length > 0 ? (
            <span className="text-[12px] text-muted-foreground">
              {skills.by_category[0].category}{" "}
              <span className="font-medium text-foreground">×{skills.by_category[0].count}</span>
            </span>
          ) : null
        }
      />

      <StatCard
        title="Active Projects"
        icon={FolderKanban}
        isLoading={false}
        value={active_projects.count}
        comment={
          <span className="text-[12px] text-muted-foreground">
            {active_projects.projects.length === 0 ? "No active projects" : joinNames(active_projects.projects)}
          </span>
        }
      />
    </div>
  );
}

UserStatsSection.Skeleton = function UserStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="" value={null} comment={null} icon={ShieldAlert} isLoading={true} />
      <StatCard title="" value={null} comment={null} icon={Users} isLoading={true} />
      <StatCard title="" value={null} comment={null} icon={Code2} isLoading={true} />
      <StatCard title="" value={null} comment={null} icon={FolderKanban} isLoading={true} />
    </div>
  );
};
