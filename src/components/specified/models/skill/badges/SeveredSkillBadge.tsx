import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { SEVERITY_COLORS } from "@/lib/severity.ts";

interface SeveredSkillBadgeProps {
  name: string;
  severity?: Severity;
  className?: string;
}

export default function SeveredSkillBadge({ name, severity, className }: SeveredSkillBadgeProps) {
  const color = severity ? SEVERITY_COLORS[severity] : undefined;

  return (
    <Badge variant="outline" className={cn("text-[11px] gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full", color ? `bg-${color.backgroundColor}` : "bg-muted-foreground")} />
      {name}
    </Badge>
  );
}
