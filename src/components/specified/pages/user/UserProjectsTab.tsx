import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HighlightMatch } from "@/utils/useHighlightableText";
import DataTable, { type DataTableColumn } from "@/components/common/table/DataTable";
import type { FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import ProjectStatusBadge from "@/components/specified/models/projects/badges/ProjectStatusBadge.tsx";
import useGetUserProjects from "@/api/users/useGetUserProjects";
import type { UserProjectItem, StatCardData } from "@/types/dashboard";
import { formatDate } from "@/utils/formatters/date.ts";

type ProjectSortField = "name" | "risk_score" | "bus_factor" | "deadline";

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

function MetricCell({ stat }: { stat: StatCardData | null | undefined }) {
  if (!stat) return <span className="text-[13px] text-muted-foreground">—</span>;
  const raw = stat.value_raw ?? stat.raw;
  return (
    <div className="flex items-center gap-1.5" title={stat.insight ?? undefined}>
      <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", SEVERITY_DOT[stat.severity])} />
      <span className={cn("text-[13px] font-semibold whitespace-nowrap", SEVERITY_TEXT[stat.severity])}>
        {stat.value}
        {raw !== null && raw !== undefined && <span className="ml-1 tabular-nums opacity-70">{raw}</span>}
      </span>
    </div>
  );
}

export default function UserProjectsTab({ userId }: { userId: string | undefined }) {
  const navigate = useNavigate();

  const columns: DataTableColumn<UserProjectItem, ProjectSortField>[] = [
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
      key: "role",
      header: "Role",
      cell: (proj) => <span className="text-[13px] text-foreground">{proj.role || "—"}</span>,
      skeleton: <Skeleton className="h-4 w-20" />,
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
      cell: (proj) => <MetricCell stat={proj.fragility} />,
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      key: "bus_factor",
      header: "Bus Factor",
      sortKey: "bus_factor",
      cell: (proj) => <MetricCell stat={proj.bus_factor} />,
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      key: "deadline",
      header: "Deadline",
      sortKey: "deadline",
      cell: (proj) => {
        const overdue = !!proj.deadline && new Date(proj.deadline) < new Date() && proj.status !== "completed";
        return (
          <div>
            <span className={cn("text-[12px] font-medium whitespace-nowrap", overdue ? "text-danger" : "text-foreground")}>
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
    <DataTable<UserProjectItem, ProjectSortField, ProjectStatus>
      title="Assigned Projects"
      hook={(params) => useGetUserProjects(userId, params)}
      columns={columns}
      defaultSort="name"
      searchPlaceholder="Search projects..."
      filter={{ options: STATUS_FILTER_OPTIONS, field: "status" }}
      onRowClick={(proj) => navigate(`/projects/${proj.id}`)}
      emptyMessage="No projects match your filters."
      errorMessage="Failed to load projects. Check API connection."
    />
  );
}
