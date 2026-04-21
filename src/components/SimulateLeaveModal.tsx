import { useState, useEffect } from "react";
import {
  X,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CalendarPlus,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/data/projects";
import { EMPLOYEE_DETAILS, type EmployeeDetail } from "@/data/employees";

/* ─── Types ───────────────────────────────────────────────── */

type SimStep = "form" | "results";
type ImpactLevel = "critical" | "warning" | "safe";

interface ProjectImpact {
  id: string;
  name: string;
  level: ImpactLevel;
  uncovered: string[];
  siloed: string[];
  safe: string[];
  totalSkills: number;
}

interface SimResult {
  employee: EmployeeDetail;
  startDate: string;
  endDate: string;
  durationDays: number;
  projects: ProjectImpact[];
  affectedProjects: number;
  totalUncovered: number;
  totalSiloed: number;
  overallLevel: ImpactLevel;
  recommendation: string;
  canSafelyApprove: boolean;
}

/* ─── Simulation engine ───────────────────────────────────── */

function skillMatch(required: string, empSkillName: string) {
  return (
    empSkillName.toLowerCase().includes(required.toLowerCase()) ||
    required.toLowerCase().includes(empSkillName.toLowerCase())
  );
}

function computeDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
}

function runSimulation(
  employee: EmployeeDetail,
  startDate: string,
  endDate: string,
): SimResult {
  const relevantProjects = PROJECTS.filter((p) =>
    p.team.some((m) => m.id === employee.id),
  );

  const projects: ProjectImpact[] = relevantProjects.map((project) => {
    const otherMembers = project.team
      .filter((m) => m.id !== employee.id)
      .map((m) => EMPLOYEE_DETAILS[m.id])
      .filter(Boolean);

    const uncovered: string[] = [];
    const siloed: string[] = [];
    const safe: string[] = [];

    project.skills.forEach((skill) => {
      const empHasSkill = employee.skills.some((s) => skillMatch(skill, s.name));
      if (!empHasSkill) return;

      const remaining = otherMembers.filter(
        (m) =>
          m.todayStatus !== "Has Leave" &&
          m.skills.some((s) => skillMatch(skill, s.name)),
      );

      if (remaining.length === 0) uncovered.push(skill);
      else if (remaining.length === 1) siloed.push(skill);
      else safe.push(skill);
    });

    const level: ImpactLevel =
      uncovered.length > 0
        ? "critical"
        : siloed.length > 0
          ? "warning"
          : "safe";

    return { id: project.id, name: project.name, level, uncovered, siloed, safe, totalSkills: project.skills.length };
  });

  const totalUncovered = projects.reduce((n, p) => n + p.uncovered.length, 0);
  const totalSiloed = projects.reduce((n, p) => n + p.siloed.length, 0);
  const affectedProjects = projects.filter((p) => p.level !== "safe").length;
  const durationDays = computeDays(startDate, endDate);

  const overallLevel: ImpactLevel = projects.some((p) => p.level === "critical")
    ? "critical"
    : projects.some((p) => p.level === "warning")
      ? "warning"
      : "safe";

  let recommendation: string;
  if (projects.length === 0) {
    recommendation =
      "This employee has no assigned projects. Their absence will have no measurable impact on project coverage.";
  } else if (overallLevel === "critical") {
    recommendation = `Approving this leave will leave ${totalUncovered} skill${totalUncovered !== 1 ? "s" : ""} completely uncovered across ${affectedProjects} project${affectedProjects !== 1 ? "s" : ""}. We strongly recommend arranging a knowledge transfer session or postponing until coverage is secured.`;
  } else if (overallLevel === "warning") {
    recommendation = `This leave reduces ${totalSiloed} skill area${totalSiloed !== 1 ? "s" : ""} to a single active holder. Brief backup team members on critical areas before confirming to reduce the risk of a bottleneck.`;
  } else {
    recommendation =
      "All required skills remain well-covered by other active team members. This leave can be safely approved without operational risk.";
  }

  return {
    employee,
    startDate,
    endDate,
    durationDays,
    projects,
    affectedProjects,
    totalUncovered,
    totalSiloed,
    overallLevel,
    recommendation,
    canSafelyApprove: overallLevel !== "critical",
  };
}

/* ─── Sub-components ──────────────────────────────────────── */

function fmt(d: string) {
  return d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

function VerdictBanner({ result }: { result: SimResult }) {
  const cfg = {
    critical: {
      bg: "bg-gradient-to-br from-rose-500 to-rose-600",
      icon: ShieldAlert,
      title: "High Risk",
      sub: "This absence creates critical skill gaps",
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-400 to-amber-500",
      icon: AlertTriangle,
      title: "Moderate Risk",
      sub: "Some knowledge areas will be left exposed",
    },
    safe: {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      icon: ShieldCheck,
      title: "Safe to Approve",
      sub: "All skills remain covered during this period",
    },
  }[result.overallLevel];

  const Icon = cfg.icon;

  return (
    <div className={cn("rounded-2xl p-5 text-white shadow-md", cfg.bg)}>
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
          <Icon className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[20px] font-bold leading-tight tracking-tight">{cfg.title}</p>
          <p className="text-[12px] text-white/80 mt-0.5 leading-snug">{cfg.sub}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-[12px] text-white/80">
        <span className="font-semibold">{result.employee.name}</span>
        <span>
          {result.durationDays > 0
            ? `${fmt(result.startDate)} → ${fmt(result.endDate)} (${result.durationDays} day${result.durationDays !== 1 ? "s" : ""})`
            : "Dates not specified"}
        </span>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sublabel,
  level = "neutral",
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  level?: "critical" | "warning" | "safe" | "neutral";
}) {
  const colors = {
    critical: "text-rose-600 bg-rose-50 border-rose-200/70",
    warning: "text-amber-600 bg-amber-50 border-amber-200/70",
    safe: "text-emerald-600 bg-emerald-50 border-emerald-200/70",
    neutral: "text-foreground bg-muted/50 border-border/60",
  };
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-xl border p-3 flex-1",
        colors[level],
      )}
    >
      <span className="text-[26px] font-bold leading-none tabular-nums">{value}</span>
      <span className="text-[10px] font-semibold text-center leading-tight opacity-70 uppercase tracking-wide mt-0.5">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-center leading-tight opacity-50 mt-0.5">
          {sublabel}
        </span>
      )}
    </div>
  );
}

function ProjectImpactRow({ project }: { project: ProjectImpact }) {
  const levelCfg = {
    critical: {
      wrapper: "bg-rose-50/70 border-rose-100",
      badge: "bg-rose-500 text-white",
      label: "Critical",
    },
    warning: {
      wrapper: "bg-amber-50/70 border-amber-100",
      badge: "bg-amber-400 text-white",
      label: "At Risk",
    },
    safe: {
      wrapper: "bg-emerald-50/40 border-emerald-100/60",
      badge: "bg-emerald-500 text-white",
      label: "Safe",
    },
  }[project.level];

  return (
    <div className={cn("rounded-xl border p-3.5 transition-colors", levelCfg.wrapper)}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold text-muted-foreground/50 shrink-0">
            {project.id}
          </span>
          <span className="text-[13px] font-semibold text-foreground truncate">
            {project.name}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm",
            levelCfg.badge,
          )}
        >
          {levelCfg.label}
        </span>
      </div>

      {project.level === "safe" ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
          <span className="text-[12px] text-emerald-700 font-medium">
            All {project.totalSkills} required skills remain covered
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {project.uncovered.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[11px] font-bold text-rose-600 shrink-0 mt-0.5 min-w-[72px]">
                Uncovered:
              </span>
              <div className="flex flex-wrap gap-1">
                {project.uncovered.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.siloed.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[11px] font-bold text-amber-600 shrink-0 mt-0.5 min-w-[72px]">
                Siloed:
              </span>
              <div className="flex flex-wrap gap-1">
                {project.siloed.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.safe.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[11px] font-medium text-muted-foreground/70 shrink-0 mt-0.5 min-w-[72px]">
                Covered:
              </span>
              <div className="flex flex-wrap gap-1">
                {project.safe.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Modal ──────────────────────────────────────────── */

interface SimulateLeaveModalProps {
  open: boolean;
  onClose: () => void;
  employees: EmployeeDetail[];
  initialEmployeeId?: string;
}

export default function SimulateLeaveModal({
  open,
  onClose,
  employees,
  initialEmployeeId,
}: SimulateLeaveModalProps) {
  const defaultEmp = initialEmployeeId
    ? (employees.find((e) => e.id === initialEmployeeId) ?? employees[0])
    : employees[0];

  const [step, setStep] = useState<SimStep>("form");
  const [selectedId, setSelectedId] = useState(defaultEmp?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<SimResult | null>(null);

  useEffect(() => {
    if (open) {
      setStep("form");
      setSelectedId(
        initialEmployeeId
          ? (employees.find((e) => e.id === initialEmployeeId)?.id ?? employees[0]?.id ?? "")
          : (employees[0]?.id ?? ""),
      );
      setStartDate("");
      setEndDate("");
      setResult(null);
    }
  }, [open, initialEmployeeId, employees]);

  if (!open) return null;

  function handleRun() {
    const emp = employees.find((e) => e.id === selectedId);
    if (!emp) return;
    setResult(runSimulation(emp, startDate, endDate));
    setStep("results");
  }

  const accentGradient =
    result?.overallLevel === "critical"
      ? "from-rose-500 to-rose-600"
      : result?.overallLevel === "warning"
        ? "from-amber-400 to-amber-500"
        : result?.overallLevel === "safe"
          ? "from-emerald-500 to-emerald-600"
          : "from-primary via-primary";

  const insertBtnClass =
    result?.overallLevel === "critical"
      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200"
      : result?.overallLevel === "warning"
        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200"
        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-[520px] flex-col bg-card shadow-2xl">
        {/* Accent bar */}
        <div
          className={cn(
            "h-[3px] w-full shrink-0 bg-gradient-to-r to-transparent",
            accentGradient,
          )}
        />

        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-7 pb-5 shrink-0 border-b border-border/40">
          <div>
            <h2 className="text-[18px] font-bold text-foreground tracking-tight">
              Leave Impact Simulation
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {step === "form"
                ? "Configure an absence to assess its risk on your projects"
                : "Simulation complete — review before confirming"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-8 py-3 shrink-0 border-b border-border/40 bg-muted/20">
          {(["form", "results"] as SimStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  step === s || (s === "form" && step === "results")
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  step === s ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s === "form" ? "Configuration" : "Results"}
              </span>
              {i < 1 && (
                <div className="w-8 h-px bg-border/60 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* ── FORM STEP ── */}
        {step === "form" && (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-foreground/70">
                  Employee
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all cursor-pointer"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.role}
                    </option>
                  ))}
                </select>
                {selectedId && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40">
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-sm",
                        employees.find((e) => e.id === selectedId)?.color,
                      )}
                    >
                      {employees.find((e) => e.id === selectedId)?.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">
                        {employees.find((e) => e.id === selectedId)?.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {employees.find((e) => e.id === selectedId)?.department} ·{" "}
                        {employees.find((e) => e.id === selectedId)?.criticality} criticality
                      </p>
                    </div>
                    <span
                      className={cn(
                        "ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full",
                        employees.find((e) => e.id === selectedId)?.criticality === "High"
                          ? "bg-rose-100 text-rose-600"
                          : employees.find((e) => e.id === selectedId)?.criticality === "Medium"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-emerald-100 text-emerald-600",
                      )}
                    >
                      Bus factor:{" "}
                      {employees.find((e) => e.id === selectedId)?.busFactor}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-foreground/70">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-foreground/70">
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>

              {startDate && endDate && computeDays(startDate, endDate) > 0 && (
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground bg-muted/40 rounded-xl px-4 py-2.5 border border-border/40">
                  <Info className="size-3.5 shrink-0 text-primary/60" />
                  Duration:{" "}
                  <span className="font-semibold text-foreground">
                    {computeDays(startDate, endDate)} day
                    {computeDays(startDate, endDate) !== 1 ? "s" : ""}
                  </span>{" "}
                  · {fmt(startDate)} → {fmt(endDate)}
                </div>
              )}

              <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-2.5">
                <p className="text-[12px] font-semibold text-foreground">
                  What this simulation analyses
                </p>
                <ul className="space-y-2">
                  {[
                    "Skills that become uncovered across all assigned projects",
                    "Knowledge areas that drop to a single active holder (silos)",
                    "Projects affected and their updated risk exposure",
                    "A clear safety verdict with actionable recommendations",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[12px] text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary/40 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="shrink-0 px-8 py-5 border-t border-border/60">
              <Button
                className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-[13px] font-semibold shadow-sm shadow-primary/10 btn-press"
                onClick={handleRun}
                disabled={!selectedId}
              >
                <PlayCircle className="size-4" />
                Run Simulation
              </Button>
            </div>
          </>
        )}

        {/* ── RESULTS STEP ── */}
        {step === "results" && result && (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {/* Verdict */}
              <VerdictBanner result={result} />

              {/* KPI row */}
              <div className="flex gap-3">
                <KpiCard
                  label="Projects involved"
                  value={result.projects.length}
                  sublabel={`${result.affectedProjects} at risk`}
                  level={result.affectedProjects > 0 ? (result.overallLevel === "critical" ? "critical" : "warning") : "neutral"}
                />
                <KpiCard
                  label="Skills uncovered"
                  value={result.totalUncovered}
                  sublabel="zero active holders"
                  level={result.totalUncovered > 0 ? "critical" : "safe"}
                />
                <KpiCard
                  label="Knowledge silos"
                  value={result.totalSiloed}
                  sublabel="single holder left"
                  level={result.totalSiloed > 0 ? "warning" : "safe"}
                />
              </div>

              {/* Project breakdown */}
              {result.projects.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">
                    Impact per project
                  </p>
                  <div className="space-y-2.5">
                    {[...result.projects]
                      .sort((a, b) => {
                        const ord = { critical: 0, warning: 1, safe: 2 };
                        return ord[a.level] - ord[b.level];
                      })
                      .map((p) => (
                        <ProjectImpactRow key={p.id} project={p} />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  <p className="text-[13px] text-emerald-700 font-medium">
                    This employee has no assigned projects. Their absence has no
                    measurable impact.
                  </p>
                </div>
              )}

              {/* Recommendation */}
              <div
                className={cn(
                  "rounded-xl border p-4",
                  result.overallLevel === "critical"
                    ? "bg-rose-50/60 border-rose-200/60"
                    : result.overallLevel === "warning"
                      ? "bg-amber-50/60 border-amber-200/60"
                      : "bg-emerald-50/60 border-emerald-200/60",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-2",
                    result.overallLevel === "critical"
                      ? "text-rose-600"
                      : result.overallLevel === "warning"
                        ? "text-amber-600"
                        : "text-emerald-600",
                  )}
                >
                  Recommendation
                </p>
                <p className="text-[13px] text-foreground leading-relaxed">
                  {result.recommendation}
                </p>
              </div>

              {/* Warning for critical */}
              {result.overallLevel === "critical" && (
                <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200/60 px-4 py-3">
                  <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-rose-700 leading-relaxed">
                    Inserting this leave will immediately flag{" "}
                    <strong>{result.totalUncovered}</strong> uncovered skill
                    {result.totalUncovered !== 1 ? "s" : ""} on your risk
                    dashboard. Proceed only if you have an external contingency
                    plan in place.
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="shrink-0 px-8 py-5 border-t border-border/60 space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl h-10 text-[13px] font-medium border-border/60 hover:bg-muted/50 px-4"
                  onClick={() => setStep("form")}
                >
                  <ArrowLeft className="size-4" />
                  Reconfigure
                </Button>
                <Button
                  className={cn(
                    "flex-1 justify-center gap-2 rounded-xl h-10 text-[13px] font-semibold btn-press",
                    insertBtnClass,
                  )}
                  onClick={onClose}
                >
                  <CalendarPlus className="size-4" />
                  Insert This Leave
                </Button>
              </div>
              {result.overallLevel === "critical" && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Inserting despite risks — make sure a manager has been notified
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
