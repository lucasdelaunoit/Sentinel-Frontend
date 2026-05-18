type RiskTolerance = "conservative" | "balanced" | "aggressive";

interface OrganizationSettings {
  id: number;
  name: string;
  risk_tolerance: RiskTolerance;
  working_days: number[];

  // Metrics config — drives RiskCalculationService + HealthService.
  risk_weight_bus_factor: number;
  risk_weight_uncovered_skills: number;
  risk_weight_silos: number;
  risk_weight_absence_impact: number;
  silo_threshold: number;
  kci_min_level: number;
  health_risk_weight: number;
  absence_horizon_days: number;
  critical_bus_factor_threshold: number;
}
