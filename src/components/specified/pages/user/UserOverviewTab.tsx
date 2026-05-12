import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import useGetUserProjects from "@/api/users/useGetUserProjects.ts";
import useGetSkillsForUser from "@/api/users/useGetSkillsForUser.ts";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import useDeleteAbsence from "@/api/absences/useDeleteAbsence.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { TablePagination } from "@/components/common/table/TablePagination.tsx";
import CreateAbsenceSheet from "@/components/specified/models/absence/sheets/CreateAbsenceSheet.tsx";
import { useTablePagination } from "@/hooks/useTablePagination.ts";
import { cn } from "@/lib/utils.ts";
import type { AbsenceItem, AbsenceType, AbsenceStatus } from "@/types/dashboard.ts";

interface UserOverviewTabProps {
  userId: string;
}

/* ─── Status helpers ─────────────────────────────────────── */

const STATUS_STYLES: Record<ProjectStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400",
  completed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400",
  on_hold: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400",
  planning: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400",
};
const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  on_hold: "On Hold",
  planning: "Planning",
  completed: "Completed",
};

/* ─── Absence helpers ────────────────────────────────────── */

const ABSENCE_TYPE_STYLES: Record<AbsenceType, string> = {
  vacation: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
  sick: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
  conference: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
};
const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  vacation: "Vacation",
  sick: "Sick leave",
  conference: "Conference",
};

const ABSENCE_STATUS_STYLES: Record<AbsenceStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
};
const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function absenceDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.max(1, Math.round(ms / 86_400_000) + 1);
  return `${days}d`;
}

/* ─── Skill bar helpers ──────────────────────────────────── */

const LEVEL_LABEL: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

function skillColor(level: number) {
  if (level >= 4) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
  if (level >= 3) return "bg-gradient-to-r from-amber-400 to-amber-500";
  return "bg-gradient-to-r from-rose-400 to-rose-500";
}

function SkillBar({ name, level }: { name: string; level: number }) {
  const filled = level * 2;
  const color = skillColor(level);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">{name}</span>
        <span className="text-[11px] text-muted-foreground">
          {level}/5 — <span className="font-medium text-foreground">{LEVEL_LABEL[level]}</span>
        </span>
      </div>
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-1.5 flex-1 rounded-sm transition-colors shadow-inner", i < filled ? color : "bg-muted")}
          />
        ))}
      </div>
    </div>
  );
}

function SkillBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-sm" />
    </div>
  );
}

/* ─── Absences card ──────────────────────────────────────── */

function AbsencesCard({ userId }: { userId: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { page, setPage, perPage, setPerPage } = useTablePagination(5, [debouncedSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useGetAbsencesForUser(userId, {
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const { mutate: deleteAbsence, isPending: isDeleting } = useDeleteAbsence();

  const absences = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;

  function handleDelete(absence: AbsenceItem) {
    setDeletingId(absence.id);
    deleteAbsence(
      { id: absence.id, userId },
      { onSuccess: () => setDeletingId(null), onError: () => setDeletingId(null) },
    );
  }

  return (
    <>
      <ComposedCard
        title="Absences"
        action={
          <>
            {!isLoading && (
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                {total}
              </span>
            )}
            <div className="flex-1" />
            <SearchBar value={search} onChange={setSearch} placeholder="Search…" size="sm" />
            <Button
              size="xs"
              variant="outline"
              className="gap-1.5 text-[10px]"
              onClick={() => setSheetOpen(true)}
            >
              <Plus className="size-3" />
              Add Absence
            </Button>
          </>
        }
        className="p-0 overflow-hidden"
        headerClassName="px-6 pt-5 pb-4 border-b border-border/60"
      >
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Type
              </TableHead>
              <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Period
              </TableHead>
              <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Duration
              </TableHead>
              <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Status
              </TableHead>
              <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Reason
              </TableHead>
              <TableHead className="w-12 px-5 py-3.5" />
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-border/40">
            {isLoading ? (
              Array.from({ length: Math.min(perPage, 5) }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="px-5 py-4"><Skeleton className="h-3.5 w-44" /></TableCell>
                  <TableCell className="px-5 py-4"><Skeleton className="h-3.5 w-8" /></TableCell>
                  <TableCell className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="px-5 py-4"><Skeleton className="h-3.5 w-32" /></TableCell>
                  <TableCell className="px-5 py-4"><Skeleton className="h-7 w-7 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Failed to load absences. Check API connection.
                </TableCell>
              </TableRow>
            ) : absences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-10 text-center">
                  <CalendarBlankIcon className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">
                    {debouncedSearch ? "No absences match your search." : "No absences recorded."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              absences.map((absence) => (
                <TableRow key={absence.id} className="hover:bg-muted/20 transition-colors border-border/40">
                  <TableCell className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        ABSENCE_TYPE_STYLES[absence.type],
                      )}
                    >
                      {ABSENCE_TYPE_LABELS[absence.type]}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-[12px] text-foreground whitespace-nowrap">
                    {fmtDate(absence.start_date)}
                    <span className="text-muted-foreground/50 mx-1.5">→</span>
                    {fmtDate(absence.end_date)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-[12px] font-medium text-muted-foreground tabular-nums">
                    {absenceDuration(absence.start_date, absence.end_date)}
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        ABSENCE_STATUS_STYLES[absence.status],
                      )}
                    >
                      {ABSENCE_STATUS_LABELS[absence.status]}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground max-w-[200px] truncate">
                    {absence.reason ?? <span className="text-muted-foreground/40">—</span>}
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <ComposedAlertDialog
                      trigger={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground/50 hover:text-rose-500 h-7 w-7 p-0 rounded-lg hover:bg-rose-50/50"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                      title="Delete absence?"
                      description="This will permanently remove this absence record and cannot be undone."
                      confirmLabel="Delete"
                      pendingLabel="Deleting…"
                      variant="destructive"
                      isPending={isDeleting && deletingId === absence.id}
                      onConfirm={() => handleDelete(absence)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && !isError && total > 0 && (
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
        )}
      </ComposedCard>

      <CreateAbsenceSheet open={sheetOpen} onOpenChange={setSheetOpen} userId={userId} />
    </>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function UserOverviewTab({ userId }: UserOverviewTabProps) {
  const { data: projectsData, isLoading: projectsLoading } = useGetUserProjects(userId, { per_page: 5 });
  const { data: skillsData, isLoading: skillsLoading } = useGetSkillsForUser(userId);

  const projects = projectsData?.data ?? [];
  const topSkills = [...(skillsData?.data ?? [])].sort((a, b) => b.pivot.level - a.pivot.level).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ComposedCard title="Projects" headerClassName="mb-4">
          <div className="space-y-2.5">
            {projectsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[52px] rounded-xl" />)
            ) : projects.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-8">No projects assigned</p>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{proj.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{proj.role}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      STATUS_STYLES[proj.status],
                    )}
                  >
                    {STATUS_LABELS[proj.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </ComposedCard>

        <ComposedCard title="Top Skills" headerClassName="mb-4">
          <div className="space-y-3.5">
            {skillsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkillBarSkeleton key={i} />)
            ) : topSkills.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-8">No skills recorded</p>
            ) : (
              topSkills.map((skill) => <SkillBar key={skill.id} name={skill.name} level={skill.pivot.level} />)
            )}
          </div>
        </ComposedCard>
      </div>

      <AbsencesCard userId={userId} />
    </div>
  );
}
