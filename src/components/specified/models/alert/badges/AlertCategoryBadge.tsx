import { Badge } from "@/components/ui/badge.tsx";
import { capitalize } from "@/utils/formatters/string.ts";
import { cn } from "@/lib/utils.ts";
import { SEVERITY_COLORS_CLASSNAMES } from "@/lib/severity.ts";

interface RecommendationPriorityBadgeProps {
  category: string;
  severity: Severity;
}

export default function AlertCategoryBadge({ category, severity }: RecommendationPriorityBadgeProps) {
  return <Badge className={cn(SEVERITY_COLORS_CLASSNAMES[severity])}>{capitalize(category)}</Badge>;
}
