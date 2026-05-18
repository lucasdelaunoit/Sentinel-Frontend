import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import SharedStatCard from "@/components/common/cards/StatCard";
import ComposedCard from "@/components/common/cards/ComposedCard";
import { Plus, Trash2, Check, CalendarDays, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import SkillsTab from "@/components/specified/pages/settings/SkillsTab.tsx";
import RulesTab from "@/components/specified/pages/settings/RulesTab.tsx";
import { BookOpenIcon, CalendarIcon, ShieldIcon, SlidersIcon } from "@phosphor-icons/react";
import useGetOrganizationSettings from "@/api/organization/useGetOrganizationSettings";
import useUpdateOrganizationSettings from "@/api/organization/useUpdateOrganizationSettings";
import useGetCalendarSummary from "@/api/calendar/useGetCalendarSummary";
import useUpdateCalendarSettings from "@/api/calendar/useUpdateCalendarSettings";
import useGetCompanyHolidays from "@/api/company-holidays/useGetCompanyHolidays";
import useDeleteCompanyHoliday from "@/api/company-holidays/useDeleteCompanyHoliday";
import CreateCompanyHolidaySheet from "@/components/specified/models/companyHoliday/sheets/CreateCompanyHolidaySheet";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const RISK_TOLERANCE_CONFIG = {
  conservative: {
    label: "Conservative",
    description: "Lower sensitivity, fewer alerts",
    sub: "Best for regulated environments",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-600",
    ring: "ring-blue-300",
  },
  balanced: {
    label: "Balanced",
    description: "Standard thresholds",
    sub: "General-purpose teams",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    activeBg: "bg-amber-500",
    ring: "ring-amber-300",
  },
  aggressive: {
    label: "Aggressive",
    description: "Higher sensitivity, more alerts",
    sub: "High-velocity or critical teams",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    activeBg: "bg-rose-600",
    ring: "ring-rose-300",
  },
} as const;

// ─── Organization Tab ─────────────────────────────────────────────────────────

type OrgFormFields = Required<UpdateOrganizationSettingsRequest>;

// ─── Risk weight model ────────────────────────────────────────────────────────

type RiskWeightKey = "bus" | "uncovered" | "silos" | "absence";

const RISK_WEIGHTS: {
  key: RiskWeightKey;
  formField:
    | "risk_weight_bus_factor"
    | "risk_weight_uncovered_skills"
    | "risk_weight_silos"
    | "risk_weight_absence_impact";
  title: string;
  question: string;
  barColor: string;
  dot: string;
}[] = [
  {
    key: "bus",
    formField: "risk_weight_bus_factor",
    title: "Losing key people",
    question: "How much should we worry about projects that depend on too few people?",
    barColor: "bg-rose-500",
    dot: "bg-rose-500",
  },
  {
    key: "uncovered",
    formField: "risk_weight_uncovered_skills",
    title: "Missing required skills",
    question: "How much should we worry when a project is missing skills it needs?",
    barColor: "bg-amber-500",
    dot: "bg-amber-500",
  },
  {
    key: "silos",
    formField: "risk_weight_silos",
    title: "Knowledge silos",
    question: "How much should we worry when only one person knows a skill?",
    barColor: "bg-violet-500",
    dot: "bg-violet-500",
  },
  {
    key: "absence",
    formField: "risk_weight_absence_impact",
    title: "Upcoming absences",
    question: "How much should we worry about planned leaves coming up?",
    barColor: "bg-blue-500",
    dot: "bg-blue-500",
  },
];

const RISK_PRESETS: { key: string; label: string; values: Record<RiskWeightKey, number> }[] = [
  { key: "balanced", label: "Balanced", values: { bus: 50, uncovered: 50, silos: 50, absence: 50 } },
  { key: "people", label: "People-loss focused", values: { bus: 100, uncovered: 25, silos: 75, absence: 25 } },
  { key: "skills", label: "Skill-gap focused", values: { bus: 25, uncovered: 100, silos: 50, absence: 25 } },
  { key: "delivery", label: "Delivery focused", values: { bus: 25, uncovered: 50, silos: 25, absence: 75 } },
];

const HEALTH_STEPS: { value: number; label: string; description: string }[] = [
  { value: 10, label: "Delivery only", description: "Progress drives the score — risk barely affects it" },
  { value: 30, label: "Delivery first", description: "Progress weighs heavier than risk" },
  { value: 50, label: "Balanced", description: "Risk and progress matter equally" },
  { value: 70, label: "Stability first", description: "Risk weighs heavier than progress" },
  { value: 90, label: "Stability only", description: "Risk drives the score — progress barely affects it" },
];

const CONCERN_STEPS: { value: number; label: string; short: string }[] = [
  { value: 0, label: "Ignore", short: "Don't factor this in" },
  { value: 25, label: "Minor", short: "Mention, low priority" },
  { value: 50, label: "Moderate", short: "Standard concern" },
  { value: 75, label: "Major", short: "Push the score noticeably" },
  { value: 100, label: "Critical", short: "Dominant concern" },
];

function nearestStep(value: number): number {
  return CONCERN_STEPS.reduce(
    (best, s) => (Math.abs(s.value - value) < Math.abs(best - value) ? s.value : best),
    CONCERN_STEPS[0].value,
  );
}

function ConcernSlider({
  title,
  question,
  value,
  total,
  dot,
  onChange,
}: {
  title: string;
  question: string;
  value: number;
  total: number;
  dot: string;
  onChange: (v: number) => void;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const current = nearestStep(value);
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start gap-2.5 mb-3">
        <span className={cn("mt-1.5 size-2 rounded-full shrink-0", dot)} />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{question}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[13px] font-semibold text-foreground tabular-nums">{pct}%</div>
          <div className="text-[10px] text-muted-foreground">of total</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {CONCERN_STEPS.map((s) => {
          const active = current === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              className={cn(
                "rounded-lg border px-1 py-1.5 text-center transition-all cursor-pointer",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
              title={s.short}
            >
              <div className="text-[11px] font-semibold leading-tight">{s.label}</div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/80 mt-2 italic">
        {CONCERN_STEPS.find((s) => s.value === current)?.short}
      </p>
    </div>
  );
}

function StackedWeightBar({ parts }: { parts: { color: string; value: number; label: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total === 0) {
    return (
      <div className="h-3 w-full rounded-full bg-muted/40 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground">
          All concerns set to zero — set at least one above zero
        </span>
      </div>
    );
  }
  return (
    <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/40">
      {parts.map((p, i) => {
        const w = (p.value / total) * 100;
        if (w === 0) return null;
        return (
          <div
            key={i}
            className={cn("h-full", p.color)}
            style={{ width: `${w}%` }}
            title={`${p.label}: ${Math.round(w)}%`}
          />
        );
      })}
    </div>
  );
}

function InlineNumber({
  value,
  onChange,
  min,
  max,
  width = "w-14",
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  width?: string;
}) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("inline-flex h-8 px-2 text-center text-[13px] font-semibold tabular-nums align-baseline", width)}
    />
  );
}

function SentenceRow({
  icon,
  iconColor,
  children,
  example,
}: {
  icon: string;
  iconColor: string;
  children: React.ReactNode;
  example: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className={cn("flex size-7 items-center justify-center rounded-lg text-[13px] shrink-0", iconColor)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-foreground leading-relaxed flex flex-wrap items-center gap-x-1 gap-y-1.5">
          {children}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 italic">{example}</p>
      </div>
    </div>
  );
}

function OrganizationTab() {
  const { data, isLoading } = useGetOrganizationSettings();
  const update = useUpdateOrganizationSettings();
  const [form, setForm] = useState<OrgFormFields | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        risk_tolerance: data.risk_tolerance,
        risk_weight_bus_factor: data.risk_weight_bus_factor,
        risk_weight_uncovered_skills: data.risk_weight_uncovered_skills,
        risk_weight_silos: data.risk_weight_silos,
        risk_weight_absence_impact: data.risk_weight_absence_impact,
        silo_threshold: data.silo_threshold,
        kci_min_level: data.kci_min_level,
        health_risk_weight: data.health_risk_weight,
        absence_horizon_days: data.absence_horizon_days,
        critical_bus_factor_threshold: data.critical_bus_factor_threshold,
        rule_violation_penalty: data.rule_violation_penalty,
      });
    }
  }, [data]);

  if (isLoading || !form) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SharedStatCard key={i} title="" value={null} comment={null} icon={Building2} isLoading />
          ))}
        </div>
      </div>
    );
  }

  const saved = update.isSuccess && !update.isPending;
  const totalRiskWeights =
    form.risk_weight_bus_factor +
    form.risk_weight_uncovered_skills +
    form.risk_weight_silos +
    form.risk_weight_absence_impact;
  const progressWeight = 100 - form.health_risk_weight;

  return (
    <div className="space-y-5">
      <ComposedCard title="Identity" headerClassName="mb-5">
        <Field>
          <FieldLabel>Organization Name</FieldLabel>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>

        <Field className="mt-5">
          <FieldLabel>Risk Tolerance</FieldLabel>
          <FieldDescription>Global multiplier applied to risk-score sensitivity.</FieldDescription>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {(["conservative", "balanced", "aggressive"] as const).map((opt) => {
              const cfg = RISK_TOLERANCE_CONFIG[opt];
              const active = form.risk_tolerance === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, risk_tolerance: opt })}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer",
                    active
                      ? `${cfg.bg} ${cfg.border} ring-2 ${cfg.ring} ring-offset-1`
                      : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border",
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-[13px] font-semibold", active ? cfg.color : "text-foreground")}>
                      {cfg.label}
                    </span>
                    <div
                      className={cn(
                        "size-4 rounded-full border-2 flex items-center justify-center transition-all",
                        active ? `${cfg.activeBg} border-transparent` : "border-muted-foreground/30",
                      )}
                    >
                      {active && <Check className="size-2.5 text-white" />}
                    </div>
                  </div>
                  <p className={cn("text-[11px] font-medium", active ? cfg.color : "text-muted-foreground")}>
                    {cfg.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{cfg.sub}</p>
                </button>
              );
            })}
          </div>
        </Field>
      </ComposedCard>

      <ComposedCard title="What should hurt a project's risk score the most?" headerClassName="mb-2">
        <FieldDescription className="mb-3">
          Drag each slider based on how worried you are about that concern. The bar below shows how they balance out —
          only their relative size matters.
        </FieldDescription>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[11px] font-medium text-muted-foreground self-center mr-1">Quick start:</span>
          {RISK_PRESETS.map((p) => {
            const active =
              form.risk_weight_bus_factor === p.values.bus &&
              form.risk_weight_uncovered_skills === p.values.uncovered &&
              form.risk_weight_silos === p.values.silos &&
              form.risk_weight_absence_impact === p.values.absence;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    risk_weight_bus_factor: p.values.bus,
                    risk_weight_uncovered_skills: p.values.uncovered,
                    risk_weight_silos: p.values.silos,
                    risk_weight_absence_impact: p.values.absence,
                  })
                }
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium border transition-all cursor-pointer",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/60",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-muted/30 border border-border/40 p-3 mb-4">
          <p className="text-[11px] font-medium text-muted-foreground mb-2">How weights distribute</p>
          <StackedWeightBar
            parts={RISK_WEIGHTS.map((w) => ({
              color: w.barColor,
              value: form[w.formField],
              label: w.title,
            }))}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
            {RISK_WEIGHTS.map((w) => {
              const v = form[w.formField];
              const pct = totalRiskWeights === 0 ? 0 : Math.round((v / totalRiskWeights) * 100);
              return (
                <div key={w.key} className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", w.dot)} />
                  <span className="text-[10px] text-muted-foreground">
                    {w.title} <span className="font-semibold text-foreground tabular-nums">{pct}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {RISK_WEIGHTS.map((w) => (
            <ConcernSlider
              key={w.key}
              title={w.title}
              question={w.question}
              value={form[w.formField]}
              total={totalRiskWeights}
              dot={w.dot}
              onChange={(v) => setForm({ ...form, [w.formField]: v })}
            />
          ))}
        </div>
      </ComposedCard>

      <ComposedCard title="Rules in plain English" headerClassName="mb-5">
        <FieldDescription className="mb-4">
          Read each line as a sentence. The numbers in white boxes are editable.
        </FieldDescription>
        <div className="space-y-3">
          <SentenceRow
            icon="👤"
            iconColor="bg-violet-100 text-violet-700"
            example="Example: a skill known by 1 person is flagged as a silo."
          >
            A skill becomes a <strong>silo</strong> when only{" "}
            <InlineNumber
              value={form.silo_threshold}
              onChange={(v) => setForm({ ...form, silo_threshold: v })}
              min={1}
              max={5}
            />{" "}
            or fewer people on the team know it.
          </SentenceRow>

          <SentenceRow
            icon="⭐"
            iconColor="bg-amber-100 text-amber-700"
            example="Example: someone with React at level 2 doesn't count as covering React."
          >
            A team member only counts as <strong>covering</strong> a skill once they reach level{" "}
            <InlineNumber
              value={form.kci_min_level}
              onChange={(v) => setForm({ ...form, kci_min_level: v })}
              min={1}
              max={5}
            />{" "}
            (out of 5).
          </SentenceRow>

          <SentenceRow
            icon="🚨"
            iconColor="bg-rose-100 text-rose-700"
            example="Example: if losing 2 people would break a project, flag it as critical."
          >
            Flag a project as <strong>critical</strong> when its bus factor drops to{" "}
            <InlineNumber
              value={form.critical_bus_factor_threshold}
              onChange={(v) => setForm({ ...form, critical_bus_factor_threshold: v })}
              min={1}
              max={10}
            />{" "}
            or below.
          </SentenceRow>

          <SentenceRow
            icon="📅"
            iconColor="bg-blue-100 text-blue-700"
            example="Example: only leaves happening in the next two weeks affect the risk score."
          >
            When scoring upcoming risks, look{" "}
            <InlineNumber
              value={form.absence_horizon_days}
              onChange={(v) => setForm({ ...form, absence_horizon_days: v })}
              min={1}
              max={90}
              width="w-16"
            />{" "}
            days into the future.
          </SentenceRow>

          <SentenceRow
            icon="⚠️"
            iconColor="bg-orange-100 text-orange-700"
            example="Example: each broken rule on a day cuts that day's health score by 15 points."
          >
            Each rule violation on a given day cuts that day's health score by{" "}
            <InlineNumber
              value={form.rule_violation_penalty}
              onChange={(v) => setForm({ ...form, rule_violation_penalty: v })}
              min={0}
              max={100}
            />{" "}
            points (clamped to 0).
          </SentenceRow>
        </div>
      </ComposedCard>

      <ComposedCard title="How should we judge overall project health?" headerClassName="mb-2">
        <FieldDescription className="mb-4">
          A project's health combines two things: how risky it is, and how far along it is. Pick which one should matter
          more.
        </FieldDescription>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {HEALTH_STEPS.map((s) => {
            const active = form.health_risk_weight === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm({ ...form, health_risk_weight: s.value })}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all cursor-pointer",
                  active
                    ? "bg-primary/5 border-primary ring-2 ring-primary/20"
                    : "border-border/40 bg-muted/20 hover:bg-muted/40",
                )}
              >
                <p
                  className={cn("text-[12px] font-semibold leading-tight", active ? "text-primary" : "text-foreground")}
                >
                  {s.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.description}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-muted/30 border border-border/40 p-4">
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/40 mb-2">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
              style={{ width: `${form.health_risk_weight}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              style={{ width: `${progressWeight}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] tabular-nums">
            <span className="text-rose-600 font-semibold">Risk weight: {form.health_risk_weight}%</span>
            <span className="text-emerald-600 font-semibold">Progress weight: {progressWeight}%</span>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => update.mutate(form)} disabled={update.isPending} className="gap-2" size="lg">
            {saved && <Check className="size-4" />}
            {update.isPending ? "Saving…" : saved ? "Saved" : "Save Changes"}
          </Button>
        </div>
      </ComposedCard>
    </div>
  );
}


// ─── Calendar Tab ─────────────────────────────────────────────────────────────

// ISO weekday index: 0 = Mon, 6 = Sun. Matches backend working_days + preview.weekday.
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHORT_DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function todayIsoDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function CalendarTab() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: summary, isLoading } = useGetCalendarSummary(year, month);
  const { data: allHolidays } = useGetCompanyHolidays();
  const updateSettings = useUpdateCalendarSettings();
  const deleteHoliday = useDeleteCompanyHoliday();

  const [holidaySheetOpen, setHolidaySheetOpen] = useState(false);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  }

  function toggleWorkingDay(isoIndex: number) {
    if (!summary) return;
    const next = summary.working_days.map((bit, i) => (i === isoIndex ? (bit ? 0 : 1) : bit));
    updateSettings.mutate({ working_days: next });
  }

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card h-72 animate-pulse" />
          <div className="rounded-2xl border border-border/60 bg-card h-72 animate-pulse" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card h-32 animate-pulse" />
      </div>
    );
  }

  const monthLabel = formatMonthYear(summary.year, summary.month);
  const today = todayIsoDate();

  // summary.company_holidays = month-scoped subset, used for preview math only.
  // allHolidays = full list, shown in the holiday list card below.
  const holidays = allHolidays ?? [];

  // Build 6×7 grid: pad leading nulls so column index matches ISO weekday of day 1.
  const firstWeekday = summary.preview[0]?.weekday ?? 0;
  const cells: (CalendarPreviewDay | null)[] = Array(firstWeekday).fill(null);
  summary.preview.forEach((d) => cells.push(d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (CalendarPreviewDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <ComposedCard
          title={`${monthLabel} Preview`}
          action={
            <div className="flex items-center gap-1">
              <Button onClick={() => shiftMonth(-1)} size="sm" variant="ghost" className="size-7 p-0">
                <ChevronLeft className="size-4" />
              </Button>
              <Button onClick={() => shiftMonth(1)} size="sm" variant="ghost" className="size-7 p-0">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          }
          headerClassName="mb-2"
        >
          <FieldDescription className="mb-3">Non-working days are dimmed.</FieldDescription>
          <div className="grid grid-cols-7 mb-1">
            {SHORT_DOW.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/50 pb-1">
                {d}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((cell, di) => {
                  if (!cell) return <div key={di} />;
                  const isToday = cell.date === today;
                  return (
                    <div
                      key={di}
                      className={cn(
                        "h-7 flex items-center justify-center rounded-lg text-[11px] font-medium",
                        isToday && "ring-2 ring-primary",
                        cell.status === "holiday"
                          ? "bg-amber-100 text-amber-600 line-through"
                          : cell.status === "working"
                            ? "bg-muted/40 text-foreground"
                            : "text-muted-foreground/30",
                      )}
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-muted/40" />
              <span className="text-[10px] text-muted-foreground">Working</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-amber-100" />
              <span className="text-[10px] text-muted-foreground">Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm border border-muted-foreground/20" />
              <span className="text-[10px] text-muted-foreground">Off</span>
            </div>
          </div>
        </ComposedCard>
        <ComposedCard
          title="Company Holidays"
          action={
            <>
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                {holidays.length}
              </span>
              <div className="flex-1" />
              <Button onClick={() => setHolidaySheetOpen(true)} className="gap-1.5">
                <Plus className="size-3.5" />
                Add Holiday
              </Button>
            </>
          }
          headerClassName="mb-4"
        >
          <FieldDescription className="mb-4">
            All company-wide days off. Blocked in the Leave Calendar and excluded from working-day counts.
          </FieldDescription>
          {holidays.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarDays className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">No holidays configured</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">Add a company-specific day off to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden">
              {holidays.map((h) => {
                const d = new Date(h.date);
                const dayNum = d.getDate();
                const dateLabel = h.recurring
                  ? `${d.toLocaleString("en-US", { month: "long", day: "numeric" })} (yearly)`
                  : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                const weekdayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <div key={h.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-200 shrink-0">
                      <span className="text-[13px] font-bold text-amber-700">{dayNum}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-foreground">{h.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {dateLabel} · {weekdayLabel}
                      </p>
                    </div>
                    {h.recurring && (
                      <span className="text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        Recurring
                      </span>
                    )}
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      Day off
                    </span>
                    <Button
                      onClick={() => deleteHoliday.mutate(h.id)}
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground/50 hover:text-rose-500 h-7 w-7 p-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ComposedCard>
      </div>

      <ComposedCard title="Working Week" headerClassName="mb-2">
        <FieldDescription className="mb-4">Select which days are regular working days.</FieldDescription>
        <div className="flex gap-2 flex-wrap">
          {DOW_LABELS.map((label, i) => {
            const active = summary.working_days[i] === 1;
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleWorkingDay(i)}
                disabled={updateSettings.isPending}
                className={cn(
                  "size-11 rounded-xl text-[13px] font-semibold border-2 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:border-border/60 hover:bg-muted",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          {summary.working_days_per_week} working day{summary.working_days_per_week !== 1 ? "s" : ""} per week
        </p>
      </ComposedCard>

      <CreateCompanyHolidaySheet open={holidaySheetOpen} onOpenChange={setHolidaySheetOpen} />
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function Settings() {
  return (
    <>
      <TopBar title="Settings" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <Tabs defaultValue="organization">
          <TabsList>
            {(
              [
                { value: "organization", label: "Organization", icon: ShieldIcon },
                { value: "skills", label: "Skills", icon: BookOpenIcon },
                { value: "rules", label: "Rules", icon: SlidersIcon },
                { value: "calendar", label: "Calendar", icon: CalendarIcon },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="organization" className="mt-5">
            <OrganizationTab />
          </TabsContent>
          <TabsContent value="skills" className="mt-5">
            <SkillsTab />
          </TabsContent>
          <TabsContent value="rules" className="mt-5">
            <RulesTab />
          </TabsContent>
          <TabsContent value="calendar" className="mt-5">
            <CalendarTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
