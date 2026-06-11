import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import DataPagination from "@/components/common/pagination/DataPagination.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import MediumSkillHolderRow from "@/components/specified/models/project/datas/MediumSkillHolderRow.tsx";
import { useTablePagination } from "@/hooks/useTablePagination.ts";
import useGetSkillHolders from "@/api/projects/useGetSkillHolders.ts";
import useDetachSkillFromUser from "@/api/user/useDetachSkillFromUser.ts";
import { getFullName } from "@/utils/formatters/persons.ts";

export interface HoldersSheetSkill {
  id: number;
  name: string;
}

interface SkillHoldersSheetProps {
  projectId: string | undefined;
  skill: HoldersSheetSkill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SkillHoldersSheet({ projectId, skill, open, onOpenChange }: SkillHoldersSheetProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [holderToRemove, setHolderToRemove] = useState<ProjectKnowledgeCoverageHolder | null>(null);
  const { page, setPage, perPage } = useTablePagination(10, [search, skill?.id]);
  const { detachSkillFromUser, isLoading: removing } = useDetachSkillFromUser();

  const {
    data: holders,
    total,
    lastPage,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData,
  } = useGetSkillHolders(projectId, skill?.id ?? null, {
    page,
    per_page: perPage,
    search: search || undefined,
    sorts: [{ field: "name", direction: "asc" }],
  });

  useEffect(() => {
    if (open) {
      setSearch("");
      setHolderToRemove(null);
    }
  }, [open]);

  async function confirmRemove() {
    if (!skill || !holderToRemove) return;
    try {
      await detachSkillFromUser({ userId: holderToRemove.id, skillId: skill.id });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "skills", skill.id, "holders"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "knowledge-coverage"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "competency-radar"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "users"] });
      toast.success("Skill removed.");
      setHolderToRemove(null);
    } catch {
      /* hook toasts */
    }
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Skill holders"
      description={
        skill ? (
          <>
            Everyone on the team who holds <span className="font-semibold text-foreground">{skill.name}</span>
            {total > 0 ? ` · ${total} ${total === 1 ? "person" : "people"}` : ""}
          </>
        ) : undefined
      }
      maxWidth="sm:max-w-[480px]"
      subheader={<SearchBar value={search} onChange={setSearch} placeholder="Search holders..." className="w-full" />}
      footer={
        !isLoading && !isError && lastPage > 1 ? (
          <div className="flex w-full justify-center">
            <DataPagination page={page} totalPages={lastPage} onPageChange={setPage} disabled={isFetching} />
          </div>
        ) : null
      }
    >
      {isLoading || isPlaceholderData ? (
        <div className="space-y-2">
          {Array.from({ length: perPage > 8 ? 8 : perPage }).map((_, i) => (
            <MediumSkillHolderRow.Skeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <Feedback variant="danger" title="Failed to load holders" description="Check API connection." />
      ) : holders.length === 0 ? (
        <Feedback
          variant="neutral"
          title={search ? "No matches" : "No holders yet"}
          description={search ? "Try adjusting the search." : "No one holds this skill yet."}
        />
      ) : (
        <div className="space-y-2">
          {holders.map((h) => (
            <MediumSkillHolderRow
              key={h.id}
              holder={h}
              search={search}
              onRemove={() => setHolderToRemove(h)}
              removing={removing && holderToRemove?.id === h.id}
            />
          ))}
        </div>
      )}

      <ComposedAlertDialog
        open={holderToRemove !== null}
        onOpenChange={(v) => {
          if (!v) setHolderToRemove(null);
        }}
        title={
          holderToRemove
            ? `Remove ${getFullName(holderToRemove.firstname, holderToRemove.lastname)} from "${skill?.name}"?`
            : ""
        }
        description="This skill will be detached from the employee across the whole organization, not only this project. This cannot be undone."
        confirmLabel="Remove"
        pendingLabel="Removing…"
        cancelLabel="Cancel"
        isPending={removing}
        variant="destructive"
        onConfirm={confirmRemove}
      />
    </ComposedSheet>
  );
}
