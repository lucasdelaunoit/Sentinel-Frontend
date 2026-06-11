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
import ProjectsStatCardsSection from "@/components/specified/pages/projects/ProjectsStatCardsSection.tsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import useGetProjects from "@/api/projects/useGetProjects";
import CreateProjectSheet from "@/components/specified/models/projects/sheets/CreateProjectSheet.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable, { type DataTableColumn } from "@/components/common/table/DataTable";
import { HighlightMatch } from "@/utils/useHighlightableText";
import ProjectStatusBadge from "@/components/specified/models/projects/badges/ProjectStatusBadge.tsx";
import { type FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog";
import usePauseProject from "@/api/projects/usePauseProject";
import useResumeProject from "@/api/projects/useResumeProject";
import useCompleteProject from "@/api/projects/useCompleteProject";
import useReopenProject from "@/api/projects/useReopenProject";
import useArchiveProject from "@/api/projects/useArchiveProject";
import useUnarchiveProject from "@/api/projects/useUnarchiveProject";
import { formatDate } from "@/utils/formatters/date.ts";
import { SEVERITY_BG, SEVERITY_TEXT } from "@/lib/theme/severity.ts";

/* ─── Types ────────────────────────────────────────────────── */

type ProjSortKey = "name" | "risk_score" | "team_availability" | "knowledge_coverage" | "created_at";

/* ─── Helpers ───────────────────────────────────────────────── */

function severityText(card: { severity: Severity }) {
  return SEVERITY_TEXT[card.severity];
}
function severityDot(card: { severity: Severity }) {
  return SEVERITY_BG[card.severity];
}

/* ─── Row Actions ───────────────────────────────────────────── */

type ConfirmKind = "complete" | "archive";

function ProjectActionsCell({ project }: { project: Project }) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);

  const pause = usePauseProject();
  const resume = useResumeProject();
  const complete = useCompleteProject();
  const reopen = useReopenProject();
  const archive = useArchiveProject();
  const unarchive = useUnarchiveProject();

  const args = { id: project.id, name: project.name };

  const confirmPending =
    confirm === "complete" ? complete.isLoading : confirm === "archive" ? archive.isLoading : false;

  const handleConfirm = () => {
    if (confirm === "complete") {
      complete.completeProject(args, { onSuccess: () => setConfirm(null) });
    } else if (confirm === "archive") {
      archive.archiveProject(args, { onSuccess: () => setConfirm(null) });
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
          {project.status === "archived" && (
            <DropdownMenuItem onSelect={() => unarchive.unarchiveProject(args)}>
              <ArchiveBoxIcon weight="bold" />
              Unarchive
            </DropdownMenuItem>
          )}
          {(project.status === "active" || project.status === "planned") && (
            <DropdownMenuItem onSelect={() => pause.pauseProject(args)}>
              <PauseIcon weight="bold" />
              Pause
            </DropdownMenuItem>
          )}
          {project.status === "paused" && (
            <DropdownMenuItem onSelect={() => resume.resumeProject(args)}>
              <PlayIcon weight="bold" />
              Resume
            </DropdownMenuItem>
          )}
          {project.status === "completed" && (
            <DropdownMenuItem onSelect={() => reopen.reopenProject(args)}>
              <ArrowUUpLeftIcon weight="bold" />
              Reopen
            </DropdownMenuItem>
          )}
          {project.status !== "archived" && project.status !== "completed" && (
            <DropdownMenuItem onSelect={() => setConfirm("complete")}>
              <CheckCircleIcon weight="bold" />
              Complete
            </DropdownMenuItem>
          )}
          {project.status !== "archived" && (
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

/** Severity dot + value cell for a project metric. `raw`: how to render value_raw alongside value. */
function StatDotCell({ metric, raw = "none" }: { metric?: MetricResult | null; raw?: "inline" | "paren" | "none" }) {
  if (!metric) return <span className="text-[13px] text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1.5" title={metric.insight ?? undefined}>
      <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", severityDot(metric))} />
      <span className={cn("text-[13px] font-semibold whitespace-nowrap", severityText(metric))}>
        {metric.value}
        {raw === "paren" && ` (${metric.value_raw})`}
        {raw === "inline" && metric.value_raw != null && (
          <span className="ml-1 tabular-nums opacity-70">{metric.value_raw}</span>
        )}
      </span>
    </div>
  );
}

const PROJECT_COLUMNS: DataTableColumn<Project, ProjSortKey>[] = [
  {
    key: "name",
    header: "Project",
    sortKey: "name",
    className: "max-w-[260px]",
    cell: (project, { search }) => (
      <>
        <p className="font-semibold text-foreground text-[14px] truncate">
          <HighlightMatch text={project.name} searchTerm={search} />
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
          <HighlightMatch text={project.description} searchTerm={search} />
        </p>
      </>
    ),
    skeleton: (
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (project) => <ProjectStatusBadge status={project.status} />,
    skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
  },
  {
    key: "fragility",
    header: "Fragility",
    sortKey: "risk_score",
    cell: (project) => <StatDotCell metric={project.fragility} raw="inline" />,
  },
  {
    key: "team_availability",
    header: "Team Availability",
    sortKey: "team_availability",
    cell: (project) => <StatDotCell metric={project.team_availability} raw="paren" />,
  },
  {
    key: "knowledge_coverage",
    header: "Knowledge Coverage",
    sortKey: "knowledge_coverage",
    cell: (project) => <StatDotCell metric={project.knowledge_coverage} />,
  },
  {
    key: "deadline",
    header: "Deadline",
    cell: (project) => {
      const overdue = new Date(project.deadline) < new Date() && project.status !== "completed";
      return (
        <>
          <span
            className={cn("text-[12px] font-medium whitespace-nowrap", overdue ? "text-danger" : "text-foreground")}
          >
            {project.deadline ? formatDate(project.deadline) : "-"}
          </span>
          {overdue && <p className="text-[10px] text-danger mt-0.5 font-medium">Overdue</p>}
        </>
      );
    },
  },
  {
    key: "actions",
    header: "Actions",
    stopPropagation: true,
    cell: (project) => <ProjectActionsCell project={project} />,
  },
];

function ProjectList() {
  const navigate = useNavigate();
  return (
    <DataTable<Project, ProjSortKey, ProjectStatus>
      title="All Projects"
      hook={(params) => useGetProjects(params)}
      columns={PROJECT_COLUMNS}
      defaultSort="name"
      searchable
      searchPlaceholder="Search projects..."
      filter={{ field: "status", options: STATUS_FILTER_OPTIONS }}
      onRowClick={(project) => navigate(`/projects/${project.id}`)}
      emptyMessage="No projects match your filters."
      errorMessage="Failed to load projects. Check API connection."
    />
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
        breadcrumb={[{ label: "Projects" }]}
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
