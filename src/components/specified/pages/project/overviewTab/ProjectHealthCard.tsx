import { type Tone, TONE_TEXT } from "@/lib/theme/tone.ts";
import { getFragilityTier } from "@/lib/theme/scoring.ts";
import { cn } from "@/lib/utils.ts";
import MetricRow, { type MetricTone } from "@/components/common/displays/MetricRow.tsx";
import { CalendarIcon, type Icon, ShieldWarningIcon, UsersIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Card } from "@/components/ui/card.tsx";
import useGetProjectStats from "@/api/projects/useGetProjectStats";
import useGetProjectMetrics from "@/api/projects/useGetProjectMetrics";

interface ProjectHealthCardProps {
  projectId: string | undefined;
}

const FRAGILITY_CAPTIONS: Record<Tone, string> = {
  success: "Operating normally",
  warning: "Monitor closely",
  danger: "Immediate attention required",
  info: "Operating normally",
  neutral: "Operating normally",
};

function deadlineToneFor(severity: string | undefined): MetricTone {
  if (severity === "critical") return "danger";
  if (severity === "warning") return "warning";
  return "neutral";
}

export default function ProjectHealthCard({ projectId }: ProjectHealthCardProps) {
  const { data: stats, isLoading: statsLoading } = useGetProjectStats(projectId);
  const { data: metrics, isLoading: metricsLoading } = useGetProjectMetrics(projectId);

  if (statsLoading || metricsLoading) return <ProjectHealthCard.Skeleton />;

  const fragilityRaw = Math.max(0, Math.min(100, Number(stats?.fragility.value_raw ?? 0)));
  const busFactor = metrics?.bus_factor ?? 0;
  const coveragePct = Number(stats?.knowledge_coverage.value_raw ?? 0);
  const deadlineLabel = stats?.deadline_countdown.value ?? "—";
  const deadlineTone = deadlineToneFor(stats?.deadline_countdown.severity);

  const tier = getFragilityTier(fragilityRaw);

  const metricsData: { icon: Icon; label: string; value: string; tone: MetricTone }[] = [
    {
      icon: ShieldWarningIcon,
      label: "Bus Factor",
      value: String(busFactor),
      tone: busFactor <= 1 ? "danger" : busFactor === 2 ? "warning" : "neutral",
    },
    {
      icon: UsersIcon,
      label: "Coverage",
      value: `${coveragePct}%`,
      tone: coveragePct < 60 ? "danger" : coveragePct < 80 ? "warning" : "neutral",
    },
    { icon: CalendarIcon, label: "Deadline", value: deadlineLabel, tone: deadlineTone },
  ];

  return (
    <Card>
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={cn("text-lg font-bold", TONE_TEXT[tier.tone])}>Project {tier.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{FRAGILITY_CAPTIONS[tier.tone]}</p>
          </div>
          <div className="flex items-baseline gap-0.5 shrink-0">
            <span className={cn("text-[28px] font-bold tabular-nums leading-none", TONE_TEXT[tier.tone])}>
              {fragilityRaw}
            </span>
            <span className="text-xs text-muted-foreground font-medium">/100</span>
          </div>
        </div>

        <MetricRow.List>
          {metricsData.map((m) => (
            <MetricRow key={m.label} icon={m.icon} label={m.label} value={m.value} tone={m.tone} />
          ))}
        </MetricRow.List>
      </div>
    </Card>
  );
}

ProjectHealthCard.Skeleton = function ProjectHealthCardSkeleton() {
  return (
    <Card>
      <div className="space-y-4 mt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex items-baseline gap-0.5 shrink-0">
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
        <MetricRow.List>
          {Array.from({ length: 3 }).map((_, i) => (
            <MetricRow.Skeleton key={i} icon={ShieldWarningIcon} />
          ))}
        </MetricRow.List>
      </div>
    </Card>
  );
};
