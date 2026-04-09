import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PenSquare,
  X,
  PlayCircle,
  Plus,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  User,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EMPLOYEE_DETAILS,
  type EmployeeDetail,
  type LeaveType,
  type SkillCategory,
} from "@/data/employees";

/* ─── Types ───────────────────────────────────────────────── */

type DetailTab = "overview" | "projects" | "skills";

/* ─── Radar chart ─────────────────────────────────────────── */

const RADAR_AXES: SkillCategory[] = [
  "FRONTEND",
  "BACKEND",
  "DEVOPS",
  "DATABASE",
  "SECURITY",
  "TESTING",
];

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

function CompetencyRadar({ employee }: { employee: EmployeeDetail }) {
  const cx = 145;
  const cy = 145;
  const maxR = 95;
  const labelR = maxR * 1.3;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const scores = RADAR_AXES.map((cat) => {
    const catSkills = employee.skills.filter((s) => s.category === cat);
    if (catSkills.length === 0) return 0.25;
    return (
      catSkills.reduce((sum, s) => sum + s.level, 0) / (catSkills.length * 5)
    );
  });

  return (
    <svg width="290" height="290" viewBox="0 0 290 290" className="mx-auto">
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
  const segments = 10;
  const filled = level * 2;
  const color = skillColor(level);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">{name}</span>
        <span className="text-[11px] text-muted-foreground">
          {level}/5 —{" "}
          <span className="font-medium text-foreground">
            {LEVEL_LABEL[level]}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-sm transition-colors shadow-inner",
              i < filled ? color : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Leave type badge ─────────────────────────────────────── */

const LEAVE_COLORS: Record<LeaveType, string> = {
  vacation:
    "bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 border border-blue-200/50",
  sick: "bg-gradient-to-br from-rose-100 to-rose-50 text-rose-700 border border-rose-200/50",
  conference:
    "bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200/50",
};

const LEAVE_LABELS: Record<LeaveType, string> = {
  vacation: "Vacation",
  sick: "Sick",
  conference: "Conference",
};

function LeaveBadge({ type }: { type: LeaveType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
        LEAVE_COLORS[type],
      )}
    >
      {LEAVE_LABELS[type]}
    </span>
  );
}

function LeaveStatusBadge({
  status,
}: {
  status: "approved" | "pending" | "rejected";
}) {
  const cls = {
    approved:
      "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/50",
    pending:
      "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 border border-amber-200/50",
    rejected:
      "bg-gradient-to-br from-rose-100 to-rose-50 text-rose-700 border border-rose-200/50",
  }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
        cls,
      )}
    >
      {status}
    </span>
  );
}

/* ─── Simulate a Leave Modal ───────────────────────────────── */

function SimulateLeaveModal({
  open,
  onClose,
  employeeName,
}: {
  open: boolean;
  onClose: () => void;
  employeeName: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-[480px] flex-col bg-card shadow-2xl">
        <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-primary via-primary to-transparent" />

        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h2 className="text-[18px] font-bold text-foreground tracking-tight">
              Leave Impact Simulation
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Simulate the impact of an employee absence on projects and skills
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
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-foreground/70">
              Select Employee
            </label>
            <select
              defaultValue={employeeName}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all cursor-pointer"
            >
              <option>{employeeName}</option>
              {Object.values(EMPLOYEE_DETAILS)
                .filter((e) => e.name !== employeeName)
                .map((e) => (
                  <option key={e.id}>{e.name}</option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">
                Start date
              </label>
              <input
                type="date"
                defaultValue="2025-08-15"
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">
                Start time
              </label>
              <select className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all cursor-pointer">
                <option>Morning</option>
                <option selected>Afternoon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">
                End date
              </label>
              <input
                type="date"
                defaultValue="2025-08-17"
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-foreground/70">
                End time
              </label>
              <select className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all cursor-pointer">
                <option>Morning</option>
                <option selected>Afternoon</option>
              </select>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-8 py-5 border-t border-border/60">
          <Button
            className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-[13px] font-semibold shadow-sm shadow-primary/10 btn-press"
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

/* ─── Overview Tab ────────────────────────────────────────── */

function OverviewTab({ employee }: { employee: EmployeeDetail }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-sm">
            Informations
          </h3>
          <Button
            size="xs"
            variant="outline"
            className="gap-1.5 text-[10px] rounded-lg bg-muted/30 hover:bg-muted"
          >
            <PenSquare className="size-3" />
            Edit
          </Button>
        </div>
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: employee.email },
            { icon: Phone, label: "Phone", value: employee.phone },
            {
              icon: Briefcase,
              label: "Department",
              value: employee.department,
            },
            { icon: User, label: "Role", value: employee.role },
            {
              icon: CalendarDays,
              label: "Start Date",
              value: new Date(employee.startDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            },
            { icon: User, label: "Manager", value: employee.manager },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                <Icon className="size-3.5 text-muted-foreground/70" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-[13px] font-medium text-foreground mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-sm">Leaves</h3>
          <Button
            size="xs"
            variant="outline"
            className="gap-1.5 text-[10px] rounded-lg bg-muted/30 hover:bg-muted"
          >
            <Calendar className="size-3" />
            Request
          </Button>
        </div>
        <div className="space-y-2.5">
          {employee.leaves.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">
              No leaves recorded
            </p>
          ) : (
            employee.leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LeaveBadge type={leave.type} />
                  <div>
                    <p className="text-[12px] font-medium text-foreground">
                      {new Date(leave.startDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                      {" → "}
                      {new Date(leave.endDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <LeaveStatusBadge status={leave.status} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-sm">Projects</h3>
          <Button
            size="xs"
            variant="outline"
            className="gap-1.5 text-[10px] rounded-lg bg-muted/30 hover:bg-muted"
          >
            <Plus className="size-3" />
            Assign
          </Button>
        </div>
        <div className="space-y-2.5">
          {employee.projects.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">
              No projects assigned
            </p>
          ) : (
            employee.projects.map((proj) => (
              <div
                key={proj.id}
                className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-muted/20 transition-colors"
              >
                <div>
                  <p className="text-[12px] font-semibold text-foreground">
                    {proj.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {proj.role}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    proj.status === "Active"
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/50"
                      : proj.status === "On Hold"
                        ? "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 border border-amber-200/50"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {proj.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Projects Tab ────────────────────────────────────────── */

function ProjectsTab({ employee }: { employee: EmployeeDetail }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Projects</h3>
        <Button
          size="xs"
          variant="outline"
          className="gap-1.5 text-[10px] rounded-lg bg-muted/30 hover:bg-muted"
        >
          <Plus className="size-3" />
          Assign project
        </Button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            {["Project", "Role", "Status"].map((col) => (
              <th
                key={col}
                className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {employee.projects.map((proj) => (
            <tr key={proj.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-6 py-4">
                <p className="font-semibold text-foreground text-[14px]">
                  {proj.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{proj.id}</p>
              </td>
              <td className="px-6 py-4 text-[13px] text-foreground">
                {proj.role}
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    proj.status === "Active"
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/50"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {proj.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Skills Tab ──────────────────────────────────────────── */

function SkillsTab({ employee }: { employee: EmployeeDetail }) {
  const left = employee.skills.filter((_, i) => i % 2 === 0);
  const right = employee.skills.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-3 rounded-2xl bg-card border border-border/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground text-sm">
            Skills & Proficiency
          </h3>
          <Button
            size="xs"
            variant="ghost"
            className="gap-1.5 text-[11px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Plus className="size-3.5" />
            Add Skill
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {left.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} />
          ))}
          {right.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} />
          ))}
        </div>
      </div>

      <div className="col-span-2 rounded-2xl bg-card border border-border/60 p-6 shadow-sm">
        <h3 className="font-semibold text-foreground text-sm mb-4">
          Competency Radar
        </h3>
        <CompetencyRadar employee={employee} />
      </div>
    </div>
  );
}

/* ─── Employee Detail Page ────────────────────────────────── */

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [simulateOpen, setSimulateOpen] = useState(false);

  const employee: EmployeeDetail | undefined = id
    ? EMPLOYEE_DETAILS[id]
    : undefined;

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-foreground">
          Employee not found
        </p>
        <Link
          to="/employees"
          className="text-[13px] text-primary hover:underline underline-offset-4"
        >
          Back to employees
        </Link>
      </div>
    );
  }

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "projects", label: "Projects" },
    { key: "skills", label: "Skills" },
  ];

  return (
    <>
      <div className="space-y-5 page-enter">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 rounded-2xl bg-card border border-border/60 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center rounded-2xl text-[18px] font-bold text-white shadow-md",
                employee.color,
              )}
            >
              {employee.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-bold text-foreground tracking-tight">
                  {employee.name}
                </h2>
                <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground/70">
                  {employee.department}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {employee.role}
              </p>
              {employee.onLeaveUntil && (
                <span className="mt-2 inline-flex items-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                  On Leave until {employee.onLeaveUntil}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Criticality
              </p>
              <button className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors">
                <PenSquare className="size-3.5" />
              </button>
            </div>
            <p
              className={cn(
                "mt-3 text-[32px] font-bold",
                employee.criticality === "High"
                  ? "text-rose-500"
                  : employee.criticality === "Medium"
                    ? "text-amber-500"
                    : "text-emerald-500",
              )}
            >
              {employee.criticality}
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Bus Factor in Org
              </p>
              <button className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors">
                <Briefcase className="size-3.5" />
              </button>
            </div>
            <p className="mt-3 text-[32px] font-bold text-amber-500">
              {employee.busFactor}
            </p>
          </div>
        </div>

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

        {activeTab === "overview" && <OverviewTab employee={employee} />}
        {activeTab === "projects" && <ProjectsTab employee={employee} />}
        {activeTab === "skills" && <SkillsTab employee={employee} />}
      </div>

      <SimulateLeaveModal
        open={simulateOpen}
        onClose={() => setSimulateOpen(false)}
        employeeName={employee.name}
      />
    </>
  );
}
