type UpdateOrganizationSettingsRequest = Partial<
  Pick<
    OrganizationSettings,
    "name" | "industry" | "size" | "location" | "methodology" | "team_structure" | "risk_tolerance"
  >
>;
