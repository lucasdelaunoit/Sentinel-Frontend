import { useState } from "react";
import AddSkillHolderSheet, {
  type HolderSheetSkill,
} from "@/components/specified/models/project/sheets/AddSkillHolderSheet.tsx";
import SkillHoldersSheet, {
  type HoldersSheetSkill,
} from "@/components/specified/models/project/sheets/SkillHoldersSheet.tsx";
import DataTable, { type DataTableColumn } from "@/components/common/table/DataTable.tsx";
import { cn } from "@/lib/utils.ts";
import { TONE_BG, TONE_TEXT } from "@/lib/theme/tone.ts";
import { COVERAGE_TONE } from "@/lib/theme/skillCoverage.ts";
import { skillLevelLabel } from "@/lib/theme/skillLevel.ts";
import { HighlightMatch } from "@/utils/useHighlightableText.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PlusIcon, UserPlusIcon } from "@phosphor-icons/react";
import useGetProjectKnowledgeCoverage from "@/api/projects/useGetProjectKnowledgeCoverage.ts";
import AddProjectSkillSheet from "@/components/specified/models/project/sheets/AddProjectSkillSheet.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import SkillCoverageStatusBadge from "@/components/specified/models/skill/badges/SkillCoverageStatusBadge.tsx";

type CoverageSortField = "name" | "status" | "active_holders_count" | "max_level";

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

interface ProjectSkillCoverageCardProps {
  projectId: string | undefined;
}

export default function ProjectSkillCoverageCard({ projectId }: ProjectSkillCoverageCardProps) {
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [holderSkill, setHolderSkill] = useState<HolderSheetSkill | null>(null);
  const [viewHoldersSkill, setViewHoldersSkill] = useState<HoldersSheetSkill | null>(null);

  const columns: DataTableColumn<ProjectKnowledgeCoverageItem, CoverageSortField>[] = [
    {
      key: "skill",
      header: "Skill",
      sortKey: "name",
      cell: (c, { search }) => {
        const tone = COVERAGE_TONE[c.status];
        return (
          <div className="flex items-center gap-2">
            <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", TONE_BG[tone])} />
            <div>
              <p className="font-semibold text-foreground text-[14px]">
                <HighlightMatch text={c.skill.name} searchTerm={search} />
              </p>
              <p className="text-[11px] text-muted-foreground">{c.skill.category}</p>
            </div>
          </div>
        );
      },
      skeleton: (
        <div className="flex items-center gap-2">
          <Skeleton className="size-1.5 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortKey: "status",
      cell: (c) => <SkillCoverageStatusBadge status={c.status} />,
      skeleton: <Skeleton className="h-5 w-24 rounded-full" />,
    },
    {
      key: "active",
      header: "Active Holders",
      sortKey: "active_holders_count",
      cell: (c) => {
        const tone = COVERAGE_TONE[c.status];
        const widthPct = c.team_size > 0 ? Math.min(100, (c.active_holders_count / c.team_size) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full", TONE_BG[tone])} style={{ width: `${widthPct}%` }} />
            </div>
            <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
              {c.active_holders_count}/{c.team_size}
            </span>
          </div>
        );
      },
      skeleton: (
        <div className="flex items-center gap-2">
          <Skeleton className="h-1.5 w-16 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      ),
    },
    {
      key: "owners",
      header: "Owners",
      cell: (c) => {
        const extra = c.holders_total - c.holders.length;
        return (
          <div className="flex items-center gap-2">
            <HolderAvatars holders={c.holders} />
            {c.holders_total > 0 && (
              <button
                type="button"
                className="text-[11px] font-medium text-primary hover:underline whitespace-nowrap"
                onClick={() => setViewHoldersSkill({ id: Number(c.skill.id), name: c.skill.name })}
              >
                {extra > 0 ? `+${extra} view all` : "View all"}
              </button>
            )}
          </div>
        );
      },
      skeleton: (
        <div className="flex -space-x-1.5">
          <Skeleton className="size-8 rounded-xl" />
          <Skeleton className="size-8 rounded-xl" />
        </div>
      ),
    },
    {
      key: "level",
      header: "Best Level",
      sortKey: "max_level",
      cell: (c) => {
        const tone = COVERAGE_TONE[c.status];
        const levelLabel = skillLevelLabel(c.max_level);
        const levelGap = c.required_level > 0 && c.max_level > 0 && c.max_level < c.required_level;
        return c.max_level > 0 ? (
          <div className="flex flex-col">
            <span className={cn("text-[13px] font-semibold whitespace-nowrap", TONE_TEXT[tone])}>
              {levelLabel} ({c.max_level}/5)
            </span>
            {levelGap && (
              <span className="text-[10px] text-danger font-medium mt-0.5">below required {c.required_level}/5</span>
            )}
          </div>
        ) : (
          <span className="text-[13px] text-muted-foreground">—</span>
        );
      },
      skeleton: <Skeleton className="h-3.5 w-24" />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      stopPropagation: true,
      cell: (c) => (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground ml-auto"
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
      ),
      skeleton: <Skeleton className="size-7 rounded-md ml-auto" />,
    },
  ];

  return (
    <>
      <DataTable<ProjectKnowledgeCoverageItem, CoverageSortField, ProjectKnowledgeCoverageStatus>
        title="Required Skills Coverage"
        hook={(params) => useGetProjectKnowledgeCoverage(projectId, params)}
        columns={columns}
        defaultSort="name"
        searchPlaceholder="Search skills..."
        className="col-span-3"
        emptyMessage="No required skills match your filters."
        errorMessage="Failed to load knowledge coverage. Check API connection."
        headerAction={
          <Button
            size="sm"
            className="h-8 gap-1.5 text-[12px]"
            onClick={() => setAddSkillOpen(true)}
            disabled={!projectId}
          >
            <PlusIcon className="size-3.5" weight="bold" />
            Add skill
          </Button>
        }
      />

      <AddProjectSkillSheet
        projectId={projectId}
        existingSkillIds={[]}
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
      <SkillHoldersSheet
        projectId={projectId}
        skill={viewHoldersSkill}
        open={viewHoldersSkill !== null}
        onOpenChange={(v) => {
          if (!v) setViewHoldersSkill(null);
        }}
      />
    </>
  );
}
