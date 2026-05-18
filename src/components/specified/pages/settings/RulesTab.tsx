import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldLabel, FieldTitle, FieldDescription } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import SelectInput from "@/components/common/inputs/SelectInput";
import SearchBar from "@/components/common/inputs/SearchBar";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SecondaryCard from "@/components/common/cards/SecondaryCard";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton";
import Feedback from "@/components/common/feedbacks/Feedback";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog";
import {
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Pencil,
  Building2,
  FolderKanban,
  UsersRound,
  Layers,
  Zap,
  Shield,
} from "lucide-react";
import DefaultRulesContainer from "./rulesTab/DefaultRulesContainer";
import useGetRules from "@/api/rules/useGetRules";
import useCreateRule from "@/api/rules/useCreateRule";
import useUpdateRule from "@/api/rules/useUpdateRule";
import useDeleteRule from "@/api/rules/useDeleteRule";
import useGetRuleViolations from "@/api/rules/useGetRuleViolations";
import useGetSkills from "@/api/skills/useGetSkills";
import useGetProjects from "@/api/projects/useGetProjects";

// ─── Static metadata ──────────────────────────────────────────────────────────

type RuleGroup = "capability" | "resilience";

const RULE_TYPE_META: Record<RuleType, { label: string; description: string; group: RuleGroup }> = {
  bus_factor: {
    label: "Bus Factor",
    description: "Flag projects too dependent on a small number of people",
    group: "resilience",
  },
  min_skill: {
    label: "Minimum Skill Coverage",
    description: "Require N people at level L+ for a given skill",
    group: "capability",
  },
  min_coverage: {
    label: "Skill Coverage Ratio",
    description: "Require a minimum % of team members to cover a skill",
    group: "capability",
  },
  role_redundancy: {
    label: "Role Redundancy",
    description: "Require a minimum number of people in a given role",
    group: "resilience",
  },
};

const SCOPE_META: Record<RuleScopeType, { label: string; icon: typeof Building2; description: string }> = {
  organization: { label: "Organization", icon: Building2, description: "Applies to the entire org" },
  project: { label: "Project", icon: FolderKanban, description: "Applies to one specific project" },
  department: { label: "Department", icon: UsersRound, description: "Applies to one department" },
};

const GROUP_META: Record<RuleGroup, { label: string; description: string; icon: typeof Layers }> = {
  capability: {
    label: "Capability",
    description: "Skill coverage and expertise requirements",
    icon: Layers,
  },
  resilience: {
    label: "Resilience",
    description: "Dependency limits and concentration thresholds",
    icon: Zap,
  },
};

type FilterKey = "ALL" | RuleGroup;

// ─── Defaults / formatting ────────────────────────────────────────────────────

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

// ─── Editor state ─────────────────────────────────────────────────────────────

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

// ─── Params editor ────────────────────────────────────────────────────────────

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
            <FieldDescription>
              Share of team members who must hold the skill at the configured KCI level.
            </FieldDescription>
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

// ─── Scope picker ─────────────────────────────────────────────────────────────

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
        <RadioGroup
          value={state.scope_type}
          onValueChange={(v) => {
            const s = v as RuleScopeType;
            setState({ ...state, scope_type: s, scope_id: s === "organization" ? null : state.scope_id });
          }}
          className="grid-cols-3"
        >
          {(["organization", "project", "department"] as RuleScopeType[]).map((s) => {
            const cfg = SCOPE_META[s];
            const Icon = cfg.icon;
            return (
              <FieldLabel key={s} htmlFor={`scope-${s}`} className="cursor-pointer">
                <Field className="relative">
                  <div className="flex items-center gap-2 pr-6">
                    <Icon className="size-4 text-muted-foreground group-has-data-checked/field-label:text-primary" />
                    <FieldTitle>{cfg.label}</FieldTitle>
                  </div>
                  <FieldDescription>{cfg.description}</FieldDescription>
                  <RadioGroupItem value={s} id={`scope-${s}`} className="absolute top-2.5 right-2.5 w-4!" />
                </Field>
              </FieldLabel>
            );
          })}
        </RadioGroup>
      </Field>

      {state.scope_type === "project" && (
        <Field>
          <FieldLabel>Target project</FieldLabel>
          <SelectInput
            value={state.scope_id === null ? "" : String(state.scope_id)}
            onChange={(e) => setState({ ...state, scope_id: e.target.value === "" ? null : Number(e.target.value) })}
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
            onChange={(e) => setState({ ...state, scope_id: e.target.value === "" ? null : Number(e.target.value) })}
            placeholder="Department ID"
          />
          <FieldDescription>Department picker is not yet available — enter the ID directly for now.</FieldDescription>
        </Field>
      )}
    </>
  );
}

// ─── Editor sheet ─────────────────────────────────────────────────────────────

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

  const canSubmit = state.name.trim().length > 0 && (state.scope_type === "organization" || state.scope_id !== null);

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Rules trigger trajectory penalties when violated on a given day."
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
  isDeleting,
}: {
  rule: Rule;
  violationCount: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const meta = RULE_TYPE_META[rule.type];
  const scope = SCOPE_META[rule.scope_type];
  const ScopeIcon = scope.icon;

  return (
    <SecondaryCard
      className={cn("bg-tertiary p-3", !rule.enabled && "opacity-60")}
      before={
        <button
          onClick={onToggle}
          aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
          className={cn(
            "size-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0",
            rule.enabled
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/40 bg-transparent hover:border-muted-foreground",
          )}
        >
          {rule.enabled && <Check className="size-3" strokeWidth={3} />}
        </button>
      }
      title={
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold truncate">{rule.name}</span>
          {violationCount > 0 && (
            <Badge variant="destructive" className="shrink-0">
              <AlertTriangle />
              {violationCount}
            </Badge>
          )}
        </div>
      }
      description={
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-[11px] text-muted-foreground">{formatParams(rule)}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-muted-foreground">
              {meta.label}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <ScopeIcon />
              {scope.label}
              {rule.scope_id !== null && ` #${rule.scope_id}`}
            </Badge>
          </div>
        </div>
      }
      action={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="hover:bg-card">
            <Pencil />
          </Button>
          <ComposedAlertDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            trigger={
              <Button variant="destructive" size="icon" disabled={isDeleting}>
                <Trash2 />
              </Button>
            }
            title={`Delete rule "${rule.name}"?`}
            description="This will permanently delete the rule and its violation history."
            confirmLabel="Delete"
            pendingLabel="Deleting…"
            isPending={isDeleting}
            variant="destructive"
            onConfirm={() => {
              onDelete();
              setConfirmOpen(false);
            }}
          />
        </div>
      }
    />
  );
}

RuleCard.Skeleton = function RuleCardSkeleton() {
  return (
    <div className="rounded-xl bg-tertiary p-3 flex items-center gap-3">
      <Skeleton className="size-5 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-8 rounded-md shrink-0" />
        <Skeleton className="size-8 rounded-md shrink-0" />
      </div>
    </div>
  );
};

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function RulesTab() {
  const { data: rules, isLoading } = useGetRules();
  const { data: violations } = useGetRuleViolations();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Rule | null>(null);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");

  const violationCountByRule = useMemo(() => {
    const map = new Map<number, number>();
    (violations ?? []).forEach((v) => map.set(v.rule_id, (map.get(v.rule_id) ?? 0) + 1));
    return map;
  }, [violations]);

  const list = rules ?? [];
  const totalViolations = violations?.length ?? 0;

  const countsByGroup = useMemo(() => {
    const out: Record<RuleGroup, { total: number; active: number }> = {
      capability: { total: 0, active: 0 },
      resilience: { total: 0, active: 0 },
    };
    list.forEach((r) => {
      const g = RULE_TYPE_META[r.type].group;
      out[g].total++;
      if (r.enabled) out[g].active++;
    });
    return out;
  }, [list]);

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      if (filter !== "ALL" && RULE_TYPE_META[r.type].group !== filter) return false;
      if (q && !r.name.toLowerCase().includes(q) && !RULE_TYPE_META[r.type].label.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [list, filter, search]);

  const activeRules = list.filter((r) => r.enabled);
  const scopeTitle = filter === "ALL" ? "Custom extra rules" : GROUP_META[filter].label;

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

  const isEmpty = !isLoading && list.length === 0;
  const noMatches = !isLoading && list.length > 0 && filteredRules.length === 0;

  return (
    <div className="space-y-5">
      <DefaultRulesContainer />
      <div className="flex gap-4 items-start">
        {/* Left — Filter rail */}
        <ComposedCard title="Groups" className="w-64 shrink-0">
          <div className="flex flex-col mb-2" style={{ minHeight: "440px" }}>
            <FilterItem
              label="All rules"
              icon={Shield}
              active={filter === "ALL"}
              onSelect={() => setFilter("ALL")}
              count={list.length}
              activeCount={activeRules.length}
            />
            <div className="h-px bg-border/60 my-2" />
            <div className="flex-1 space-y-1">
              {(["capability", "resilience"] as const).map((g) => (
                <FilterItem
                  key={g}
                  label={GROUP_META[g].label}
                  description={GROUP_META[g].description}
                  icon={GROUP_META[g].icon}
                  active={filter === g}
                  onSelect={() => setFilter(g)}
                  count={countsByGroup[g].total}
                  activeCount={countsByGroup[g].active}
                />
              ))}
            </div>
          </div>
          <SecondaryButton onClick={() => setCreateOpen(true)}>
            <Plus className="size-3 mb-0.5" />
            Add new rule
          </SecondaryButton>
        </ComposedCard>

        {/* Right — Rules grid */}
        <ComposedCard
          title={scopeTitle}
          className="flex-1 h-auto"
          action={
            isEmpty ? null : (
              <div className="flex items-center gap-2">
                <SearchBar value={search} onChange={setSearch} size="sm" />
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="size-3.5" />
                  Add Rule
                </Button>
              </div>
            )
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{activeRules.length}</span>/{list.length} active
              </span>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <span className={cn(totalViolations > 0 && "text-destructive font-medium")}>
                {totalViolations} open violation{totalViolations !== 1 ? "s" : ""}
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RuleCard.Skeleton key={i} />
                ))}
              </div>
            ) : isEmpty ? (
              <Feedback
                variant="warning"
                title="No rules yet"
                description="Define your first resilience policy to start tracking organizational fragility."
                className="h-96"
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-3.5" />
                    Add your first rule
                  </Button>
                }
              />
            ) : noMatches ? (
              <Feedback
                variant="warning"
                title="No matching rules"
                description="Try a different search term or group filter."
                className="h-96"
                action={
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearch("");
                      setFilter("ALL");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredRules.map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    violationCount={violationCountByRule.get(rule.id) ?? 0}
                    onToggle={() => toggleEnabled(rule)}
                    onEdit={() => setEditTarget(rule)}
                    onDelete={() => deleteRule.mutate(rule.id)}
                    isDeleting={deleteRule.isPending && deleteRule.variables === rule.id}
                  />
                ))}
              </div>
            )}
          </div>
        </ComposedCard>
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

// ─── Filter item (left rail) ──────────────────────────────────────────────────

function FilterItem({
  label,
  description,
  icon: Icon,
  active,
  onSelect,
  count,
  activeCount,
}: {
  label: string;
  description?: string;
  icon: typeof Layers;
  active: boolean;
  onSelect: () => void;
  count: number;
  activeCount: number;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer",
        active ? "bg-primary/10 text-primary" : "hover:bg-tertiary text-foreground",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate">{label}</p>
        {description && <p className="text-[10.5px] text-muted-foreground truncate font-normal">{description}</p>}
      </div>
      <span
        className={cn(
          "text-[11px] tabular-nums font-medium shrink-0",
          active ? "text-primary" : "text-muted-foreground/60",
        )}
      >
        {activeCount}/{count}
      </span>
    </button>
  );
}
