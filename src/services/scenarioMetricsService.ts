import type { OrgFormFields } from "@/components/specified/pages/settings/organizationTab/types";

export const TOLERANCE_CEILING: Record<OrgFormFields["fragility_tolerance"], number> = {
  conservative: 40,
  balanced: 60,
  aggressive: 80,
};

export function computeScenarioMetrics(
  scenario: Scenario,
  form: OrgFormFields,
  exclude: string[] = [],
): ScenarioMetrics {
  const { team, project } = scenario;
  const active = team.filter((m) => !exclude.includes(m.name));
  const coverage = project.requiredSkills.map(
    (skill) => active.filter((m) => (m.skills[skill] ?? 0) >= form.kci_min_level).length,
  );

  const uncovered = coverage.filter((c) => c === 0).length;
  const silos = coverage.filter((c) => c > 0 && c <= form.silo_threshold).length;
  const covered = coverage.filter((c) => c > 0);
  const busFactor = covered.length > 0 ? Math.min(...covered) : 0;
  const total = project.requiredSkills.length || 1;

  const totalW =
    form.fragility_weight_bus_factor +
    form.fragility_weight_uncovered_skills +
    form.fragility_weight_silos +
    form.fragility_weight_absence_impact;

  const busRisk =
    busFactor === 0
      ? 1
      : busFactor <= form.critical_bus_factor_threshold
        ? 1
        : Math.max(0, 1 - (busFactor - form.critical_bus_factor_threshold) / 3);
  const absenceRisk = exclude.length > 0 ? Math.min(1, exclude.length / Math.max(1, team.length / 2)) : 0;

  const riskNormalized =
    totalW === 0
      ? 0
      : (busRisk * form.fragility_weight_bus_factor +
          (uncovered / total) * form.fragility_weight_uncovered_skills +
          (silos / total) * form.fragility_weight_silos +
          absenceRisk * form.fragility_weight_absence_impact) /
        totalW;

  const riskScore = Math.round(riskNormalized * 100);
  const healthScore = Math.round(
    ((100 - riskScore) * form.trajectory_fragility_weight +
      project.progress * (100 - form.trajectory_fragility_weight)) /
      100,
  );

  return {
    busFactor,
    uncovered,
    silos,
    riskScore,
    healthScore,
    critical: busFactor <= form.critical_bus_factor_threshold,
  };
}
