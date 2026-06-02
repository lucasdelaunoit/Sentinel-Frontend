import { Activity, AlertOctagon, Clock, Shield, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Severity, SimulateTotals } from "@/types/planning";

interface PlanningStatStripProps {
  totals: SimulateTotals;
  blockCount: number;
}

const SEV_RING: Record<Severity, string> = {
  safe: "border-success/30",
  low: "border-success/30",
  medium: "border-warning/40",
  high: "border-warning/50",
  critical: "border-destructive/40",
};

const SEV_TEXT: Record<Severity, string> = {
  safe: "text-success",
  low: "text-success",
  medium: "text-warning",
  high: "text-warning",
  critical: "text-destructive-foreground",
};

export default function PlanningStatStrip({ totals, blockCount }: PlanningStatStripProps) {
  if (blockCount === 0) return null;

  return (
    <Card className={cn("p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 gap-y-4", SEV_RING[totals.severity])}>
      <Stat
        icon={AlertOctagon}
        label="Risk score"
        value={totals.risk_score}
        delta={totals.risk_score_delta}
        invertGood
        severity={totals.severity}
      />
      <Stat icon={Shield} label="Bus factor" value={totals.bus_factor} delta={totals.bus_factor_delta} />
      <Stat icon={Activity} label="Coverage" value={totals.coverage_pct} delta={totals.coverage_delta_pct} suffix="%" />
      <Stat icon={Clock} label="FTE days" value={totals.absent_fte_days} delta={null} />
      <Stat
        icon={Users}
        label="Peak overlap"
        value={totals.absent_headcount_peak}
        delta={null}
        sub={totals.absent_headcount_peak_date ?? undefined}
        warn={totals.absent_headcount_peak >= 4}
      />
      <Stat
        icon={AlertOctagon}
        label="Projects @ risk"
        value={totals.projects_at_risk_count}
        delta={null}
        sub={totals.projects_blocked_count > 0 ? `${totals.projects_blocked_count} blocked` : undefined}
        warn={totals.projects_at_risk_count > 0}
      />
    </Card>
  );
}

interface StatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  delta: number | null;
  suffix?: string;
  invertGood?: boolean;
  sub?: string;
  warn?: boolean;
  severity?: Severity;
}

function Stat({ icon: Icon, label, value, delta, suffix = "", invertGood = false, sub, warn, severity }: StatProps) {
  const improved = delta !== null && delta !== 0 && (invertGood ? delta < 0 : delta > 0);
  const worse = delta !== null && delta !== 0 && (invertGood ? delta > 0 : delta < 0);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("size-3", severity && SEV_TEXT[severity], warn && "text-warning")} />
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-[20px] font-bold leading-none text-foreground", worse && "text-destructive-foreground", improved && "text-success")}>
          {value}
          {suffix}
        </span>
        {delta !== null && delta !== 0 && (
          <Badge
            variant={worse ? "destructive" : "secondary"}
            className={cn("h-4 px-1.5 text-[10px] font-semibold gap-0.5", improved && "bg-success/15 text-success")}
          >
            {delta > 0 ? <TrendingUp /> : <TrendingDown />}
            {delta > 0 ? "+" : ""}
            {delta}
            {suffix}
          </Badge>
        )}
      </div>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
