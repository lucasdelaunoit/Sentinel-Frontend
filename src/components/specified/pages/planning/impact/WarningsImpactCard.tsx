import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";

function severityBadgeVariant(sev: PlanningSeverity): "default" | "secondary" | "destructive" | "outline" {
  if (sev === "critical" || sev === "high") return "destructive";
  if (sev === "medium") return "outline";
  return "secondary";
}

export default function WarningsImpactCard({ warnings }: { warnings: SimWarning[] }) {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Warnings</span>
          <CountDisplay count={warnings.length} />
        </div>
      }
    >
      {warnings.length === 0 ? (
        <Feedback variant="success" title="No project impact" description="All skills remain covered." />
      ) : (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <SecondaryCard
              key={i}
              before={
                <ShieldAlert
                  className={cn(
                    "size-4",
                    w.severity === "critical" || w.severity === "high" ? "text-destructive-foreground" : "text-warning",
                  )}
                />
              }
              title={w.code.replace(/_/g, " ")}
              description={w.message}
              action={
                <Badge variant={severityBadgeVariant(w.severity)} className="text-[10px] uppercase">
                  {w.severity}
                </Badge>
              }
            />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}
