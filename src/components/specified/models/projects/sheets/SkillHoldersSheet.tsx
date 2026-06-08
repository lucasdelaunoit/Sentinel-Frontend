import { useEffect, useState } from "react";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SearchBar from "@/components/common/inputs/SearchBar";
import { TablePagination } from "@/components/common/table/TablePagination";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTablePagination } from "@/hooks/useTablePagination";
import useGetSkillHolders from "@/api/projects/useGetSkillHolders";
import { HighlightMatch } from "@/utils/useHighlightableText";
import { getFullName } from "@/utils/formatters/persons";
import { cn } from "@/lib/utils";

const LEVEL_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"] as const;
const SKELETON_ROWS = 6;

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

function HolderRow({ holder, search }: { holder: ProjectKnowledgeCoverageHolder; search: string }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-muted/40 transition-colors">
      <UserAvatar firstname={holder.firstname} lastname={holder.lastname} variant={holder.status} size="base" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">
          <HighlightMatch text={getFullName(holder.firstname, holder.lastname)} searchTerm={search} />
        </p>
        {holder.on_leave_today && <p className="text-[11px] text-warning font-medium">On leave today</p>}
      </div>
      <span className="text-[12px] font-semibold text-muted-foreground tabular-nums whitespace-nowrap">
        {LEVEL_LABELS[holder.level] ?? "—"} ({holder.level}/5)
      </span>
    </div>
  );
}

function HolderRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <UserAvatar.Skeleton size="base" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
      </div>
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}

export default function SkillHoldersSheet({ projectId, skill, open, onOpenChange }: SkillHoldersSheetProps) {
  const [search, setSearch] = useState("");
  const { page, setPage, perPage, setPerPage } = useTablePagination(10, [search, skill?.id]);

  const {
    data: holders,
    total,
    lastPage,
    from,
    to,
    isLoading,
    isError,
  } = useGetSkillHolders(projectId, skill?.id ?? null, {
    page,
    per_page: perPage,
    search: search || undefined,
    sorts: [{ field: "name", direction: "asc" }],
  });

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Skill holders"
      description={
        skill ? (
          <>
            Everyone on the team who holds{" "}
            <span className="font-semibold text-foreground">{skill.name}</span>
            {total > 0 ? ` · ${total} ${total === 1 ? "person" : "people"}` : ""}
          </>
        ) : undefined
      }
      maxWidth="sm:max-w-[480px]"
      className="p-0"
      subheader={<SearchBar value={search} onChange={setSearch} placeholder="Search holders..." className="w-full" />}
    >
      <div className={cn("space-y-0.5", isLoading && "pointer-events-none")}>
        {isLoading ? (
          Array.from({ length: SKELETON_ROWS }).map((_, i) => <HolderRowSkeleton key={i} />)
        ) : isError ? (
          <p className="px-3.5 py-12 text-center text-sm text-muted-foreground">
            Failed to load holders. Check API connection.
          </p>
        ) : holders.length === 0 ? (
          <p className="px-3.5 py-12 text-center text-sm text-muted-foreground">
            {search ? "No holders match your search." : "No one holds this skill yet."}
          </p>
        ) : (
          holders.map((h) => <HolderRow key={h.id} holder={h} search={search} />)
        )}
      </div>

      {!isLoading && !isError && total > perPage && (
        <div className="-mx-6">
          <TablePagination
            page={page}
            lastPage={lastPage}
            perPage={perPage}
            total={total}
            from={from}
            to={to}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      )}
    </ComposedSheet>
  );
}
