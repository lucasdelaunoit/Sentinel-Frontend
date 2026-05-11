import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePage } from "@/context/PageContext";
import {
  PenSquare,
  Plus,
  Phone,
  User,
  CalendarDays,
  ShieldAlert,
  Users as UsersIcon,
  Code2,
  FolderKanban,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard";
import StatCard from "@/components/common/cards/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHead } from "@/components/common/table/SortableTableHead";
import { TablePagination } from "@/components/common/table/TablePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import { getInitials } from "@/utils/formatters/persons.ts";
import useGetUser from "@/api/users/useGetUser";
import useGetUserProjects from "@/api/users/useGetUserProjects";
import useGetUserSkills from "@/api/users/useGetUserSkills";
import type { UserSkillDetail } from "@/types/dashboard";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import UserProfileCard from "@/components/specified/pages/user/UserProfileCard.tsx";

/* ─── Types ───────────────────────────────────────────────── */

type DetailTab = "overview" | "projects" | "skills";
type ProjectSortKey = "name" | "progress" | "risk_score" | "bus_factor" | "end_date";

/* ─── Helpers ─────────────────────────────────────────────── */

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
];
function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

const CRITICALITY_STYLE: Record<string, string> = {
  high: "text-rose-500",
  medium: "text-amber-500",
  low: "text-emerald-500",
};

function capitalize(s: string | undefined) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ─── Project status helpers ──────────────────────────────── */

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

/* ─── Radar chart ─────────────────────────────────────────── */

const RADAR_AXES = ["FRONTEND", "BACKEND", "DEVOPS", "DATABASE", "SECURITY", "TESTING"] as const;

function radarPoint(cx: number, cy: number, r: number, i: number) {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function radarPath(values: number[], cx: number, cy: number, maxR: number) {
  const pts = values.map((v, i) => radarPoint(cx, cy, v * maxR, i));
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";
}

function hexPath(cx: number, cy: number, r: number) {
  return (
    Array.from({ length: 6 }, (_, i) => radarPoint(cx, cy, r, i))
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + "Z"
  );
}

function CompetencyRadar({ skills }: { skills: UserSkillDetail[] }) {
  const cx = 145,
    cy = 145,
    maxR = 95,
    labelR = maxR * 1.3;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const scores = RADAR_AXES.map((cat) => {
    const catSkills = skills.filter((s) => s.category.name.toUpperCase() === cat);
    if (catSkills.length === 0) return 0.25;
    return catSkills.reduce((sum, s) => sum + s.level, 0) / (catSkills.length * 5);
  });

  return (
    <svg width="290" height="290" viewBox="0 0 290 290" className="mx-auto">
      {gridLevels.map((r) => (
        <path key={r} d={hexPath(cx, cy, r * maxR)} fill="none" stroke="#E5E7EB" strokeWidth="1" />
      ))}
      {RADAR_AXES.map((_, i) => {
        const p = radarPoint(cx, cy, maxR, i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />;
      })}
      <path
        d={radarPath(scores, cx, cy, maxR)}
        fill="#DBEAFE"
        fillOpacity="0.55"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      {RADAR_AXES.map((label, i) => {
        const p = radarPoint(cx, cy, labelR, i);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontWeight="600"
            fill="#6B7280"
            letterSpacing="0.8"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Skill bar ───────────────────────────────────────────── */

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

/* ─── InfoChip ────────────────────────────────────────────── */

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className="text-[13px] font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

/* ─── Skeletons ───────────────────────────────────────────── */

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

/* ─── Overview Tab ────────────────────────────────────────── */

function OverviewTab({ userId }: { userId: string }) {
  const { data: projectsData, isLoading: projectsLoading } = useGetUserProjects(userId, {
    per_page: 5,
  });
  const { data: skills, isLoading: skillsLoading } = useGetUserSkills(userId);

  const projects = projectsData?.data ?? [];
  const topSkills = [...(skills ?? [])].sort((a, b) => b.level - a.level).slice(0, 6);

  return (
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
            topSkills.map((skill) => <SkillBar key={skill.id} name={skill.name} level={skill.level} />)
          )}
        </div>
      </ComposedCard>
    </div>
  );
}

/* ─── Projects Tab ────────────────────────────────────────── */

function ProjectsTab({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { sort, toggleSort } = useTableSort<ProjectSortKey>("name");
  const { page, setPage, perPage, setPerPage } = useTablePagination(10, []);

  const { data, isLoading, isError } = useGetUserProjects(userId, {
    page,
    per_page: perPage,
    sorts: [{ field: sort.key, direction: sort.dir }],
  });

  const projects = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;

  return (
    <ComposedCard
      title="Projects"
      action={
        <>
          {!isLoading && (
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              {total}
            </span>
          )}
          <div className="flex-1" />
          <Button size="xs" variant="outline" className="gap-1.5 text-[10px]">
            <Plus className="size-3" />
            Assign project
          </Button>
        </>
      }
      className="p-0 overflow-hidden"
      headerClassName="px-6 pt-5 pb-4 border-b border-border/60"
    >
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
            <SortableTableHead label="Project" col="name" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Role
            </TableHead>
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Status
            </TableHead>
            <SortableTableHead
              label="Progress"
              col="progress"
              sortKey={sort.key}
              sortDir={sort.dir}
              onSort={toggleSort}
            />
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
            <SortableTableHead label="Due" col="end_date" sortKey={sort.key} sortDir={sort.dir} onSort={toggleSort} />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-border/40">
          {isLoading ? (
            Array.from({ length: Math.min(perPage, 8) }).map((_, i) => (
              <TableRow key={i} className="border-border/40">
                <TableCell className="px-5 py-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-3 w-28 rounded-full" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Skeleton className="h-4 w-6" />
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
            <TableRow>
              <TableCell colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                Failed to load projects. Check API connection.
              </TableCell>
            </TableRow>
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No projects assigned.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((proj) => {
              const overdue = new Date(proj.end_date) < new Date() && proj.status !== "completed";
              return (
                <TableRow
                  key={proj.id}
                  className="hover:bg-muted/20 transition-colors cursor-pointer border-border/40"
                  onClick={() => navigate(`/projects/${proj.id}`)}
                >
                  <TableCell className="px-5 py-4 max-w-[220px]">
                    <p className="font-semibold text-foreground text-[14px] truncate">{proj.name}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{proj.description}</p>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-[13px] text-foreground">{proj.role}</TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        STATUS_STYLES[proj.status],
                      )}
                    >
                      {STATUS_LABELS[proj.status]}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2 min-w-[110px]">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${proj.progress}%` }} />
                      </div>
                      <span className="text-[12px] font-medium tabular-nums w-8 text-right">{proj.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", riskDotColor(proj.risk_score))} />
                      <span className={cn("text-[14px] font-bold tabular-nums", riskColor(proj.risk_score))}>
                        {proj.risk_score}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span className={cn("text-[14px] font-bold tabular-nums", busFactorColor(proj.bus_factor))}>
                      {proj.bus_factor}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={cn(
                        "text-[12px] font-medium whitespace-nowrap",
                        overdue ? "text-rose-500" : "text-foreground",
                      )}
                    >
                      {fmtDate(proj.end_date)}
                    </span>
                    {overdue && <p className="text-[10px] text-rose-400 mt-0.5 font-medium">Overdue</p>}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${proj.id}`);
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

/* ─── Skills Tab ──────────────────────────────────────────── */

function SkillsTab({ userId }: { userId: string }) {
  const { data: skills, isLoading, isError } = useGetUserSkills(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ComposedCard title="Skills & Proficiency" className="lg:col-span-3" headerClassName="mb-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkillBarSkeleton key={i} />
            ))}
          </div>
        </ComposedCard>
        <ComposedCard title="Competency Radar" className="lg:col-span-2" headerClassName="mb-4">
          <Skeleton className="w-[290px] h-[290px] rounded-full mx-auto" />
        </ComposedCard>
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground text-center py-12">Failed to load skills.</p>;
  }

  const list = skills ?? [];
  const left = list.filter((_, i) => i % 2 === 0);
  const right = list.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <ComposedCard
        title="Skills & Proficiency"
        action={
          <>
            <div className="flex-1" />
            <Button size="xs" variant="ghost" className="gap-1.5 text-[11px] text-muted-foreground">
              <Plus className="size-3.5" />
              Add Skill
            </Button>
          </>
        }
        className="lg:col-span-3"
        headerClassName="mb-5"
      >
        {list.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-8">No skills recorded</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {left.map((skill) => (
              <SkillBar key={skill.id} name={skill.name} level={skill.level} />
            ))}
            {right.map((skill) => (
              <SkillBar key={skill.id} name={skill.name} level={skill.level} />
            ))}
          </div>
        )}
      </ComposedCard>

      <ComposedCard title="Competency Radar" className="lg:col-span-2" headerClassName="mb-4">
        {list.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-8">No skills to display</p>
        ) : (
          <CompetencyRadar skills={list} />
        )}
      </ComposedCard>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { setTitle, setBreadcrumb } = usePage();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const { data: user, isLoading, isError } = useGetUser(id);

  useEffect(() => {
    if (user) {
      setTitle(`${user.firstname} ${user.lastname}`);
      setBreadcrumb("HR");
    }
    return () => {
      setTitle("");
      setBreadcrumb("");
    };
  }, [user?.id]);

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "projects", label: "Projects" },
    { key: "skills", label: "Skills" },
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-foreground">Employee not found</p>
        <Link to="/users" className="text-[13px] text-primary hover:underline underline-offset-4">
          Back to employees
        </Link>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title={isLoading ? "Loading…" : user ? `${user.firstname} ${user.lastname}` : "Employee"}
        breadcrumb="Employee"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero ─────────────────────────────────────────────── */}
        {isLoading ? <UserProfileCard.Skeleton /> : user && <UserProfileCard user={user} />}

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Criticality"
            icon={ShieldAlert}
            isLoading={isLoading}
            comment={null}
            value={
              user ? (
                <span className={CRITICALITY_STYLE[user.criticality ?? ""] ?? "text-foreground"}>
                  {capitalize(user.criticality)}
                </span>
              ) : null
            }
          />
          <StatCard
            title="Bus Factor in Org"
            icon={UsersIcon}
            isLoading={isLoading}
            value={user ? <span className="text-amber-500">{user.bus_factor}</span> : null}
            comment={
              user ? (
                <span className="text-[12px] text-muted-foreground">
                  {user.bus_factor <= 1 ? "Critical dependency" : "Distributed"}
                </span>
              ) : null
            }
          />
          <StatCard
            title="Skills"
            icon={Code2}
            isLoading={isLoading}
            value={user?.skills_count ?? "—"}
            comment={
              user?.expert_skills_count != null ? (
                <span className="text-[12px] text-muted-foreground">{user.expert_skills_count} expert-level</span>
              ) : null
            }
          />
          <StatCard
            title="Active Projects"
            icon={FolderKanban}
            isLoading={isLoading}
            value={user?.active_projects_count ?? "—"}
            comment={
              user?.projects_count != null ? (
                <span className="text-[12px] text-muted-foreground">{user.projects_count} total</span>
              ) : null
            }
          />
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-card border border-border/60 text-foreground hover:bg-muted/50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {id && (
          <>
            {activeTab === "overview" && <OverviewTab userId={id} />}
            {activeTab === "projects" && <ProjectsTab userId={id} />}
            {activeTab === "skills" && <SkillsTab userId={id} />}
          </>
        )}
      </div>
    </>
  );
}
