import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import SharedStatCard from "@/components/common/cards/StatCard";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SelectInput from "@/components/common/inputs/SelectInput";
import {
  Plus,
  Trash2,
  X,
  Check,
  CalendarDays,
  Building2,
  Users,
  MapPin,
  Layers,
  Zap,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SkillsTab from "@/components/specified/pages/settings/SkillsTab.tsx";
import { BookOpenIcon, CalendarIcon, ShieldIcon, SlidersIcon } from "@phosphor-icons/react";
import useGetOrganizationSettings from "@/api/organization/useGetOrganizationSettings";
import useUpdateOrganizationSettings from "@/api/organization/useUpdateOrganizationSettings";
import useGetCalendarSummary from "@/api/calendar/useGetCalendarSummary";
import useUpdateCalendarSettings from "@/api/calendar/useUpdateCalendarSettings";
import useDeleteCompanyHoliday from "@/api/company-holidays/useDeleteCompanyHoliday";
import CreateCompanyHolidaySheet from "@/components/specified/models/companyHoliday/sheets/CreateCompanyHolidaySheet";

// ─── Types ────────────────────────────────────────────────────────────────────

type RuleType = "min_staff" | "min_skill" | "bus_factor" | "coverage";

interface Rule {
  id: string;
  name: string;
  type: RuleType;
  enabled: boolean;
  params: Record<string, string | number>;
  severity: "critical" | "warning" | "info";
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const METHODOLOGY_OPTIONS: { value: Methodology; label: string }[] = [
  { value: "agile", label: "Agile" },
  { value: "waterfall", label: "Waterfall" },
  { value: "kanban", label: "Kanban" },
  { value: "scrumban", label: "Scrumban" },
];

const TEAM_STRUCTURE_OPTIONS: { value: TeamStructure; label: string }[] = [
  { value: "cross-functional", label: "Cross-functional" },
  { value: "functional", label: "Functional" },
  { value: "matrix", label: "Matrix" },
  { value: "squad", label: "Squad" },
];

const SIZE_OPTIONS: CompanySize[] = ["1-10", "11-50", "51-200", "201-500", "500+"];

const DEFAULT_RULES: Rule[] = [
  {
    id: "r1",
    name: "Minimum Frontend Developers",
    type: "min_staff",
    enabled: true,
    params: { department: "Engineering", role: "Frontend Developer", minCount: 3 },
    severity: "critical",
  },
  {
    id: "r2",
    name: "Minimum Project Managers",
    type: "min_staff",
    enabled: true,
    params: { role: "Project Manager", minCount: 2 },
    severity: "critical",
  },
  {
    id: "r3",
    name: "Minimum React Experts",
    type: "min_skill",
    enabled: true,
    params: { skill: "React", minLevel: 4, minCount: 3 },
    severity: "warning",
  },
  {
    id: "r4",
    name: "Bus Factor Risk",
    type: "bus_factor",
    enabled: true,
    params: { maxBusFactor: 2 },
    severity: "critical",
  },
  {
    id: "r5",
    name: "Backend Coverage",
    type: "coverage",
    enabled: false,
    params: { category: "BACKEND", minCoverage: 2 },
    severity: "warning",
  },
  {
    id: "r6",
    name: "Security Coverage",
    type: "coverage",
    enabled: true,
    params: { category: "SECURITY", minCoverage: 2 },
    severity: "critical",
  },
];

// ─── Style maps ───────────────────────────────────────────────────────────────

const RULE_TYPE_LABELS: Record<RuleType, string> = {
  min_staff: "Min Staff",
  min_skill: "Min Skill",
  bus_factor: "Bus Factor",
  coverage: "Coverage",
};

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-gradient-to-br from-rose-500 to-rose-600",
    text: "text-rose-700",
    bgLight: "bg-rose-50",
    border: "border-rose-200",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-500 to-amber-600",
    text: "text-amber-700",
    bgLight: "bg-amber-50",
    border: "border-amber-200",
  },
  info: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-600",
    text: "text-blue-700",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
  },
};

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

const RULE_GROUPS = [
  {
    key: "staffing",
    label: "Staffing Constraints",
    description: "Minimum staff counts and role quotas",
    Icon: Users,
    types: ["min_staff"] as RuleType[],
    headerBg: "bg-blue-50/60",
    headerBorder: "border-blue-100",
    iconColor: "text-blue-600",
    textColor: "text-blue-700",
  },
  {
    key: "capability",
    label: "Capability Constraints",
    description: "Skill coverage and expertise requirements",
    Icon: Layers,
    types: ["min_skill", "coverage"] as RuleType[],
    headerBg: "bg-violet-50/60",
    headerBorder: "border-violet-100",
    iconColor: "text-violet-600",
    textColor: "text-violet-700",
  },
  {
    key: "resilience",
    label: "Resilience Constraints",
    description: "Dependency limits and concentration thresholds",
    Icon: Zap,
    types: ["bus_factor"] as RuleType[],
    headerBg: "bg-rose-50/60",
    headerBorder: "border-rose-100",
    iconColor: "text-rose-600",
    textColor: "text-rose-700",
  },
];

// ─── Shared small components ───────────────────────────────────────────────────

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "critical" | "warning" | "info" | "neutral";
}) {
  const styles = {
    critical: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm",
    warning: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm",
    info: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm",
    neutral: "bg-muted/60 text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

// ─── Organization Tab ─────────────────────────────────────────────────────────

type OrgFormFields = Omit<Required<UpdateOrganizationSettingsRequest>, "industry">;

function OrganizationTab() {
  const { data, isLoading } = useGetOrganizationSettings();
  const update = useUpdateOrganizationSettings();
  const [form, setForm] = useState<OrgFormFields | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        size: data.size,
        location: data.location,
        methodology: data.methodology,
        team_structure: data.team_structure,
        risk_tolerance: data.risk_tolerance,
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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <SharedStatCard title="Organization" value={form.name} comment={null} icon={Building2} isLoading={false} />
        <SharedStatCard title="Size" value={form.size} comment={null} icon={Users} isLoading={false} />
        <SharedStatCard title="Location" value={form.location} comment={null} icon={MapPin} isLoading={false} />
      </div>

      <ComposedCard title="Organization Details" headerClassName="mb-5">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Organization Name</FieldLabel>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field>
            <FieldLabel>Company Size</FieldLabel>
            <SelectInput value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value as CompanySize })}>
              {SIZE_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SelectInput>
          </Field>
          <Field>
            <FieldLabel>Location</FieldLabel>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
        </div>
      </ComposedCard>

      <ComposedCard
        title="Operational Profile"
        headerClassName="mb-2"
        action={
          <p className="flex text-sm items-center">
            <AlertTriangle /> Influences risk thresholds, simulation assumptions, and recommended policies.
          </p>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Engineering Methodology</FieldLabel>
            <SelectInput
              value={form.methodology}
              onChange={(e) => setForm({ ...form, methodology: e.target.value as Methodology })}
            >
              {METHODOLOGY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field>
            <FieldLabel>Team Structure</FieldLabel>
            <SelectInput
              value={form.team_structure}
              onChange={(e) => setForm({ ...form, team_structure: e.target.value as TeamStructure })}
            >
              {TEAM_STRUCTURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <Field className="mt-5">
          <FieldLabel>Risk Tolerance</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
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

// ─── Rules Tab ────────────────────────────────────────────────────────────────

function formatRuleParams(rule: Rule): string {
  switch (rule.type) {
    case "min_staff":
      return `Min ${rule.params.minCount} ${rule.params.role || rule.params.department}`;
    case "min_skill":
      return `${rule.params.minCount}x ${rule.params.skill} (lv.${rule.params.minLevel}+)`;
    case "bus_factor":
      return `Max: ${rule.params.maxBusFactor}`;
    case "coverage":
      return `${rule.params.minCoverage}x ${rule.params.category}`;
    default:
      return "";
  }
}

function RulesTab({ rules, onSave }: { rules: Rule[]; onSave: (r: Rule[]) => void }) {
  const [list, setList] = useState(rules);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: "",
    type: "min_staff",
    enabled: true,
    severity: "warning",
    params: { minCount: 1 },
  });

  function toggleRule(id: string) {
    const updated = list.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setList(updated);
    onSave(updated);
  }

  function handleDelete(id: string) {
    const updated = list.filter((r) => r.id !== id);
    setList(updated);
    onSave(updated);
  }

  function handleAdd() {
    if (!newRule.name) return;
    const rule: Rule = {
      id: `r${Date.now()}`,
      name: newRule.name,
      type: newRule.type as RuleType,
      enabled: true,
      severity: newRule.severity as Rule["severity"],
      params: newRule.params || {},
    };
    const updated = [...list, rule];
    setList(updated);
    onSave(updated);
    setNewRule({ name: "", type: "min_staff", enabled: true, severity: "warning", params: { minCount: 1 } });
    setShowAdd(false);
  }

  const activeRules = list.filter((r) => r.enabled);
  const criticalRules = list.filter((r) => r.enabled && r.severity === "critical");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground">Organizational Resilience Policies</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {activeRules.length} active · {criticalRules.length} critical
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="neutral">{list.length} rules</Badge>
            <Badge variant="critical">{criticalRules.length} critical</Badge>
          </div>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10 btn-press"
        >
          <Plus className="size-4" />
          Add Rule
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Rule name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <select
              value={newRule.type}
              onChange={(e) => setNewRule({ ...newRule, type: e.target.value as RuleType })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              <option value="min_staff">Min Staff</option>
              <option value="min_skill">Min Skill</option>
              <option value="bus_factor">Bus Factor</option>
              <option value="coverage">Coverage</option>
            </select>
            <select
              value={newRule.severity}
              onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as Rule["severity"] })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
            >
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-600 text-white rounded-xl h-10 px-4 shadow-sm"
              >
                Add
              </Button>
              <Button
                onClick={() => setShowAdd(false)}
                variant="outline"
                className="rounded-xl h-10 px-3 hover:bg-muted/50"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {RULE_GROUPS.map(({ key, label, description, Icon, types, headerBg, headerBorder, iconColor, textColor }) => {
          const groupRules = list.filter((r) => types.includes(r.type));
          return (
            <div key={key} className="rounded-2xl border border-border/60 overflow-hidden shadow-sm">
              <div className={cn("px-5 py-3.5 border-b flex items-center gap-3", headerBg, headerBorder)}>
                <Icon className={cn("size-4 shrink-0", iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[13px] font-semibold", textColor)}>{label}</p>
                  <p className="text-[11px] text-muted-foreground">{description}</p>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                  {groupRules.filter((r) => r.enabled).length}/{groupRules.length} active
                </span>
              </div>
              {groupRules.length === 0 ? (
                <div className="px-5 py-5 text-center text-[12px] text-muted-foreground">
                  No rules defined — add one above.
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 gap-3">
                  {groupRules.map((rule) => {
                    const s = SEVERITY_STYLES[rule.severity];
                    return (
                      <div
                        key={rule.id}
                        className={cn(
                          "rounded-xl border p-3.5 transition-all duration-200",
                          rule.enabled
                            ? "bg-card border-border/60 hover:shadow-sm hover:border-border"
                            : "bg-muted/20 border-border/30 opacity-60",
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className={cn(
                                "mt-0.5 size-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 shadow-sm",
                                rule.enabled
                                  ? `${s.bg} border-transparent`
                                  : "border-muted-foreground/30 bg-transparent",
                              )}
                            >
                              {rule.enabled && <Check className="size-2.5 text-white" />}
                            </button>
                            <div>
                              <p
                                className={cn(
                                  "text-[12px] font-semibold",
                                  rule.enabled ? "text-foreground" : "text-muted-foreground",
                                )}
                              >
                                {rule.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={rule.severity}>{RULE_TYPE_LABELS[rule.type]}</Badge>
                                <span className="text-[10px] text-muted-foreground">{formatRuleParams(rule)}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDelete(rule.id)}
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground/50 hover:text-rose-500 h-6 w-6 p-0 rounded-lg hover:bg-rose-50/50"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SharedStatCard key={i} title="" value={null} comment={null} icon={CalendarDays} isLoading />
          ))}
        </div>
      </div>
    );
  }

  const monthLabel = formatMonthYear(summary.year, summary.month);
  const today = todayIsoDate();

  const capacityDiff = summary.working_days_in_month - summary.standard_days_month;
  const capacityPct = Math.round((Math.abs(capacityDiff) / summary.standard_days_month) * 100);

  // Build 6×7 grid: pad leading nulls so column index matches ISO weekday of day 1.
  const firstWeekday = summary.preview[0]?.weekday ?? 0;
  const cells: (CalendarPreviewDay | null)[] = Array(firstWeekday).fill(null);
  summary.preview.forEach((d) => cells.push(d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (CalendarPreviewDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <SharedStatCard
          title="Working Days / Week"
          value={summary.working_days_per_week}
          comment={<p className="text-[11px] text-muted-foreground mt-0.5">days per week</p>}
          icon={CalendarDays}
          isLoading={false}
        />
        <SharedStatCard
          title="Company Holidays"
          value={summary.company_holidays.length}
          comment={<p className="text-[11px] text-muted-foreground mt-0.5">in {monthLabel}</p>}
          icon={CalendarDays}
          isLoading={false}
        />
        <SharedStatCard
          title={`Working Days — ${monthLabel.split(" ")[0]}`}
          value={summary.working_days_in_month}
          comment={<p className="text-[11px] text-muted-foreground mt-0.5">available working days</p>}
          icon={CalendarDays}
          isLoading={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <ComposedCard
        title={`Company Holidays — ${monthLabel}`}
        action={
          <>
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              {summary.company_holidays.length}
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
          Blocked in the Leave Calendar and excluded from working-day counts.
        </FieldDescription>
        {summary.company_holidays.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarDays className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">No holidays configured</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              Add company-specific days off for {monthLabel}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden">
            {summary.company_holidays.map((h) => {
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

      <CreateCompanyHolidaySheet open={holidaySheetOpen} onOpenChange={setHolidaySheetOpen} />
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function Settings() {
  const [rules, setRules] = useState(DEFAULT_RULES);

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
            <RulesTab rules={rules} onSave={setRules} />
          </TabsContent>
          <TabsContent value="calendar" className="mt-5">
            <CalendarTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

