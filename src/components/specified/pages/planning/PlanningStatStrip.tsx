import { Activity, ArrowRight, Gauge, Shield, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Severity, SimulateResponse } from "@/types/planning";

interface PlanningStatStripProps {
  data: SimulateResponse;
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

export default function PlanningStatStrip({ data, blockCount }: PlanningStatStripProps) {
  if (blockCount === 0) return null;

  const cmp = data.comparison_vs_baseline;
  const { totals } = data;

  return (
    <Card className={cn("p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 gap-y-4", SEV_RING[totals.severity])}>
      {/* Fragility — composite org risk. Higher = more fragile. Lower is better. */}
      <DeltaStat
        icon={Gauge}
        label="Fragility"
        before={cmp.risk_score.before}
        after={cmp.risk_score.after}
        invertGood
        severity={totals.severity}
      />
      <DeltaStat
        icon={Activity}
        label="Coverage"
        before={cmp.coverage_pct.before}
        after={cmp.coverage_pct.after}
        suffix="%"
      />
      <DeltaStat icon={Shield} label="Bus factor" before={cmp.bus_factor.before} after={cmp.bus_factor.after} />
      <SingleStat
        icon={Users}
        label="Peak overlap"
        value={totals.absent_headcount_peak}
        sub={totals.absent_headcount_peak_date ?? undefined}
        warn={totals.absent_headcount_peak >= 4}
      />
    </Card>
  );
}

interface DeltaStatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  before: number;
  after: number;
  suffix?: string;
  invertGood?: boolean;
  severity?: Severity;
}

function DeltaStat({ icon: Icon, label, before, after, suffix = "", invertGood = false, severity }: DeltaStatProps) {
  const delta = after - before;
  const improved = delta !== 0 && (invertGood ? delta < 0 : delta > 0);
  const worse = delta !== 0 && (invertGood ? delta > 0 : delta < 0);

  return (
    <div className="flex flex-col gap-1">
      <StatLabel icon={Icon} label={label} className={cn(severity && SEV_TEXT[severity])} />
      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold leading-none text-muted-foreground/70">
          {before}
          {suffix}
        </span>
        <ArrowRight className="size-3 text-muted-foreground/40 shrink-0" />
        <span
          className={cn(
            "text-[20px] font-bold leading-none text-foreground",
            worse && "text-destructive-foreground",
            improved && "text-success",
          )}
        >
          {after}
          {suffix}
        </span>
        {delta !== 0 && (
          <Badge
            variant={worse ? "destructive" : "secondary"}
            className={cn("h-4 px-1.5 text-[10px] font-semibold gap-0.5", improved && "bg-success/15 text-success")}
          >
            {(invertGood ? delta < 0 : delta > 0) ? <TrendingUp /> : <TrendingDown />}
            {delta > 0 ? "+" : ""}
            {delta}
            {suffix}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface SingleStatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
  warn?: boolean;
}

function SingleStat({ icon: Icon, label, value, sub, warn }: SingleStatProps) {
  return (
    <div className="flex flex-col gap-1">
      <StatLabel icon={Icon} label={label} className={cn(warn && "text-warning")} />
      <span className={cn("text-[20px] font-bold leading-none text-foreground", warn && "text-warning")}>{value}</span>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StatLabel({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className={cn("size-3", className)} />
      {label}
    </div>
  );
}
