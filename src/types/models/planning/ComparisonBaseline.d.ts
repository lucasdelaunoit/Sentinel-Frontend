interface ComparisonBaseline {
  risk_score: { before: number; after: number; delta_pct: number };
  bus_factor: { before: number; after: number };
  coverage_pct: { before: number; after: number };
  projects_healthy_count: { before: number; after: number };
}
