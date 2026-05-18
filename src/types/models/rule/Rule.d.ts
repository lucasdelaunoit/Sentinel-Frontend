type RuleType = "bus_factor" | "min_skill" | "min_coverage" | "role_redundancy";
type RuleScopeType = "organization" | "project" | "department";

interface BusFactorRuleParams {
  max_bus_factor: number;
}

interface MinSkillRuleParams {
  skill_id: number;
  min_level: number;
  min_count: number;
}

interface MinCoverageRuleParams {
  skill_id: number;
  min_pct: number;
}

interface RoleRedundancyRuleParams {
  role: string;
  min_count: number;
}

type RuleParamsByType = {
  bus_factor: BusFactorRuleParams;
  min_skill: MinSkillRuleParams;
  min_coverage: MinCoverageRuleParams;
  role_redundancy: RoleRedundancyRuleParams;
};

type AnyRuleParams =
  | BusFactorRuleParams
  | MinSkillRuleParams
  | MinCoverageRuleParams
  | RoleRedundancyRuleParams;

interface Rule {
  id: number;
  name: string;
  type: RuleType;
  scope_type: RuleScopeType;
  scope_id: number | null;
  params: AnyRuleParams;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
