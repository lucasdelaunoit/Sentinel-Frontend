import { useMemo } from "react";
import { ArrowRight, Lightbulb, ShieldAlert, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SecondaryCard from "@/components/common/cards/SecondaryCard";
import { blockDurationLabel, formatHalfDate } from "@/utils/planning/calendar";
import { simColor } from "@/utils/planning/theme";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
import SeveredSkillBadge from "@/components/specified/models/skill/badges/SeveredSkillBadge";

interface SimBlockDetailSheetProps {
  block: SimBlock;
  user: PlanningUser;
  /** Combined scenario simulation already computed by the parent — no refetch on open. */
  combined: SimulateResponse;
  onClose: () => void;
  onDelete: () => void;
}

const COST_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ok: "secondary",
  stretch: "outline",
  overloaded: "destructive",
};

const COST_CLASS: Record<string, string> = {
  ok: "bg-success/15 text-success",
  stretch: "border-warning/40 text-warning",
  overloaded: "",
};

export default function SimBlockDetailSheet({ block, user, combined, onClose, onDelete }: SimBlockDetailSheetProps) {
  const color = simColor(block.colorIdx);

  const userImpact = combined.per_user_impact[block.userId];
  const projects = useMemo(() => {
    const affected = new Set((userImpact?.projects_affected ?? []).map((p) => p.project_id));
    return combined.per_project_impact.filter((p) => affected.has(p.project_id));
  }, [combined.per_project_impact, userImpact]);
  const cascading = combined.cascading_risks.filter((c) => c.trigger_user_id === block.userId);

  return (
    <ComposedSheet
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`${user.firstname} ${user.lastname}`}
      description={`${user.department?.name ?? user.title} · Absence simulation`}
      maxWidth="sm:max-w-[480px]"
      footer={
        <Button
          variant="ghost"
          onClick={onDelete}
          className="w-full text-muted-foreground hover:text-destructive-foreground hover:bg-destructive rounded-xl h-9 text-[12px] gap-1.5"
        >
          <Trash2 className="size-3.5" /> Remove simulation block
        </Button>
      }
    >
      <div
        className="rounded-xl border-2 border-dashed p-4 space-y-2.5"
        style={{ background: color.bg, borderColor: color.border, color: color.fg }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider">Simulated Absence Period</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
          <span className="opacity-70">From</span>
          <span className="font-semibold text-right">{formatHalfDate(block.startDate, block.startHalf)}</span>
          <span className="opacity-70">To</span>
          <span className="font-semibold text-right">{formatHalfDate(block.endDate, block.endHalf)}</span>
          <span className="opacity-70">Calendar span</span>
          <span className="font-semibold text-right">{blockDurationLabel(block)}</span>
          <span className="opacity-70">Working days off</span>
          <span className="font-semibold text-right">
            {userImpact ? `${userImpact.days_off} day${userImpact.days_off === 1 ? "" : "s"}` : "—"}
          </span>
        </div>
        <p className="text-[10px] opacity-60 leading-snug">Weekends &amp; holidays excluded from working days.</p>
      </div>

      {userImpact && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-3.5",
            /*SEVERITY_SURFACE[userImpact.severity].bg,
            SEVERITY_SURFACE[userImpact.severity].border,*/
          )}
        >
          <SeverityBadge severity={userImpact.severity} size="md" />
          <div className="flex-1 text-[12px] text-muted-foreground">
            {userImpact.severity === "critical"
              ? "Key skills will be uncovered."
              : userImpact.severity === "warning"
                ? "Some skills may be at risk."
                : "All required skills are covered."}
            {userImpact.is_critical_employee && (
              <span className="block text-[10px] text-destructive-foreground font-semibold mt-0.5">
                Critical employee — bus factor contribution: {userImpact.bus_factor_contribution}
              </span>
            )}
          </div>
        </div>
      )}

      {userImpact && userImpact.skills_uncovered.length > 0 && (
        <Section icon={ShieldAlert} title="Skills uncovered">
          <div className="flex flex-wrap gap-1.5">
            {userImpact.skills_uncovered.map((s) => (
              <Badge key={s.skill_id} variant="destructive" className="text-[11px]">
                {s.name} · {s.owners_left} left
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title={`Project Impact (${projects.length})`}>
          <div className="space-y-2">
            {projects.map((p) => (
              <ProjectImpactCard key={p.project_id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {userImpact && userImpact.replacement_candidates.length > 0 && (
        <Section icon={Users} title="Replacement candidates">
          <div className="space-y-1.5">
            {userImpact.replacement_candidates.map((c) => (
              <SecondaryCard
                key={c.user_id}
                title={c.name}
                description={`${c.available_days}d available`}
                action={
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[11px]",
                        c.skill_match_pct >= 70
                          ? "bg-success/15 text-success"
                          : c.skill_match_pct >= 40
                            ? "bg-warning/15 text-warning"
                            : "",
                      )}
                    >
                      {c.skill_match_pct}%
                    </Badge>
                    <Badge
                      variant={COST_VARIANT[c.cost_signal] ?? "secondary"}
                      className={cn("text-[9px] uppercase", COST_CLASS[c.cost_signal] ?? "")}
                    >
                      {c.cost_signal}
                    </Badge>
                  </div>
                }
              />
            ))}
          </div>
        </Section>
      )}

      {cascading.length > 0 && (
        <Section icon={Lightbulb} title="Cascading risks">
          <div className="space-y-1.5">
            {cascading.map((c, i) => (
              <SecondaryCard
                key={i}
                before={<Lightbulb className="size-4 text-warning" />}
                title={c.type}
                description={
                  <span>
                    {c.consequence}
                    <span className="block text-[10px] mt-0.5">Probability: {c.probability_hint}</span>
                  </span>
                }
                className="bg-warning/10"
              />
            ))}
          </div>
        </Section>
      )}
    </ComposedSheet>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {title}
      </p>
      {children}
    </div>
  );
}

function ProjectImpactCard({ project }: { project: ProjectImpact }) {
  //const theme = SEVERITY_SURFACE[project.severity];
  return (
    <div className={cn("rounded-xl border p-3 space-y-2" /*, theme.bg, theme.border*/)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("size-2 rounded-full shrink-0" /*, theme.dot*/)} />
          <span className="text-[12px] font-semibold text-foreground truncate">{project.name}</span>
        </div>
        <SeverityBadge severity={project.severity} />
      </div>

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>
          BF {project.bus_factor_before} <ArrowRight className="size-2.5 inline" />{" "}
          <span className={cn(project.bus_factor_delta < 0 && "text-destructive-foreground font-semibold")}>
            {project.bus_factor_after}
          </span>
        </span>
        <span>
          Cov {project.coverage_pct_before}% <ArrowRight className="size-2.5 inline" />{" "}
          <span className={cn(project.coverage_delta_pct < 0 && "text-destructive-foreground font-semibold")}>
            {project.coverage_pct_after}%
          </span>
        </span>
      </div>

      {project.skills_at_risk.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.skills_at_risk.map((s) => (
            <SeveredSkillBadge key={s.skill_id} name={`${s.name} · ${s.owners_left}`} severity={s.severity} />
          ))}
        </div>
      )}

      {project.recommendation && (
        <p className="text-[10px] text-muted-foreground italic flex items-start gap-1">
          <Lightbulb className="size-2.5 mt-0.5 shrink-0" />
          {project.recommendation}
        </p>
      )}
    </div>
  );
}
