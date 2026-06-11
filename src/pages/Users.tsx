import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { PlusIcon, DotsThreeVerticalIcon, CalendarPlusIcon, TrashIcon, EyeIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog";
import useGetUsers from "@/api/user/useGetUsers";
import useDeleteUser from "@/api/user/useDeleteUser";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable, { type DataTableColumn } from "@/components/common/table/DataTable";
import { HighlightMatch } from "@/utils/useHighlightableText";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import UserStatusBadge from "@/components/specified/models/user/badges/UserStatusBadge.tsx";
import UsersStatCardsSection from "@/components/specified/pages/employees/UsersStatCardsSection.tsx";
import { type FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import CreateUserSheet from "@/components/specified/models/user/sheets/CreateUserSheet";
import CreateAbsenceSheet from "@/components/specified/models/absence/sheets/CreateAbsenceSheet";

/* ─── Types ────────────────────────────────────────────────── */

type EmpSortKey = "name" | "email" | "title";

/* ─── Row Actions ───────────────────────────────────────────── */

function UserActionsCell({ user }: { user: UserListItem }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [absenceSheetOpen, setAbsenceSheetOpen] = useState(false);

  const { deleteUser, isLoading: isDeleting } = useDeleteUser();

  const fullName = `${user.firstname} ${user.lastname}`;

  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      setConfirmDelete(false);
    } catch {
      console.error();
    }
  };

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button
        size="sm"
        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
        onClick={() => navigate(`/users/${user.id}`)}
      >
        <EyeIcon className="size-3.5" /> View
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 data-[state=open]:bg-muted data-[state=open]:text-foreground"
            aria-label="Employee actions"
          >
            <DotsThreeVerticalIcon className="size-4" weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className="min-w-[170px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setAbsenceSheetOpen(true)}>
            <CalendarPlusIcon weight="bold" />
            Create absence
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
            <TrashIcon weight="bold" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateAbsenceSheet open={absenceSheetOpen} onOpenChange={setAbsenceSheetOpen} userId={String(user.id)} />

      <ComposedAlertDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete "${fullName}"?`}
        description="This action cannot be undone. The employee and related data will be permanently removed."
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isPending={isDeleting}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ─── Employee List ─────────────────────────────────────────── */

const USER_STATUS_FILTER_OPTIONS: FilterPillOption<UserStatus | null>[] = [
  { value: null, label: "All" },
  { value: "available", label: "Available" },
  { value: "away", label: "Away" },
];

function SkillsCell({ skills }: { skills: UserSkillItem[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-semibold text-foreground text-[14px]">{skills.length}</span>
      <span className="text-muted-foreground text-[11px]">skills</span>
      <div className="flex gap-1 ml-1 flex-wrap">
        {skills.slice(0, 3).map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60"
          >
            {s.name}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
            +{skills.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}

const USER_COLUMNS: DataTableColumn<UserListItem, EmpSortKey>[] = [
  {
    key: "employee",
    header: "Employee",
    sortKey: "name",
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
    cell: (emp) => <SkillsCell skills={emp.skills} />,
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
    cell: (emp) => <UserActionsCell user={emp} />,
  },
];

export default function Users() {
  const navigate = useNavigate();

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
        title="All Employees"
        breadcrumb={[{ label: "Employees" }]}
        actions={
          <div className="flex gap-2">
            <Button size="lg" onClick={() => setSheetOpen(true)}>
              <PlusIcon /> Add a New Employee
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <UsersStatCardsSection />

        <DataTable<UserListItem, EmpSortKey, UserStatus>
          title="All Employees"
          hook={(params) => useGetUsers<UserListItem>(params)}
          columns={USER_COLUMNS}
          defaultSort="name"
          searchable
          searchPlaceholder="Search employees..."
          filter={{ field: "status", options: USER_STATUS_FILTER_OPTIONS }}
          includes={["department", "skills"]}
          onRowClick={(emp) => navigate(`/users/${emp.id}`)}
          emptyMessage="No employees match your filters."
          errorMessage="Failed to load employees. Check API connection."
        />
      </div>

      <CreateUserSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
