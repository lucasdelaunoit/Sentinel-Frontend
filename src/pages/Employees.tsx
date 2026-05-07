import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, PenSquare, X } from "lucide-react";
import ComposedCard from "@/components/common/cards/ComposedCard";
import EmployeesStatCardsSection from "@/components/specified/pages/employees/EmployeesStatCardsSection";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { PlusIcon } from "@phosphor-icons/react";
import useGetEmployees from "@/api/employees/useGetEmployees";
import EmployeeAvatar from "@/components/specified/models/employees/avatars/EmployeeAvatar.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeStatusBadge from "@/components/specified/models/employees/badges/EmployeeStatusBadge.tsx";
import { getInitials } from "@/utils/formatters/persons.ts";
import { HighlightMatch } from "@/utils/useHighlightableText";
import { SortableTableHead } from "@/components/common/table/SortableTableHead";
import { TablePagination } from "@/components/common/table/TablePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";

/* ─── Types ────────────────────────────────────────────────── */

type EmpSortKey = "name" | "email" | "title";

interface EmployeeFormData {
  name?: string;
  email?: string;
  department?: string;
  criticality?: string;
}

/* ─── Employee Modal ────────────────────────────────────────── */

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: EmployeeFormData;
}

function EmployeeModal({ open, onClose, employee }: EmployeeModalProps) {
  if (!open) return null;
  const isEdit = !!employee;

  const fieldCls =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-[480px] flex-col bg-card shadow-2xl">
        <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-primary via-primary to-transparent" />
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h2 className="text-[18px] font-bold text-foreground tracking-tight">
              {isEdit ? "Edit Employee" : "Add a New Employee"}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {isEdit
                ? "Update the employee information below"
                : "Fill in the details to create a new employee profile"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
          {[
            { label: "Full Name", type: "text", placeholder: "e.g. John Doe", defaultValue: employee?.name },
            {
              label: "Email Address",
              type: "email",
              placeholder: "e.g. john@company.com",
              defaultValue: employee?.email,
            },
          ].map(({ label, ...props }) => (
            <div key={label} className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">{label}</label>
              <input className={fieldCls} {...props} />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-foreground/70">Department</label>
            <select
              defaultValue={employee?.department ?? ""}
              className={cn(fieldCls, "appearance-none cursor-pointer")}
            >
              <option value="" disabled>
                Select a department
              </option>
              {["Management", "Engineering", "Design", "Data", "Security", "DevOps"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-foreground/70">Role / Position</label>
            <input type="text" placeholder="e.g. Senior Developer" className={fieldCls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-foreground/70">Start Date</label>
            <input type="date" className={fieldCls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-foreground/70">Criticality Level</label>
            <select
              defaultValue={employee?.criticality ?? ""}
              className={cn(fieldCls, "appearance-none cursor-pointer")}
            >
              <option value="" disabled>
                Select criticality
              </option>
              {["High", "Medium", "Low"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="shrink-0 px-8 py-5 border-t border-border/60">
          <Button
            className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-[13px] font-semibold shadow-sm shadow-primary/10 btn-press"
            onClick={onClose}
          >
            <PenSquare className="size-4" />
            {isEdit ? "Save Changes" : "Create Employee"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Employee List ─────────────────────────────────────────── */

function EmployeeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | null>(null);
  const { sort, toggleSort } = useTableSort<EmpSortKey>("name");
  const { page, setPage, perPage, setPerPage } = useTablePagination(15, [search, statusFilter]);

  const { data, isLoading, isError } = useGetEmployees({
    page,
    per_page: perPage,
    search: search || undefined,
    sorts: [{ field: sort.key, direction: sort.dir }],
    filters: statusFilter !== null ? [{ field: "status", value: statusFilter }] : undefined,
    includes: ["department", "skills"],
  });

  const employees = data?.data ?? [];
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
      <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-1">
        {([null, "available", "away"] as (EmployeeStatus | null)[]).map((val) => (
          <button
            key={String(val)}
            onClick={() => setStatusFilter(val)}
            className={cn(
              "px-3 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer",
              statusFilter === val
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {val === null ? "All" : val === "available" ? "Available" : "Away"}
          </button>
        ))}
      </div>
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
              Work mode
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
          ) : employees.length === 0 ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No employees match your filters.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => (
              <TableRow
                key={emp.id}
                className="hover:bg-muted/20 transition-colors group cursor-pointer border-border/40"
                onClick={() => navigate(`/employees/${emp.id}`)}
              >
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar initials={getInitials(emp.name)} variant={emp.status} size="lg" />
                    <div>
                      <p className="font-semibold text-foreground text-[14px]">
                        <HighlightMatch text={emp.name} searchTerm={search} />
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
                  <EmployeeStatusBadge status={emp.status} />
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
                  <Button
                    size="sm"
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employees/${emp.id}`);
                    }}
                  >
                    <Eye className="size-3.5" /> View
                  </Button>
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

export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <TopBar
        title="All Employees"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="font-semibold" size="lg" onClick={() => setModalOpen(true)}>
              <PlusIcon /> Add a New Employee
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <EmployeesStatCardsSection />

        <EmployeeList />
      </div>

      <EmployeeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
