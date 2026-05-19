type FragilityTolerance = "conservative" | "balanced" | "aggressive";

interface OrganizationSettings {
  id: number;
  name: string;
  fragility_tolerance: FragilityTolerance;

  // Metrics config — drives RiskCalculationService + HealthService.
  fragility_weight_bus_factor: number;
  fragility_weight_uncovered_skills: number;
  fragility_weight_silos: number;
  fragility_weight_absence_impact: number;
  silo_threshold: number;
  kci_min_level: number;
  absence_horizon_days: number;
  critical_bus_factor_threshold: number;
  rule_violation_penalty: number;
}
