import { Badge } from "@/components/ui/badge.tsx";
import { COVERAGE_BADGE, COVERAGE_LABEL } from "@/lib/theme/skillCoverage.ts";

interface SkillCoverageStatusBadgeProps {
  status: ProjectKnowledgeCoverageStatus;
}

export default function SkillCoverageStatusBadge({ status }: SkillCoverageStatusBadgeProps) {
  return <Badge className={COVERAGE_BADGE[status]}>{COVERAGE_LABEL[status]}</Badge>;
}
