import { Badge } from "@/components/ui/badge.tsx";
import { COVERAGE_COLORS_CLASSNAMES, COVERAGE_LABEL } from "@/lib/skill/skillCoverage.ts";

interface SkillCoverageStatusBadgeProps {
  status: ProjectKnowledgeCoverageStatus;
}

export default function SkillCoverageStatusBadge({ status }: SkillCoverageStatusBadgeProps) {
  return <Badge className={COVERAGE_COLORS_CLASSNAMES[status]}>{COVERAGE_LABEL[status]}</Badge>;
}
