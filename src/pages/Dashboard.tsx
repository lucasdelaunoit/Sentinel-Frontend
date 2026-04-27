import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  TrendingUp,
  TrendingDown,
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
import StatCard, { StatCardSkeleton } from "@/components/common/cards/StatCard.tsx";
import TopBar from "@/components/layout/TopBar.tsx";
import useGetDashboardStats from "@/hooks/useGetDashboardStats";
import type { Severity } from "@/types/api";
import {Card} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

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

/* ─── KCI Radar Chart ─────────────────────────────────────── */

const AXES: SkillCategory[] = ["FRONTEND", "BACKEND", "DEVOPS", "DATABASE", "SECURITY", "TESTING"];

function radarPoint(cx: number, cy: number, r: number, i: number) {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function radarPath(values: number[], cx: number, cy: number, maxR: number) {
  const pts = values.map((v, i) => radarPoint(cx, cy, v * maxR, i));
  return (
    pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + "Z"
  );
}

function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => radarPoint(cx, cy, r, i));
  return (
    pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + "Z"
  );
}

function KCIRadarChart({
  coverageValues,
  targetValues,
}: {
  coverageValues: number[];
  targetValues: number[];
}) {
  const cx = 100,
    cy = 100,
    maxR = 70,
    labelR = maxR * 1.35;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
      {gridLevels.map((r) => (
        <path
          key={r}
          d={hexPath(cx, cy, r * maxR)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}
      {AXES.map((_, i) => {
        const p = radarPoint(cx, cy, maxR, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      })}
      <path
        d={radarPath(targetValues, cx, cy, maxR)}
        fill="#DBEAFE"
        fillOpacity="0.35"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      <path
        d={radarPath(coverageValues, cx, cy, maxR)}
        fill="#FECACA"
        fillOpacity="0.55"
        stroke="#F87171"
        strokeWidth="2"
      />
      {AXES.map((label, i) => {
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
            letterSpacing="0.5"
          >
            {label}
          </text>
        );
      })}
    </svg>
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

  /* ── Computed coverage ─────────────────────────────────── */
  const coverageByCategory = useMemo(() =>
    AXES.map(cat => {
      const count = employees.filter(e =>
        e.skills.some(s => s.category === cat && s.level >= 3),
      ).length;
      return count / employees.length;
    }),
    [employees],
  );

  const avgCoverage = useMemo(
    () => Math.round((coverageByCategory.reduce((a, b) => a + b, 0) / AXES.length) * 100),
    [coverageByCategory],
  );

  const targetValues = [0.92, 0.88, 0.93, 0.87, 0.88, 0.92];

  const weakestCategories = useMemo(() => {
    return AXES
      .map((axis, i) => ({ axis, value: coverageByCategory[i] }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 2);
  }, [coverageByCategory]);

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
  const onLeaveCount = employees.filter(e => e.todayStatus === "Has Leave").length;
  const atRiskProjects = PROJECTS.filter(p => p.riskScore >= 15 || p.health < 60).length;
  const criticalProjectCount = PROJECTS.filter(p => p.riskScore >= 25 || p.health < 40).length;
  const unstableProjectCount = atRiskProjects - criticalProjectCount;
  const teamAvailable = employees.filter(e => e.todayStatus !== "Has Leave").length;
  const criticalAbsentCount = employees.filter(e => e.todayStatus === "Has Leave" && e.criticality === "High").length;

  const underCoveredCount = coverageByCategory.filter(c => c < 0.7).length;

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
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  const SEVERITY_COLOR: Record<Severity, string> = {
    critical: "text-rose-500",
    warning:  "text-amber-500",
    ok:       "text-emerald-600",
  };

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
  const statusEvents = [...employees]
    .sort((a, b) => {
      const order: Record<string, number> = { "Has Leave": 0, Remote: 1, Available: 2 };
      return order[a.todayStatus] - order[b.todayStatus];
    })
    .slice(0, 4)
    .map(e => ({
      type: e.todayStatus === "Has Leave" ? "leave" : e.todayStatus === "Remote" ? "remote" : "available",
      name: e.name,
      role: e.role,
      initials: e.initials,
      time: e.todayStatus === "Has Leave" ? "On leave" : e.todayStatus === "Remote" ? "Remote" : "Available",
    }));

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
        <div className="grid grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Projects at Risk"
                value={stats ? String(stats.projects_at_risk.value) : "—"}
                trend={stats?.projects_at_risk.insight ?? "Unavailable"}
                trendColor={stats ? SEVERITY_COLOR[stats.projects_at_risk.severity] : undefined}
                icon={AlertTriangle}
                onClick={() => setModalOpen("risk")}
              />
              <StatCard
                title="Knowledge Coverage"
                value={stats ? `${stats.knowledge_coverage.value}%` : "—"}
                trend={stats?.knowledge_coverage.insight ?? "Unavailable"}
                trendColor={stats ? SEVERITY_COLOR[stats.knowledge_coverage.severity] : undefined}
                icon={Activity}
                onClick={() => setModalOpen("coverage")}
              />
              <StatCard
                title="Team Availability"
                value={stats ? stats.team_availability.value : "—"}
                trend={stats?.team_availability.insight ?? "Unavailable"}
                trendColor={stats ? SEVERITY_COLOR[stats.team_availability.severity] : undefined}
                icon={Users}
                onClick={() => setModalOpen("availability")}
              />
              <StatCard
                title="Absence Impact"
                value={stats ? String(stats.absence_impact.value) : "—"}
                trend={stats?.absence_impact.insight ?? "Unavailable"}
                trendColor={stats ? SEVERITY_COLOR[stats.absence_impact.severity] : undefined}
                icon={Zap}
                onClick={() => setModalOpen("impact")}
              />
            </>
          )}
        </div>

        {/* Today's Overview Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Team Status */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">Team Status</h3>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Today</span>
            </div>
            <div className="space-y-3">
              {statusEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
                      e.type === "leave"
                        ? "bg-gradient-to-br from-rose-400 to-rose-500"
                        : e.type === "remote"
                          ? "bg-gradient-to-br from-blue-400 to-blue-500"
                          : "bg-gradient-to-br from-emerald-400 to-emerald-500",
                    )}
                  >
                    {e.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.role}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      e.type === "leave" ? "text-rose-600 bg-rose-50" : e.type === "remote" ? "text-blue-600 bg-blue-50" : "text-emerald-600 bg-emerald-50",
                    )}
                  >
                    {e.time}
                  </span>
                </div>
              ))}
            </div>
            {/* Capacity bar */}
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Capacity</span>
                <span className="text-[11px] font-semibold text-foreground">{Math.round((teamAvailable / employees.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm transition-all"
                  style={{ width: `${(teamAvailable / employees.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{teamAvailable} available</span>
                <span className="text-[10px] text-muted-foreground">{onLeaveCount} on leave</span>
              </div>
            </div>
          </Card>

          {/* KCI Chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Knowledge Coverage</h3>
              <span
                className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  avgCoverage >= 70 ? "text-emerald-600 bg-emerald-50" : avgCoverage >= 55 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50",
                )}
              >
                {avgCoverage}% avg
              </span>
            </div>
            <div className="flex items-center gap-4">
              <KCIRadarChart coverageValues={coverageByCategory} targetValues={targetValues} />
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-sm bg-rose-400 shadow-sm" />
                  <span className="text-muted-foreground">Current: {avgCoverage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-sm border border-blue-300 bg-blue-100" style={{ borderStyle: "dashed" }} />
                  <span className="text-muted-foreground">Target: 90%</span>
                </div>
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide font-medium">Weakest areas</p>
                  {weakestCategories.map(({ axis, value }) => (
                    <div key={axis} className="flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full shrink-0", value < 0.3 ? "bg-rose-400" : "bg-amber-400")} />
                      <span className="text-muted-foreground">{axis} ({Math.round(value * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

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

      {/* ── Modals ────────────────────────────────────────────── */}

      {modalOpen === "risk" && (
        <Modal title="Projects at Risk" onClose={() => setModalOpen(null)}>
          {!stats ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{statsLoading ? "Loading…" : "Data unavailable"}</p>
          ) : stats.projects_at_risk.value === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <ShieldAlert className="size-8 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">All projects are healthy</p>
            </div>
          ) : (
            [
              ...stats.projects_at_risk.detail.critical.map(p => ({ ...p, tag: "Critical" as const })),
              ...stats.projects_at_risk.detail.unstable.map(p => ({ ...p, tag: "Unstable" as const })),
            ].map(p => (
              <div key={p.id} className="rounded-xl border border-border/60 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                    p.tag === "Critical"
                      ? "bg-rose-50 text-rose-600 border-rose-200/60"
                      : "bg-orange-50 text-orange-600 border-orange-200/60",
                  )}>
                    {p.tag}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Risk Score</p>
                    <p className="font-semibold text-rose-500">{p.risk_score}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Bus Factor</p>
                    <p className={cn("font-semibold", p.bus_factor === 1 ? "text-rose-500" : "text-amber-500")}>{p.bus_factor}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Health</p>
                    <p className={cn("font-semibold", p.health < 50 ? "text-rose-500" : "text-amber-500")}>{p.health}%</p>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", p.health < 50 ? "bg-rose-500" : "bg-amber-400")}
                    style={{ width: `${p.health}%` }}
                  />
                </div>
                {p.missing_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.missing_skills.map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setModalOpen(null); navigate(`/projects/${p.id}`); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  View project details <ArrowRight className="size-3" />
                </button>
              </div>
            ))
          )}
        </Modal>
      )}

      {modalOpen === "coverage" && (
        <Modal title="Knowledge Coverage" onClose={() => setModalOpen(null)}>
          {!stats ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{statsLoading ? "Loading…" : "Data unavailable"}</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                % of team members with proficiency ≥ 3 in each skill category. Under 70% is considered at risk.
              </p>
              <div className="space-y-3">
                {stats.knowledge_coverage.detail.categories.map(cat => {
                  const isWeak = cat.coverage_pct < 70;
                  return (
                    <div key={cat.category_id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{cat.category_name}</span>
                        <span className={cn("text-xs font-semibold", isWeak ? "text-rose-500" : "text-emerald-600")}>
                          {cat.coverage_pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", isWeak ? "bg-rose-400" : "bg-emerald-500")}
                          style={{ width: `${cat.coverage_pct}%` }}
                        />
                      </div>
                      {cat.uncovered_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cat.uncovered_skills.map(s => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl bg-muted/40 border border-border/60 p-3 text-xs">
                <p className="font-semibold mb-0.5">Most fragile area</p>
                <p className="text-muted-foreground">{stats.knowledge_coverage.detail.most_fragile}</p>
              </div>
            </>
          )}
        </Modal>
      )}

      {modalOpen === "availability" && (
        <Modal title="Team Availability" onClose={() => setModalOpen(null)}>
          {!stats ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{statsLoading ? "Loading…" : "Data unavailable"}</p>
          ) : stats.team_availability.detail.absent_employees.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Users className="size-8 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">Full team is available today</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Employees currently on leave and their potential impact.</p>
              <div className="space-y-3">
                {stats.team_availability.detail.absent_employees.map(emp => (
                  <div key={emp.id} className="rounded-xl border border-border/60 p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                        {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{emp.name}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                        emp.criticality === "High"
                          ? "bg-rose-50 text-rose-600 border-rose-200/60"
                          : emp.criticality === "Medium"
                          ? "bg-amber-50 text-amber-600 border-amber-200/60"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200/60",
                      )}>
                        {emp.criticality}
                      </span>
                    </div>
                    {emp.projects.length > 0 && (
                      <div className="text-xs text-muted-foreground pl-11">
                        Active on:{" "}
                        <span className="text-foreground font-medium">{emp.projects.join(", ")}</span>
                      </div>
                    )}
                    {emp.skills.length > 0 && (
                      <div className="pl-11 flex flex-wrap gap-1">
                        {emp.skills.slice(0, 4).map(s => (
                          <span key={s} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                            {s}
                          </span>
                        ))}
                        {emp.skills.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">+{emp.skills.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}

      {modalOpen === "impact" && (
        <Modal title="Absence Impact" onClose={() => setModalOpen(null)}>
          {!stats ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{statsLoading ? "Loading…" : "Data unavailable"}</p>
          ) : stats.absence_impact.detail.uncovered_skills.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <BookOpen className="size-8 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">No skills became uncovered</p>
              <p className="text-xs text-muted-foreground">All skills have at least one available backup today.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Skills with zero available coverage due to today's absences.
              </p>
              <div className="space-y-3">
                {stats.absence_impact.detail.uncovered_skills.map(skill => (
                  <div key={skill.skill_id} className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{skill.skill_name}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-600 border-rose-200/60 shrink-0">
                        0 coverage
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Was covered by:{" "}
                      <span className="text-foreground font-medium">{skill.previously_covered_by}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Required by:{" "}
                      <span className="text-foreground font-medium">{skill.required_by_project}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}

    </>
  );
}
