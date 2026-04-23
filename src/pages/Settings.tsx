import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  BookOpen,
  Sliders,
  Plus,
  Trash2,
  X,
  Check,
  CalendarDays,
} from "lucide-react";
import { useCalendarSettings, type CompanyHoliday } from "@/hooks/useCalendarSettings";

type Tab = "organization" | "skills" | "rules" | "calendar";

const SKILL_CATEGORIES = [
  "FRONTEND",
  "BACKEND",
  "DEVOPS",
  "DATABASE",
  "SECURITY",
  "TESTING",
] as const;

interface OrganizationSettings {
  name: string;
  industry: string;
  size: string;
  location: string;
}

interface SkillDefinition {
  id: string;
  name: string;
  category: (typeof SKILL_CATEGORIES)[number];
  description: string;
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

const DEFAULT_ORG: OrganizationSettings = {
  name: "QITE",
  industry: "Technology",
  size: "11-50",
  location: "Belgium",
};

const DEFAULT_SKILLS: SkillDefinition[] = [
  { id: "s1", name: "React", category: "FRONTEND", description: "React.js framework" },
  { id: "s2", name: "Vue.js", category: "FRONTEND", description: "Vue.js framework" },
  { id: "s3", name: "TypeScript", category: "FRONTEND", description: "TypeScript language" },
  { id: "s4", name: "Node.js", category: "BACKEND", description: "Node.js runtime" },
  { id: "s5", name: "Python", category: "BACKEND", description: "Python language" },
  { id: "s6", name: "AWS", category: "DEVOPS", description: "Amazon Web Services" },
  { id: "s7", name: "Kubernetes", category: "DEVOPS", description: "Container orchestration" },
  { id: "s8", name: "PostgreSQL", category: "DATABASE", description: "PostgreSQL database" },
  { id: "s9", name: "Security", category: "SECURITY", description: "Security engineering" },
  { id: "s10", name: "Testing", category: "TESTING", description: "QA and testing" },
];

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

/* ─── Shared small components ────────────────────────────── */

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-[24px] font-bold text-foreground mt-1 tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant: "critical" | "warning" | "info" | "neutral" }) {
  const styles = {
    critical: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm",
    warning: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm",
    info: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm",
    neutral: "bg-muted/60 text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm", styles[variant])}>
      {children}
    </span>
  );
}

const inputCls = "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

/* ─── Organization Tab ───────────────────────────────────── */

function OrganizationTab({ settings, onSave }: { settings: OrganizationSettings; onSave: (s: OrganizationSettings) => void }) {
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
        <StatCard label="Organization" value={form.name} />
        <StatCard label="Industry" value={form.industry} />
        <StatCard label="Size" value={form.size} />
        <StatCard label="Location" value={form.location} />
      </div>

      <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm">
        <h3 className="text-[14px] font-semibold text-foreground mb-4">Organization Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Organization Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Industry</label>
            <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={cn(inputCls, "cursor-pointer")}>
              {["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Company Size</label>
            <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={cn(inputCls, "cursor-pointer")}>
              {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
          </div>
        </div>
        <div className="mt-5">
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
    </div>
  );
}

/* ─── Skills Tab ─────────────────────────────────────────── */

function SkillsTab({ skills, onSave }: { skills: SkillDefinition[]; onSave: (s: SkillDefinition[]) => void }) {
  const [list, setList] = useState(skills);
  const [newSkill, setNewSkill] = useState<Partial<SkillDefinition>>({ name: "", category: "FRONTEND", description: "" });
  const [showAdd, setShowAdd] = useState(false);

  function handleDelete(id: string) {
    const updated = list.filter((s) => s.id !== id);
    setList(updated);
    onSave(updated);
  }

  function handleAdd() {
    if (!newSkill.name) return;
    const skill: SkillDefinition = {
      id: `s${Date.now()}`,
      name: newSkill.name,
      category: newSkill.category as (typeof SKILL_CATEGORIES)[number],
      description: newSkill.description || "",
    };
    const updated = [...list, skill];
    setList(updated);
    onSave(updated);
    setNewSkill({ name: "", category: "FRONTEND", description: "" });
    setShowAdd(false);
  }

  const grouped = SKILL_CATEGORIES.reduce(
    (acc, cat) => { acc[cat] = list.filter((s) => s.category === cat); return acc; },
    {} as Record<string, SkillDefinition[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">Manage your skill catalog</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{list.length} skills defined</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10 btn-press">
          <Plus className="size-4" />
          Add Skill
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            <input type="text" placeholder="Skill name" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
            <select value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as (typeof SKILL_CATEGORIES)[number] })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all cursor-pointer">
              {SKILL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Description" value={newSkill.description} onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-600 text-white rounded-xl h-10 px-4 shadow-sm">Add</Button>
              <Button onClick={() => setShowAdd(false)} variant="outline" className="rounded-xl h-10 px-3 hover:bg-muted/50"><X className="size-4" /></Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {SKILL_CATEGORIES.map((cat) => (
          <div key={cat} className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{cat}</h4>
                <Badge variant="neutral">{grouped[cat]?.length || 0}</Badge>
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {grouped[cat]?.length === 0 ? (
                <p className="px-4 py-6 text-[11px] text-muted-foreground text-center">No skills</p>
              ) : (
                grouped[cat]?.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{skill.name}</p>
                      {skill.description && <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{skill.description}</p>}
                    </div>
                    <Button onClick={() => handleDelete(skill.id)} size="sm" variant="ghost" className="text-muted-foreground/50 hover:text-rose-500 h-7 w-7 p-0 rounded-lg hover:bg-rose-50/50">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Rules Tab ──────────────────────────────────────────── */

function RulesTab({ rules, onSave }: { rules: Rule[]; onSave: (r: Rule[]) => void }) {
  const [list, setList] = useState(rules);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({ name: "", type: "min_staff", enabled: true, severity: "warning", params: { minCount: 1 } });

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
      severity: newRule.severity as "critical" | "warning" | "info",
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
            <p className="text-[12px] font-medium text-muted-foreground">Organizational Rules</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{activeRules.length} active, {criticalRules.length} critical</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="neutral">{list.length} rules</Badge>
            <Badge variant="critical">{criticalRules.length} critical</Badge>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10 btn-press">
          <Plus className="size-4" />
          Add Rule
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            <input type="text" placeholder="Rule name" value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
            <select value={newRule.type} onChange={(e) => setNewRule({ ...newRule, type: e.target.value as RuleType })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all cursor-pointer">
              <option value="min_staff">Min Staff</option>
              <option value="min_skill">Min Skill</option>
              <option value="bus_factor">Bus Factor</option>
              <option value="coverage">Coverage</option>
            </select>
            <select value={newRule.severity} onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as "critical" | "warning" | "info" })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all cursor-pointer">
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-600 text-white rounded-xl h-10 px-4 shadow-sm">Add</Button>
              <Button onClick={() => setShowAdd(false)} variant="outline" className="rounded-xl h-10 px-3 hover:bg-muted/50"><X className="size-4" /></Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {list.map((rule) => {
          const s = SEVERITY_STYLES[rule.severity];
          return (
            <div key={rule.id} className={cn("rounded-2xl border p-4 transition-all duration-200", rule.enabled ? "bg-card border-border/60 hover:shadow-md hover:border-border" : "bg-muted/20 border-border/30 opacity-60")}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={cn("mt-0.5 size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 shadow-sm", rule.enabled ? `${s.bg} border-transparent` : "border-muted-foreground/30 bg-transparent")}
                  >
                    {rule.enabled && <Check className="size-3 text-white" />}
                  </button>
                  <div>
                    <p className={cn("text-[13px] font-semibold", rule.enabled ? "text-foreground" : "text-muted-foreground")}>{rule.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={rule.severity}>{RULE_TYPE_LABELS[rule.type]}</Badge>
                      <span className="text-[11px] text-muted-foreground">{formatRuleParams(rule)}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleDelete(rule.id)} size="sm" variant="ghost" className="text-muted-foreground/50 hover:text-rose-500 h-7 w-7 p-0 rounded-lg hover:bg-rose-50/50">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatRuleParams(rule: Rule): string {
  switch (rule.type) {
    case "min_staff": return `Min ${rule.params.minCount} ${rule.params.role || rule.params.department}`;
    case "min_skill": return `${rule.params.minCount}x ${rule.params.skill} (lv.${rule.params.minLevel}+)`;
    case "bus_factor": return `Max: ${rule.params.maxBusFactor}`;
    case "coverage": return `${rule.params.minCoverage}x ${rule.params.category}`;
    default: return "";
  }
}

/* ─── Calendar Tab ───────────────────────────────────────── */

// April 2026: April 1 is Wednesday (dow=3)
const APRIL_FIRST_DOW = 3;
const DAYS_IN_APRIL = 30;
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
    const holiday: CompanyHoliday = {
      id: `h${Date.now()}`,
      day,
      label: newHoliday.label.trim(),
    };
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

  // Build mini calendar display (Mon-first grid, April 2026)
  const weeks: (number | null)[][] = [];
  // April 1 is Wednesday: Mon-first offset = 2
  const monFirstOffset = ((APRIL_FIRST_DOW - 1 + 7) % 7);
  let firstWeek: (number | null)[] = Array(monFirstOffset).fill(null);
  for (let d = 1; d <= DAYS_IN_APRIL; d++) firstWeek.push(d);
  // Split into weeks of 7
  for (let i = 0; i < firstWeek.length; i += 7) {
    const week = firstWeek.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const holidayDays = new Set(settings.holidays.map((h) => h.day));

  return (
    <div className="space-y-6">
      {/* Stats */}
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
          <p className="text-[28px] font-bold text-foreground mt-1">
            {Array.from({ length: DAYS_IN_APRIL }, (_, i) => i + 1).filter(
              (d) => settings.workingDays.includes(getDayOfWeekForDay(d)) && !holidayDays.has(d),
            ).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">available working days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Working week */}
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

        {/* Mini calendar preview */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-3">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">April 2026 Preview</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Non-working days are dimmed</p>
          </div>
          <div>
            <div className="grid grid-cols-7 mb-1">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/50 pb-1">{d}</div>
              ))}
            </div>
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-0.5">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} />;
                    const dow = getDayOfWeekForDay(day);
                    // Convert 0-6 Sun-Sat to Mon-first for grid display
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
              <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-sm bg-muted/40" /><span className="text-[10px] text-muted-foreground">Working</span></div>
              <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-sm bg-amber-100" /><span className="text-[10px] text-muted-foreground">Holiday</span></div>
              <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-sm border border-muted-foreground/20" /><span className="text-[10px] text-muted-foreground">Off</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Holidays */}
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
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Day (1–30)</label>
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
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Holiday Name</label>
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
                <Button onClick={addHoliday} className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl h-9 px-4 shadow-sm">
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

/* ─── Settings Page ──────────────────────────────────────── */

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const [orgSettings, setOrgSettings] = useState(DEFAULT_ORG);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [rules, setRules] = useState(DEFAULT_RULES);

  const tabs = [
    { key: "organization" as Tab, label: "Organization", icon: Shield },
    { key: "skills" as Tab, label: "Skills", icon: BookOpen },
    { key: "rules" as Tab, label: "Rules", icon: Sliders },
    { key: "calendar" as Tab, label: "Calendar", icon: CalendarDays },
  ];

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "bg-card border border-border/60 text-foreground hover:bg-muted/50",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "organization" && <OrganizationTab settings={orgSettings} onSave={setOrgSettings} />}
      {activeTab === "skills" && <SkillsTab skills={skills} onSave={setSkills} />}
      {activeTab === "rules" && <RulesTab rules={rules} onSave={setRules} />}
      {activeTab === "calendar" && <CalendarTab />}
    </div>
  );
}
