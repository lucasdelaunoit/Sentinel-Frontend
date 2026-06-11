import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { SEVERITY_BG } from "@/lib/theme/severity.ts";

interface SeveredSkillBadgeProps {
  name: string;
  severity?: Severity;
  className?: string;
}

export default function SeveredSkillBadge({ name, severity, className }: SeveredSkillBadgeProps) {
  return (
    <Badge variant="outline" className={cn("text-[11px] gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full", severity ? SEVERITY_BG[severity] : "bg-muted-foreground")} />
      {name}
    </Badge>
  );
}
