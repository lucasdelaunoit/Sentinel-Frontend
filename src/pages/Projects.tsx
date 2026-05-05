import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, X, Layers, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { PlusIcon } from "@phosphor-icons/react";
import StatCard from "@/components/common/cards/StatCard";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/TopBar.tsx";
import useGetProjects from "@/api/projects/useGetProjects";
import type { ProjectListItem } from "@/types/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableTableHead } from "@/components/common/table/SortableTableHead";
import { TablePagination } from "@/components/common/table/TablePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import { HighlightMatch } from "@/utils/useHighlightableText";

/* ─── Types ────────────────────────────────────────────────── */

type ProjSortKey = "name" | "progress" | "risk_score" | "bus_factor" | "health" | "end_date";

/* ─── Helpers ───────────────────────────────────────────────── */

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  on_hold: "On Hold",
  planning: "Planning",
  completed: "Completed",
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400",
  completed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400",
  on_hold: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400",
  planning: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400",
};

const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_DOT: Record<ProjectPriority, string> = {
  critical: "bg-rose-500 shadow-sm",
  high: "bg-orange-400 shadow-sm",
  medium: "bg-amber-400 shadow-sm",
  low: "bg-muted/60",
};

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-blue-500", "bg-amber-500",
  "bg-emerald-500", "bg-rose-500", "bg-violet-500", "bg-cyan-500",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function healthColor(v: number) {
  if (v >= 75) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
  if (v >= 55) return "bg-gradient-to-r from-amber-400 to-amber-500";
  return "bg-gradient-to-r from-rose-400 to-rose-500";
}

function healthTextColor(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 55) return "text-amber-500";
  return "text-rose-500";
}

function riskColor(v: number) {
  if (v >= 20) return "text-rose-500";
  if (v >= 12) return "text-amber-500";
  return "text-emerald-500";
}

function riskDotColor(v: number) {
  if (v >= 20) return "bg-rose-500";
  if (v >= 12) return "bg-amber-400";
  return "bg-emerald-500";
}

function busFactorColor(v: number) {
  if (v <= 1) return "text-rose-500";
  if (v <= 2) return "text-amber-500";
  return "text-emerald-500";
}

function progressBarColor(v: number) {
  if (v === 100) return "bg-gradient-to-r from-blue-500 to-blue-600";
  if (v >= 60) return "bg-gradient-to-r from-primary/80 to-primary";
  if (v >= 35) return "bg-gradient-to-r from-amber-400 to-amber-500";
  return "bg-muted";
}

/* ─── Sub-components ────────────────────────────────────────── */

function StatusBadge({ value }: { value: ProjectStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLES[value])}>
      {STATUS_LABELS[value]}
    </span>
  );
}

function PriorityDot({ value }: { value: ProjectPriority }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full shrink-0", PRIORITY_DOT[value])} />
      <span className="text-[12px] text-foreground">{PRIORITY_LABELS[value]}</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5 min-w-[110px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted shadow-inner overflow-hidden">
        <div className={cn("h-full rounded-full shadow-sm", progressBarColor(value))} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[12px] font-medium tabular-nums text-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

function HealthBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5 min-w-[100px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted shadow-inner overflow-hidden">
        <div className={cn("h-full rounded-full shadow-sm", healthColor(value))} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-[12px] font-semibold tabular-nums w-8 text-right", healthTextColor(value))}>{value}</span>
    </div>
  );
}

function AvatarGroup({ members, max = 4 }: { members: ProjectListItem["team"]; max?: number }) {
  const visible = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div key={m.id} title={m.name} className="ring-2 ring-card rounded-full" style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <div className={cn("flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0 shadow-sm", avatarColor(m.id))}>
            {m.initials}
          </div>
        </div>
      ))}
      {extra > 0 && (
        <div className="ring-2 ring-card flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground" style={{ marginLeft: -8 }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ─── Project Modal ─────────────────────────────────────────── */

function ProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const fieldCls =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-[480px] flex-col bg-card shadow-2xl">
        <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-primary via-primary to-transparent" />
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h2 className="text-[18px] font-bold text-foreground tracking-tight">New Project</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Create a new project in your portfolio</p>
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
            { label: "Project Name", type: "text", placeholder: "e.g. API Modernization" },
            { label: "Description", type: "text", placeholder: "Brief description of the project" },
          ].map(({ label, ...props }) => (
            <div key={label} className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">{label}</label>
              <input className={fieldCls} {...props} />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-foreground/70">Department</label>
            <select defaultValue="" className={cn(fieldCls, "appearance-none cursor-pointer")}>
              <option value="" disabled>Select a department</option>
              {["Engineering", "Data", "Design", "Security", "DevOps", "Management"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-foreground/70">Priority</label>
            <select defaultValue="" className={cn(fieldCls, "appearance-none cursor-pointer")}>
              <option value="" disabled>Select priority</option>
              {["Critical", "High", "Medium", "Low"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">Start Date</label>
              <input type="date" className={fieldCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">Target End Date</label>
              <input type="date" className={fieldCls} />
            </div>
          </div>
        </div>
        <div className="shrink-0 px-8 py-5 border-t border-border/60">
          <Button
            className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-[13px] font-semibold shadow-sm shadow-primary/10 btn-press"
            onClick={onClose}
          >
            <PlusIcon className="size-4" />
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Project List ──────────────────────────────────────────── */

const STATUS_FILTER_OPTIONS: (ProjectStatus | null)[] = [null, "active", "on_hold", "planning", "completed"];

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
      <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-1">
        {STATUS_FILTER_OPTIONS.map((val) => (
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
            {val === null ? "All" : STATUS_LABELS[val]}
          </button>
        ))}
      </div>
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
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Priority
            </TableHead>
            <SortableTableHead label="Progress" col="progress" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <SortableTableHead label="Risk" col="risk_score" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <SortableTableHead label="Bus Factor" col="bus_factor" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <SortableTableHead label="Health" col="health" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Team
            </TableHead>
            <SortableTableHead label="Due" col="end_date" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
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
                <TableCell className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-3.5 w-16" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-3 w-28 rounded-full" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-3 w-24 rounded-full" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-7 w-20 rounded-full" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-3.5 w-20" /></TableCell>
                <TableCell className="px-5 py-4"><Skeleton className="h-8 w-14 rounded-lg" /></TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={10} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Failed to load projects. Check API connection.
              </TableCell>
            </TableRow>
          ) : projects.length === 0 ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={10} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No projects match your filters.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const overdue = new Date(project.end_date) < new Date() && project.status !== "completed";
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
                        <span key={s.id} className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
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
                    <StatusBadge value={project.status} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <PriorityDot value={project.priority} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <ProgressBar value={project.progress} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", riskDotColor(project.risk_score))} />
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
                    <AvatarGroup members={project.team ?? []} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span className={cn("text-[12px] font-medium whitespace-nowrap", overdue ? "text-rose-500" : "text-foreground")}>
                      {fmtDate(project.end_date)}
                    </span>
                    {overdue && <p className="text-[10px] text-rose-400 mt-0.5 font-medium">Overdue</p>}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                    >
                      <Eye className="size-3.5" /> View
                    </Button>
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
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data, isLoading: statsLoading } = useGetProjects({ per_page: 1 });
  const total = data?.total;
  const totalDisplay = total != null ? String(total).padStart(2, "0") : "—";

  return (
    <>
      <TopBar title="All Projects" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Projects" value={totalDisplay} icon={Layers} isLoading={statsLoading} comment={null} />
          <StatCard title="Active" value="—" icon={CheckCircle2} isLoading={statsLoading} comment={null} />
          <StatCard title="At Risk" value="—" icon={AlertTriangle} isLoading={statsLoading} comment={null} />
          <StatCard title="Avg. Progress" value="—" icon={Clock} isLoading={statsLoading} comment={null} />
        </div>

        <ProjectList />
      </div>

      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
