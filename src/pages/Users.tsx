import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { PlusIcon, DotsThreeVerticalIcon, CalendarPlusIcon, TrashIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog";
import useGetUsers from "@/api/users/useGetUsers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { HighlightMatch } from "@/utils/useHighlightableText";
import { SortableTableHead } from "@/components/common/table/SortableTableHead";
import { TablePagination } from "@/components/common/table/TablePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import UserStatusBadge from "@/components/specified/models/employees/badges/UserStatusBadge.tsx";
import UsersStatCardsSection from "@/components/specified/pages/employees/UsersStatCardsSection.tsx";
import FilterPillGroup, { type FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import CreateUserSheet from "@/components/specified/models/employees/sheets/CreateUserSheet";
import type { UserListItem } from "@/types/dashboard";

/* ─── Types ────────────────────────────────────────────────── */

type EmpSortKey = "name" | "email" | "title";

/* ─── Row Actions ───────────────────────────────────────────── */

function UserActionsCell({ user }: { user: UserListItem }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fullName = `${user.firstname} ${user.lastname}`;

  const handleCreateAbsence = () => {
    toast.info(`TODO: create absence for "${fullName}"`);
  };

  const handleDelete = () => {
    toast.info(`TODO: delete "${fullName}"`);
    setConfirmDelete(false);
  };

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button
        size="sm"
        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
        onClick={() => navigate(`/users/${user.id}`)}
      >
        <Eye className="size-3.5" /> View
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
          <DropdownMenuItem onSelect={handleCreateAbsence}>
            <CalendarPlusIcon weight="bold" />
            Create absence
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
            <TrashIcon weight="bold" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ComposedAlertDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete "${fullName}"?`}
        description="This action cannot be undone. The employee and related data will be permanently removed."
        confirmLabel="Delete"
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

function UserList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);
  const { sort, toggleSort } = useTableSort<EmpSortKey>("name");
  const { page, setPage, perPage, setPerPage } = useTablePagination(15, [search, statusFilter]);

  const {
    data: users,
    total,
    lastPage,
    from,
    to,
    isLoading,
    isError,
  } = useGetUsers({
    page,
    per_page: perPage,
    search: search || undefined,
    sorts: [{ field: sort.key, direction: sort.dir }],
    filters: statusFilter !== null ? [{ field: "status", value: statusFilter }] : undefined,
    includes: ["department", "skills"],
  });

  const toolbarAction = (
    <>
      {!isLoading && (
        <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
          {total}
        </span>
      )}
      <div className="flex-1" />
      <FilterPillGroup options={USER_STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search employees..." />
    </>
  );

  return (
    <ComposedCard
      title="All Employees"
      action={toolbarAction}
      className="p-0 overflow-hidden"
      headerClassName="px-6 pt-4 flex-wrap gap-3"
    >
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
            <SortableTableHead label="Employee" col="name" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Department
            </TableHead>
            <SortableTableHead label="Title" col="title" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Work status
            </TableHead>
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Skills
            </TableHead>
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
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-3.5 w-28" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-12 rounded-md" />
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-8 w-14 rounded-lg" />
                </TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Failed to load employees. Check API connection.
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No employees match your filters.
              </TableCell>
            </TableRow>
          ) : (
            users.map((emp) => (
              <TableRow
                key={emp.id}
                className="hover:bg-muted/20 transition-colors group cursor-pointer border-border/40"
                onClick={() => navigate(`/users/${emp.id}`)}
              >
                <TableCell className="px-5 py-4">
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
                </TableCell>
                <TableCell className="px-5 py-4">
                  <span className="inline-flex items-center rounded-md bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground/70">
                    {emp.department?.name ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <span className="text-[13px] text-foreground">{emp.title || "—"}</span>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <UserStatusBadge status={emp.status} />
                </TableCell>
                <TableCell className="px-5 py-4">
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
                </TableCell>
                <TableCell className="px-5 py-4">
                  <UserActionsCell user={emp} />
                </TableCell>
              </TableRow>
            ))
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

/* ─── Employees Page ─────────────────────────────────────────── */

export default function Users() {
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

        <UserList />
      </div>

      <CreateUserSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
