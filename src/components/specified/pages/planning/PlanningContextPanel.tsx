import { CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SecondaryCard from "@/components/common/cards/SecondaryCard";
import Feedback from "@/components/common/feedbacks/Feedback";
import { blockDurationLabel, formatHalfDate } from "@/utils/planning/calendar";
import ImpactBadge from "./badges/ImpactBadge";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import ProjectsImpactCard from "@/components/specified/pages/planning/impact/ProjectsImpactCard.tsx";
import SkillImpactCard from "@/components/specified/pages/planning/impact/SkillImpactCard.tsx";
import HotspotsImpactCard from "@/components/specified/pages/planning/impact/HotspotsImpactCard.tsx";
import RecommandationsImpactCard from "@/components/specified/pages/planning/impact/RecommandationsImpactCard.tsx";
import WarningsImpactCard from "@/components/specified/pages/planning/impact/WarningsImpactCard.tsx";

type PanelLayout = "side" | "below";

interface PlanningContextPanelProps {
  mode: PlanningMode;
  users: PlanningUser[];
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onClearAll: () => void;
  combined: SimulateResponse;
  layout?: PanelLayout;
}

export default function PlanningContextPanel({
  users,
  simBlocks,
  onSelectBlock,
  onRemoveBlock,
  onClearAll,
  combined,
  layout = "side",
}: PlanningContextPanelProps) {
  return (
    <SimulatePanel
      users={users}
      simBlocks={simBlocks}
      onSelectBlock={onSelectBlock}
      onRemoveBlock={onRemoveBlock}
      onClearAll={onClearAll}
      combined={combined}
      layout={layout}
    />
  );
}

function panelContainerClass(_layout: PanelLayout): string {
  return "flex flex-col gap-4";
}

function resultsContainerClass(layout: PanelLayout): string {
  return layout === "below"
    ? "columns-1 md:columns-2 2xl:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid"
    : "flex flex-col gap-4";
}

PlanningContextPanel.Skeleton = function PlanningContextPanelSkeleton({ layout = "below" }: { layout?: PanelLayout }) {
  return (
    <div className={panelContainerClass(layout)}>
      <ComposedCard
        title={<Skeleton className="h-4 w-24" />}
        action={<Skeleton className="h-4 w-12" />}
        className="gap-0"
      >
        <div className="space-y-3 pt-3">
          <Skeleton className="h-8 w-full rounded-xl" />
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </ComposedCard>
    </div>
  );
};

/* ─────────────────────── Simulate mode ─────────────────────── */

function SimulatePanel({
  users,
  simBlocks,
  onSelectBlock,
  onRemoveBlock,
  onClearAll,
  combined,
  layout,
}: {
  users: PlanningUser[];
  simBlocks: SimBlock[];
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onClearAll: () => void;
  combined: SimulateResponse;
  layout: PanelLayout;
}) {
  const usersById = new Map(users.map((u) => [u.id, u]));
  const hasData = simBlocks.length > 0;

  return (
    <div className={panelContainerClass(layout)}>
      <ComposedCard
        title={
          <span className="flex items-center gap-2">
            <span className="text-planned">Scenario</span>
            {hasData && (
              <Badge variant="secondary" className="bg-planned/20 text-planned">
                {simBlocks.length}
              </Badge>
            )}
          </span>
        }
        action={
          hasData ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-7 px-2 text-[11px] text-planned/70 hover:text-destructive-foreground"
            >
              Clear all
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-3">
          {hasData ? (
            <div className="max-h-64 overflow-y-auto space-y-1.5 -mr-2 pr-2">
              {simBlocks.map((block) => {
                const user = usersById.get(block.userId);
                const impact = combined.per_user_impact[block.userId];

                return (
                  <SecondaryCard
                    key={block.id}
                    onClick={() => onSelectBlock(block.id)}
                    before={
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full shrink-0 bg-planned" />
                        <UserAvatar firstname={user?.firstname} lastname={user?.lastname} variant={user.status} />
                      </div>
                    }
                    title={user ? `${user.firstname} ${user.lastname}` : "Unknown"}
                    description={`${formatHalfDate(block.startDate, block.startHalf)} – ${formatHalfDate(block.endDate, block.endHalf)} · ${blockDurationLabel(block)}`}
                    action={
                      <div className="flex items-center gap-1.5">
                        {impact && <ImpactBadge level={impact.level} />}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveBlock(block.id);
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    }
                    className="bg-tertiary"
                  />
                );
              })}
            </div>
          ) : (
            <Feedback variant="info" title="No absences simulated" description="Add employees above to begin." />
          )}
        </div>
      </ComposedCard>

      {hasData && (
        <div className={resultsContainerClass(layout)}>
          <ProjectsImpactCard projects={combined.per_project_impact} />
          <SkillImpactCard skills={combined.per_skill_impact} />
          <HotspotsImpactCard hotspots={combined.hotspots} usersById={usersById} />
          <RecommandationsImpactCard recs={combined.recommendations} />
          <WarningsImpactCard warnings={combined.warnings} />
        </div>
      )}
    </div>
  );
}

export { CheckCircle2 };
