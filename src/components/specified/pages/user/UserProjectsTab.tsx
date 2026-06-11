import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { FolderPlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HighlightMatch } from "@/utils/useHighlightableText";
import DataTable, { type DataTableColumn } from "@/components/common/table/DataTable";
import type { FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import ProjectStatusBadge from "@/components/specified/models/projects/badges/ProjectStatusBadge.tsx";
import AddUserProjectsSheet from "@/components/specified/models/projects/sheets/AddUserProjectsSheet";
import useGetUserProjects from "@/api/user/useGetUserProjects";
import { formatDate } from "@/utils/formatters/date.ts";

type ProjectSortField = "name" | "risk_score" | "team_availability" | "knowledge_coverage" | "created_at";

const STATUS_FILTER_OPTIONS: FilterPillOption<ProjectStatus | null>[] = [
  { value: null, label: "All" },
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const SEVERITY_TEXT: Record<Severity, string> = {
  ok: "text-success",
  warning: "text-warning",
  critical: "text-danger",
};

const SEVERITY_DOT: Record<Severity, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  critical: "bg-danger",
};

function MetricCell({ metric, withRaw = false }: { metric: MetricResult | null | undefined; withRaw?: boolean }) {
  if (!metric) return <span className="text-[13px] text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1.5" title={metric.insight ?? undefined}>
      <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", SEVERITY_DOT[metric.severity])} />
      <span className={cn("text-[13px] font-semibold whitespace-nowrap", SEVERITY_TEXT[metric.severity])}>
        {metric.value}
        {withRaw && metric.value_raw !== null && metric.value_raw !== undefined && (
          <span className="ml-1 tabular-nums opacity-70">({metric.value_raw})</span>
        )}
      </span>
    </div>
  );
}

export default function UserProjectsTab({ userId }: { userId: string | undefined }) {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);

  const columns: DataTableColumn<Project, ProjectSortField>[] = [
    {
      key: "project",
      header: "Project",
      sortKey: "name",
      cell: (proj, { search }) => (
        <div className="max-w-[280px]">
          <p className="font-semibold text-foreground text-[14px] truncate">
            <HighlightMatch text={proj.name} searchTerm={search} />
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
            <HighlightMatch text={proj.description} searchTerm={search} />
          </p>
        </div>
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
      cell: (proj) => <ProjectStatusBadge status={proj.status} />,
      skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
    },
    {
      key: "fragility",
      header: "Fragility",
      sortKey: "risk_score",
      cell: (proj) => <MetricCell metric={proj.fragility} withRaw />,
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      key: "team_availability",
      header: "Team Availability",
      sortKey: "team_availability",
      cell: (proj) => <MetricCell metric={proj.team_availability} withRaw />,
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      key: "knowledge_coverage",
      header: "Knowledge Coverage",
      sortKey: "knowledge_coverage",
      cell: (proj) => <MetricCell metric={proj.knowledge_coverage} />,
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      key: "deadline",
      header: "Deadline",
      cell: (proj) => {
        const overdue = !!proj.deadline && new Date(proj.deadline) < new Date() && proj.status !== "completed";
        return (
          <div>
            <span
              className={cn("text-[12px] font-medium whitespace-nowrap", overdue ? "text-danger" : "text-foreground")}
            >
              {proj.deadline ? formatDate(proj.deadline) : "—"}
            </span>
            {overdue && <p className="text-[10px] text-danger mt-0.5 font-medium">Overdue</p>}
          </div>
        );
      },
      skeleton: <Skeleton className="h-3.5 w-20" />,
    },
    {
      key: "actions",
      header: "Actions",
      stopPropagation: true,
      cell: (proj) => (
        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
          onClick={() => navigate(`/projects/${proj.id}`)}
        >
          <Eye className="size-3.5" /> View
        </Button>
      ),
      skeleton: <Skeleton className="h-8 w-14 rounded-lg" />,
    },
  ];

  return (
    <>
      <DataTable<Project, ProjectSortField, ProjectStatus>
        title="Assigned Projects"
        hook={(params) => useGetUserProjects(userId, params)}
        columns={columns}
        defaultSort="name"
        searchPlaceholder="Search projects..."
        filter={{ options: STATUS_FILTER_OPTIONS, field: "status" }}
        onRowClick={(proj) => navigate(`/projects/${proj.id}`)}
        emptyMessage="No projects match your filters."
        errorMessage="Failed to load projects. Check API connection."
        headerAction={
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            disabled={!userId}
            className="gap-1.5 h-9 px-3 text-[12px] font-medium rounded-lg btn-press"
          >
            <FolderPlusIcon className="size-3.5" weight="bold" />
            Assign project
          </Button>
        }
      />
      <AddUserProjectsSheet userId={userId} open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
