type UpdateOrganizationSettingsRequest = Partial<
  Pick<
    OrganizationSettings,
    | "name"
    | "risk_tolerance"
    | "risk_weight_bus_factor"
    | "risk_weight_uncovered_skills"
    | "risk_weight_silos"
    | "risk_weight_absence_impact"
    | "silo_threshold"
    | "kci_min_level"
    | "health_risk_weight"
    | "absence_horizon_days"
    | "critical_bus_factor_threshold"
  >
>;
