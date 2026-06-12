import { Badge } from "@/components/ui/badge.tsx";
import { capitalize } from "@/utils/formatters/string.ts";
import { cn } from "@/lib/utils.ts";
import { SEVERITY_BADGE } from "@/lib/theme/severity.ts";

interface AlertCategoryBadgeProps {
  category: string;
  severity: Severity;
}

export default function AlertCategoryBadge({ category, severity }: AlertCategoryBadgeProps) {
  return <Badge className={cn(SEVERITY_BADGE[severity])}>{capitalize(category)}</Badge>;
}
