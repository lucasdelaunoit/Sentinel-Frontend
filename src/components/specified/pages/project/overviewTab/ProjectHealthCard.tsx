import { type Tone, TONE_TEXT } from "@/lib/scoring.ts";
import { cn } from "@/lib/utils.ts";
import MetricRow, { type MetricTone } from "@/components/common/displays/MetricRow.tsx";
import { CalendarIcon, type Icon, ShieldWarningIcon, UsersIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Card } from "@/components/ui/card.tsx";

interface ProjectHealthCardProps {
  health: number;
  busFactor: number;
  coveragePct: number;
  deadlineLabel: string;
  deadlineTone: MetricTone;
  criticalCount: number;
}

type HealthLevel = { label: string; tone: Tone };

function healthLevel(health: number): HealthLevel {
  if (health < 50) return { label: "Critical", tone: "danger" };
  if (health < 65) return { label: "Degraded", tone: "warning" };
  return { label: "Healthy", tone: "success" };
}

export default function ProjectHealthCard({
  health,
  busFactor,
  coveragePct,
  deadlineLabel,
  deadlineTone,
  criticalCount,
}: ProjectHealthCardProps) {
  const level = healthLevel(health);

  const metrics: { icon: Icon; label: string; value: string; tone: MetricTone }[] = [
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn("text-[15px] font-bold", TONE_TEXT[level.tone])}>Project {level.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {criticalCount > 0
                ? `${criticalCount} critical issue${criticalCount !== 1 ? "s" : ""} need attention`
                : "No critical issues — monitor warnings"}
            </p>
          </div>
          <div className="flex items-baseline gap-0.5 shrink-0">
            <span className={cn("text-[28px] font-bold tabular-nums leading-none", TONE_TEXT[level.tone])}>
              {health}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">/100</span>
          </div>
        </div>

        <MetricRow.List>
          {metrics.map((m) => (
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
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex items-baseline gap-0.5 shrink-0">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-7" />
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
