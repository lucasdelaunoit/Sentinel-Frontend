import { useState } from "react";
import { PlusIcon, UserPlusIcon } from "@phosphor-icons/react";
import ComposedCard from "@/components/common/cards/ComposedCard";
import CoverageRadar, { type CoverageRadarDatum } from "@/components/common/charts/CoverageRadar";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar";
import AddProjectSkillSheet from "@/components/specified/models/projects/sheets/AddProjectSkillSheet";
import AddSkillHolderSheet, {
  type HolderSheetSkill,
} from "@/components/specified/models/projects/sheets/AddSkillHolderSheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useGetProjectKnowledgeCoverage from "@/api/projects/useGetProjectKnowledgeCoverage";
import useGetProjectCompetencyRadar from "@/api/projects/useGetProjectCompetencyRadar";
import { cn } from "@/lib/utils";
import { TONE_TEXT, TONE_BG, type Tone } from "@/lib/scoring";
import ProjectCoverageSummary from "@/components/specified/pages/project/knowledgeTab/ProjectCoverageSummary.tsx";

const LEVEL_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"] as const;
const SAFE_REDUNDANCY = 2;
const COLUMN_COUNT = 6;
const SKELETON_ROWS = 5;

const STATUS_TONE: Record<ProjectKnowledgeCoverageStatus, Tone> = {
  uncovered: "danger",
  silo: "warning",
  covered: "success",
};

const STATUS_LABEL: Record<ProjectKnowledgeCoverageStatus, string> = {
  uncovered: "Uncovered",
  silo: "Knowledge Silo",
  covered: "Covered",
};

const STATUS_BADGE: Record<ProjectKnowledgeCoverageStatus, string> = {
  uncovered: "bg-danger text-danger-foreground",
  silo: "bg-warning text-warning-foreground",
  covered: "bg-success text-success-foreground",
};

/* ─── Holder avatars ──────────────────────────────────────── */

function HolderAvatars({ holders }: { holders: ProjectKnowledgeCoverageHolder[] }) {
  if (holders.length === 0) return <span className="text-[13px] text-muted-foreground">—</span>;

  return (
    <div className="flex items-center -space-x-1.5">
      {holders.map((h) => (
        <div
          key={h.id}
          title={`${h.firstname} ${h.lastname}${h.on_leave_today ? " (on leave)" : ""} — level ${h.level}/5`}
          className={cn("rounded-md ring-2 ring-white shadow-sm")}
        >
          <UserAvatar firstname={h.firstname} lastname={h.lastname} variant={h.status} />
        </div>
      ))}
    </div>
  );
}

/* ─── Coverage table ──────────────────────────────────────── */

interface CoverageTableProps {
  projectId: string | undefined;
  coverage: ProjectKnowledgeCoverageItem[];
}

function CoverageTable({ projectId, coverage }: CoverageTableProps) {
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [holderSkill, setHolderSkill] = useState<HolderSheetSkill | null>(null);

  const totalSkills = coverage.length;
  const atRisk = coverage.filter((c) => c.active_holders_count < SAFE_REDUNDANCY).length;
  const existingSkillIds = coverage.map((c) => Number(c.skill.id));

  return (
    <ComposedCard
      title="Required Skills Coverage"
      action={
        <>
          <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
            {atRisk}/{totalSkills} at risk
          </span>
          <div className="flex-1" />
          <Button size="sm" className="h-7 gap-1.5 text-[12px]" onClick={() => setAddSkillOpen(true)}>
            <PlusIcon className="size-3.5" weight="bold" />
            Add skill
          </Button>
        </>
      }
      className="col-span-3 p-0 overflow-hidden"
      headerClassName="px-6 pt-4 flex-wrap gap-3"
    >
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
            {["Skill", "Status", "Active Holders", "Owners", "Best Level"].map((label) => (
              <TableHead
                key={label}
                className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
              >
                {label}
              </TableHead>
            ))}
            <TableHead className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-border/40">
          {coverage.length === 0 ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={COLUMN_COUNT} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No required skills defined for this project.
              </TableCell>
            </TableRow>
          ) : (
            coverage.map((c) => {
              const tone = STATUS_TONE[c.status];
              const levelLabel = c.max_level > 0 ? LEVEL_LABELS[c.max_level] : "—";
              const levelGap = c.required_level > 0 && c.max_level > 0 && c.max_level < c.required_level;
              const widthPct = c.team_size > 0 ? Math.min(100, (c.active_holders_count / c.team_size) * 100) : 0;

              return (
                <TableRow key={c.skill.id} className="hover:bg-muted/20 transition-colors border-border/40">
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", TONE_BG[tone])} />
                      <div>
                        <p className="font-semibold text-foreground text-[14px]">{c.skill.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.skill.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full", TONE_BG[tone])} style={{ width: `${widthPct}%` }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                        {c.active_holders_count}/{c.team_size}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <HolderAvatars holders={c.holders} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {c.max_level > 0 ? (
                      <div className="flex flex-col">
                        <span className={cn("text-[13px] font-semibold whitespace-nowrap", TONE_TEXT[tone])}>
                          {levelLabel} ({c.max_level}/5)
                        </span>
                        {levelGap && (
                          <span className="text-[10px] text-danger font-medium mt-0.5">
                            below required {c.required_level}/5
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      title="Add someone with this skill"
                      aria-label={`Add someone with ${c.skill.name}`}
                      onClick={() =>
                        setHolderSkill({
                          id: Number(c.skill.id),
                          name: c.skill.name,
                          category: c.skill.category,
                        })
                      }
                    >
                      <UserPlusIcon className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <AddProjectSkillSheet
        projectId={projectId}
        existingSkillIds={existingSkillIds}
        open={addSkillOpen}
        onOpenChange={setAddSkillOpen}
      />
      <AddSkillHolderSheet
        projectId={projectId}
        skill={holderSkill}
        open={holderSkill !== null}
        onOpenChange={(v) => {
          if (!v) setHolderSkill(null);
        }}
      />
    </ComposedCard>
  );
}

CoverageTable.Skeleton = function CoverageTableSkeleton() {
  return (
    <ComposedCard
      title="Required Skills Coverage"
      action={<Skeleton className="h-5 w-20 rounded-full" />}
      className="col-span-3 p-0 overflow-hidden"
      headerClassName="px-6 pt-4 flex-wrap gap-3"
    >
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
            {["Skill", "Status", "Active Holders", "Owners", "Best Level"].map((label) => (
              <TableHead
                key={label}
                className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
              >
                {label}
              </TableHead>
            ))}
            <TableHead className="px-5 py-3.5" />
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-border/40">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i} className="border-border/40">
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-1.5 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-5 py-4">
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-1.5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex -space-x-1.5">
                  <Skeleton className="size-8 rounded-xl" />
                  <Skeleton className="size-8 rounded-xl" />
                </div>
              </TableCell>
              <TableCell className="px-5 py-4">
                <Skeleton className="h-3.5 w-24" />
              </TableCell>
              <TableCell className="px-5 py-4 text-right">
                <Skeleton className="size-7 rounded-md ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ComposedCard>
  );
};

/* ─── Radar card ──────────────────────────────────────────── */

interface RadarCardProps {
  radar: ProjectCompetencyRadarItem[];
}

function RadarCard({ radar }: RadarCardProps) {
  const data: CoverageRadarDatum[] = radar.map((r) => ({
    axis: r.category,
    value: r.value,
    target: r.target,
  }));

  return (
    <ComposedCard title="Team Competency Radar">
      <p className="text-[11px] text-muted-foreground mb-2">Average skill level per category across the team</p>
      <CoverageRadar data={data} valueLabel="Team level" targetLabel="Target" />
    </ComposedCard>
  );
}

RadarCard.Skeleton = function RadarCardSkeleton() {
  return (
    <ComposedCard title="Team Competency Radar">
      <p className="text-[11px] text-muted-foreground mb-2">Average skill level per category across the team</p>
      <CoverageRadar.Skeleton />
    </ComposedCard>
  );
};

/* ─── Main tab ────────────────────────────────────────────── */

interface ProjectKnowledgeTabProps {
  projectId: string | undefined;
}

export default function ProjectKnowledgeTab({ projectId }: ProjectKnowledgeTabProps) {
  const {
    data: coverage,
    isLoading: isCoverageLoading,
    isError: isCoverageError,
  } = useGetProjectKnowledgeCoverage(projectId);
  const { data: radar, isLoading: isRadarLoading, isError: isRadarError } = useGetProjectCompetencyRadar(projectId);

  return (
    <div className="grid grid-cols-5 gap-4">
      {isCoverageLoading || !coverage ? (
        <CoverageTable.Skeleton />
      ) : isCoverageError ? (
        <ComposedCard
          title="Required Skills Coverage"
          className="col-span-3 p-0 overflow-hidden"
          headerClassName="px-6 pt-4"
        >
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Failed to load knowledge coverage. Check API connection.
          </div>
        </ComposedCard>
      ) : (
        <CoverageTable projectId={projectId} coverage={coverage} />
      )}

      <div className="col-span-2 space-y-4">
        {isRadarLoading || !radar ? (
          <RadarCard.Skeleton />
        ) : isRadarError ? (
          <ComposedCard title="Team Competency Radar">
            <p className="text-[12px] text-muted-foreground">Failed to load competency radar.</p>
          </ComposedCard>
        ) : (
          <RadarCard radar={radar} />
        )}

        <ProjectCoverageSummary isLoading={isCoverageLoading || !coverage} coverage={coverage} />
      </div>
    </div>
  );
}
