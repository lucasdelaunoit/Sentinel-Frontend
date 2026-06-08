import { Badge } from "@/components/ui/badge.tsx";
import { COVERAGE_COLORS_CLASSNAMES, COVERAGE_LABEL } from "@/lib/skill/skillCoverage.ts";

interface SkillCoverageStatusBadgeProps {
  skillCoverage: ProjectSkillCoverageStatus;
}

export default function SkillCoverageStatusBadge({ skillCoverage }: SkillCoverageStatusBadgeProps) {
  return (
    <Badge className={COVERAGE_COLORS_CLASSNAMES[skillCoverage.status]}>{COVERAGE_LABEL[skillCoverage.status]}</Badge>
  );
}
