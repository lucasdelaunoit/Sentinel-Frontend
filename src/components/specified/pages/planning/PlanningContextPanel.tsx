import { CheckCircle2, Play, Plus, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanningMode, PlanningUser, ProjectImpact, SimBlock, SimulateResponse } from "@/types/planning";
import { MONTH_NAMES, blockDurationLabel, formatHalfDate } from "@/utils/planning/calendar";
import { getViewLeaves, isOnRealLeave } from "@/utils/planning/leaves";
import { ABSENCE_THEME, IMPACT_THEME, simColor } from "@/utils/planning/theme";
import ImpactBadge from "./badges/ImpactBadge";

type PanelLayout = "side" | "below";

interface PlanningContextPanelProps {
  mode: PlanningMode;
  users: PlanningUser[];
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  onOpenAddSheet: () => void;
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onClearAll: () => void;
  combined: SimulateResponse;
  layout?: PanelLayout;
}

export default function PlanningContextPanel({
  mode,
  users,
  simBlocks,
  viewYear,
  viewMonth,
  onOpenAddSheet,
  onSelectBlock,
  onRemoveBlock,
  onClearAll,
  combined,
  layout = "side",
}: PlanningContextPanelProps) {
  if (mode === "view") {
    return <ViewPanel users={users} viewYear={viewYear} viewMonth={viewMonth} layout={layout} />;
  }
  return (
    <SimulatePanel
      users={users}
      simBlocks={simBlocks}
      onOpenAddSheet={onOpenAddSheet}
      onSelectBlock={onSelectBlock}
      onRemoveBlock={onRemoveBlock}
      onClearAll={onClearAll}
      combined={combined}
      layout={layout}
    />
  );
}

function panelContainerClass(layout: PanelLayout): string {
  return layout === "below"
    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start"
    : "flex flex-col gap-4";
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</p>
  );
}

function ViewPanel({
  users,
  viewYear,
  viewMonth,
  layout,
}: {
  users: PlanningUser[];
  viewYear: number;
  viewMonth: number;
  layout: PanelLayout;
}) {
  const today = new Date();
  const todayInView = today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;
  const todayDay = todayInView ? today.getDate() : null;

  const totalEmps = users.length;
  const onLeaveToday =
    todayDay !== null ? users.filter((u) => isOnRealLeave(u, todayDay, viewYear, viewMonth)).length : null;
  const availableToday = onLeaveToday !== null ? totalEmps - onLeaveToday : null;
  const monthAbbr = MONTH_NAMES[viewMonth - 1].slice(0, 3);

  const upcomingLeaves = users
    .flatMap((u) =>
      getViewLeaves(u, viewYear, viewMonth)
        .filter((l) => todayDay === null || l.start >= todayDay)
        .map((l) => ({ user: u, leave: l })),
    )
    .sort((a, b) => a.leave.start - b.leave.start)
    .slice(0, 6);

  return (
    <div className={panelContainerClass(layout)}>
      <Card className="p-0 gap-0 overflow-hidden">
        <CardHeader className="px-5 py-4 border-b border-border/60 bg-muted/20">
          <SectionHeader>
            {todayDay !== null
              ? `Today — ${monthAbbr} ${todayDay}`
              : `${MONTH_NAMES[viewMonth - 1]} ${viewYear}`}
          </SectionHeader>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-3">
          <Row dot="bg-success" label="Available" value={availableToday} />
          <Row dot="bg-destructive-foreground" label="On Leave" value={onLeaveToday} />
          {availableToday !== null && totalEmps > 0 && (
            <>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${(availableToday / totalEmps) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {Math.round((availableToday / totalEmps) * 100)}% team available
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {upcomingLeaves.length > 0 && (
        <Card className="p-0 gap-0 overflow-hidden">
          <CardHeader className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <SectionHeader>Upcoming leaves</SectionHeader>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/40">
            {upcomingLeaves.map(({ user, leave }, i) => {
              const meta = ABSENCE_THEME[leave.type];
              return (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm",
                      user.color,
                    )}
                  >
                    {user.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {monthAbbr} {leave.start}–{leave.end}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("size-1.5 rounded-full", meta.dot)} />
                    <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

function Row({ dot, label, value }: { dot: string; label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn("size-2 rounded-full", dot)} />
        <span className="text-[13px] text-foreground">{label}</span>
      </div>
      <span className="text-[13px] font-bold text-foreground">{value !== null ? value : "—"}</span>
    </div>
  );
}

function SimulatePanel({
  users,
  simBlocks,
  onOpenAddSheet,
  onSelectBlock,
  onRemoveBlock,
  onClearAll,
  combined,
  layout,
}: {
  users: PlanningUser[];
  simBlocks: SimBlock[];
  onOpenAddSheet: () => void;
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onClearAll: () => void;
  combined: SimulateResponse;
  layout: PanelLayout;
}) {
  const usersById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className={panelContainerClass(layout)}>
      <Card className="p-0 gap-0 overflow-hidden border-planned/30 bg-planned/5">
        <CardHeader className="px-5 py-4 border-b border-planned/20 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-planned" />
            <p className="text-[13px] font-bold text-planned">Scenario</p>
            {simBlocks.length > 0 && (
              <span className="text-[10px] font-bold bg-planned/20 text-planned px-1.5 py-0.5 rounded-full">
                {simBlocks.length}
              </span>
            )}
          </div>
          {simBlocks.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-planned/70 hover:text-destructive-foreground transition-colors font-medium"
            >
              Clear all
            </button>
          )}
        </CardHeader>

        <CardContent className="px-5 py-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 rounded-xl h-8 px-3 text-[12px] font-semibold border-planned/30 text-planned hover:bg-planned/10 bg-card"
            onClick={onOpenAddSheet}
          >
            <Plus className="size-3.5" />
            Add absence
          </Button>
        </CardContent>

        {simBlocks.length > 0 ? (
          <div className="border-t border-planned/20 divide-y divide-planned/10">
            {simBlocks.map((block) => {
              const user = usersById.get(block.userId);
              const color = simColor(block.colorIdx);
              const impact = combined.per_user_impact[block.userId];
              return (
                <div key={block.id} className="flex items-center gap-2.5 px-4 py-2.5 group">
                  <button
                    type="button"
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                    onClick={() => onSelectBlock(block.id)}
                  >
                    <div className="size-2 rounded-full shrink-0" style={{ background: color.border }} />
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white",
                        user?.color ?? "bg-muted",
                      )}
                    >
                      {user?.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">
                        {user ? `${user.firstname} ${user.lastname}` : "Unknown"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatHalfDate(block.startDate, block.startHalf)} – {formatHalfDate(block.endDate, block.endHalf)}{" "}
                        · {blockDurationLabel(block)}
                      </p>
                    </div>
                  </button>
                  {impact && <ImpactBadge level={impact} />}
                  <button
                    type="button"
                    onClick={() => onRemoveBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive-foreground ml-1"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <CardContent className="px-5 py-4 text-center">
            <p className="text-[12px] text-planned/70">No absences simulated yet.</p>
            <p className="text-[11px] text-planned/60 mt-0.5">Add employees above to begin.</p>
          </CardContent>
        )}
      </Card>

      {simBlocks.length > 0 && (
        <Card className="p-0 gap-0 overflow-hidden">
          <CardHeader className="px-5 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center gap-2">
            <Play className="size-3.5 text-primary" />
            <SectionHeader>Combined impact</SectionHeader>
            {combined.projects.length > 0 && <ImpactBadge level={combined.overall_level} className="ml-auto" />}
          </CardHeader>

          {combined.projects.length === 0 ? (
            <CardContent className="px-5 py-4 text-center">
              <CheckCircle2 className="size-5 text-success mx-auto mb-1.5" />
              <p className="text-[12px] text-success font-medium">No project impact</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">All skills remain covered.</p>
            </CardContent>
          ) : (
            <div className="divide-y divide-border/40">
              {combined.projects.map((p) => (
                <ProjectImpactRow key={p.id} project={p} />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function ProjectImpactRow({ project }: { project: ProjectImpact }) {
  const theme = IMPACT_THEME[project.level];
  return (
    <div className="px-5 py-3.5 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className={cn("size-2 rounded-full shrink-0", theme.dot)} />
        <span className="text-[12px] font-semibold text-foreground truncate">{project.name}</span>
      </div>
      {project.uncovered_skills.length > 0 && (
        <p className="text-[11px] text-destructive-foreground pl-4">
          <span className="font-semibold">Uncovered: </span>
          {project.uncovered_skills.join(", ")}
        </p>
      )}
      {project.siloed_skills.length > 0 && (
        <p className="text-[11px] text-warning pl-4">
          <span className="font-semibold">At risk: </span>
          {project.siloed_skills.join(", ")}
        </p>
      )}
      {project.safe_skills.length > 0 && (
        <p className="text-[11px] text-success pl-4">
          <span className="font-semibold">Covered: </span>
          {project.safe_skills.join(", ")}
        </p>
      )}
    </div>
  );
}
