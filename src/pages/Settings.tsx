import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  BookOpen,
  Plus,
  Trash2,
  X,
  Check,
  Sliders,
} from "lucide-react";

type Tab = "organization" | "skills" | "rules";

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
  {
    id: "s1",
    name: "React",
    category: "FRONTEND",
    description: "React.js framework",
  },
  {
    id: "s2",
    name: "Vue.js",
    category: "FRONTEND",
    description: "Vue.js framework",
  },
  {
    id: "s3",
    name: "TypeScript",
    category: "FRONTEND",
    description: "TypeScript language",
  },
  {
    id: "s4",
    name: "Node.js",
    category: "BACKEND",
    description: "Node.js runtime",
  },
  {
    id: "s5",
    name: "Python",
    category: "BACKEND",
    description: "Python language",
  },
  {
    id: "s6",
    name: "AWS",
    category: "DEVOPS",
    description: "Amazon Web Services",
  },
  {
    id: "s7",
    name: "Kubernetes",
    category: "DEVOPS",
    description: "Container orchestration",
  },
  {
    id: "s8",
    name: "PostgreSQL",
    category: "DATABASE",
    description: "PostgreSQL database",
  },
  {
    id: "s9",
    name: "Security",
    category: "SECURITY",
    description: "Security engineering",
  },
  {
    id: "s10",
    name: "Testing",
    category: "TESTING",
    description: "QA and testing",
  },
];

const DEFAULT_RULES: Rule[] = [
  {
    id: "r1",
    name: "Minimum Frontend Developers",
    type: "min_staff",
    enabled: true,
    params: {
      department: "Engineering",
      role: "Frontend Developer",
      minCount: 3,
    },
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
  min_staff: "Minimum Staff",
  min_skill: "Minimum Skill",
  bus_factor: "Bus Factor",
  coverage: "Coverage",
};

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
    <div className="rounded-xl bg-card border border-border p-6 max-w-2xl">
      <h3 className="font-semibold text-foreground mb-6">
        Organization Details
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Organization Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Industry
            </label>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {[
                "Technology",
                "Finance",
                "Healthcare",
                "Retail",
                "Manufacturing",
              ].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Company Size
            </label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="pt-4">
          <Button
            onClick={handleSave}
            className="gap-2 bg-foreground text-background hover:bg-foreground/85 rounded-xl h-9 px-4 font-semibold"
          >
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Save({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function SkillsTab({
  skills,
  onSave,
}: {
  skills: SkillDefinition[];
  onSave: (s: SkillDefinition[]) => void;
}) {
  const [list, setList] = useState(skills);
  const [newSkill, setNewSkill] = useState<Partial<SkillDefinition>>({
    name: "",
    category: "FRONTEND",
    description: "",
  });
  const [showAdd, setShowAdd] = useState(false);

  function handleDelete(id: string) {
    setList(list.filter((s) => s.id !== id));
    onSave(list.filter((s) => s.id !== id));
  }

  function handleAdd() {
    if (!newSkill.name) return;
    const skill: SkillDefinition = {
      id: `s${Date.now()}`,
      name: newSkill.name,
      category: newSkill.category as (typeof SKILL_CATEGORIES)[number],
      description: newSkill.description || "",
    };
    setList([...list, skill]);
    onSave([...list, skill]);
    setNewSkill({ name: "", category: "FRONTEND", description: "" });
    setShowAdd(false);
  }

  const grouped = SKILL_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = list.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<string, SkillDefinition[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Skill Catalog</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage the skills tracked in your organization
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="gap-2 bg-foreground text-background hover:bg-foreground/85 rounded-xl h-9 px-4 font-semibold"
        >
          <Plus className="size-4" />
          Add Skill
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-xl bg-card border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Add New Skill
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Skill name"
              value={newSkill.name}
              onChange={(e) =>
                setNewSkill({ ...newSkill, name: e.target.value })
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={newSkill.category}
              onChange={(e) =>
                setNewSkill({
                  ...newSkill,
                  category: e.target.value as (typeof SKILL_CATEGORIES)[number],
                })
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SKILL_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Description (optional)"
                value={newSkill.description}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, description: e.target.value })
                }
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                onClick={handleAdd}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-9 px-3"
              >
                <Check className="size-4" />
              </Button>
              <Button
                onClick={() => setShowAdd(false)}
                size="sm"
                variant="outline"
                className="h-9 px-3 rounded-lg"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {SKILL_CATEGORIES.map((cat) => (
        <div
          key={cat}
          className="rounded-xl bg-card border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {cat}
            </h4>
          </div>
          <div className="divide-y divide-border">
            {grouped[cat]?.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No skills in this category
              </p>
            ) : (
              grouped[cat]?.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {skill.name}
                    </p>
                    {skill.description && (
                      <p className="text-xs text-muted-foreground">
                        {skill.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDelete(skill.id)}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-rose-500 h-8 w-8 p-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RulesTab({
  rules,
  onSave,
}: {
  rules: Rule[];
  onSave: (r: Rule[]) => void;
}) {
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
    const updated = list.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r,
    );
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
    setNewRule({
      name: "",
      type: "min_staff",
      enabled: true,
      severity: "warning",
      params: { minCount: 1 },
    });
    setShowAdd(false);
  }

  function updateParam(id: string, key: string, value: string | number) {
    const updated = list.map((r) =>
      r.id === id ? { ...r, params: { ...r.params, [key]: value } } : r,
    );
    setList(updated);
    onSave(updated);
  }

  const severityColors = {
    critical: "bg-rose-500 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Organizational Rules
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define constraints and requirements for your organization
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="gap-2 bg-foreground text-background hover:bg-foreground/85 rounded-xl h-9 px-4 font-semibold"
        >
          <Plus className="size-4" />
          Add Rule
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-xl bg-card border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Add New Rule
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Rule name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={newRule.type}
              onChange={(e) =>
                setNewRule({ ...newRule, type: e.target.value as RuleType })
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="min_staff">Minimum Staff</option>
              <option value="min_skill">Minimum Skill</option>
              <option value="bus_factor">Bus Factor</option>
              <option value="coverage">Coverage</option>
            </select>
            <select
              value={newRule.severity}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  severity: e.target.value as "critical" | "warning" | "info",
                })
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-9 px-4"
              >
                Add
              </Button>
              <Button
                onClick={() => setShowAdd(false)}
                variant="outline"
                className="h-9 px-3 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "rounded-xl border p-4",
              rule.enabled
                ? "bg-card border-border"
                : "bg-muted/30 border-border/50",
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={cn(
                    "mt-0.5 size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    rule.enabled
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-muted-foreground/30",
                  )}
                >
                  {rule.enabled && <Check className="size-3 text-white" />}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        rule.enabled
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {rule.name}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        severityColors[rule.severity],
                      )}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {RULE_TYPE_LABELS[rule.type]} • {formatRuleParams(rule)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleDelete(rule.id)}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-rose-500 h-8 w-8 p-0"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 pl-8">
              {renderRuleParams(rule, (key, val) =>
                updateParam(rule.id, key, val),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRuleParams(rule: Rule): string {
  switch (rule.type) {
    case "min_staff":
      return `Min ${rule.params.minCount} ${rule.params.role || rule.params.department}`;
    case "min_skill":
      return `Min ${rule.params.minCount} with ${rule.params.skill} (level ${rule.params.minLevel}+)`;
    case "bus_factor":
      return `Max bus factor: ${rule.params.maxBusFactor}`;
    case "coverage":
      return `Min ${rule.params.minCoverage} per ${rule.params.category}`;
    default:
      return "";
  }
}

function renderRuleParams(
  rule: Rule,
  onChange: (key: string, val: string | number) => void,
) {
  switch (rule.type) {
    case "min_staff":
      return (
        <>
          <input
            type="text"
            placeholder="Role or department"
            value={rule.params.role || rule.params.department || ""}
            onChange={(e) =>
              onChange(
                rule.params.role !== undefined ? "role" : "department",
                e.target.value,
              )
            }
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Min count"
            value={rule.params.minCount}
            onChange={(e) =>
              onChange("minCount", parseInt(e.target.value) || 1)
            }
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </>
      );
    case "min_skill":
      return (
        <>
          <input
            type="text"
            placeholder="Skill name"
            value={rule.params.skill || ""}
            onChange={(e) => onChange("skill", e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Min level"
            value={rule.params.minLevel || 1}
            onChange={(e) =>
              onChange("minLevel", parseInt(e.target.value) || 1)
            }
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Min count"
            value={rule.params.minCount}
            onChange={(e) =>
              onChange("minCount", parseInt(e.target.value) || 1)
            }
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </>
      );
    case "bus_factor":
      return (
        <input
          type="number"
          placeholder="Max bus factor"
          value={rule.params.maxBusFactor}
          onChange={(e) =>
            onChange("maxBusFactor", parseInt(e.target.value) || 2)
          }
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      );
    case "coverage":
      return (
        <>
          <select
            value={rule.params.category || "FRONTEND"}
            onChange={(e) => onChange("category", e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SKILL_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min coverage"
            value={rule.params.minCoverage}
            onChange={(e) =>
              onChange("minCoverage", parseInt(e.target.value) || 1)
            }
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </>
      );
    default:
      return null;
  }
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const [orgSettings, setOrgSettings] = useState(DEFAULT_ORG);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [rules, setRules] = useState(DEFAULT_RULES);

  const tabs = [
    { key: "organization" as Tab, label: "Organization", icon: Shield },
    { key: "skills" as Tab, label: "Skills", icon: BookOpen },
    { key: "rules" as Tab, label: "Rules", icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors",
              activeTab === tab.key
                ? "bg-foreground text-background"
                : "bg-card border border-border text-foreground hover:bg-muted",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "organization" && (
        <OrganizationTab settings={orgSettings} onSave={setOrgSettings} />
      )}
      {activeTab === "skills" && (
        <SkillsTab skills={skills} onSave={setSkills} />
      )}
      {activeTab === "rules" && <RulesTab rules={rules} onSave={setRules} />}
    </div>
  );
}
