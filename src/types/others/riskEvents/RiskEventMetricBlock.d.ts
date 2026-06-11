/** A single metric's before/after with tier + severity. Fragility: higher worse. Coverage: lower worse. */
interface RiskEventMetricBlock {
  before: number;
  after: number;
  delta: number;
  tier: string;
  tier_label: string;
  severity: Severity;
}
