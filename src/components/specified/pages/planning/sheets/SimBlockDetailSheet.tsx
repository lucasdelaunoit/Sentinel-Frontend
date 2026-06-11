import { useMemo, useState } from "react";
import { ArrowLeft, Check, Lightbulb, Loader2, ShieldAlert, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SecondaryCard from "@/components/common/cards/SecondaryCard";
import MetricRow from "@/components/common/displays/MetricRow";
import { SegButton } from "@/components/specified/models/absence/sheets/AbsenceFormFields.tsx";
import { ABSENCE_TYPE_LABEL, ABSENCE_TYPE_VALUES } from "@/utils/absence/absenceType.ts";
import { blockDurationLabel, formatHalfDate, formatRange } from "@/utils/planning/calendar";
import { simColor } from "@/utils/planning/theme";
import { TONE_SOLID_BADGE } from "@/lib/theme/tone.ts";
import { capitalize } from "@/utils/formatters/string.ts";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
import MediumProjectImpactRow from "@/components/specified/models/projects/datas/items/MediumProjectImpactRow.tsx";
import MediumSkillImpactRow from "@/components/specified/models/skill/datas/items/MediumSkillImpactRow.tsx";

interface SimBlockDetailSheetProps {
  block: SimBlock;
  user: PlanningUser;
  /** Combined scenario simulation already computed by the parent — no refetch on open. */
  combined: SimulateResponse;
  onClose: () => void;
  onDelete: () => void;
  /** Persists this block as a real planned absence, with the chosen type and optional note. */
  onConfirm: (details: { type: AbsenceType; reason?: string }) => void;
  isConfirming?: boolean;
  /** True while the parent is still computing the scenario simulation — impact body shows skeletons. */
  isSimulating?: boolean;
}

const SEVERITY_MESSAGE: Record<Severity, string> = {
  critical: "Key skills will be uncovered.",
  warning: "Some skills may be at risk.",
  ok: "All required skills are covered.",
};

const MATCH_CLASS = (pct: number) =>
  TONE_SOLID_BADGE[pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger"];

const COST_CLASS: Record<ReplacementCandidate["cost_signal"], string> = {
  ok: TONE_SOLID_BADGE.success,
  stretch: TONE_SOLID_BADGE.warning,
  overloaded: TONE_SOLID_BADGE.danger,
};

export default function SimBlockDetailSheet({
  block,
  user,
  combined,
  onClose,
  onDelete,
  onConfirm,
  isConfirming = false,
  isSimulating = false,
}: SimBlockDetailSheetProps) {
  const color = simColor(block.colorIdx);

  // Two-step confirm: impact overview first, then leave type + note before persisting.
  const [step, setStep] = useState<"overview" | "confirm">("overview");
  const [absenceType, setAbsenceType] = useState<AbsenceType>("vacation");
  const [reason, setReason] = useState("");

  const userImpact = combined.per_user_impact[block.userId];
  const projects = useMemo(() => {
    const affected = new Set((userImpact?.projects_affected ?? []).map((p) => p.project_id));
    return combined.per_project_impact.filter((p) => affected.has(p.project_id));
  }, [combined.per_project_impact, userImpact]);
  const skills = useMemo(() => {
    const uncovered = new Set((userImpact?.skills_uncovered ?? []).map((s) => s.skill_id));
    return combined.per_skill_impact.filter((s) => uncovered.has(s.skill_id));
  }, [combined.per_skill_impact, userImpact]);
  const cascading = combined.cascading_risks.filter((c) => c.trigger_user_id === block.userId);

  const window = formatRange(block.startDate, block.endDate);
  const drivers = `${user.firstname} ${user.lastname}`;

  return (
    <ComposedSheet
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`${user.firstname} ${user.lastname}`}
      description={`${user.department?.name ?? user.title} · ${step === "confirm" ? "Confirm absence" : "Absence simulation"}`}
      maxWidth="sm:max-w-[480px]"
      footer={
        step === "overview" ? (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={onDelete}
              disabled={isConfirming}
              className="flex-1 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="size-3.5" /> Remove
            </Button>
            <Button size="lg" onClick={() => setStep("confirm")} className="flex-1">
              <Check className="size-3.5" /> Confirm absence
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("overview")}
              disabled={isConfirming}
              className="flex-1"
            >
              <ArrowLeft className="size-3.5" /> Back
            </Button>
            <Button
              size="lg"
              onClick={() => onConfirm({ type: absenceType, reason: reason.trim() || undefined })}
              disabled={isConfirming}
              className="flex-1 bg-planned hover:bg-planned/90 text-planned-foreground"
            >
              {isConfirming ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              Confirm absence
            </Button>
          </>
        )
      }
    >
      <div
        className="rounded-xl border-2 border-dashed px-4 py-3"
        style={{ background: color.bg, borderColor: color.border, color: color.fg }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider pt-1">Simulated Absence Period</p>
        <MetricRow.List>
          <MetricRow label="From" value={formatHalfDate(block.startDate, block.startHalf)} />
          <MetricRow label="To" value={formatHalfDate(block.endDate, block.endHalf)} />
          <MetricRow label="Calendar span" value={blockDurationLabel(block)} />
          {isSimulating ? (
            <MetricRow.Skeleton />
          ) : (
            <MetricRow
              label="Working days off"
              value={userImpact ? `${userImpact.days_off} day${userImpact.days_off === 1 ? "" : "s"}` : "—"}
            />
          )}
        </MetricRow.List>
        <p className="text-[10px] opacity-60 leading-snug pb-1">Weekends &amp; holidays excluded from working days.</p>
      </div>

      {step === "confirm" && (
        <>
          <Field>
            <FieldLabel>
              Type <span className="text-destructive-foreground">*</span>
            </FieldLabel>
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {ABSENCE_TYPE_VALUES.map((value) => (
                <SegButton key={value} active={absenceType === value} onClick={() => setAbsenceType(value)}>
                  {ABSENCE_TYPE_LABEL[value]}
                </SegButton>
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel>Note</FieldLabel>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Optional — e.g. Annual leave, doctor appointment…"
              maxLength={256}
              className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
            />
            <FieldDescription>Optional context for this absence</FieldDescription>
          </Field>
        </>
      )}

      {step === "overview" && isSimulating && <ImpactBodySkeleton />}

      {step === "overview" && !isSimulating && userImpact && (
        <SecondaryCard
          before={<SeverityBadge severity={userImpact.severity} size="md" />}
          title={SEVERITY_MESSAGE[userImpact.severity]}
          description={
            userImpact.is_critical_employee
              ? `Critical employee — bus factor contribution: ${userImpact.bus_factor_contribution}`
              : undefined
          }
          className="bg-background border"
        />
      )}

      {step === "overview" && !isSimulating && skills.length > 0 && (
        <Section icon={ShieldAlert} title={`Impacted Skills (${skills.length})`}>
          <div className="space-y-2">
            {skills.map((s) => (
              <MediumSkillImpactRow key={s.skill_id} skill={s} />
            ))}
          </div>
        </Section>
      )}

      {step === "overview" && !isSimulating && projects.length > 0 && (
        <Section title={`Project Impact (${projects.length})`}>
          <div className="space-y-2">
            {projects.map((p) => (
              <MediumProjectImpactRow key={p.project_id} project={p} window={window} drivers={drivers} />
            ))}
          </div>
        </Section>
      )}

      {step === "overview" && !isSimulating && userImpact && userImpact.replacement_candidates.length > 0 && (
        <Section icon={Users} title="Replacement candidates">
          <div className="space-y-1.5">
            {userImpact.replacement_candidates.map((c) => (
              <SecondaryCard
                key={c.user_id}
                title={c.name}
                description={`${c.available_days}d available`}
                action={
                  <div className="flex items-center gap-2">
                    <Badge className={cn("font-semibold", MATCH_CLASS(c.skill_match_pct))}>
                      {c.skill_match_pct}%
                    </Badge>
                    <Badge className={cn("font-semibold", COST_CLASS[c.cost_signal])}>
                      {capitalize(c.cost_signal)}
                    </Badge>
                  </div>
                }
              />
            ))}
          </div>
        </Section>
      )}

      {step === "overview" && !isSimulating && cascading.length > 0 && (
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

/** Impact body placeholder shown while the scenario simulation is still computing. */
function ImpactBodySkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border bg-background p-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>

      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <div className="space-y-1.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </>
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
