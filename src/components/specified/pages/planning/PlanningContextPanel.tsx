import {
  CheckCircle2,
  Flame,
  Lightbulb,
  Play,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SecondaryCard from "@/components/common/cards/SecondaryCard";
import Feedback from "@/components/common/feedbacks/Feedback";
import { cn } from "@/lib/utils";
import type {
  Hotspot,
  PlanningMode,
  PlanningUser,
  ProjectImpact,
  Recommendation,
  Severity,
  SimBlock,
  SimWarning,
  SimulateResponse,
  SkillImpact,
} from "@/types/planning";
import { blockDurationLabel, formatHalfDate } from "@/utils/planning/calendar";
import { simColor } from "@/utils/planning/theme";
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
  users,
  simBlocks,
  onOpenAddSheet,
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
  return layout === "below" ? "grid grid-cols-1 lg:grid-cols-3 gap-4 items-start" : "flex flex-col gap-4";
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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function severityBadgeVariant(sev: Severity): "default" | "secondary" | "destructive" | "outline" {
  if (sev === "critical" || sev === "high") return "destructive";
  if (sev === "medium") return "outline";
  return "secondary";
}

function severityClass(sev: Severity): string {
  if (sev === "medium") return "border-warning/40 text-warning";
  return "";
}
/* ─────────────────────── Simulate mode ─────────────────────── */

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
  const hasData = simBlocks.length > 0;

  return (
    <div className={panelContainerClass(layout)}>
      <ComposedCard
        className="border-planned/30 bg-planned/5 gap-0"
        title={
          <span className="flex items-center gap-2">
            <Zap className="size-4 text-planned" />
            <span className="text-planned">Scenario</span>
            {hasData && (
              <Badge variant="secondary" className="bg-planned/20 text-planned h-4 px-1.5 text-[10px]">
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
        <div className="space-y-3 pt-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 rounded-xl h-8 px-3 text-[12px] font-semibold border-planned/30 text-planned hover:bg-planned/10 bg-card"
            onClick={onOpenAddSheet}
          >
            <Plus className="size-3.5" />
            Add absence
          </Button>

          {hasData ? (
            <div className="max-h-64 overflow-y-auto space-y-1.5 -mr-2 pr-2">
              {simBlocks.map((block) => {
                const user = usersById.get(block.userId);
                const color = simColor(block.colorIdx);
                const impact = combined.per_user_impact[block.userId];
                return (
                  <SecondaryCard
                    key={block.id}
                    onClick={() => onSelectBlock(block.id)}
                    before={
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full shrink-0" style={{ background: color.border }} />
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white",
                            user?.color ?? "bg-muted",
                          )}
                        >
                          {user?.initials}
                        </div>
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
                    className="bg-card/60 hover:bg-card"
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
        <ComposedCard
          className={cn("p-0 gap-0", layout === "below" && "lg:col-span-2")}
          headerClassName="px-5 py-3.5 border-b border-border/60 bg-muted/20"
          title={
            <span className="flex items-center gap-2">
              <Play className="size-3.5 text-primary" />
              <SectionHeader>Combined impact</SectionHeader>
            </span>
          }
          action={<ImpactBadge level={combined.overall_level} />}
        >
          <ImpactTabs combined={combined} usersById={usersById} />
        </ComposedCard>
      )}
    </div>
  );
}

/* ─────────────────────── Tabs ─────────────────────── */

function ImpactTabs({ combined, usersById }: { combined: SimulateResponse; usersById: Map<string, PlanningUser> }) {
  return (
    <Tabs defaultValue="projects" className="w-full">
      <TabsList className="w-full justify-start rounded-none bg-muted/10 border-b border-border/60 h-9 p-0 px-3 gap-1">
        <TabPill value="projects" icon={Users} label="Projects" count={combined.per_project_impact.length} />
        <TabPill value="skills" icon={Sparkles} label="Skills" count={combined.per_skill_impact.length} />
        <TabPill value="hotspots" icon={Flame} label="Hotspots" count={combined.hotspots.length} />
        <TabPill
          value="recommendations"
          icon={Lightbulb}
          label="Recommendations"
          count={combined.recommendations.length}
        />
        <TabPill value="warnings" icon={ShieldAlert} label="Warnings" count={combined.warnings.length} />
      </TabsList>

      <TabsContent value="projects" className="m-0">
        <ProjectsTab projects={combined.per_project_impact} />
      </TabsContent>
      <TabsContent value="skills" className="m-0">
        <SkillsTab skills={combined.per_skill_impact} />
      </TabsContent>
      <TabsContent value="hotspots" className="m-0">
        <HotspotsTab hotspots={combined.hotspots} usersById={usersById} />
      </TabsContent>
      <TabsContent value="recommendations" className="m-0">
        <RecommendationsTab recs={combined.recommendations} />
      </TabsContent>
      <TabsContent value="warnings" className="m-0">
        <WarningsTab warnings={combined.warnings} />
      </TabsContent>
    </Tabs>
  );
}

function TabPill({
  value,
  icon: Icon,
  label,
  count,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className="h-8 gap-1.5 px-2.5 rounded-md text-[11px] font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
      {count > 0 && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
          {count}
        </Badge>
      )}
    </TabsTrigger>
  );
}

/* ─────────────────────── Tab contents ─────────────────────── */

function EmptyTab({ title, description }: { title: string; description?: string }) {
  return (
    <div className="p-6">
      <Feedback variant="success" title={title} description={description} />
    </div>
  );
}

function ProjectsTab({ projects }: { projects: ProjectImpact[] }) {
  if (projects.length === 0) return <EmptyTab title="No project impact" description="All skills remain covered." />;
  return (
    <div className="divide-y divide-border/40">
      {projects.map((p) => (
        <ProjectImpactRow key={p.project_id} project={p} />
      ))}
    </div>
  );
}

function ProjectImpactRow({ project }: { project: ProjectImpact }) {
  const sev: Severity =
    project.status_after === "blocked" ? "critical" : project.status_after === "at_risk" ? "high" : "safe";
  return (
    <div className="px-5 py-3.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "size-2 rounded-full shrink-0",
              sev === "critical" ? "bg-destructive-foreground" : sev === "high" ? "bg-warning" : "bg-success",
            )}
          />
          <span className="text-[12px] font-semibold text-foreground truncate">{project.name}</span>
        </div>
        <ImpactBadge level={project.level} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <MetricMini label="Bus factor" before={project.bus_factor_before} after={project.bus_factor_after} invertGood />
        <MetricMini
          label="Coverage"
          before={project.coverage_pct_before}
          after={project.coverage_pct_after}
          suffix="%"
        />
        <MetricMini label="Risk" before={project.risk_score_before} after={project.risk_score_after} invertGood />
      </div>

      {project.skills_at_risk.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.skills_at_risk.map((s) => (
            <Badge
              key={s.skill_id}
              variant={severityBadgeVariant(s.severity)}
              className={cn("text-[10px]", severityClass(s.severity))}
            >
              {s.name} · {s.owners_left} left
            </Badge>
          ))}
        </div>
      )}

      {project.recommendation && (
        <p className="text-[11px] text-muted-foreground italic flex items-start gap-1.5">
          <Lightbulb className="size-3 shrink-0 mt-0.5" />
          {project.recommendation}
        </p>
      )}
    </div>
  );
}

function MetricMini({
  label,
  before,
  after,
  suffix = "",
  invertGood = false,
}: {
  label: string;
  before: number;
  after: number;
  suffix?: string;
  invertGood?: boolean;
}) {
  const delta = after - before;
  const improved = invertGood ? delta < 0 : delta > 0;
  const worse = invertGood ? delta > 0 : delta < 0;
  return (
    <div className="rounded-md bg-muted/30 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <div className="flex items-center gap-1 text-[11px] font-bold">
        <span className="text-muted-foreground">
          {before}
          {suffix}
        </span>
        <span className="text-muted-foreground/40">→</span>
        <span className={cn(worse && "text-destructive-foreground", improved && "text-success")}>
          {after}
          {suffix}
        </span>
        {delta !== 0 && (
          <Badge
            variant={worse ? "destructive" : "secondary"}
            className={cn("ml-auto h-4 px-1 text-[9px] gap-0", improved && "bg-success/15 text-success")}
          >
            {delta > 0 ? <TrendingUp /> : <TrendingDown />}
            {Math.abs(delta)}
            {suffix}
          </Badge>
        )}
      </div>
    </div>
  );
}

function SkillsTab({ skills }: { skills: SkillImpact[] }) {
  if (skills.length === 0) return <EmptyTab title="No skill impact" />;
  const order: Severity[] = ["critical", "high", "medium", "low", "safe"];
  const sorted = [...skills].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  return (
    <div className="divide-y divide-border/40">
      {sorted.map((s) => (
        <div key={s.skill_id} className="px-5 py-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "size-2 rounded-full shrink-0",
                  s.severity === "critical"
                    ? "bg-destructive-foreground"
                    : s.severity === "high"
                      ? "bg-warning"
                      : s.severity === "medium"
                        ? "bg-warning"
                        : "bg-success",
                )}
              />
              <span className="text-[12px] font-semibold text-foreground truncate">{s.name}</span>
              {s.is_critical_for_org && (
                <Badge variant="destructive" className="h-4 px-1.5 text-[9px]">
                  Critical
                </Badge>
              )}
            </div>
            <Badge variant={severityBadgeVariant(s.severity)} className={cn("text-[10px]", severityClass(s.severity))}>
              {s.owners_left}/{s.owners_total} owners
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Coverage {s.coverage_pct_before}% →{" "}
            <span
              className={cn(
                s.coverage_pct_after < s.coverage_pct_before && "text-destructive-foreground font-semibold",
              )}
            >
              {s.coverage_pct_after}%
            </span>
            {s.projects_impacted.length > 0 &&
              ` · ${s.projects_impacted.length} project${s.projects_impacted.length === 1 ? "" : "s"}`}
          </p>
          {s.dates_uncovered.length > 0 && (
            <p className="text-[10px] text-destructive-foreground">
              Uncovered: {s.dates_uncovered.slice(0, 4).join(", ")}
              {s.dates_uncovered.length > 4 ? ` +${s.dates_uncovered.length - 4}` : ""}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function HotspotsTab({ hotspots, usersById }: { hotspots: Hotspot[]; usersById: Map<string, PlanningUser> }) {
  if (hotspots.length === 0) return <EmptyTab title="No critical overlap windows" />;
  return (
    <div className="p-3 space-y-2">
      {hotspots.map((h, i) => (
        <SecondaryCard
          key={i}
          before={
            <Flame
              className={cn("size-4", h.severity === "critical" ? "text-destructive-foreground" : "text-warning")}
            />
          }
          title={`${h.date_range[0]} → ${h.date_range[1]}`}
          description={h.reason}
          action={
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={severityBadgeVariant(h.severity)} className="text-[10px] uppercase">
                {h.severity}
              </Badge>
              <div className="flex flex-wrap gap-1 justify-end">
                {h.absent_user_ids.slice(0, 6).map((uid) => {
                  const u = usersById.get(uid);
                  return (
                    <span
                      key={uid}
                      className={cn(
                        "flex size-5 items-center justify-center rounded-md text-[8px] font-bold text-white",
                        u?.color ?? "bg-muted",
                      )}
                    >
                      {u?.initials ?? "?"}
                    </span>
                  );
                })}
              </div>
            </div>
          }
        />
      ))}
    </div>
  );
}

function RecommendationsTab({ recs }: { recs: Recommendation[] }) {
  if (recs.length === 0) return <EmptyTab title="No actions needed" />;
  const sorted = [...recs].sort((a, b) => a.priority - b.priority);
  return (
    <div className="p-3 space-y-2">
      {sorted.map((r) => (
        <SecondaryCard
          key={r.id}
          before={<Lightbulb className="size-4 text-primary" />}
          title={
            <span className="flex items-center gap-2">
              <Badge variant="default" className="h-4 px-1.5 text-[9px] uppercase">
                {r.type}
              </Badge>
              {r.title}
            </span>
          }
          description={
            <span>
              {r.detail}
              {r.impact_preview && (
                <span className="flex gap-2 mt-1">
                  {r.impact_preview.risk_score_delta !== undefined && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-4 px-1.5 text-[9px]",
                        r.impact_preview.risk_score_delta < 0
                          ? "bg-success/15 text-success"
                          : "bg-destructive/10 text-destructive-foreground",
                      )}
                    >
                      Risk {r.impact_preview.risk_score_delta > 0 ? "+" : ""}
                      {r.impact_preview.risk_score_delta}
                    </Badge>
                  )}
                  {r.impact_preview.coverage_delta_pct !== undefined && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-4 px-1.5 text-[9px]",
                        r.impact_preview.coverage_delta_pct > 0
                          ? "bg-success/15 text-success"
                          : "bg-destructive/10 text-destructive-foreground",
                      )}
                    >
                      Coverage {r.impact_preview.coverage_delta_pct > 0 ? "+" : ""}
                      {r.impact_preview.coverage_delta_pct}%
                    </Badge>
                  )}
                  {r.impact_preview.absent_headcount_peak !== undefined && (
                    <Badge variant="outline" className="h-4 px-1.5 text-[9px]">
                      Peak → {r.impact_preview.absent_headcount_peak}
                    </Badge>
                  )}
                </span>
              )}
            </span>
          }
        />
      ))}
    </div>
  );
}

function WarningsTab({ warnings }: { warnings: SimWarning[] }) {
  if (warnings.length === 0) return <EmptyTab title="No warnings" />;
  return (
    <div className="p-3 space-y-2">
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
  );
}

/* legacy export retained — CheckCircle2 used in some empty hints */
export { CheckCircle2 };
