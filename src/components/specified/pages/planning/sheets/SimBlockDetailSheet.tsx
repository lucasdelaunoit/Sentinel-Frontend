import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import type { PlanningUser, ProjectImpact, SimBlock } from "@/types/planning";
import { blockDurationLabel, formatHalfDate } from "@/utils/planning/calendar";
import { IMPACT_THEME, simColor } from "@/utils/planning/theme";
import ImpactBadge from "../badges/ImpactBadge";
import useSimulatePlanning from "@/api/planning/useSimulatePlanning";

interface SimBlockDetailSheetProps {
  block: SimBlock;
  user: PlanningUser;
  onClose: () => void;
  onDelete: () => void;
}

export default function SimBlockDetailSheet({ block, user, onClose, onDelete }: SimBlockDetailSheetProps) {
  const color = simColor(block.colorIdx);

  const absences = useMemo(
    () => [
      {
        user_id: block.userId,
        start_date: block.startDate,
        start_half: block.startHalf,
        end_date: block.endDate,
        end_half: block.endHalf,
      },
    ],
    [block],
  );
  const { data } = useSimulatePlanning(absences, block.endDate >= block.startDate, { debounceMs: 0 });
  const { projects, overall_level } = data;

  return (
    <ComposedSheet
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`${user.firstname} ${user.lastname}`}
      description={`${user.department?.name ?? user.title} · Absence simulation`}
      maxWidth="sm:max-w-[440px]"
      footer={
        <Button
          variant="ghost"
          onClick={onDelete}
          className="w-full text-muted-foreground hover:text-destructive-foreground hover:bg-destructive rounded-xl h-9 text-[12px] gap-1.5"
        >
          <Trash2 className="size-3.5" /> Remove simulation block
        </Button>
      }
    >
      <div
        className="rounded-xl border-2 border-dashed p-4 space-y-2.5"
        style={{ background: color.bg, borderColor: color.border, color: color.fg }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider">Simulated Absence Period</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
          <span className="opacity-70">From</span>
          <span className="font-semibold text-right">{formatHalfDate(block.startDate, block.startHalf)}</span>
          <span className="opacity-70">To</span>
          <span className="font-semibold text-right">{formatHalfDate(block.endDate, block.endHalf)}</span>
          <span className="opacity-70">Duration</span>
          <span className="font-semibold text-right">{blockDurationLabel(block)}</span>
        </div>
      </div>

      <div className={cn("flex items-center gap-3 rounded-xl border p-3.5", IMPACT_THEME[overall_level].bg, IMPACT_THEME[overall_level].border)}>
        <ImpactBadge level={overall_level} size="md" />
        <span className="text-[12px] text-muted-foreground">
          {overall_level === "critical"
            ? "Key skills will be uncovered."
            : overall_level === "warning"
              ? "Some skills may be at risk."
              : "All required skills are covered."}
        </span>
      </div>

      {projects.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Project Impact ({projects.length})
          </p>
          {projects.map((p) => (
            <ProjectImpactCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </ComposedSheet>
  );
}

function ProjectImpactCard({ project }: { project: ProjectImpact }) {
  const theme = IMPACT_THEME[project.level];
  return (
    <div className={cn("rounded-xl border p-3.5 space-y-2", theme.bg, theme.border)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("size-2 rounded-full shrink-0", theme.dot)} />
          <span className="text-[13px] font-semibold text-foreground truncate">{project.name}</span>
        </div>
        <ImpactBadge level={project.level} />
      </div>
      {project.uncovered_skills.length > 0 && (
        <p className="text-[11px] text-destructive-foreground">
          <span className="font-semibold">Uncovered: </span>
          {project.uncovered_skills.join(", ")}
        </p>
      )}
      {project.siloed_skills.length > 0 && (
        <p className="text-[11px] text-warning">
          <span className="font-semibold">At risk: </span>
          {project.siloed_skills.join(", ")}
        </p>
      )}
      {project.safe_skills.length > 0 && (
        <p className="text-[11px] text-success">
          <span className="font-semibold">Covered: </span>
          {project.safe_skills.join(", ")}
        </p>
      )}
    </div>
  );
}
