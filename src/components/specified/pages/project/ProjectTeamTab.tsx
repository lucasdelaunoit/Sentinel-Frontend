import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { UserPlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HighlightMatch } from "@/utils/useHighlightableText";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import UserStatusBadge from "@/components/specified/models/user/badges/UserStatusBadge.tsx";
import DataTable, { type DataTableColumn } from "@/components/common/table/DataTable";
import type { FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import useGetProjectUsers from "@/api/projects/useGetProjectUsers";
import AddProjectMembersSheet from "@/components/specified/models/projects/sheets/AddProjectMembersSheet";
import type { UserListItem } from "@/types/dashboard";

type TeamSortableField = "firstname" | "lastname" | "title" | "created_at";

const STATUS_FILTER_OPTIONS: FilterPillOption<UserStatus | null>[] = [
  { value: null, label: "All" },
  { value: "available", label: "Available" },
  { value: "away", label: "Away" },
];

export default function ProjectTeamTab({ projectId }: { projectId: string | undefined }) {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);

  const columns: DataTableColumn<UserListItem, TeamSortableField>[] = [
    {
      key: "member",
      header: "Member",
      sortKey: "firstname",
      cell: (emp, { search }) => (
        <div className="flex items-center gap-3">
          <UserAvatar firstname={emp.firstname} lastname={emp.lastname} variant={emp.status} size="lg" />
          <div>
            <p className="font-semibold text-foreground text-[14px]">
              <HighlightMatch text={`${emp.firstname} ${emp.lastname}`} searchTerm={search} />
            </p>
            <p className="text-[12px] text-muted-foreground">
              <HighlightMatch text={emp.email} searchTerm={search} />
            </p>
          </div>
        </div>
      ),
      skeleton: (
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (emp) => (
        <span className="inline-flex items-center rounded-md bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground/70">
          {emp.department?.name ?? "—"}
        </span>
      ),
      skeleton: <Skeleton className="h-5 w-20 rounded-md" />,
    },
    {
      key: "title",
      header: "Title",
      sortKey: "title",
      cell: (emp) => <span className="text-[13px] text-foreground">{emp.title || "—"}</span>,
      skeleton: <Skeleton className="h-3.5 w-28" />,
    },
    {
      key: "status",
      header: "Work status",
      cell: (emp) => <UserStatusBadge status={emp.status} />,
      skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
    },
    {
      key: "skills",
      header: "Skills",
      cell: (emp) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-foreground text-[14px]">{emp.skills.length}</span>
          <span className="text-muted-foreground text-[11px]">skills</span>
          <div className="flex gap-1 ml-1 flex-wrap">
            {emp.skills.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60"
              >
                {s.name}
              </span>
            ))}
            {emp.skills.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
                +{emp.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      ),
      skeleton: (
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      stopPropagation: true,
      cell: (emp) => (
        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
          onClick={() => navigate(`/users/${emp.id}`)}
        >
          <Eye className="size-3.5" /> View
        </Button>
      ),
      skeleton: <Skeleton className="h-8 w-14 rounded-lg" />,
    },
  ];

  return (
    <>
      <DataTable<UserListItem, TeamSortableField, UserStatus>
        title="Project Team"
        hook={(params) => useGetProjectUsers(projectId, params)}
        columns={columns}
        defaultSort="firstname"
        searchPlaceholder="Search team members..."
        filter={{ options: STATUS_FILTER_OPTIONS, field: "status" }}
        includes={["department", "skills"]}
        onRowClick={(emp) => navigate(`/users/${emp.id}`)}
        emptyMessage="No team members match your filters."
        errorMessage="Failed to load team. Check API connection."
        headerAction={
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            disabled={!projectId}
            className="gap-1.5 h-9 px-3 text-[12px] font-medium rounded-lg btn-press"
          >
            <UserPlusIcon className="size-3.5" weight="bold" />
            Add member
          </Button>
        }
      />
      <AddProjectMembersSheet projectId={projectId} open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
