import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import SelectInput from "@/components/common/inputs/SelectInput";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import { Plus, Trash2, Check, AlertTriangle, Pencil, Building2, FolderKanban, UsersRound, Layers, Zap } from "lucide-react";
import useGetRules from "@/api/rules/useGetRules";
import useCreateRule from "@/api/rules/useCreateRule";
import useUpdateRule from "@/api/rules/useUpdateRule";
import useDeleteRule from "@/api/rules/useDeleteRule";
import useGetRuleViolations from "@/api/rules/useGetRuleViolations";
import useGetSkills from "@/api/skills/useGetSkills";
import useGetProjects from "@/api/projects/useGetProjects";

// ─── Static metadata ──────────────────────────────────────────────────────────

const RULE_TYPE_META: Record<
  RuleType,
  { label: string; description: string; group: "capability" | "resilience"; icon: typeof Layers }
> = {
  bus_factor: {
    label: "Bus Factor",
    description: "Flag projects too dependent on a small number of people",
    group: "resilience",
    icon: Zap,
  },
  min_skill: {
    label: "Minimum Skill Coverage",
    description: "Require N people at level L+ for a given skill",
    group: "capability",
    icon: Layers,
  },
  min_coverage: {
    label: "Skill Coverage Ratio",
    description: "Require a minimum % of team members to cover a skill",
    group: "capability",
    icon: Layers,
  },
  role_redundancy: {
    label: "Role Redundancy",
    description: "Require a minimum number of people in a given role",
    group: "resilience",
    icon: Zap,
  },
};

const SCOPE_META: Record<RuleScopeType, { label: string; icon: typeof Building2; description: string }> = {
  organization: { label: "Organization", icon: Building2, description: "Applies to the entire org" },
  project: { label: "Project", icon: FolderKanban, description: "Applies to one specific project" },
  department: { label: "Department", icon: UsersRound, description: "Applies to one department" },
};

const GROUP_META = {
  capability: {
    label: "Capability Constraints",
    description: "Skill coverage and expertise requirements",
    headerBg: "bg-violet-50/60",
    headerBorder: "border-violet-100",
    iconColor: "text-violet-600",
    textColor: "text-violet-700",
    Icon: Layers,
  },
  resilience: {
    label: "Resilience Constraints",
    description: "Dependency limits and concentration thresholds",
    headerBg: "bg-rose-50/60",
    headerBorder: "border-rose-100",
    iconColor: "text-rose-600",
    textColor: "text-rose-700",
    Icon: Zap,
  },
} as const;

// ─── Defaults per type ────────────────────────────────────────────────────────

function defaultParams(type: RuleType): AnyRuleParams {
  switch (type) {
    case "bus_factor":
      return { max_bus_factor: 2 };
    case "min_skill":
      return { skill_id: 0, min_level: 3, min_count: 2 };
    case "min_coverage":
      return { skill_id: 0, min_pct: 50 };
    case "role_redundancy":
      return { role: "", min_count: 2 };
  }
}

function formatParams(rule: Rule): string {
  switch (rule.type) {
    case "bus_factor": {
      const p = rule.params as BusFactorRuleParams;
      return `Bus factor must be > ${p.max_bus_factor}`;
    }
    case "min_skill": {
      const p = rule.params as MinSkillRuleParams;
      return `≥${p.min_count} people at skill #${p.skill_id} level ${p.min_level}+`;
    }
    case "min_coverage": {
      const p = rule.params as MinCoverageRuleParams;
      return `≥${p.min_pct}% coverage on skill #${p.skill_id}`;
    }
    case "role_redundancy": {
      const p = rule.params as RoleRedundancyRuleParams;
      return `≥${p.min_count}× ${p.role || "(role)"}`;
    }
  }
}

// ─── Rule editor sheet ────────────────────────────────────────────────────────

interface RuleEditorState {
  name: string;
  type: RuleType;
  scope_type: RuleScopeType;
  scope_id: number | null;
  params: AnyRuleParams;
  enabled: boolean;
}

function emptyEditor(): RuleEditorState {
  return {
    name: "",
    type: "bus_factor",
    scope_type: "organization",
    scope_id: null,
    params: defaultParams("bus_factor"),
    enabled: true,
  };
}

function fromRule(rule: Rule): RuleEditorState {
  return {
    name: rule.name,
    type: rule.type,
    scope_type: rule.scope_type,
    scope_id: rule.scope_id,
    params: rule.params,
    enabled: rule.enabled,
  };
}

function ParamsEditor({
  state,
  setState,
  skills,
}: {
  state: RuleEditorState;
  setState: (s: RuleEditorState) => void;
  skills: Skill[];
}) {
  switch (state.type) {
    case "bus_factor": {
      const p = state.params as BusFactorRuleParams;
      return (
        <Field>
          <FieldLabel>Maximum bus factor</FieldLabel>
          <Input
            type="number"
            min={1}
            max={20}
            value={p.max_bus_factor}
            onChange={(e) => setState({ ...state, params: { max_bus_factor: Number(e.target.value) } })}
          />
          <FieldDescription>Flag projects whose bus factor is at or below this value.</FieldDescription>
        </Field>
      );
    }
    case "min_skill": {
      const p = state.params as MinSkillRuleParams;
      return (
        <>
          <Field>
            <FieldLabel>Skill</FieldLabel>
            <SelectInput
              value={String(p.skill_id)}
              onChange={(e) => setState({ ...state, params: { ...p, skill_id: Number(e.target.value) } })}
            >
              <option value="0">— Select a skill —</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Minimum level (1–5)</FieldLabel>
              <Input
                type="number"
                min={1}
                max={5}
                value={p.min_level}
                onChange={(e) => setState({ ...state, params: { ...p, min_level: Number(e.target.value) } })}
              />
            </Field>
            <Field>
              <FieldLabel>Minimum people</FieldLabel>
              <Input
                type="number"
                min={1}
                value={p.min_count}
                onChange={(e) => setState({ ...state, params: { ...p, min_count: Number(e.target.value) } })}
              />
            </Field>
          </div>
        </>
      );
    }
    case "min_coverage": {
      const p = state.params as MinCoverageRuleParams;
      return (
        <>
          <Field>
            <FieldLabel>Skill</FieldLabel>
            <SelectInput
              value={String(p.skill_id)}
              onChange={(e) => setState({ ...state, params: { ...p, skill_id: Number(e.target.value) } })}
            >
              <option value="0">— Select a skill —</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field>
            <FieldLabel>Minimum coverage (%)</FieldLabel>
            <Input
              type="number"
              min={0}
              max={100}
              value={p.min_pct}
              onChange={(e) => setState({ ...state, params: { ...p, min_pct: Number(e.target.value) } })}
            />
            <FieldDescription>Share of team members who must hold the skill at the configured KCI level.</FieldDescription>
          </Field>
        </>
      );
    }
    case "role_redundancy": {
      const p = state.params as RoleRedundancyRuleParams;
      return (
        <>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Input
              value={p.role}
              onChange={(e) => setState({ ...state, params: { ...p, role: e.target.value } })}
              placeholder="e.g. Frontend Developer"
            />
          </Field>
          <Field>
            <FieldLabel>Minimum people in this role</FieldLabel>
            <Input
              type="number"
              min={1}
              value={p.min_count}
              onChange={(e) => setState({ ...state, params: { ...p, min_count: Number(e.target.value) } })}
            />
          </Field>
        </>
      );
    }
  }
}

function ScopePicker({
  state,
  setState,
  projects,
}: {
  state: RuleEditorState;
  setState: (s: RuleEditorState) => void;
  projects: { id: string | number; name: string }[];
}) {
  return (
    <>
      <Field>
        <FieldLabel>Scope</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {(["organization", "project", "department"] as RuleScopeType[]).map((s) => {
            const cfg = SCOPE_META[s];
            const active = state.scope_type === s;
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setState({ ...state, scope_type: s, scope_id: s === "organization" ? null : state.scope_id })}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all cursor-pointer",
                  active ? "bg-primary/5 border-primary" : "border-border/40 bg-muted/20 hover:bg-muted/40",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="size-4" />
                  <span className="text-[12px] font-semibold">{cfg.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
              </button>
            );
          })}
        </div>
      </Field>

      {state.scope_type === "project" && (
        <Field>
          <FieldLabel>Target project</FieldLabel>
          <SelectInput
            value={state.scope_id === null ? "" : String(state.scope_id)}
            onChange={(e) =>
              setState({ ...state, scope_id: e.target.value === "" ? null : Number(e.target.value) })
            }
          >
            <option value="">— Select a project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectInput>
        </Field>
      )}

      {state.scope_type === "department" && (
        <Field>
          <FieldLabel>Department ID</FieldLabel>
          <Input
            type="number"
            value={state.scope_id ?? ""}
            onChange={(e) =>
              setState({ ...state, scope_id: e.target.value === "" ? null : Number(e.target.value) })
            }
            placeholder="Department ID"
          />
          <FieldDescription>Department picker is not yet available — enter the ID directly for now.</FieldDescription>
        </Field>
      )}
    </>
  );
}

function RuleEditorSheet({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: RuleEditorState;
  onSubmit: (s: RuleEditorState) => void;
  isPending: boolean;
  title: string;
}) {
  const [state, setState] = useState<RuleEditorState>(initial);
  const { data: skillsData } = useGetSkills({ per_page: 200 });
  const { data: projectsData } = useGetProjects({ per_page: 200 });
  const skills = skillsData?.data ?? [];
  const projects = projectsData?.data ?? [];

  useEffect(() => {
    if (open) setState(initial);
  }, [open, initial]);

  function changeType(type: RuleType) {
    setState({ ...state, type, params: defaultParams(type) });
  }

  const canSubmit =
    state.name.trim().length > 0 &&
    (state.scope_type === "organization" || state.scope_id !== null);

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Rules trigger health-score penalties when violated on a given day."
      maxWidth="sm:max-w-[440px]"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSubmit(state)} disabled={!canSubmit || isPending} className="flex-1 gap-2">
            <Check className="size-4" />
            {isPending ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          placeholder="e.g. Minimum React Experts"
        />
      </Field>

      <Field>
        <FieldLabel>Rule type</FieldLabel>
        <SelectInput value={state.type} onChange={(e) => changeType(e.target.value as RuleType)}>
          {(Object.keys(RULE_TYPE_META) as RuleType[]).map((t) => (
            <option key={t} value={t}>
              {RULE_TYPE_META[t].label}
            </option>
          ))}
        </SelectInput>
        <FieldDescription>{RULE_TYPE_META[state.type].description}</FieldDescription>
      </Field>

      <ParamsEditor state={state} setState={setState} skills={skills} />

      <ScopePicker state={state} setState={setState} projects={projects} />

      <Field>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.enabled}
            onChange={(e) => setState({ ...state, enabled: e.target.checked })}
            className="size-4 rounded border-border"
          />
          <span className="text-[13px] font-medium">Enabled</span>
        </label>
      </Field>
    </ComposedSheet>
  );
}

// ─── Rule card ────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  violationCount,
  onToggle,
  onEdit,
  onDelete,
}: {
  rule: Rule;
  violationCount: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = RULE_TYPE_META[rule.type];
  const scope = SCOPE_META[rule.scope_type];
  const ScopeIcon = scope.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-all duration-200",
        rule.enabled ? "bg-card border-border/60 hover:shadow-sm hover:border-border" : "bg-muted/20 border-border/30 opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            onClick={onToggle}
            className={cn(
              "mt-0.5 size-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer",
              rule.enabled ? "bg-gradient-to-br from-blue-500 to-blue-600 border-transparent" : "border-muted-foreground/30 bg-transparent",
            )}
          >
            {rule.enabled && <Check className="size-2.5 text-white" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={cn("text-[13px] font-semibold truncate", rule.enabled ? "text-foreground" : "text-muted-foreground")}>
                {rule.name}
              </p>
              {violationCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold">
                  <AlertTriangle className="size-3" />
                  {violationCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{formatParams(rule)}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {meta.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <ScopeIcon className="size-3" />
                {scope.label}
                {rule.scope_id !== null && ` #${rule.scope_id}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button onClick={onEdit} size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg">
            <Pencil className="size-3.5" />
          </Button>
          <Button
            onClick={onDelete}
            size="sm"
            variant="ghost"
            className="text-muted-foreground/50 hover:text-rose-500 h-7 w-7 p-0 rounded-lg hover:bg-rose-50/50"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function RulesTab() {
  const { data: rules, isLoading } = useGetRules();
  const { data: violations } = useGetRuleViolations();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Rule | null>(null);

  const violationCountByRule = useMemo(() => {
    const map = new Map<number, number>();
    (violations ?? []).forEach((v) => map.set(v.rule_id, (map.get(v.rule_id) ?? 0) + 1));
    return map;
  }, [violations]);

  const list = rules ?? [];
  const activeRules = list.filter((r) => r.enabled);
  const totalViolations = violations?.length ?? 0;

  const grouped = useMemo(() => {
    const out: Record<"capability" | "resilience", Rule[]> = { capability: [], resilience: [] };
    list.forEach((r) => out[RULE_TYPE_META[r.type].group].push(r));
    return out;
  }, [list]);

  function handleCreate(s: RuleEditorState) {
    createRule.mutate(
      {
        name: s.name,
        type: s.type,
        scope_type: s.scope_type,
        scope_id: s.scope_id,
        params: s.params,
        enabled: s.enabled,
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  }

  function handleEdit(s: RuleEditorState) {
    if (!editTarget) return;
    updateRule.mutate(
      {
        id: editTarget.id,
        payload: {
          name: s.name,
          type: s.type,
          scope_type: s.scope_type,
          scope_id: s.scope_id,
          params: s.params,
          enabled: s.enabled,
        },
      },
      { onSuccess: () => setEditTarget(null) },
    );
  }

  function toggleEnabled(rule: Rule) {
    updateRule.mutate({ id: rule.id, payload: { enabled: !rule.enabled } });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground">Organizational Resilience Policies</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {activeRules.length}/{list.length} active · {totalViolations} open violation{totalViolations !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 h-9 px-4">
          <Plus className="size-4" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-5">
        {(["capability", "resilience"] as const).map((groupKey) => {
          const groupRules = grouped[groupKey];
          const g = GROUP_META[groupKey];
          const Icon = g.Icon;
          return (
            <div key={groupKey} className="rounded-2xl border border-border/60 overflow-hidden shadow-sm">
              <div className={cn("px-5 py-3.5 border-b flex items-center gap-3", g.headerBg, g.headerBorder)}>
                <Icon className={cn("size-4 shrink-0", g.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[13px] font-semibold", g.textColor)}>{g.label}</p>
                  <p className="text-[11px] text-muted-foreground">{g.description}</p>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                  {groupRules.filter((r) => r.enabled).length}/{groupRules.length} active
                </span>
              </div>
              {groupRules.length === 0 ? (
                <div className="px-5 py-5 text-center text-[12px] text-muted-foreground">
                  No rules in this group — add one above.
                </div>
              ) : (
                <div className="p-4 grid grid-cols-2 gap-3">
                  {groupRules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      violationCount={violationCountByRule.get(rule.id) ?? 0}
                      onToggle={() => toggleEnabled(rule)}
                      onEdit={() => setEditTarget(rule)}
                      onDelete={() => {
                        if (window.confirm(`Delete rule "${rule.name}"?`)) deleteRule.mutate(rule.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <RuleEditorSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={emptyEditor()}
        onSubmit={handleCreate}
        isPending={createRule.isPending}
        title="Create Rule"
      />

      <RuleEditorSheet
        open={editTarget !== null}
        onOpenChange={(v) => !v && setEditTarget(null)}
        initial={editTarget ? fromRule(editTarget) : emptyEditor()}
        onSubmit={handleEdit}
        isPending={updateRule.isPending}
        title="Edit Rule"
      />
    </div>
  );
}
