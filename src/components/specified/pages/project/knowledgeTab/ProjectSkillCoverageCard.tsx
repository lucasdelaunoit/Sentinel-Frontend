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
import { HighlightMatch } from "@/components/common/displays/HighlightMatch.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import { DotsThreeIcon, PlusIcon, TrashIcon, UserPlusIcon } from "@phosphor-icons/react";
import useDetachSkillFromProject from "@/api/projects/useDetachSkillFromProject.ts";
import { AVATAR_SIZE } from "@/lib/theme/avatar.ts";
import useGetProjectKnowledgeCoverage from "@/api/projects/useGetProjectKnowledgeCoverage.ts";
import AddProjectSkillSheet from "@/components/specified/models/project/sheets/AddProjectSkillSheet.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import SkillCoverageStatusBadge from "@/components/specified/models/skill/badges/SkillCoverageStatusBadge.tsx";

type CoverageSortField = "name" | "status" | "max_level";

/* ─── Holder avatars ──────────────────────────────────────── */

const VISIBLE_HOLDERS = 2;

function HolderAvatars({
  holders,
  total,
  onClick,
}: {
  holders: ProjectKnowledgeCoverageHolder[];
  total: number;
  onClick: () => void;
}) {
  if (total === 0) return <span className="text-[13px] text-muted-foreground">—</span>;

  const visible = holders.slice(0, VISIBLE_HOLDERS);
  const extra = total - visible.length;

  return (
    <button
      type="button"
      onClick={onClick}
      title="View all holders"
      className="group flex items-center -space-x-1.5 rounded-xl p-1 -m-1 cursor-pointer transition-colors hover:bg-border"
    >
      {visible.map((h) => (
        <div
          key={h.id}
          title={`${h.firstname} ${h.lastname}${h.on_leave_today ? " (on leave)" : ""} — level ${h.level}/5`}
          className="rounded-xl ring-2 ring-card transition-colors group-hover:ring-border"
        >
          <UserAvatar firstname={h.firstname} lastname={h.lastname} variant={h.status} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl ring-2 ring-background bg-muted text-muted-foreground shadow-sm transition-colors group-hover:ring-border",
            AVATAR_SIZE.base,
          )}
        >
          <DotsThreeIcon className="size-4" weight="bold" />
        </div>
      )}
    </button>
  );
}

interface ProjectSkillCoverageCardProps {
  projectId: string | undefined;
}

export default function ProjectSkillCoverageCard({ projectId }: ProjectSkillCoverageCardProps) {
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [holderSkill, setHolderSkill] = useState<HolderSheetSkill | null>(null);
  const [viewHoldersSkill, setViewHoldersSkill] = useState<HoldersSheetSkill | null>(null);
  const [skillToRemove, setSkillToRemove] = useState<HoldersSheetSkill | null>(null);
  const { detachSkillFromProject, isLoading: removing } = useDetachSkillFromProject();

  async function confirmRemove() {
    if (!projectId || !skillToRemove) return;
    try {
      await detachSkillFromProject({ projectId, skillId: skillToRemove.id });
      setSkillToRemove(null);
    } catch {
      /* hook toasts */
    }
  }

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
      key: "owners",
      header: "Owners",
      cell: (c) => {
        const tone = COVERAGE_TONE[c.status];
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", TONE_BG[tone])} />
              <span className={cn("text-[13px] font-semibold tabular-nums", TONE_TEXT[tone])}>{c.holders_total}</span>
            </div>
            <HolderAvatars
              holders={c.holders}
              total={c.holders_total}
              onClick={() => setViewHoldersSkill({ id: Number(c.skill.id), name: c.skill.name })}
            />
          </div>
        );
      },
      skeleton: (
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-1.5 rounded-full" />
            <Skeleton className="h-4 w-5" />
          </div>
          <div className="flex -space-x-1.5">
            <Skeleton className="size-8 rounded-xl" />
            <Skeleton className="size-8 rounded-xl" />
          </div>
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
        return (
          <div className="flex flex-col">
            {c.max_level > 0 ? (
              <span className={cn("text-[13px] font-semibold whitespace-nowrap", TONE_TEXT[tone])}>
                {levelLabel} ({c.max_level}/5)
              </span>
            ) : (
              <span className="text-[13px] text-muted-foreground">—</span>
            )}
            {c.required_level > 0 && (
              <span
                className={cn(
                  "text-[10px] font-medium mt-0.5",
                  levelGap || c.max_level === 0 ? "text-danger" : "text-muted-foreground",
                )}
              >
                required {skillLevelLabel(c.required_level)} ({c.required_level}/5)
              </span>
            )}
          </div>
        );
      },
      skeleton: (
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      stopPropagation: true,
      cell: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
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
            <UserPlusIcon className="size-3.5" /> Add
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg"
            title="Remove required skill"
            aria-label={`Remove ${c.skill.name} from required skills`}
            disabled={removing}
            onClick={() => setSkillToRemove({ id: Number(c.skill.id), name: c.skill.name })}
          >
            <TrashIcon className="size-3.5" />
          </Button>
        </div>
      ),
      skeleton: (
        <div className="flex items-center justify-end gap-1.5">
          <Skeleton className="h-8 w-14 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ),
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
      <ComposedAlertDialog
        open={skillToRemove !== null}
        onOpenChange={(v) => {
          if (!v) setSkillToRemove(null);
        }}
        title={skillToRemove ? `Remove "${skillToRemove.name}" from required skills?` : ""}
        description="The skill requirement will be removed from this project. Team members keep the skill on their profiles. This cannot be undone."
        confirmLabel="Remove"
        pendingLabel="Removing…"
        cancelLabel="Cancel"
        isPending={removing}
        variant="destructive"
        onConfirm={confirmRemove}
      />
    </>
  );
}
