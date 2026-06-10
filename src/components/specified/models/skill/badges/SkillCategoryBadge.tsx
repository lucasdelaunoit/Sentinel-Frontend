import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";

interface SkillCategoryBadgeProps {
  category: Pick<SkillCategory, "name">;
  className?: string;
}

export default function SkillCategoryBadge({ category, className }: SkillCategoryBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("mt-1 bg-border", className)}>
      {category.name}
    </Badge>
  );
}
