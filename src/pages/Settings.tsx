import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import SharedStatCard from "@/components/common/cards/StatCard";
import {
  Plus,
  Trash2,
  X,
  Check,
  CalendarDays,
  Building2,
  Briefcase,
  Users,
  MapPin,
  Activity,
  Layers,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useCalendarSettings, type CompanyHoliday } from "@/hooks/useCalendarSettings";
import SkillsTab from "@/components/specified/pages/settings/SkillsTab.tsx";
import { ActivityIcon, BookOpenIcon, CalendarIcon, ShieldIcon, SlidersIcon } from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrganizationSettings {
  name: string;
  industry: string;
  size: string;
  location: string;
  methodology: "agile" | "scrum" | "kanban" | "hybrid" | "waterfall";
  teamStructure: "cross-functional" | "specialized" | "matrix";
  riskTolerance: "conservative" | "balanced" | "aggressive";
}

type RuleType = "min_staff" | "min_skill" | "bus_factor" | "coverage";

interface Rule {
  id: string;
  name: string;
  type: RuleType;
  enabled: boolean;
  params: Record<string, string | number>;
  severity: "critical" | "warning" | "info";
}

interface AnalyticsConfig {
  busFactorThreshold: number;
  coverageSensitivity: "conservative" | "balanced" | "aggressive";
  riskWeights: { busFactor: number; skillCoverage: number; teamAvailability: number };
  alertThresholds: { riskScore: number; coverageMin: number; busFactorMax: number };
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_ORG: OrganizationSettings = {
  name: "QITE",
  industry: "Technology",
  size: "11-50",
  location: "Belgium",
  methodology: "agile",
  teamStructure: "cross-functional",
  riskTolerance: "balanced",
};

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

const DEFAULT_ANALYTICS: AnalyticsConfig = {
  busFactorThreshold: 2,
  coverageSensitivity: "balanced",
  riskWeights: { busFactor: 40, skillCoverage: 40, teamAvailability: 20 },
  alertThresholds: { riskScore: 70, coverageMin: 60, busFactorMax: 2 },
};

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

const SENSITIVITY_CONFIG = {
  conservative: {
    label: "Conservative",
    description: "Fewer alerts, higher thresholds",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-600",
    ring: "ring-blue-300",
  },
  balanced: {
    label: "Balanced",
    description: "Standard sensitivity",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    activeBg: "bg-amber-500",
    ring: "ring-amber-300",
  },
  aggressive: {
    label: "Aggressive",
    description: "More alerts, lower thresholds",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    activeBg: "bg-rose-600",
    ring: "ring-rose-300",
  },
} as const;

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

const inputCls =
  "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

// ─── Organization Tab ─────────────────────────────────────────────────────────

function OrganizationTab({
  settings,
  onSave,
}: {
  settings: OrganizationSettings;
  onSave: (s: OrganizationSettings) => void;
}) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <SharedStatCard title="Organization" value={form.name} comment={null} icon={Building2} isLoading={false} />
        <SharedStatCard title="Industry" value={form.industry} comment={null} icon={Briefcase} isLoading={false} />
        <SharedStatCard title="Size" value={form.size} comment={null} icon={Users} isLoading={false} />
        <SharedStatCard title="Location" value={form.location} comment={null} icon={MapPin} isLoading={false} />
      </div>

      <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm">
        <h3 className="text-[14px] font-semibold text-foreground mb-4">Organization Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Organization Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className={cn(inputCls, "cursor-pointer")}
            >
              {["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Company Size
            </label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className={cn(inputCls, "cursor-pointer")}
            >
              {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Operational Profile</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Influences risk thresholds, simulation assumptions, and recommended policies.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Engineering Methodology
            </label>
            <select
              value={form.methodology}
              onChange={(e) => setForm({ ...form, methodology: e.target.value as OrganizationSettings["methodology"] })}
              className={cn(inputCls, "cursor-pointer")}
            >
              <option value="agile">Agile</option>
              <option value="scrum">Scrum</option>
              <option value="kanban">Kanban</option>
              <option value="hybrid">Hybrid</option>
              <option value="waterfall">Waterfall</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Team Structure
            </label>
            <select
              value={form.teamStructure}
              onChange={(e) =>
                setForm({ ...form, teamStructure: e.target.value as OrganizationSettings["teamStructure"] })
              }
              className={cn(inputCls, "cursor-pointer")}
            >
              <option value="cross-functional">Cross-functional</option>
              <option value="specialized">Specialized</option>
              <option value="matrix">Matrix</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
            Risk Tolerance
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["conservative", "balanced", "aggressive"] as const).map((opt) => {
              const cfg = RISK_TOLERANCE_CONFIG[opt];
              const active = form.riskTolerance === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setForm({ ...form, riskTolerance: opt })}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all duration-200",
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
        </div>

        <Button
          onClick={handleSave}
          className={cn(
            "gap-2 rounded-xl h-9 px-5 font-medium transition-all duration-200 shadow-sm",
            saved
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/10",
          )}
        >
          {saved && <Check className="size-4" />}
          {saved ? "Saved" : "Save Changes"}
        </Button>
      </div>
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

const APRIL_FIRST_DOW = 3;
const DAYS_IN_APRIL = 30;
const STANDARD_APRIL_WORKING_DAYS = 22;
const ALL_DAYS_OF_WEEK = [
  { dow: 1, label: "Mon" },
  { dow: 2, label: "Tue" },
  { dow: 3, label: "Wed" },
  { dow: 4, label: "Thu" },
  { dow: 5, label: "Fri" },
  { dow: 6, label: "Sat" },
  { dow: 0, label: "Sun" },
];

function getDayOfWeekForDay(day: number): number {
  return (APRIL_FIRST_DOW + day - 1) % 7;
}

function CalendarTab() {
  const { settings, update } = useCalendarSettings();
  const [newHoliday, setNewHoliday] = useState<{ day: string; label: string }>({ day: "", label: "" });
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleWorkingDay(dow: number) {
    const next = settings.workingDays.includes(dow)
      ? settings.workingDays.filter((d) => d !== dow)
      : [...settings.workingDays, dow].sort();
    update({ ...settings, workingDays: next });
    flash();
  }

  function addHoliday() {
    const day = parseInt(newHoliday.day, 10);
    if (!day || day < 1 || day > DAYS_IN_APRIL || !newHoliday.label.trim()) return;
    const holiday: CompanyHoliday = { id: `h${Date.now()}`, day, label: newHoliday.label.trim() };
    update({ ...settings, holidays: [...settings.holidays, holiday].sort((a, b) => a.day - b.day) });
    setNewHoliday({ day: "", label: "" });
    setShowAddHoliday(false);
    flash();
  }

  function removeHoliday(id: string) {
    update({ ...settings, holidays: settings.holidays.filter((h) => h.id !== id) });
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const workingDayCount = ALL_DAYS_OF_WEEK.filter((d) => settings.workingDays.includes(d.dow)).length;
  const holidayDays = new Set(settings.holidays.map((h) => h.day));

  const workingDaysInApril = Array.from({ length: DAYS_IN_APRIL }, (_, i) => i + 1).filter(
    (d) => settings.workingDays.includes(getDayOfWeekForDay(d)) && !holidayDays.has(d),
  ).length;

  const capacityDiff = workingDaysInApril - STANDARD_APRIL_WORKING_DAYS;
  const capacityPct = Math.round((Math.abs(capacityDiff) / STANDARD_APRIL_WORKING_DAYS) * 100);

  const weeks: (number | null)[][] = [];
  const monFirstOffset = (APRIL_FIRST_DOW - 1 + 7) % 7;
  let firstWeek: (number | null)[] = Array(monFirstOffset).fill(null);
  for (let d = 1; d <= DAYS_IN_APRIL; d++) firstWeek.push(d);
  for (let i = 0; i < firstWeek.length; i += 7) {
    const week = firstWeek.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Working Days / Week</p>
          <p className="text-[28px] font-bold text-foreground mt-1">{workingDayCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">days per week</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Company Holidays</p>
          <p className="text-[28px] font-bold text-foreground mt-1">{settings.holidays.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">in April 2026</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Working Days — April</p>
          <p className="text-[28px] font-bold text-foreground mt-1">{workingDaysInApril}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">available working days</p>
        </div>
      </div>

      {/* Capacity insight */}
      <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3 flex items-center gap-2.5">
        <AlertTriangle className="size-3.5 text-muted-foreground/50 shrink-0" />
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">{workingDayCount}-day</span> working week
          {settings.holidays.length > 0 && (
            <>
              {" "}
              ·{" "}
              <span className="font-medium text-foreground">
                {settings.holidays.length} holiday{settings.holidays.length !== 1 ? "s" : ""}
              </span>
            </>
          )}
          {" · "}
          <span className="font-semibold text-foreground">{workingDaysInApril} working days in April 2026</span>
          {" — "}
          <span
            className={cn(
              "font-semibold",
              capacityDiff < 0 ? "text-amber-600" : capacityDiff === 0 ? "text-muted-foreground" : "text-emerald-600",
            )}
          >
            {capacityDiff === 0
              ? "standard capacity"
              : `${capacityPct}% ${capacityDiff < 0 ? "below" : "above"} standard`}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Working Week</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Select which days are regular working days</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_DAYS_OF_WEEK.map(({ dow, label }) => {
              const active = settings.workingDays.includes(dow);
              return (
                <button
                  key={dow}
                  onClick={() => toggleWorkingDay(dow)}
                  className={cn(
                    "size-11 rounded-xl text-[13px] font-semibold border-2 transition-all duration-150",
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
          <p className="text-[11px] text-muted-foreground">
            {workingDayCount} working day{workingDayCount !== 1 ? "s" : ""} per week
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-3">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">April 2026 Preview</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Non-working days are dimmed</p>
          </div>
          <div>
            <div className="grid grid-cols-7 mb-1">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/50 pb-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-0.5">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} />;
                    const dow = getDayOfWeekForDay(day);
                    const isWorking = settings.workingDays.includes(dow);
                    const isHoliday = holidayDays.has(day);
                    const isToday = day === 23;
                    return (
                      <div
                        key={di}
                        className={cn(
                          "h-7 flex items-center justify-center rounded-lg text-[11px] font-medium",
                          isToday && "ring-2 ring-primary",
                          isHoliday
                            ? "bg-amber-100 text-amber-600 line-through"
                            : isWorking
                              ? "bg-muted/40 text-foreground"
                              : "text-muted-foreground/30",
                        )}
                      >
                        {day}
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
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Company Holidays — April 2026</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              These days are blocked in the Leave Calendar and excluded from working-day counts
            </p>
          </div>
          <Button
            onClick={() => setShowAddHoliday((v) => !v)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10"
          >
            <Plus className="size-4" />
            Add Holiday
          </Button>
        </div>

        {showAddHoliday && (
          <div className="px-6 py-4 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="space-y-1 w-28">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Day (1–30)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  placeholder="21"
                  value={newHoliday.day}
                  onChange={(e) => setNewHoliday({ ...newHoliday, day: e.target.value })}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Holiday Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Easter Monday"
                  value={newHoliday.label}
                  onChange={(e) => setNewHoliday({ ...newHoliday, label: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addHoliday()}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="flex gap-2 pt-5">
                <Button
                  onClick={addHoliday}
                  className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl h-9 px-4 shadow-sm"
                >
                  Add
                </Button>
                <Button onClick={() => setShowAddHoliday(false)} variant="outline" className="rounded-xl h-9 px-3">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {settings.holidays.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <CalendarDays className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">No holidays configured</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Add company-specific days off for April 2026</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {settings.holidays.map((h) => {
              const dow = getDayOfWeekForDay(h.day);
              const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              return (
                <div key={h.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-200 shrink-0">
                    <span className="text-[13px] font-bold text-amber-700">{h.day}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-foreground">{h.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      April {h.day}, 2026 · {dayNames[dow]}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    Day off
                  </span>
                  <Button
                    onClick={() => removeHoliday(h.id)}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground/50 hover:text-rose-500 h-7 w-7 p-0 rounded-lg hover:bg-rose-50/50"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {saved && (
          <div className="px-6 py-2.5 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
            <Check className="size-3.5 text-emerald-600" />
            <span className="text-[12px] font-medium text-emerald-700">Changes saved automatically</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ config, onSave }: { config: AnalyticsConfig; onSave: (c: AnalyticsConfig) => void }) {
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const weightsTotal = form.riskWeights.busFactor + form.riskWeights.skillCoverage + form.riskWeights.teamAvailability;
  const weightsValid = weightsTotal === 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <SharedStatCard
          title="Bus Factor Alert"
          value={`≤ ${form.alertThresholds.busFactorMax}`}
          comment="Trigger when bus factor reaches this"
          icon={AlertTriangle}
          isLoading={false}
        />
        <SharedStatCard
          title="Coverage Alert"
          value={`< ${form.alertThresholds.coverageMin}%`}
          comment="Trigger when coverage drops below"
          icon={Layers}
          isLoading={false}
        />
        <SharedStatCard
          title="Risk Score Alert"
          value={`≥ ${form.alertThresholds.riskScore}`}
          comment="Trigger when risk score exceeds"
          icon={Activity}
          isLoading={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Risk Calculation Model */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Risk Calculation Model</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Controls how Sentinel evaluates and scores organizational risk.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Coverage Sensitivity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["conservative", "balanced", "aggressive"] as const).map((opt) => {
                const cfg = SENSITIVITY_CONFIG[opt];
                const active = form.coverageSensitivity === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setForm({ ...form, coverageSensitivity: opt })}
                    className={cn(
                      "rounded-xl border-2 p-3 text-left transition-all duration-200",
                      active
                        ? `${cfg.bg} ${cfg.border} ring-2 ${cfg.ring} ring-offset-1`
                        : "border-border/40 bg-muted/20 hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-[11px] font-semibold", active ? cfg.color : "text-foreground")}>
                        {cfg.label}
                      </span>
                      <div
                        className={cn(
                          "size-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                          active ? `${cfg.activeBg} border-transparent` : "border-muted-foreground/30",
                        )}
                      >
                        {active && <Check className="size-2 text-white" />}
                      </div>
                    </div>
                    <p className={cn("text-[10px]", active ? cfg.color : "text-muted-foreground")}>{cfg.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Bus Factor Alert Threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={5}
                value={form.busFactorThreshold}
                onChange={(e) => setForm({ ...form, busFactorThreshold: parseInt(e.target.value) || 1 })}
                className="w-20 rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-center font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <p className="text-[12px] text-muted-foreground">Alert when bus factor ≤ this value</p>
            </div>
          </div>
        </div>

        {/* Score Weights */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-foreground">Risk Score Weights</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                How each factor contributes to overall risk score.
              </p>
            </div>
            <span
              className={cn(
                "text-[11px] font-semibold px-2.5 py-1 rounded-full border",
                weightsValid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200",
              )}
            >
              {weightsTotal}/100
            </span>
          </div>

          {[
            {
              key: "busFactor" as const,
              label: "Bus Factor",
              color: "bg-rose-500",
              description: "Dependency concentration weight",
            },
            {
              key: "skillCoverage" as const,
              label: "Skill Coverage",
              color: "bg-violet-500",
              description: "Skill redundancy weight",
            },
            {
              key: "teamAvailability" as const,
              label: "Team Availability",
              color: "bg-blue-500",
              description: "Capacity availability weight",
            },
          ].map(({ key, label, color, description }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{description}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.riskWeights[key]}
                  onChange={(e) =>
                    setForm({ ...form, riskWeights: { ...form.riskWeights, [key]: parseInt(e.target.value) || 0 } })
                  }
                  className="w-16 rounded-xl border border-border/60 bg-background px-2 py-1.5 text-[12px] text-center font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", color)}
                  style={{ width: `${Math.min(form.riskWeights[key], 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Alert Thresholds</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Values that trigger risk alerts across the platform.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Risk Score Alert (≥)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={form.alertThresholds.riskScore}
                onChange={(e) =>
                  setForm({
                    ...form,
                    alertThresholds: { ...form.alertThresholds, riskScore: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-20 rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-center font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <span className="text-[12px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Coverage Alert (&lt;)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={form.alertThresholds.coverageMin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    alertThresholds: { ...form.alertThresholds, coverageMin: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-20 rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-center font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <span className="text-[12px] text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Bus Factor Alert (≤)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={form.alertThresholds.busFactorMax}
                onChange={(e) =>
                  setForm({
                    ...form,
                    alertThresholds: { ...form.alertThresholds, busFactorMax: parseInt(e.target.value) || 1 },
                  })
                }
                className="w-20 rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-center font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <span className="text-[12px] text-muted-foreground">persons</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        className={cn(
          "gap-2 rounded-xl h-9 px-5 font-medium transition-all duration-200 shadow-sm",
          saved
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/10",
        )}
      >
        {saved && <Check className="size-4" />}
        {saved ? "Saved" : "Save Changes"}
      </Button>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function Settings() {
  const [orgSettings, setOrgSettings] = useState(DEFAULT_ORG);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);

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
                { value: "analytics", label: "Analytics", icon: ActivityIcon },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="organization" className="mt-5">
            <OrganizationTab settings={orgSettings} onSave={setOrgSettings} />
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
          <TabsContent value="analytics" className="mt-5">
            <AnalyticsTab config={analytics} onSave={setAnalytics} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
