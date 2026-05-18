interface Scenario {
  id: string;
  label: string;
  description: string;
  team: ScenarioMember[];
  project: ScenarioProject;
  excludes: string[];
}
