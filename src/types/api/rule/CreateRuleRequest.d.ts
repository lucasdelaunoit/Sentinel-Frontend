interface CreateRuleRequest {
  name: string;
  type: RuleType;
  scope_type: RuleScopeType;
  scope_id: number | null;
  params: AnyRuleParams;
  enabled: boolean;
}
