import type { RiskEventKind, RiskEventOrgImpact, RiskEventSeverity } from "@/types/dashboard";

export interface UpcomingRiskEvent {
  id: string;
  date: string;
  employee: { id: string; firstname: string; lastname: string };
  kind: RiskEventKind;
  severity: RiskEventSeverity;
  org_impact: RiskEventOrgImpact;
  affected_projects: RiskEventProjectImpact[];
}
