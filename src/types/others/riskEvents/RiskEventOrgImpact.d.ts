/** Dual-scope headline. `affected` = avg over the person's projects (punchy). `org` = whole-org avg (honest). */
interface RiskEventOrgImpact {
  affected: RiskEventScopeImpact;
  org: RiskEventScopeImpact;
}
