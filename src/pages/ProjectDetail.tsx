import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PlayCircle,
  AlertTriangle,
  ShieldAlert,
  Brain,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PROJECTS, type ProjectData } from "@/data/projects";
import { EMPLOYEE_DETAILS, type EmployeeDetail } from "@/data/employees";

/* ─── Risk computation ────────────────────────────────────── */

interface SkillCoverage {
  skill: string;
  holders: EmployeeDetail[]; // all team members who have it
  activeHolders: EmployeeDetail[]; // holders not currently on leave
  maxLevel: number; // best level in team
}

function skillMatch(required: string, empSkillName: string) {
  return (
    empSkillName.toLowerCase().includes(required.toLowerCase()) ||
    required.toLowerCase().includes(empSkillName.toLowerCase())
  );
}

function computeCoverage(
  project: ProjectData,
  members: EmployeeDetail[],
): SkillCoverage[] {
  return project.skills.map((skill) => {
    const holders = members.filter((m) =>
      m.skills.some((s) => skillMatch(skill, s.name)),
    );
    const activeHolders = holders.filter((m) => m.todayStatus !== "Has Leave");
    const maxLevel = holders.length
      ? Math.max(
          ...holders.flatMap((m) =>
            m.skills
              .filter((s) => skillMatch(skill, s.name))
              .map((s) => s.level),
          ),
        )
      : 0;
    return { skill, holders, activeHolders, maxLevel };
  });
}

type AlertSeverity = "critical" | "warning" | "info";

interface RiskAlert {
  id: string;
  severity: AlertSeverity;
  category: string;
  title: string;
  detail: string;
}

function generateAlerts(
  project: ProjectData,
  members: EmployeeDetail[],
  coverage: SkillCoverage[],
): RiskAlert[] {
  const alerts: RiskAlert[] = [];

  // Bus factor
  if (project.busFactor <= 1) {
    const singleHolders = coverage.filter((c) => c.holders.length === 1);
    alerts.push({
      id: "bf-critical",
      severity: "critical",
      category: "Bus Factor",
      title: "Project has a Bus Factor of 1",
      detail: `${singleHolders.length} skill${singleHolders.length !== 1 ? "s have" : " has"} only one owner. Losing that person would immediately block the project.`,
    });
  } else if (project.busFactor === 2) {
    alerts.push({
      id: "bf-warning",
      severity: "warning",
      category: "Bus Factor",
      title: "Bus Factor is low (2)",
      detail:
        "Two absences could put the project at serious risk. Consider cross-training.",
    });
  }

  // People currently on leave with impact
  members
    .filter((m) => m.todayStatus === "Has Leave")
    .forEach((member) => {
      const nowUncovered = coverage.filter(
        (c) =>
          c.holders.some((h) => h.id === member.id) &&
          c.activeHolders.length === 0,
      );
      const nowSilo = coverage.filter(
        (c) =>
          c.holders.some((h) => h.id === member.id) &&
          c.activeHolders.length === 1 &&
          c.activeHolders[0].id !== member.id,
      );
      alerts.push({
        id: `leave-${member.id}`,
        severity: nowUncovered.length > 0 ? "critical" : "warning",
        category: "Active Absence",
        title: `${member.name} is currently on leave`,
        detail:
          nowUncovered.length > 0
            ? `⚠ ${nowUncovered.map((c) => c.skill).join(", ")} now has zero active coverage.`
            : nowSilo.length > 0
              ? `${nowSilo.map((c) => c.skill).join(", ")} dropped to a single active holder.`
              : "All skills remain covered by other team members.",
      });
    });

  // Knowledge silos (only 1 person knows a skill, and they're available)
  coverage
    .filter((c) => c.activeHolders.length === 1 && c.holders.length === 1)
    .forEach((c) => {
      alerts.push({
        id: `silo-${c.skill}`,
        severity: "warning",
        category: "Knowledge Silo",
        title: `"${c.skill}" is owned by a single person`,
        detail: `Only ${c.holders[0].name} knows this skill. Their absence would leave the project without ${c.skill} coverage.`,
      });
    });

  // Fully uncovered skills (no one has it)
  coverage
    .filter((c) => c.holders.length === 0)
    .forEach((c) => {
      alerts.push({
        id: `uncov-${c.skill}`,
        severity: "critical",
        category: "Uncovered Skill",
        title: `"${c.skill}" is not covered by any team member`,
        detail:
          "This required skill has no owner on the team. Assign someone or recruit.",
      });
    });

  // Health
  if (project.health < 50) {
    alerts.push({
      id: "health",
      severity: "critical",
      category: "Project Health",
      title: `Project health is critical (${project.health}/100)`,
      detail:
        "Multiple risk factors are combining. Immediate manager intervention recommended.",
    });
  } else if (project.health < 65) {
    alerts.push({
      id: "health-warn",
      severity: "warning",
      category: "Project Health",
      title: `Project health is degraded (${project.health}/100)`,
      detail:
        "Risk factors are accumulating. Monitor closely and address knowledge silos.",
    });
  }

  // Overdue
  if (
    new Date(project.endDate) < new Date() &&
    project.status !== "Completed"
  ) {
    alerts.push({
      id: "overdue",
      severity: "critical",
      category: "Deadline",
      title: "Project is past its end date",
      detail: `Deadline was ${new Date(project.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}. Delivery risk is high.`,
    });
  }

  return alerts;
}

/* ─── Absence impact per member ───────────────────────────── */

interface AbsenceImpact {
  uncovered: string[]; // skills with 0 holders if this person left
  weakened: string[]; // skills dropping to 1 holder
  level: "critical" | "warning" | "safe";
}

function absenceImpact(
  member: EmployeeDetail,
  coverage: SkillCoverage[],
): AbsenceImpact {
  const uncovered: string[] = [];
  const weakened: string[] = [];
  for (const c of coverage) {
    if (!c.holders.some((h) => h.id === member.id)) continue;
    const remaining = c.holders.filter((h) => h.id !== member.id);
    if (remaining.length === 0) uncovered.push(c.skill);
    else if (remaining.length === 1) weakened.push(c.skill);
  }
  const level =
    uncovered.length > 0
      ? "critical"
      : weakened.length > 0
        ? "warning"
        : "safe";
  return { uncovered, weakened, level };
}

/* ─── Helpers / small components ─────────────────────────── */

const ALERT_STYLE: Record<
  AlertSeverity,
  { border: string; bg: string; icon: string; label: string }
> = {
  critical: {
    border: "border-l-rose-500",
    bg: "bg-rose-50",
    icon: "text-rose-500",
    label: "bg-rose-100 text-rose-700",
  },
  warning: {
    border: "border-l-amber-400",
    bg: "bg-amber-50",
    icon: "text-amber-500",
    label: "bg-amber-100 text-amber-700",
  },
  info: {
    border: "border-l-blue-400",
    bg: "bg-blue-50",
    icon: "text-blue-500",
    label: "bg-blue-100 text-blue-700",
  },
};

function AlertCard({ alert }: { alert: RiskAlert }) {
  const s = ALERT_STYLE[alert.severity];
  return (
    <div
      className={cn(
        "rounded-xl border border-border border-l-4 p-4",
        s.border,
        s.bg,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn("size-4 mt-0.5 shrink-0", s.icon)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                s.label,
              )}
            >
              {alert.category}
            </span>
            <p className="text-sm font-semibold text-foreground">
              {alert.title}
            </p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {alert.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function RiskKpi({
  label,
  value,
  sub,
  color = "text-foreground",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-card border border-border px-5 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground/60">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight leading-none mt-0.5",
            color,
          )}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function MemberAvatar({
  emp,
  size = "md",
}: {
  emp: EmployeeDetail;
  size?: "sm" | "md";
}) {
  return (
    <div
      title={emp.name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        emp.color,
        size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs",
      )}
    >
      {emp.initials}
    </div>
  );
}

function ImpactPill({ impact }: { impact: AbsenceImpact }) {
  if (impact.level === "critical") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-rose-500 shrink-0" />
        <span className="text-xs font-semibold text-rose-600">
          {impact.uncovered.length} skill
          {impact.uncovered.length !== 1 ? "s" : ""} lost
        </span>
      </div>
    );
  }
  if (impact.level === "warning") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="text-xs font-semibold text-amber-600">
          {impact.weakened.length} skill
          {impact.weakened.length !== 1 ? "s" : ""} become silo
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
      <span className="text-xs text-emerald-600 font-medium">No impact</span>
    </div>
  );
}

/* ─── Simulate Leave Modal ────────────────────────────────── */

function SimulateLeaveModal({
  open,
  onClose,
  members,
}: {
  open: boolean;
  onClose: () => void;
  members: EmployeeDetail[];
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-[460px] flex-col bg-card shadow-2xl">
        <div className="h-[3px] w-full shrink-0 bg-emerald-400" />
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Leave Impact Simulation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Simulate an absence and see how it affects this project's risk
              profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Select Employee
            </label>
            <select className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
              {members.map((m) => (
                <option key={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Start date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Start time
              </label>
              <select className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Morning</option>
                <option>Afternoon</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                End date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                End time
              </label>
              <select className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Morning</option>
                <option>Afternoon</option>
              </select>
            </div>
          </div>
        </div>
        <div className="shrink-0 px-8 py-5 border-t border-border">
          <Button
            className="w-full justify-center gap-2 bg-foreground text-background hover:bg-foreground/85 rounded-xl h-10 font-semibold"
            onClick={onClose}
          >
            <PlayCircle className="size-4" />
            Run Simulation
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Risk Overview ──────────────────────────────────── */

function RiskOverviewTab({
  project,
  members,
  coverage,
  alerts,
  onSimulate,
}: {
  project: ProjectData;
  members: EmployeeDetail[];
  coverage: SkillCoverage[];
  alerts: RiskAlert[];
  onSimulate: () => void;
}) {
  const onLeave = members.filter((m) => m.todayStatus === "Has Leave");
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");

  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Left: alerts + leave impact */}
      <div className="col-span-3 space-y-4">
        {/* Risk alerts */}
        <div className="rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Risk Alerts</h3>
              {criticalAlerts.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                  {criticalAlerts.length} critical
                </span>
              )}
              {warningAlerts.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  {warningAlerts.length} warning
                </span>
              )}
            </div>
          </div>
          <div className="p-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <div className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                  No active risk alerts — project is in good shape.
                </p>
              </div>
            ) : (
              [
                ...alerts.filter((a) => a.severity === "critical"),
                ...alerts.filter((a) => a.severity === "warning"),
              ].map((alert) => <AlertCard key={alert.id} alert={alert} />)
            )}
          </div>
        </div>

        {/* Active leave impact */}
        {onLeave.length > 0 && (
          <div className="rounded-2xl bg-card border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Current Absence Impact
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Skills affected by team members who are currently on leave
              </p>
            </div>
            <div className="divide-y divide-border">
              {onLeave.map((member) => {
                const impact = absenceImpact(member, coverage);
                const affected = [...impact.uncovered, ...impact.weakened];
                return (
                  <div
                    key={member.id}
                    className="flex items-start gap-4 px-6 py-4"
                  >
                    <MemberAvatar emp={member} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm">
                          {member.name}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          On Leave
                          {member.onLeaveUntil
                            ? ` until ${member.onLeaveUntil}`
                            : ""}
                        </span>
                      </div>
                      {affected.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {impact.uncovered.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700"
                            >
                              ✕ {s}
                            </span>
                          ))}
                          {impact.weakened.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                            >
                              ⚠ {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                          All skills remain covered
                        </p>
                      )}
                    </div>
                    <ImpactPill impact={impact} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: quick coverage summary */}
      <div className="col-span-2 space-y-4">
        {/* Skill coverage summary */}
        <div className="rounded-2xl bg-card border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Skill Coverage</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active holders per required skill
            </p>
          </div>
          <div className="p-5 space-y-3">
            {coverage.map((c) => {
              const status =
                c.activeHolders.length === 0
                  ? "uncovered"
                  : c.activeHolders.length === 1
                    ? "silo"
                    : "covered";
              const barColor =
                status === "uncovered"
                  ? "bg-rose-500"
                  : status === "silo"
                    ? "bg-amber-400"
                    : "bg-emerald-500";
              const pct = Math.min(
                100,
                (c.activeHolders.length / Math.max(project.team.length, 1)) *
                  100,
              );

              return (
                <div key={c.skill}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {c.skill}
                    </span>
                    <div className="flex items-center gap-2">
                      {status === "uncovered" && (
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                          Uncovered
                        </span>
                      )}
                      {status === "silo" && (
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                          Silo
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {c.activeHolders.length}/{project.team.length}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        barColor,
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulate CTA */}
        <div className="rounded-2xl bg-foreground p-5 space-y-3">
          <div>
            <p className="text-sm font-bold text-background">
              Run a Leave Simulation
            </p>
            <p className="text-xs text-background/60 mt-0.5">
              See how a planned or unplanned absence would affect risk coverage
              on this project.
            </p>
          </div>
          <Button
            onClick={onSimulate}
            className="w-full justify-center gap-2 bg-background text-foreground hover:bg-background/90 rounded-xl h-9 text-sm font-semibold"
          >
            <PlayCircle className="size-4" />
            Simulate a Leave
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Team ───────────────────────────────────────────── */

function TeamTab({
  members,
  coverage,
}: {
  members: EmployeeDetail[];
  coverage: SkillCoverage[];
}) {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Team Risk Analysis</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Shows the risk exposure if each team member were to become unavailable
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            {[
              "Member",
              "Role",
              "Criticality",
              "Skills Contributed",
              "Status",
              "If Absent — Impact",
            ].map((col) => (
              <th
                key={col}
                className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member) => {
            const impact = absenceImpact(member, coverage);
            const contributed = coverage.filter((c) =>
              c.holders.some((h) => h.id === member.id),
            );
            const isOnLeave = member.todayStatus === "Has Leave";

            return (
              <tr
                key={member.id}
                className={cn(
                  "hover:bg-muted/10 transition-colors",
                  impact.level === "critical" && "bg-rose-50/50",
                )}
              >
                {/* Member */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <MemberAvatar emp={member} />
                    <div>
                      <p className="font-semibold text-foreground">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </td>
                {/* Role */}
                <td className="px-5 py-4">
                  <p className="text-sm text-foreground">{member.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.department}
                  </p>
                </td>
                {/* Criticality */}
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      member.criticality === "High"
                        ? "bg-rose-100 text-rose-700"
                        : member.criticality === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {member.criticality}
                  </span>
                </td>
                {/* Skills */}
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {contributed.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">
                        None matched
                      </span>
                    ) : (
                      contributed.map((c) => (
                        <span
                          key={c.skill}
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                            c.holders.length === 1
                              ? "bg-rose-100 text-rose-700"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {c.skill}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      isOnLeave
                        ? "bg-rose-500 text-white"
                        : member.todayStatus === "Remote"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {member.todayStatus}
                  </span>
                </td>
                {/* Impact */}
                <td className="px-5 py-4">
                  {impact.level === "critical" ? (
                    <div className="space-y-0.5">
                      <ImpactPill impact={impact} />
                      <p className="text-[10px] text-rose-500 font-medium pl-3.5">
                        {impact.uncovered.join(", ")}
                      </p>
                    </div>
                  ) : impact.level === "warning" ? (
                    <div className="space-y-0.5">
                      <ImpactPill impact={impact} />
                      <p className="text-[10px] text-amber-500 font-medium pl-3.5">
                        {impact.weakened.join(", ")}
                      </p>
                    </div>
                  ) : (
                    <ImpactPill impact={impact} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Tab: Knowledge ─────────────────────────────────────── */

// Reuse hexagonal radar from EmployeeDetail pattern
const RADAR_AXES = [
  "FRONTEND",
  "BACKEND",
  "DEVOPS",
  "DATABASE",
  "SECURITY",
  "TESTING",
] as const;

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
  return (
    Array.from({ length: 6 }, (_, i) => radarPoint(cx, cy, r, i))
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + "Z"
  );
}

function CoverageRadar({ members }: { members: EmployeeDetail[] }) {
  const cx = 140;
  const cy = 140;
  const maxR = 95;
  const labelR = maxR * 1.3;
  const scores = RADAR_AXES.map((cat) => {
    const skills = members.flatMap((m) =>
      m.skills.filter((s) => s.category === cat),
    );
    if (skills.length === 0) return 0.15;
    return Math.min(
      1,
      skills.reduce((s, sk) => s + sk.level, 0) / (skills.length * 5),
    );
  });
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" className="mx-auto">
      {gridLevels.map((r) => (
        <path
          key={r}
          d={hexPath(cx, cy, r * maxR)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}
      {RADAR_AXES.map((_, i) => {
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
        d={radarPath(scores, cx, cy, maxR)}
        fill="#DBEAFE"
        fillOpacity="0.6"
        stroke="#60A5FA"
        strokeWidth="1.5"
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

function KnowledgeTab({
  project,
  members,
  coverage,
}: {
  project: ProjectData;
  members: EmployeeDetail[];
  coverage: SkillCoverage[];
}) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Skill coverage table */}
      <div className="col-span-3 rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Required Skills Coverage
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Coverage counts exclude team members currently on leave
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {[
                "Skill",
                "Status",
                "Active Holders",
                "Owners",
                "Best Level",
              ].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coverage.map((c) => {
              const status =
                c.activeHolders.length === 0
                  ? "uncovered"
                  : c.activeHolders.length === 1
                    ? "silo"
                    : "covered";

              const levelLabel =
                [
                  "",
                  "Beginner",
                  "Elementary",
                  "Intermediate",
                  "Advanced",
                  "Expert",
                ][c.maxLevel] || "—";

              return (
                <tr
                  key={c.skill}
                  className={cn(
                    "hover:bg-muted/10 transition-colors",
                    status === "uncovered" && "bg-rose-50/50",
                    status === "silo" && "bg-amber-50/40",
                  )}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-foreground">{c.skill}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                        status === "uncovered"
                          ? "bg-rose-100 text-rose-700"
                          : status === "silo"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700",
                      )}
                    >
                      {status === "uncovered"
                        ? "Uncovered"
                        : status === "silo"
                          ? "Knowledge Silo"
                          : "Covered"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            status === "uncovered"
                              ? "bg-rose-500"
                              : status === "silo"
                                ? "bg-amber-400"
                                : "bg-emerald-500",
                          )}
                          style={{
                            width: `${Math.min(100, (c.activeHolders.length / Math.max(project.team.length, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {c.activeHolders.length}/{project.team.length}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {c.holders.length === 0 ? (
                        <span className="text-xs text-rose-500 italic">
                          None
                        </span>
                      ) : (
                        c.holders.map((h) => (
                          <div
                            key={h.id}
                            title={`${h.name}${h.todayStatus === "Has Leave" ? " (on leave)" : ""}`}
                            className={cn(
                              "flex size-6 items-center justify-center rounded-full text-[9px] font-semibold text-white ring-2 ring-card",
                              h.color,
                              h.todayStatus === "Has Leave" && "opacity-40",
                            )}
                          >
                            {h.initials}
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        c.maxLevel >= 4
                          ? "text-emerald-600"
                          : c.maxLevel >= 3
                            ? "text-amber-600"
                            : "text-rose-500",
                      )}
                    >
                      {c.maxLevel > 0 ? `${c.maxLevel}/5 — ${levelLabel}` : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Radar + legend */}
      <div className="col-span-2 space-y-4">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="font-semibold text-foreground mb-1">
            Team Competency Radar
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Average skill level per category across the team
          </p>
          <CoverageRadar members={members} />
        </div>

        {/* Summary counts */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">
            Coverage Summary
          </h3>
          {[
            {
              label: "Fully covered (2+ holders)",
              count: coverage.filter((c) => c.activeHolders.length >= 2).length,
              color: "bg-emerald-500",
            },
            {
              label: "Knowledge silos (1 holder)",
              count: coverage.filter((c) => c.activeHolders.length === 1)
                .length,
              color: "bg-amber-400",
            },
            {
              label: "Uncovered (0 holders)",
              count: coverage.filter((c) => c.activeHolders.length === 0)
                .length,
              color: "bg-rose-500",
            },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("size-2 rounded-full shrink-0", color)} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Project Detail Page ─────────────────────────────────── */

type DetailTab = "overview" | "team" | "knowledge";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [simulateOpen, setSimulateOpen] = useState(false);

  const project = PROJECTS.find((p) => p.id === id);

  const members = useMemo(
    () =>
      (project?.team
        .map((m) => EMPLOYEE_DETAILS[m.id])
        .filter(Boolean) as EmployeeDetail[]) ?? [],
    [project],
  );

  const coverage = useMemo(
    () => (project ? computeCoverage(project, members) : []),
    [project, members],
  );

  const alerts = useMemo(
    () => (project ? generateAlerts(project, members, coverage) : []),
    [project, members, coverage],
  );

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-lg font-semibold text-foreground">
          Project not found
        </p>
        <Link
          to="/projects"
          className="text-sm text-primary underline underline-offset-4"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  const onLeaveCount = members.filter(
    (m) => m.todayStatus === "Has Leave",
  ).length;
  const criticalAlertCount = alerts.filter(
    (a) => a.severity === "critical",
  ).length;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "overview", label: "Risk Overview" },
    { key: "team", label: "Team" },
    { key: "knowledge", label: "Knowledge" },
  ];

  return (
    <>
      <div className="space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <RiskKpi
            label="Risk Score"
            value={`${project.riskScore}/100`}
            sub={
              project.riskScore >= 20
                ? "High risk"
                : project.riskScore >= 12
                  ? "Moderate"
                  : "Low risk"
            }
            color={
              project.riskScore >= 20
                ? "text-rose-500"
                : project.riskScore >= 12
                  ? "text-amber-500"
                  : "text-emerald-600"
            }
            icon={ShieldAlert}
          />
          <RiskKpi
            label="Bus Factor"
            value={project.busFactor}
            sub={
              project.busFactor <= 1
                ? "Critical — 1 person"
                : project.busFactor <= 2
                  ? "Low — 2 people"
                  : "Acceptable"
            }
            color={
              project.busFactor <= 1
                ? "text-rose-500"
                : project.busFactor <= 2
                  ? "text-amber-500"
                  : "text-emerald-600"
            }
            icon={AlertTriangle}
          />
          <RiskKpi
            label="Health Score"
            value={`${project.health}/100`}
            sub={
              project.health >= 75
                ? "Healthy"
                : project.health >= 55
                  ? "Degraded"
                  : "Critical"
            }
            color={
              project.health >= 75
                ? "text-emerald-600"
                : project.health >= 55
                  ? "text-amber-500"
                  : "text-rose-500"
            }
            icon={Brain}
          />
          <RiskKpi
            label="Team"
            value={`${members.length} members`}
            sub={
              onLeaveCount > 0
                ? `${onLeaveCount} currently on leave`
                : "All available"
            }
            color={onLeaveCount > 0 ? "text-amber-500" : "text-foreground"}
            icon={Users}
          />
        </div>

        {/* Active alert strip */}
        {criticalAlertCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
            <AlertTriangle className="size-4 text-rose-500 shrink-0" />
            <p className="text-sm font-semibold text-rose-700">
              {criticalAlertCount} critical risk
              {criticalAlertCount !== 1 ? "s" : ""} detected on this project —
              <button
                onClick={() => setActiveTab("overview")}
                className="underline underline-offset-2 ml-1"
              >
                view risk overview
              </button>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-colors",
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "bg-card border border-border text-foreground hover:bg-muted",
              )}
            >
              {tab.label}
              {tab.key === "overview" && criticalAlertCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  {criticalAlertCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <RiskOverviewTab
            project={project}
            members={members}
            coverage={coverage}
            alerts={alerts}
            onSimulate={() => setSimulateOpen(true)}
          />
        )}
        {activeTab === "team" && (
          <TeamTab members={members} coverage={coverage} />
        )}
        {activeTab === "knowledge" && (
          <KnowledgeTab
            project={project}
            members={members}
            coverage={coverage}
          />
        )}
      </div>

      <SimulateLeaveModal
        open={simulateOpen}
        onClose={() => setSimulateOpen(false)}
        members={members}
      />
    </>
  );
}
