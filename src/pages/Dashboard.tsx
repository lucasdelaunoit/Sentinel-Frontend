import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Users,
  AlertTriangle,
  Activity,
  ArrowRight,
  Calendar,
  Zap, CalendarCheck, PlayCircle,
  X,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/data/projects";
import { EMPLOYEE_DETAILS, type EmployeeDetail, type SkillCategory } from "@/data/employees";
import TopBar from "@/components/layout/TopBar.tsx";
import useGetDashboardStats from "@/hooks/useGetDashboardStats";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import HomeStatCardsSection from "@/components/specified/pages/home/HomeStatCardsSection.tsx";
import TeamStatusOfTodayCard from "@/components/specified/pages/home/TeamStatusOfTodayCard.tsx";
import KnowledgeCoverageOfToday from "@/components/specified/pages/home/KnowledgeCoverageOfToday.tsx";

/* ─── Avatar ──────────────────────────────────────────────── */

function Avatar({
  initials,
  color,
  size = "sm",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm",
        size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs",
        color,
      )}
    >
      {initials}
    </div>
  );
}

function AvatarGroup({
  members,
  extra,
}: {
  members: Array<{ initials: string; color: string }>;
  extra?: number;
}) {
  return (
    <div className="flex items-center">
      {members.map((m, i) => (
        <div
          key={i}
          className="ring-2 ring-card rounded-full"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar initials={m.initials} color={m.color} size="sm" />
        </div>
      ))}
      {extra != null && extra > 0 && (
        <div
          className="ring-2 ring-card flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
          style={{ marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ─── Bars ────────────────────────────────────────────────── */

function HealthBar({ value }: { value: number }) {
  const color =
    value >= 70
      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
      : value >= 55
        ? "bg-gradient-to-r from-amber-400 to-amber-500"
        : "bg-gradient-to-r from-rose-400 to-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted shadow-inner">
        <div
          className={cn("h-full rounded-full shadow-sm", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-sm"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{value}%</span>
    </div>
  );
}

/* ─── Critical Employee Card ──────────────────────────────── */

function CriticalEmployeeCard({
  employee,
  uniqueSkills,
  onClick,
}: {
  employee: EmployeeDetail;
  uniqueSkills: string[];
  onClick: () => void;
}) {
  const bfColor =
    employee.busFactor <= 1
      ? "text-rose-600 bg-rose-50 border-rose-200/60"
      : employee.busFactor <= 2
        ? "text-orange-600 bg-orange-50 border-orange-200/60"
        : "text-amber-600 bg-amber-50 border-amber-200/60";

  const critColor =
    employee.criticality === "High"
      ? "text-rose-500"
      : employee.criticality === "Medium"
        ? "text-amber-500"
        : "text-emerald-500";

  return (
    <button
      onClick={onClick}
      className="flex gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-border/80 transition-all text-left w-full group"
    >
      <Avatar initials={employee.initials} color={employee.color} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-foreground">
            {employee.name}
          </p>
          <span className={cn("shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border", bfColor)}>
            BF {employee.busFactor}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2 truncate">{employee.role}</p>
        <div className="flex items-center gap-1.5 mb-2">
          <span className={cn("text-[10px] font-semibold uppercase tracking-wide", critColor)}>
            {employee.criticality}
          </span>
          <span className="text-muted-foreground/40 text-[10px]">·</span>
          <span className="text-[10px] text-muted-foreground">
            {employee.projects.filter(p => p.status === "Active").length} active project{employee.projects.filter(p => p.status === "Active").length !== 1 ? "s" : ""}
          </span>
        </div>
        {uniqueSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {uniqueSkills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {uniqueSkills.length > 3 && (
              <span className="text-[9px] font-medium text-muted-foreground px-1 py-0.5">
                +{uniqueSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

/* ─── Risk Distribution Bar ───────────────────────────────── */

const RISK_LEVELS = [
  { label: "Critical", threshold: 25, color: "bg-rose-500", text: "text-rose-600", badge: "bg-rose-50 text-rose-600 border-rose-200/60" },
  { label: "High",     threshold: 15, color: "bg-orange-500", text: "text-orange-600", badge: "bg-orange-50 text-orange-600 border-orange-200/60" },
  { label: "Medium",   threshold: 8,  color: "bg-amber-400", text: "text-amber-600", badge: "bg-amber-50 text-amber-600 border-amber-200/60" },
  { label: "Low",      threshold: 0,  color: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-600 border-emerald-200/60" },
];

function getRiskLevel(score: number) {
  return (
    RISK_LEVELS.find((l, i) =>
      score >= l.threshold &&
      (i === 0 || score < RISK_LEVELS[i - 1].threshold),
    ) ?? RISK_LEVELS[3]
  );
}

/* ─── Modal ───────────────────────────────────────────────── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[82vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const employees = useMemo(() => Object.values(EMPLOYEE_DETAILS), []);

  /* ── Unique skills per employee ────────────────────────── */
  const uniqueSkillsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    employees.forEach(emp => {
      map[emp.id] = emp.skills
        .filter(s => s.level >= 3)
        .filter(s =>
          !employees
            .filter(e => e.id !== emp.id)
            .some(e => e.skills.some(es => es.name === s.name && es.level >= 3)),
        )
        .map(s => s.name);
    });
    return map;
  }, [employees]);

  /* ── Derived stats ─────────────────────────────────────── */
  const atRiskProjects = PROJECTS.filter(p => p.riskScore >= 15 || p.health < 60).length;
  const criticalProjectCount = PROJECTS.filter(p => p.riskScore >= 25 || p.health < 40).length;
  const unstableProjectCount = atRiskProjects - criticalProjectCount;
  const criticalAbsentCount = employees.filter(e => e.todayStatus === "Has Leave" && e.criticality === "High").length;


  const absenceImpactDetails = useMemo(() => {
    const absentIds = new Set(employees.filter(e => e.todayStatus === "Has Leave").map(e => e.id));
    const allSkillNames = [...new Set(employees.flatMap(e => e.skills.filter(s => s.level >= 3).map(s => s.name)))];
    return allSkillNames
      .map(skill => {
        const coveredBy = employees.filter(e => e.skills.some(s => s.name === skill && s.level >= 3));
        if (coveredBy.length === 0 || !coveredBy.every(e => absentIds.has(e.id))) return null;
        const category = coveredBy[0].skills.find(s => s.name === skill)?.category ?? "";
        const requiredBy = PROJECTS.filter(p => p.skills.includes(skill));
        return { skill, category, coveredBy, requiredBy };
      })
      .filter(Boolean) as { skill: string; category: string; coveredBy: typeof employees; requiredBy: typeof PROJECTS }[];
  }, [employees]);

  const absenceImpactSkills = absenceImpactDetails.length;

  /* ── Modal state ───────────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState<"risk" | "coverage" | "availability" | "impact" | null>(null);

  /* ── Dashboard stats (live) ────────────────────────────── */

  const criticalEmployees = useMemo(
    () => employees.filter(e => e.criticality === "High").sort((a, b) => a.busFactor - b.busFactor),
    [employees],
  );

  /* ── Risk distribution ─────────────────────────────────── */
  const riskDistribution = useMemo(() =>
    RISK_LEVELS.map((level, levelIdx) => {
      const prevThreshold = levelIdx > 0 ? RISK_LEVELS[levelIdx - 1].threshold : Infinity;
      const count = PROJECTS.filter(p => {
        const score = p.riskScore;
        return score >= level.threshold && score < prevThreshold;
      }).length;
      return { ...level, count };
    }),
    [],
  );
  const maxRiskCount = Math.max(...riskDistribution.map(r => r.count), 1);

  /* ── Upcoming leaves (next 30 days) ────────────────────── */
  const upcomingLeaves = useMemo(() => {
    const today = new Date("2026-04-21");
    const limit = new Date("2026-05-21");
    return employees
      .flatMap(e =>
        e.leaves
          .filter(l => {
            const d = new Date(l.startDate);
            return d >= today && d <= limit && l.status === "approved";
          })
          .map(l => ({ employee: e, leave: l })),
      )
      .sort((a, b) => new Date(a.leave.startDate).getTime() - new Date(b.leave.startDate).getTime());
  }, [employees]);

  /* ── Display lists ─────────────────────────────────────── */


  const criticalProjects = [...PROJECTS].sort((a, b) => b.riskScore - a.riskScore).slice(0, 2);
  const displayProjects = [...PROJECTS]
    .filter(p => p.status !== "Completed")
    .sort((a, b) => b.riskScore - a.riskScore);

  return (
    <>
      <TopBar
        title="Dashboard"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="font-semibold" size="lg" onClick={() => {}}>
              <CalendarCheck className="size-4" /> Import planning
            </Button>
            <Button onClick={() => navigate("/?simulate=true")} size="lg">
              <PlayCircle className="size-4" /> Simulate Leave
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 page-enter">
        {/* Today's Stats */}
        <HomeStatCardsSection />

        {/* Today's Overview Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Team Status */}
          <TeamStatusOfTodayCard />

          {/* KCI Chart */}
          <KnowledgeCoverageOfToday />

          {/* Critical Projects */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">Critical Projects</h3>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {atRiskProjects} at risk
              </span>
            </div>
            <div className="space-y-2.5">
              {criticalProjects.map((p, i) => {
                const level = getRiskLevel(p.riskScore);
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left hover:opacity-90 cursor-pointer",
                      i === 0
                        ? "bg-gradient-to-r from-rose-50/80 to-rose-50/40 border-rose-100/50 hover:from-rose-50 hover:to-rose-50"
                        : "bg-gradient-to-r from-amber-50/80 to-amber-50/40 border-amber-100/50 hover:from-amber-50 hover:to-amber-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
                        i === 0 ? "bg-gradient-to-br from-rose-500 to-rose-600" : "bg-gradient-to-br from-amber-500 to-amber-600",
                      )}
                    >
                      {p.id.slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className={cn("text-[11px] font-medium", i === 0 ? "text-rose-600" : "text-amber-600")}>
                        Bus factor: {p.busFactor} · Risk: {p.riskScore}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", level.badge)}>
                        {level.label}
                      </span>
                      <Eye className={cn("size-3.5 shrink-0", i === 0 ? "text-rose-400/70" : "text-amber-400/70")} />
                    </div>
                  </button>
                );
              })}
              <div className="pt-1">
                <button
                  onClick={() => navigate("/projects")}
                  className="w-full flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors font-medium py-2 rounded-xl hover:bg-muted/30"
                >
                  View all projects
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Staff + Risk Overview */}
        <div className="grid grid-cols-3 gap-4">
          {/* Critical Staff Panel */}
          <div className="col-span-2 rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-semibold text-foreground text-sm">Critical Staff</h3>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {criticalEmployees.length} high-risk dependencies
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              Employees whose absence would critically impact operations — highlighted skills are unique to them.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {criticalEmployees.map(emp => (
                <CriticalEmployeeCard
                  key={emp.id}
                  employee={emp}
                  uniqueSkills={uniqueSkillsMap[emp.id] ?? []}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-400 inline-block" />
                  Bus Factor 1 = single point of failure
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-1 py-0.5 rounded-full">skill</span>
                  Unique to this person
                </span>
              </div>
              <button
                onClick={() => navigate("/employees")}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                View all staff <ArrowRight className="size-3" />
              </button>
            </div>
          </div>

          {/* Risk Distribution + Upcoming Absences */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm flex flex-col gap-5">
            {/* Risk Distribution */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm">Risk Distribution</h3>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {PROJECTS.length} projects
                </span>
              </div>
              <div className="space-y-2.5">
                {riskDistribution.map(level => (
                  <div key={level.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-[11px] font-semibold", level.text)}>{level.label}</span>
                      <span className="text-[11px] font-bold text-foreground">{level.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", level.color)}
                        style={{ width: level.count === 0 ? "0%" : `${(level.count / maxRiskCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">
                Avg risk score:{" "}
                <span className="font-semibold text-foreground">
                  {Math.round(PROJECTS.reduce((s, p) => s + p.riskScore, 0) / PROJECTS.length)}
                </span>
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border/40" />

            {/* Upcoming Absences */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm">Upcoming Absences</h3>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">30 days</span>
              </div>
              {upcomingLeaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Calendar className="size-8 text-muted-foreground/30 mb-2" />
                  <p className="text-[11px] text-muted-foreground">No upcoming absences</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingLeaves.map(({ employee, leave }) => {
                    const start = new Date(leave.startDate);
                    const daysUntil = Math.ceil((start.getTime() - new Date("2026-04-21").getTime()) / (1000 * 60 * 60 * 24));
                    const typeColor =
                      leave.type === "vacation" ? "text-blue-600 bg-blue-50" :
                      leave.type === "sick" ? "text-rose-600 bg-rose-50" :
                      "text-violet-600 bg-violet-50";
                    return (
                      <div
                        key={`${employee.id}-${leave.id}`}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <Avatar initials={employee.initials} color={employee.color} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground truncate">{employee.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            {" · "}
                            <span className={cn("font-medium px-1 py-0.5 rounded text-[9px]", typeColor)}>
                              {leave.type}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "text-[10px] font-bold",
                            daysUntil <= 1 ? "text-rose-500" : daysUntil <= 3 ? "text-amber-500" : "text-muted-foreground"
                          )}>
                            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil}d`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick action */}
            <div className="mt-auto">
              <button
                onClick={() => navigate("/employees?tab=calendar")}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 py-2 rounded-xl transition-colors"
              >
                <Zap className="size-3" />
                Simulate absence impact
              </button>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-foreground">Active Projects</h3>
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                {displayProjects.length} shown
              </span>
            </div>
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              View all
              <ArrowRight className="size-3" />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                {["ID", "Project Name", "Status", "Progress", "Risk", "Bus Factor", "Health", "Team", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {displayProjects.map((p) => {
                const level = getRiskLevel(p.riskScore);
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground/70">{p.id}</span>
                    </td>
                    <td className="px-4 py-4 max-w-[220px]">
                      <p className="font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.description.slice(0, 55)}…</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                          p.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
                            : p.status === "On Hold"
                              ? "bg-amber-50 text-amber-700 ring-amber-200/60"
                              : "bg-violet-50 text-violet-700 ring-violet-200/60",
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ProgressBar value={p.progress} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", level.text)}>{p.riskScore}</span>
                        <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded border hidden group-hover:inline", level.badge)}>
                          {level.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          p.busFactor <= 1 ? "text-rose-500" : p.busFactor <= 2 ? "text-amber-500" : "text-emerald-600",
                        )}
                      >
                        {p.busFactor}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <HealthBar value={p.health} />
                    </td>
                    <td className="px-4 py-4">
                      <AvatarGroup members={p.team.slice(0, 3)} extra={p.team.length > 3 ? p.team.length - 3 : 0} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${p.id}`);
                        }}
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
