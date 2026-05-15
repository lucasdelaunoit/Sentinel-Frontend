import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  PlusIcon,
  DotsThreeVerticalIcon,
  ArchiveIcon,
  ArchiveBoxIcon,
  PauseIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowUUpLeftIcon,
} from "@phosphor-icons/react";
import ComposedCard from "@/components/common/cards/ComposedCard";
import ProjectsStatCardsSection from "@/components/specified/pages/projects/ProjectsStatCardsSection.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import useGetProjects from "@/api/projects/useGetProjects";
import CreateProjectSheet from "@/components/specified/models/projects/sheets/CreateProjectSheet.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableTableHead } from "@/components/common/table/SortableTableHead";
import { TablePagination } from "@/components/common/table/TablePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import { HighlightMatch } from "@/utils/useHighlightableText";
import ProjectStatusBadge from "@/components/specified/models/projects/badges/ProjectStatusBadge.tsx";
import HealthBar from "@/components/specified/models/projects/datas/HealthBar.tsx";
import FilterPillGroup, { type FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog";
import type { ProjectListItem } from "@/types/dashboard";
import usePauseProject from "@/api/projects/usePauseProject";
import useResumeProject from "@/api/projects/useResumeProject";
import useCompleteProject from "@/api/projects/useCompleteProject";
import useReopenProject from "@/api/projects/useReopenProject";
import useArchiveProject from "@/api/projects/useArchiveProject";
import useUnarchiveProject from "@/api/projects/useUnarchiveProject";

/* ─── Types ────────────────────────────────────────────────── */

type ProjSortKey = "name" | "risk_score" | "bus_factor" | "health" | "deadline";

/* ─── Helpers ───────────────────────────────────────────────── */

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function riskColor(v: number) {
  if (v >= 20) return "text-danger";
  if (v >= 12) return "text-amber-500";
  return "text-success";
}

function riskDotColor(v: number) {
  if (v >= 20) return "bg-danger";
  if (v >= 12) return "bg-amber-400";
  return "bg-success";
}

function busFactorColor(v: number) {
  if (v <= 1) return "text-danger";
  if (v <= 2) return "text-amber-500";
  return "text-success";
}

/* ─── Row Actions ───────────────────────────────────────────── */

type ConfirmKind = "complete" | "archive";

function deriveState(project: ProjectListItem): ProjectStatus {
  if (project.archived_at) return "archived";
  if (project.completed_at) return "completed";
  if (project.paused_at) return "paused";
  return project.status;
}

function ProjectActionsCell({ project }: { project: ProjectListItem }) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);

  const pause = usePauseProject();
  const resume = useResumeProject();
  const complete = useCompleteProject();
  const reopen = useReopenProject();
  const archive = useArchiveProject();
  const unarchive = useUnarchiveProject();

  const state = deriveState(project);
  const args = { id: project.id, name: project.name };

  const confirmPending =
    confirm === "complete" ? complete.isPending : confirm === "archive" ? archive.isPending : false;

  const handleConfirm = () => {
    if (confirm === "complete") {
      complete.mutate(args, { onSuccess: () => setConfirm(null) });
    } else if (confirm === "archive") {
      archive.mutate(args, { onSuccess: () => setConfirm(null) });
    }
  };

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button
        size="sm"
        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
        onClick={() => navigate(`/projects/${project.id}`)}
      >
        <Eye className="size-3.5" /> View
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 data-[state=open]:bg-muted data-[state=open]:text-foreground"
            aria-label="Project actions"
          >
            <DotsThreeVerticalIcon className="size-4" weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className="min-w-[170px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {state === "archived" && (
            <DropdownMenuItem onSelect={() => unarchive.mutate(args)}>
              <ArchiveBoxIcon weight="bold" />
              Unarchive
            </DropdownMenuItem>
          )}
          {(state === "active" || state === "planned") && (
            <DropdownMenuItem onSelect={() => pause.mutate(args)}>
              <PauseIcon weight="bold" />
              Pause
            </DropdownMenuItem>
          )}
          {state === "paused" && (
            <DropdownMenuItem onSelect={() => resume.mutate(args)}>
              <PlayIcon weight="bold" />
              Resume
            </DropdownMenuItem>
          )}
          {state === "completed" && (
            <DropdownMenuItem onSelect={() => reopen.mutate(args)}>
              <ArrowUUpLeftIcon weight="bold" />
              Reopen
            </DropdownMenuItem>
          )}
          {state !== "archived" && state !== "completed" && (
            <DropdownMenuItem onSelect={() => setConfirm("complete")}>
              <CheckCircleIcon weight="bold" />
              Complete
            </DropdownMenuItem>
          )}
          {state !== "archived" && (
            <DropdownMenuItem onSelect={() => setConfirm("archive")}>
              <ArchiveIcon weight="bold" />
              Archive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ComposedAlertDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "archive" ? `Archive "${project.name}"?` : `Mark "${project.name}" as completed?`}
        description={
          confirm === "archive"
            ? "The project will be hidden from active views. You can unarchive it later."
            : "Completing locks the project as done. You can reopen it later if needed."
        }
        confirmLabel={confirm === "archive" ? "Archive" : "Complete"}
        pendingLabel={confirm === "archive" ? "Archiving..." : "Completing..."}
        variant={confirm === "archive" ? "destructive" : "default"}
        isPending={confirmPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

/* ─── Project List ──────────────────────────────────────────── */

const STATUS_FILTER_OPTIONS: FilterPillOption<ProjectStatus | null>[] = [
  { value: null, label: "All" },
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

function ProjectList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | null>(null);
  const { sort, toggleSort } = useTableSort<ProjSortKey>("name");
  const { page, setPage, perPage, setPerPage } = useTablePagination(15, [search, statusFilter]);

  const { data, isLoading, isError } = useGetProjects({
    page,
    per_page: perPage,
    search: search || undefined,
    sorts: [{ field: sort.key, direction: sort.dir }],
    filters: statusFilter !== null ? [{ field: "status", value: statusFilter }] : undefined,
    includes: ["team", "skills"],
  });

  const projects = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;

  const toolbarAction = (
    <>
      {!isLoading && (
        <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
          {total}
        </span>
      )}
      <div className="flex-1" />
      <FilterPillGroup options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search projects..." />
    </>
  );

  return (
    <ComposedCard
      title="All Projects"
      action={toolbarAction}
      className="p-0 overflow-hidden"
      headerClassName="px-6 pt-4 flex-wrap gap-3"
    >
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
            <SortableTableHead label="Project" col="name" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Status
            </TableHead>
            <SortableTableHead
              label="Risk"
              col="risk_score"
              sortKey={sort.key}
              sortDir={sort.dir}
              onSort={toggleSort}
            />
            <SortableTableHead
              label="Bus Factor"
              col="bus_factor"
              sortKey={sort.key}
              sortDir={sort.dir}
              onSort={toggleSort}
            />
            <SortableTableHead label="Health" col="health" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <SortableTableHead
              label="Deadline"
              col="deadline"
              sortKey={sort.key}
              sortDir={sort.dir}
              onSort={toggleSort}
            />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-border/40">
          {isLoading ? (
            Array.from({ length: perPage > 10 ? 8 : perPage }).map((_, i) => (
              <TableRow key={i} className="border-border/40">
                <TableCell className="px-5 py-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-56" />
                    <div className="flex gap-1 mt-1">
                      <Skeleton className="h-4 w-14 rounded-md" />
                      <Skeleton className="h-4 w-12 rounded-md" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <HealthBar.Skeleton />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-3.5 w-20" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-8 w-14 rounded-lg" />
                </TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Failed to load projects. Check API connection.
              </TableCell>
            </TableRow>
          ) : projects.length === 0 ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No projects match your filters.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const overdue = new Date(project.deadline) < new Date() && project.status !== "completed";
              return (
                <TableRow
                  key={project.id}
                  className="hover:bg-muted/20 transition-colors group cursor-pointer border-border/40"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <TableCell className="px-5 py-4 max-w-[260px]">
                    <p className="font-semibold text-foreground text-[14px] truncate">
                      <HighlightMatch text={project.name} searchTerm={search} />
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                      <HighlightMatch text={project.description} searchTerm={search} />
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {(project.skills ?? []).slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60"
                        >
                          {s.name}
                        </span>
                      ))}
                      {(project.skills ?? []).length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
                          +{(project.skills ?? []).length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <ProjectStatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn("size-1.5 rounded-full shrink-0 shadow-sm", riskDotColor(project.risk_score))}
                      />
                      <span className={cn("text-[14px] font-bold tabular-nums", riskColor(project.risk_score))}>
                        {project.risk_score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span className={cn("text-[14px] font-bold tabular-nums", busFactorColor(project.bus_factor))}>
                      {project.bus_factor}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <HealthBar value={project.health} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={cn(
                        "text-[12px] font-medium whitespace-nowrap",
                        overdue ? "text-rose-500" : "text-foreground",
                      )}
                    >
                      {fmtDate(project.deadline)}
                    </span>
                    {overdue && <p className="text-[10px] text-rose-400 mt-0.5 font-medium">Overdue</p>}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <ProjectActionsCell project={project} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {!isLoading && !isError && (
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
  );
}

/* ─── Projects Page ─────────────────────────────────────────── */

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setSheetOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <TopBar
        title="All Projects"
        actions={
          <Button onClick={() => setSheetOpen(true)} size="lg">
            <PlusIcon className="size-3.5" weight="bold" />
            New Project
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <ProjectsStatCardsSection />

        <ProjectList />
      </div>

      <CreateProjectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
