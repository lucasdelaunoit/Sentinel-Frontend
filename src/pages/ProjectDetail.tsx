import { useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTabParam } from "@/hooks/useTabParam";
import { usePage } from "@/context/PageContext";
import { AlertTriangle, PlayCircle, Users, ShieldAlert, CalendarClock, Activity } from "lucide-react";
import { ShieldWarningIcon, UsersThreeIcon, BrainIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PROJECTS, type ProjectData } from "@/data/projects";
import { USER_DETAILS, type UserDetail } from "@/data/users";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import useGetProject from "@/api/projects/useGetProject";
import useGetProjectStats from "@/api/projects/useGetProjectStats";
import ProjectProfileCard from "@/components/specified/pages/project/ProjectProfileCard.tsx";
import ProjectStatsSection from "@/components/specified/pages/project/ProjectStatsSection.tsx";
import ProjectTeamTab from "@/components/specified/pages/project/ProjectTeamTab.tsx";
import ProjectKnowledgeTab from "@/components/specified/pages/project/ProjectKnowledgeTab.tsx";

/* ─── Risk computation ────────────────────────────────────── */

interface SkillCoverage {
  skill: string;
  holders: UserDetail[];
  activeHolders: UserDetail[];
  maxLevel: number;
}

function skillMatch(required: string, empSkillName: string) {
  return (
    empSkillName.toLowerCase().includes(required.toLowerCase()) ||
    required.toLowerCase().includes(empSkillName.toLowerCase())
  );
}

function computeCoverage(project: ProjectData, members: UserDetail[]): SkillCoverage[] {
  return project.skills.map((skill) => {
    const holders = members.filter((m) => m.skills.some((s) => skillMatch(skill, s.name)));
    const activeHolders = holders.filter((m) => m.todayStatus !== "Has Leave");
    const maxLevel = holders.length
      ? Math.max(...holders.flatMap((m) => m.skills.filter((s) => skillMatch(skill, s.name)).map((s) => s.level)))
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

function generateAlerts(project: ProjectData, members: UserDetail[], coverage: SkillCoverage[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];

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
      detail: "Two absences could put the project at serious risk. Consider cross-training.",
    });
  }

  members
    .filter((m) => m.todayStatus === "Has Leave")
    .forEach((member) => {
      const nowUncovered = coverage.filter(
        (c) => c.holders.some((h) => h.id === member.id) && c.activeHolders.length === 0,
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
            ? `${nowUncovered.map((c) => c.skill).join(", ")} now has zero active coverage.`
            : nowSilo.length > 0
              ? `${nowSilo.map((c) => c.skill).join(", ")} dropped to a single active holder.`
              : "All skills remain covered by other team members.",
      });
    });

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

  coverage
    .filter((c) => c.holders.length === 0)
    .forEach((c) => {
      alerts.push({
        id: `uncov-${c.skill}`,
        severity: "critical",
        category: "Uncovered Skill",
        title: `"${c.skill}" is not covered by any team member`,
        detail: "This required skill has no owner on the team. Assign someone or recruit.",
      });
    });

  if (project.health < 50) {
    alerts.push({
      id: "health",
      severity: "critical",
      category: "Project Trajectory",
      title: `Project trajectory is critical (${project.health}/100)`,
      detail: "Multiple risk factors are combining. Immediate manager intervention recommended.",
    });
  } else if (project.health < 65) {
    alerts.push({
      id: "health-warn",
      severity: "warning",
      category: "Project Trajectory",
      title: `Project trajectory is degraded (${project.health}/100)`,
      detail: "Risk factors are accumulating. Monitor closely and address knowledge silos.",
    });
  }

  if (new Date(project.endDate) < new Date() && project.status !== "Completed") {
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

interface AbsenceImpact {
  uncovered: string[];
  weakened: string[];
  level: "critical" | "warning" | "safe";
}

function absenceImpact(member: UserDetail, coverage: SkillCoverage[]): AbsenceImpact {
  const uncovered: string[] = [];
  const weakened: string[] = [];
  for (const c of coverage) {
    if (!c.holders.some((h) => h.id === member.id)) continue;
    const remaining = c.holders.filter((h) => h.id !== member.id);
    if (remaining.length === 0) uncovered.push(c.skill);
    else if (remaining.length === 1) weakened.push(c.skill);
  }
  const level = uncovered.length > 0 ? "critical" : weakened.length > 0 ? "warning" : "safe";
  return { uncovered, weakened, level };
}

/* ─── Helpers / small components ─────────────────────────── */

const ALERT_STYLE: Record<AlertSeverity, { border: string; bg: string; icon: string; label: string }> = {
  critical: {
    border: "border-l-rose-500",
    bg: "bg-gradient-to-r from-rose-50/80 to-rose-50/40",
    icon: "text-rose-500",
    label: "bg-gradient-to-br from-rose-500 to-rose-600 text-white",
  },
  warning: {
    border: "border-l-amber-400",
    bg: "bg-gradient-to-r from-amber-50/80 to-amber-50/40",
    icon: "text-amber-500",
    label: "bg-gradient-to-br from-amber-400 to-amber-500 text-white",
  },
  info: {
    border: "border-l-blue-400",
    bg: "bg-gradient-to-r from-blue-50/80 to-blue-50/40",
    icon: "text-blue-500",
    label: "bg-gradient-to-br from-blue-400 to-blue-500 text-white",
  },
};

function AlertCard({ alert }: { alert: RiskAlert }) {
  const s = ALERT_STYLE[alert.severity];
  return (
    <div className={cn("rounded-xl border border-border/60 border-l-4 p-4 shadow-sm", s.border, s.bg)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn("size-4 mt-0.5 shrink-0", s.icon)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
                s.label,
              )}
            >
              {alert.category}
            </span>
            <p className="text-[13px] font-semibold text-foreground">{alert.title}</p>
          </div>
          <p className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed">{alert.detail}</p>
        </div>
      </div>
    </div>
  );
}

function MemberAvatar({ emp, size = "md" }: { emp: UserDetail; size?: "sm" | "md" }) {
  return (
    <div
      title={emp.name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm",
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
        <div className="size-1.5 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shrink-0 shadow-sm" />
        <span className="text-[11px] font-semibold text-rose-600">
          {impact.uncovered.length} skill
          {impact.uncovered.length !== 1 ? "s" : ""} lost
        </span>
      </div>
    );
  }
  if (impact.level === "warning") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shrink-0 shadow-sm" />
        <span className="text-[11px] font-semibold text-amber-600">
          {impact.weakened.length} skill
          {impact.weakened.length !== 1 ? "s" : ""} become silo
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-1.5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shrink-0 shadow-sm" />
      <span className="text-[11px] text-emerald-600 font-medium">No impact</span>
    </div>
  );
}

/* ─── Tab: Risk Overview ──────────────────────────────────── */

/* ─── Overview sub-components ─────────────────────────────── */

type HealthLevel = "critical" | "degraded" | "healthy";

function healthLevel(health: number): HealthLevel {
  if (health < 50) return "critical";
  if (health < 65) return "degraded";
  return "healthy";
}

const HEALTH_STYLE: Record<HealthLevel, { wrap: string; dot: string; label: string; text: string }> = {
  critical: {
    wrap: "from-rose-50 to-rose-100/40 border-rose-200/60",
    dot: "bg-gradient-to-br from-rose-500 to-rose-600",
    label: "Critical",
    text: "text-rose-700",
  },
  degraded: {
    wrap: "from-amber-50 to-amber-100/40 border-amber-200/60",
    dot: "bg-gradient-to-br from-amber-400 to-amber-500",
    label: "Degraded",
    text: "text-amber-700",
  },
  healthy: {
    wrap: "from-emerald-50 to-emerald-100/40 border-emerald-200/60",
    dot: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    label: "Healthy",
    text: "text-emerald-700",
  },
};

function HealthBanner({
  project,
  coverage,
  alerts,
  onSimulate,
}: {
  project: ProjectData;
  coverage: SkillCoverage[];
  alerts: RiskAlert[];
  onSimulate: () => void;
}) {
  const level = healthLevel(project.health);
  const style = HEALTH_STYLE[level];
  const coveredCount = coverage.filter((c) => c.activeHolders.length >= 1).length;
  const coveragePct = coverage.length ? Math.round((coveredCount / coverage.length) * 100) : 0;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const daysToDeadline = Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className={cn("rounded-2xl border bg-gradient-to-r p-5 shadow-sm", style.wrap)}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn("size-10 rounded-2xl shrink-0 shadow-md flex items-center justify-center", style.dot)}>
            <Activity className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("text-[15px] font-bold", style.text)}>Project {style.label}</p>
              <span className="text-[12px] text-muted-foreground">·</span>
              <p className="text-[12px] text-muted-foreground">Health {project.health}/100</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {criticalCount > 0
                ? `${criticalCount} critical issue${criticalCount !== 1 ? "s" : ""} need attention`
                : "No critical issues — monitor warnings"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <BannerMetric
            icon={ShieldAlert}
            label="Bus Factor"
            value={String(project.busFactor)}
            tone={project.busFactor <= 1 ? "critical" : project.busFactor === 2 ? "warning" : "normal"}
          />
          <BannerMetric
            icon={Users}
            label="Coverage"
            value={`${coveragePct}%`}
            tone={coveragePct < 60 ? "critical" : coveragePct < 80 ? "warning" : "normal"}
          />
          <BannerMetric
            icon={CalendarClock}
            label="Deadline"
            value={daysToDeadline < 0 ? "Overdue" : `${daysToDeadline}d`}
            tone={daysToDeadline < 0 ? "critical" : daysToDeadline < 14 ? "warning" : "normal"}
          />
          <Button
            onClick={onSimulate}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl h-10 px-4 text-[13px] font-semibold shadow-md btn-press"
          >
            <PlayCircle className="size-4" />
            Simulate Leave
          </Button>
        </div>
      </div>
    </div>
  );
}

function BannerMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tone: "critical" | "warning" | "normal";
}) {
  const toneClass = tone === "critical" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : "text-foreground";
  return (
    <div className="flex items-center gap-2.5">
      <Icon className={cn("size-4", toneClass)} />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className={cn("text-[15px] font-bold tabular-nums leading-tight", toneClass)}>{value}</p>
      </div>
    </div>
  );
}

function TodaySnapshot({
  project,
  members,
  coverage,
  alerts,
}: {
  project: ProjectData;
  members: UserDetail[];
  coverage: SkillCoverage[];
  alerts: RiskAlert[];
}) {
  const onLeave = members.filter((m) => m.todayStatus === "Has Leave").length;
  const silos = coverage.filter((c) => c.activeHolders.length === 1).length;
  const uncovered = coverage.filter((c) => c.activeHolders.length === 0).length;
  const warnings = alerts.filter((a) => a.severity === "warning").length;

  const rows = [
    { label: "On leave today", value: onLeave, tone: onLeave > 0 ? "warning" : ("normal" as const) },
    { label: "Knowledge silos", value: silos, tone: silos > 0 ? "warning" : ("normal" as const) },
    { label: "Uncovered skills", value: uncovered, tone: uncovered > 0 ? "critical" : ("normal" as const) },
    { label: "Active warnings", value: warnings, tone: warnings > 0 ? "warning" : ("normal" as const) },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <h3 className="font-semibold text-foreground text-sm">Today's Snapshot</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {project.team.length} team members · {coverage.length} required skills
        </p>
      </div>
      <div className="divide-y divide-border/40">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-5 py-3">
            <span className="text-[12px] text-muted-foreground">{r.label}</span>
            <span
              className={cn(
                "text-[15px] font-bold tabular-nums",
                r.tone === "critical" ? "text-rose-600" : r.tone === "warning" ? "text-amber-600" : "text-foreground",
              )}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyPeoplePanel({ members, coverage }: { members: UserDetail[]; coverage: SkillCoverage[] }) {
  const rank = { High: 3, Medium: 2, Low: 1 } as const;
  const top = [...members]
    .map((m) => ({ member: m, impact: absenceImpact(m, coverage) }))
    .sort((a, b) => {
      const r = rank[b.member.criticality] - rank[a.member.criticality];
      if (r !== 0) return r;
      return b.impact.uncovered.length - a.impact.uncovered.length;
    })
    .slice(0, 3);

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <h3 className="font-semibold text-foreground text-sm">Key People</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Highest-criticality members and their absence impact</p>
      </div>
      <div className="divide-y divide-border/40">
        {top.map(({ member, impact }) => (
          <div key={member.id} className="flex items-center gap-3 px-5 py-3">
            <MemberAvatar emp={member} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-[12px] truncate">{member.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
            </div>
            <ImpactPill impact={impact} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupedAlerts({ alerts }: { alerts: RiskAlert[] }) {
  const critical = alerts.filter((a) => a.severity === "critical");
  const warning = alerts.filter((a) => a.severity === "warning");

  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground text-sm">Fragility Alerts</h3>
          {critical.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {critical.length} critical
            </span>
          )}
          {warning.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {warning.length} warning
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-4">
        {alerts.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-emerald-50/40 border border-emerald-100/50 p-4">
            <div className="size-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shrink-0 shadow-sm" />
            <p className="text-[13px] font-medium text-emerald-700">
              No active fragility alerts — project is in good shape.
            </p>
          </div>
        )}
        {critical.length > 0 && <AlertGroup title="Critical" tone="critical" alerts={critical} />}
        {warning.length > 0 && <AlertGroup title="Warnings" tone="warning" alerts={warning} />}
      </div>
    </div>
  );
}

function AlertGroup({ title, tone, alerts }: { title: string; tone: AlertSeverity; alerts: RiskAlert[] }) {
  const dot =
    tone === "critical"
      ? "bg-gradient-to-br from-rose-500 to-rose-600"
      : tone === "warning"
        ? "bg-gradient-to-br from-amber-400 to-amber-500"
        : "bg-gradient-to-br from-blue-400 to-blue-500";
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <div className={cn("size-1.5 rounded-full shadow-sm", dot)} />
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          {title} ({alerts.length})
        </p>
      </div>
      <div className="space-y-2">
        {alerts.map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      </div>
    </div>
  );
}

function RiskOverviewTab({
  project,
  members,
  coverage,
  alerts,
  onSimulate,
}: {
  project: ProjectData;
  members: UserDetail[];
  coverage: SkillCoverage[];
  alerts: RiskAlert[];
  onSimulate: () => void;
}) {
  const onLeave = members.filter((m) => m.todayStatus === "Has Leave");

  return (
    <div className="space-y-4">
      <HealthBanner project={project} coverage={coverage} alerts={alerts} onSimulate={onSimulate} />

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 space-y-4">
          <GroupedAlerts alerts={alerts} />

          {onLeave.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border/60">
                <h3 className="font-semibold text-foreground text-sm">Current Absence Impact</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Skills affected by team members who are currently on leave
                </p>
              </div>
              <div className="divide-y divide-border/40">
                {onLeave.map((member) => {
                  const impact = absenceImpact(member, coverage);
                  const affected = [...impact.uncovered, ...impact.weakened];
                  return (
                    <div
                      key={member.id}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                    >
                      <MemberAvatar emp={member} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-[13px]">{member.name}</p>
                          <span className="inline-flex items-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                            On Leave
                            {member.onLeaveUntil ? ` until ${member.onLeaveUntil}` : ""}
                          </span>
                        </div>
                        {affected.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {impact.uncovered.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center rounded-md bg-gradient-to-br from-rose-100 to-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200/50"
                              >
                                {s}
                              </span>
                            ))}
                            {impact.weakened.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center rounded-md bg-gradient-to-br from-amber-100 to-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/50"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-emerald-600 mt-1 font-medium">All skills remain covered</p>
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

        <div className="col-span-2 space-y-4">
          <TodaySnapshot project={project} members={members} coverage={coverage} alerts={alerts} />
          <KeyPeoplePanel members={members} coverage={coverage} />
        </div>
      </div>
    </div>
  );
}

/* ─── Project Detail Page ─────────────────────────────────── */

const PROJECT_TABS = ["overview", "team", "knowledge"] as const;
type DetailTab = (typeof PROJECT_TABS)[number];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setTitle, setBreadcrumb } = usePage();
  const [activeTab, setActiveTab] = useTabParam<DetailTab>("overview", PROJECT_TABS);

  const { data: apiProject, isLoading, isError } = useGetProject(id);
  const { data: stats, isLoading: isLoadingStats } = useGetProjectStats(id);

  // Mock fallback for tabs (risk/team/knowledge) — to be migrated later
  const project = PROJECTS.find((p) => p.id === id) ?? PROJECTS[0];

  useEffect(() => {
    if (apiProject) {
      setTitle(apiProject.name);
      setBreadcrumb("Portfolio");
    }
    return () => {
      setTitle("");
      setBreadcrumb("");
    };
  }, [apiProject?.id]);

  const members = useMemo(
    () => (project?.team.map((m) => USER_DETAILS[m.id]).filter(Boolean) as UserDetail[]) ?? [],
    [project],
  );

  const coverage = useMemo(() => (project ? computeCoverage(project, members) : []), [project, members]);

  const alerts = useMemo(
    () => (project ? generateAlerts(project, members, coverage) : []),
    [project, members, coverage],
  );

  const tabs: { key: DetailTab; label: string; icon: typeof ShieldWarningIcon }[] = [
    { key: "overview", label: "Fragility Overview", icon: ShieldWarningIcon },
    { key: "team", label: "Team", icon: UsersThreeIcon },
    { key: "knowledge", label: "Knowledge", icon: BrainIcon },
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-foreground">Project not found</p>
        <Link to="/projects" className="text-[13px] text-primary hover:underline underline-offset-4">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <>
      <TopBar title={isLoading ? "Loading…" : (apiProject?.name ?? "Project")} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero ─────────────────────────────────────────────── */}
        {isLoading || !apiProject ? (
          <ProjectProfileCard.Skeleton />
        ) : (
          <ProjectProfileCard project={apiProject} />
        )}

        {/* ── Stats ────────────────────────────────────────────── */}
        {isLoadingStats || !stats ? <ProjectStatsSection.Skeleton /> : <ProjectStatsSection stats={stats} />}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                <tab.icon className="size-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-1">
            <RiskOverviewTab
              project={project}
              members={members}
              coverage={coverage}
              alerts={alerts}
              onSimulate={() => navigate("/users?tab=calendar")}
            />
          </TabsContent>
          <TabsContent value="team" className="mt-1">
            <ProjectTeamTab projectId={id} />
          </TabsContent>
          <TabsContent value="knowledge" className="mt-1">
            <ProjectKnowledgeTab projectId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
