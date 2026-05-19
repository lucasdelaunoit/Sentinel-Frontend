type UpdateOrganizationSettingsRequest = Partial<
  Pick<
    OrganizationSettings,
    | "name"
    | "fragility_tolerance"
    | "fragility_weight_bus_factor"
    | "fragility_weight_uncovered_skills"
    | "fragility_weight_silos"
    | "fragility_weight_absence_impact"
    | "silo_threshold"
    | "kci_min_level"
    | "absence_horizon_days"
    | "critical_bus_factor_threshold"
    | "rule_violation_penalty"
  >
>;
