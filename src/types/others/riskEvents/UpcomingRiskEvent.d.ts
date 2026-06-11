interface UpcomingRiskEvent {
  id: string;
  date: string;
  employee: { id: string; firstname: string; lastname: string };
  kind: RiskEventKind;
  severity: Severity;
  org_impact: RiskEventOrgImpact;
  affected_projects: RiskEventProjectImpact[];
}
