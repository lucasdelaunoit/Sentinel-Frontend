import { Badge } from "@/components/ui/badge.tsx";

interface SkillCategoryBadgeProps {
  category: SkillCategory;
}

export default function SkillCategoryBadge({ category }: SkillCategoryBadgeProps) {
  return (
    <Badge variant="secondary" className="mt-1 bg-border">
      {category.name}
    </Badge>
  );
}
