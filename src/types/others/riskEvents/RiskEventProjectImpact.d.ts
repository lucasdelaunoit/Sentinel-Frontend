/** Per-project operational impact of one absence (backend strips `severity` before sending). */
interface RiskEventProjectImpact {
  id: string;
  name: string;
  fragility_before: number;
  fragility_after: number;
  coverage_before: number;
  coverage_after: number;
  bus_factor_before: number;
  bus_factor_after: number;
  lost_skills: string[];
}
