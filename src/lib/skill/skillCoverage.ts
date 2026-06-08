interface CoverageColor {
  foregroundColor: string;
  backgroundColor: string;
}

export const COVERAGE_LABEL: Record<ProjectKnowledgeCoverageStatus, string> = {
  uncovered: "Uncovered",
  silo: "Knowledge Silo",
  covered: "Covered",
};

export const COVERAGE_COLORS: Record<ProjectKnowledgeCoverageStatus, CoverageColor> = {
  uncovered: { backgroundColor: "danger", foregroundColor: "background" },
  silo: { backgroundColor: "warning", foregroundColor: "background" },
  covered: { backgroundColor: "success", foregroundColor: "background" },
};

export const COVERAGE_COLORS_CLASSNAMES = Object.fromEntries(
  Object.entries(COVERAGE_COLORS).map(([severity, color]) => [
    severity,
    `text-${color.foregroundColor} bg-${color.backgroundColor}`,
  ]),
) as Record<Severity, string>;
