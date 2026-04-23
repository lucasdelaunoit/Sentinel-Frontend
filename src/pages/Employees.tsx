import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye, PenSquare, X, Search, Plus, Play, Trash2,
  AlertTriangle, CheckCircle2, ShieldAlert, ChevronDown,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EMPLOYEE_DETAILS } from "@/data/employees";
import { PROJECTS } from "@/data/projects";

/* ─── Types ────────────────────────────────────────────────── */

type Criticality = "High" | "Medium" | "Low";
type TodayStatus = "Available" | "Has Leave" | "Remote";
type LeaveType = "vacation" | "sick" | "conference";
type Tab = "list" | "calendar";
type ImpactLevel = "critical" | "warning" | "safe";
type DragMode = "move" | "resize-left" | "resize-right";

interface LeaveRange {
  start: number;
  end: number;
  type: LeaveType;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  skills: number;
  projects: number;
  criticality: Criticality;
  busFactor: number;
  todayStatus: TodayStatus;
  initials: string;
  color: string;
  leaves: LeaveRange[];
}

interface SimBlock {
  id: string;
  employeeId: string;
  startDay: number;
  startHalf: 0 | 1; // 0 = AM, 1 = PM
  endDay: number;
  endHalf: 0 | 1;   // 0 = AM, 1 = PM (inclusive)
  colorIdx: number;
  status: "pending" | "approved" | "refused";
}

interface DragState {
  blockId: string;
  mode: DragMode;
  startMouseX: number;
  origStartDay: number;
  origStartHalf: 0 | 1;
  origEndDay: number;
  origEndHalf: 0 | 1;
}

interface ProjectImpact {
  id: string;
  name: string;
  level: ImpactLevel;
  uncovered: string[];
  siloed: string[];
  safe: string[];
}

/* ─── Mock data ───────────────────────────────────────────── */

const EMPLOYEES: Employee[] = [
  {
    id: "E001",
    name: "Clint Cambier",
    email: "clint@qite.be",
    department: "Management",
    skills: 8,
    projects: 2,
    criticality: "High",
    busFactor: 1,
    todayStatus: "Has Leave",
    initials: "CC",
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    leaves: [{ start: 1, end: 5, type: "vacation" }],
  },
  {
    id: "E002",
    name: "Gérard Martic",
    email: "gerard@qite.be",
    department: "Management",
    skills: 8,
    projects: 2,
    criticality: "High",
    busFactor: 1,
    todayStatus: "Available",
    initials: "GM",
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
    leaves: [],
  },
  {
    id: "E003",
    name: "Sarah Chen",
    email: "sarah@qite.be",
    department: "Engineering",
    skills: 6,
    projects: 3,
    criticality: "High",
    busFactor: 1,
    todayStatus: "Available",
    initials: "SC",
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    leaves: [{ start: 2, end: 6, type: "vacation" }],
  },
  {
    id: "E004",
    name: "Michael Johnson",
    email: "michael@qite.be",
    department: "Engineering",
    skills: 7,
    projects: 2,
    criticality: "Medium",
    busFactor: 2,
    todayStatus: "Available",
    initials: "MJ",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    leaves: [{ start: 14, end: 18, type: "conference" }],
  },
  {
    id: "E005",
    name: "Emily Rodriguez",
    email: "emily@qite.be",
    department: "Design",
    skills: 5,
    projects: 2,
    criticality: "Medium",
    busFactor: 2,
    todayStatus: "Remote",
    initials: "ER",
    color: "bg-gradient-to-br from-rose-500 to-rose-600",
    leaves: [],
  },
  {
    id: "E006",
    name: "David Kim",
    email: "david@qite.be",
    department: "Engineering",
    skills: 9,
    projects: 1,
    criticality: "High",
    busFactor: 1,
    todayStatus: "Available",
    initials: "DK",
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
    leaves: [],
  },
  {
    id: "E007",
    name: "Lisa Wang",
    email: "lisa@qite.be",
    department: "Data",
    skills: 6,
    projects: 2,
    criticality: "Medium",
    busFactor: 3,
    todayStatus: "Available",
    initials: "LW",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    leaves: [],
  },
  {
    id: "E008",
    name: "James Park",
    email: "james@qite.be",
    department: "Engineering",
    skills: 7,
    projects: 2,
    criticality: "Low",
    busFactor: 4,
    todayStatus: "Available",
    initials: "JP",
    color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    leaves: [{ start: 22, end: 26, type: "conference" }],
  },
];

/* ─── Calendar constants ─────────────────────────────────── */

const DAY_COL_WIDTH = 44;
const ROW_HEIGHT = 56;
const NAME_COL_WIDTH = 196;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_IN_APRIL = 30;
const APRIL_FIRST_DAY = 3; // April 1 2026 is Wednesday

// Company-configured holidays (day numbers in April)
const COMPANY_HOLIDAYS: number[] = [21]; // Easter Monday

const SIM_COLORS = [
  { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-800", handle: "bg-amber-400", dot: "bg-amber-400" },
  { bg: "bg-violet-100", border: "border-violet-400", text: "text-violet-800", handle: "bg-violet-400", dot: "bg-violet-400" },
  { bg: "bg-teal-100", border: "border-teal-400", text: "text-teal-800", handle: "bg-teal-400", dot: "bg-teal-400" },
  { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-800", handle: "bg-orange-400", dot: "bg-orange-400" },
  { bg: "bg-pink-100", border: "border-pink-400", text: "text-pink-800", handle: "bg-pink-400", dot: "bg-pink-400" },
  { bg: "bg-sky-100", border: "border-sky-400", text: "text-sky-800", handle: "bg-sky-400", dot: "bg-sky-400" },
] as const;

const LEAVE_BAND_BG: Record<LeaveType, string> = {
  vacation: "bg-blue-50",
  sick: "bg-rose-50",
  conference: "bg-indigo-50",
};

const LEAVE_BAND_BORDER: Record<LeaveType, string> = {
  vacation: "border-blue-200",
  sick: "border-rose-200",
  conference: "border-indigo-200",
};

const LEAVE_DOT: Record<LeaveType, string> = {
  vacation: "bg-blue-400",
  sick: "bg-rose-400",
  conference: "bg-indigo-500",
};

/* ─── Calendar helpers ──────────────────────────────────── */

function getDayOfWeek(day: number): number {
  return (APRIL_FIRST_DAY + day - 1) % 7;
}

function isWeekend(day: number): boolean {
  const d = getDayOfWeek(day);
  return d === 0 || d === 6;
}

function isClosedDay(day: number): boolean {
  return isWeekend(day) || COMPANY_HOLIDAYS.includes(day);
}

function getDayLabel(day: number): string {
  return DAY_NAMES[getDayOfWeek(day)];
}

// Half-day index: (day-1)*2 + half  (0-based)
function toHalves(day: number, half: 0 | 1): number {
  return (day - 1) * 2 + half;
}

function fromHalves(h: number): { day: number; half: 0 | 1 } {
  const clamped = Math.max(0, Math.min(DAYS_IN_APRIL * 2 - 1, h));
  return { day: Math.floor(clamped / 2) + 1, half: (clamped % 2) as 0 | 1 };
}

// Pixel X offset within the days area (day is 1-based)
function toX(day: number, half: 0 | 1 = 0): number {
  return (day - 1) * DAY_COL_WIDTH + half * (DAY_COL_WIDTH / 2);
}

function blockLeft(b: SimBlock): number {
  return toX(b.startDay, b.startHalf);
}

function blockWidth(b: SimBlock): number {
  return toX(b.endDay, b.endHalf) + DAY_COL_WIDTH / 2 - toX(b.startDay, b.startHalf);
}

function formatHalfDate(day: number, half: 0 | 1): string {
  return `Apr ${day} ${half === 0 ? "AM" : "PM"}`;
}

function blockDurationLabel(b: SimBlock): string {
  const halves = toHalves(b.endDay, b.endHalf) - toHalves(b.startDay, b.startHalf) + 1;
  if (halves === 1) return "½ day";
  if (halves === 2) return "1 day";
  const days = halves / 2;
  return `${Number.isInteger(days) ? days : days} days`;
}

function countWorkingDays(startDay: number, endDay: number): number {
  let count = 0;
  for (let d = startDay; d <= endDay; d++) {
    if (!isClosedDay(d)) count++;
  }
  return count;
}

/* ─── Simulation engine ─────────────────────────────────── */

function skillMatch(required: string, empSkill: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const r = norm(required);
  const e = norm(empSkill);
  return r === e || r.includes(e) || e.includes(r);
}

function runBlockSimulation(
  block: SimBlock,
): { projects: ProjectImpact[]; overallLevel: ImpactLevel } {
  const emp = EMPLOYEE_DETAILS[block.employeeId];
  if (!emp) return { projects: [], overallLevel: "safe" };

  const impacts: ProjectImpact[] = [];

  for (const pr of emp.projects) {
    const project = PROJECTS.find((p) => p.id === pr.id);
    if (!project) continue;

    const teammates = project.team
      .filter((m) => m.id !== emp.id)
      .map((m) => EMPLOYEE_DETAILS[m.id])
      .filter(Boolean);

    const uncovered: string[] = [];
    const siloed: string[] = [];
    const safe: string[] = [];

    for (const skill of project.skills) {
      const empHasSkill = emp.skills.some(
        (s) => skillMatch(skill, s.name) && s.level >= 2,
      );
      if (!empHasSkill) continue;

      const othersCount = teammates.filter((m) =>
        m.skills.some((s) => skillMatch(skill, s.name) && s.level >= 2),
      ).length;

      if (othersCount === 0) uncovered.push(skill);
      else if (othersCount === 1) siloed.push(skill);
      else safe.push(skill);
    }

    const level: ImpactLevel =
      uncovered.length > 0 ? "critical" : siloed.length > 0 ? "warning" : "safe";

    impacts.push({ id: project.id, name: project.name, level, uncovered, siloed, safe });
  }

  const overallLevel: ImpactLevel = impacts.some((p) => p.level === "critical")
    ? "critical"
    : impacts.some((p) => p.level === "warning")
    ? "warning"
    : "safe";

  return { projects: impacts, overallLevel };
}

/* ─── SimBlock Sheet ────────────────────────────────────── */

function SimBlockSheet({
  block,
  employee,
  onClose,
  onApprove,
  onRefuse,
  onDelete,
}: {
  block: SimBlock;
  employee: Employee;
  onClose: () => void;
  onApprove: () => void;
  onRefuse: () => void;
  onDelete: () => void;
}) {
  const color = SIM_COLORS[block.colorIdx % SIM_COLORS.length];
  const { projects, overallLevel } = runBlockSimulation(block);
  const workingDays = countWorkingDays(block.startDay, block.endDay);

  const levelMeta = {
    critical: {
      label: "Critical Impact",
      sub: "Key skills will be uncovered",
      Icon: ShieldAlert,
      cls: "text-rose-700 bg-rose-50 border-rose-200",
    },
    warning: {
      label: "Moderate Impact",
      sub: "Some skills may be at risk",
      Icon: AlertTriangle,
      cls: "text-amber-700 bg-amber-50 border-amber-200",
    },
    safe: {
      label: "Safe to Approve",
      sub: "All skills are covered",
      Icon: CheckCircle2,
      cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
  };
  const lm = levelMeta[overallLevel];

  const projectDot: Record<ImpactLevel, string> = {
    critical: "bg-rose-400",
    warning: "bg-amber-400",
    safe: "bg-emerald-400",
  };

  const projectCard: Record<ImpactLevel, string> = {
    critical: "border-rose-200 bg-rose-50/60",
    warning: "border-amber-200 bg-amber-50/60",
    safe: "border-emerald-200 bg-emerald-50/60",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-[440px] flex-col bg-card shadow-2xl overflow-hidden">
        {/* Color accent bar */}
        <div className={cn("h-[3px] w-full shrink-0", color.handle)} />

        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-md",
                employee.color,
              )}
            >
              {employee.initials}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-foreground leading-tight">
                {employee.name}
              </h2>
              <p className="text-[12px] text-muted-foreground">{employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
          {/* Period info */}
          <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Simulation Period
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              <div className="text-muted-foreground">From</div>
              <div className="font-medium text-foreground text-right">
                {formatHalfDate(block.startDay, block.startHalf)}
              </div>
              <div className="text-muted-foreground">To</div>
              <div className="font-medium text-foreground text-right">
                {formatHalfDate(block.endDay, block.endHalf)}
              </div>
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium text-foreground text-right">
                {blockDurationLabel(block)}
              </div>
              <div className="text-muted-foreground">Working days</div>
              <div className="font-medium text-foreground text-right">
                {workingDays} day{workingDays !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Overall impact */}
          <div className={cn("flex items-start gap-3 rounded-xl border p-3.5", lm.cls)}>
            <lm.Icon className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold">{lm.label}</p>
              <p className="text-[11px] opacity-75">{lm.sub}</p>
            </div>
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Project Impact ({projects.length})
              </p>
              {projects.map((p) => (
                <div
                  key={p.id}
                  className={cn("rounded-xl border p-3.5 space-y-2", projectCard[p.level])}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full shrink-0", projectDot[p.level])} />
                    <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                  </div>
                  {p.uncovered.length > 0 && (
                    <p className="text-[11px] text-rose-700">
                      <span className="font-medium">Uncovered: </span>
                      {p.uncovered.join(", ")}
                    </p>
                  )}
                  {p.siloed.length > 0 && (
                    <p className="text-[11px] text-amber-700">
                      <span className="font-medium">At risk: </span>
                      {p.siloed.join(", ")}
                    </p>
                  )}
                  {p.safe.length > 0 && (
                    <p className="text-[11px] text-emerald-700">
                      <span className="font-medium">Covered: </span>
                      {p.safe.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Status banner */}
          {block.status !== "pending" && (
            <div
              className={cn(
                "rounded-xl border p-3 text-center text-[13px] font-semibold",
                block.status === "approved"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700",
              )}
            >
              {block.status === "approved" ? "✓ Leave Approved" : "✗ Leave Refused"}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 px-7 py-5 border-t border-border/60 space-y-2">
          {block.status === "pending" && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onApprove}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-[13px] font-semibold shadow-sm gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                Approve
              </Button>
              <Button
                onClick={onRefuse}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10 text-[13px] font-semibold shadow-sm gap-1.5"
              >
                <X className="size-4" />
                Refuse
              </Button>
            </div>
          )}
          {block.status !== "pending" && (
            <Button
              onClick={() => {
                /* reset to pending for re-evaluation */
                onApprove(); // parent handles toggle — wire as needed
              }}
              variant="outline"
              className="w-full rounded-xl h-10 text-[13px] font-medium"
            >
              Reset to Pending
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onDelete}
            className="w-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9 text-[12px] gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Remove simulation
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Simulation Results Panel ──────────────────────────── */

function SimResultsPanel({
  simBlocks,
  employees,
  onClose,
  onSelectBlock,
}: {
  simBlocks: SimBlock[];
  employees: Employee[];
  onClose: () => void;
  onSelectBlock: (id: string) => void;
}) {
  const results = simBlocks.map((b) => ({
    block: b,
    employee: employees.find((e) => e.id === b.employeeId)!,
    ...runBlockSimulation(b),
  }));

  const criticalCount = results.filter((r) => r.overallLevel === "critical").length;
  const warningCount = results.filter((r) => r.overallLevel === "warning").length;
  const safeCount = results.filter((r) => r.overallLevel === "safe").length;

  const levelIcon = {
    critical: <ShieldAlert className="size-3.5 text-rose-500" />,
    warning: <AlertTriangle className="size-3.5 text-amber-500" />,
    safe: <CheckCircle2 className="size-3.5 text-emerald-500" />,
  };

  const levelBadge: Record<ImpactLevel, string> = {
    critical: "bg-rose-100 text-rose-700 border-rose-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    safe: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Play className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Simulation Results</h3>
          <div className="flex items-center gap-1.5">
            {criticalCount > 0 && (
              <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {warningCount} warning
              </span>
            )}
            {safeCount > 0 && (
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {safeCount} safe
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="divide-y divide-border/40">
        {results.map(({ block, employee, overallLevel, projects }) => {
          const color = SIM_COLORS[block.colorIdx % SIM_COLORS.length];
          return (
            <button
              key={block.id}
              className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-muted/20 transition-colors text-left"
              onClick={() => onSelectBlock(block.id)}
            >
              <div className={cn("size-2.5 rounded-full shrink-0", color.dot)} />
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white",
                  employee?.color ?? "bg-muted",
                )}
              >
                {employee?.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {employee?.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatHalfDate(block.startDay, block.startHalf)} →{" "}
                  {formatHalfDate(block.endDay, block.endHalf)} · {blockDurationLabel(block)}
                </p>
              </div>
              <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", levelBadge[overallLevel])}>
                {levelIcon[overallLevel]}
                <span className="capitalize">{overallLevel}</span>
              </div>
              <div className="text-[11px] text-muted-foreground shrink-0">
                {block.status === "approved" && <span className="text-emerald-600 font-medium">Approved</span>}
                {block.status === "refused" && <span className="text-rose-600 font-medium">Refused</span>}
                {block.status === "pending" && (
                  <span className="text-muted-foreground">
                    {projects.filter((p) => p.level !== "safe").length} project
                    {projects.filter((p) => p.level !== "safe").length !== 1 ? "s" : ""} at risk
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Leave Calendar ────────────────────────────────────── */

function LeaveCalendar({ employees }: { employees: Employee[] }) {
  const [simBlocks, setSimBlocks] = useState<SimBlock[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [simResultsVisible, setSimResultsVisible] = useState(false);

  const dragStateRef = useRef<DragState | null>(null);
  const didMoveRef = useRef(false);
  const colorCounterRef = useRef(0);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: DAYS_IN_APRIL }, (_, i) => i + 1);
  const totalDaysWidth = DAYS_IN_APRIL * DAY_COL_WIDTH;

  // Document-level mouse handlers for dragging
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;

      const deltaX = e.clientX - drag.startMouseX;
      if (Math.abs(deltaX) > 4) didMoveRef.current = true;
      if (!didMoveRef.current) return;

      const deltaHalves = Math.round(deltaX / (DAY_COL_WIDTH / 2));

      setSimBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== drag.blockId) return b;

          if (drag.mode === "move") {
            const origStart = toHalves(drag.origStartDay, drag.origStartHalf);
            const origEnd = toHalves(drag.origEndDay, drag.origEndHalf);
            const span = origEnd - origStart;
            const newStart = Math.max(0, Math.min(DAYS_IN_APRIL * 2 - 1 - span, origStart + deltaHalves));
            const newEnd = newStart + span;
            const { day: sd, half: sh } = fromHalves(newStart);
            const { day: ed, half: eh } = fromHalves(newEnd);
            return { ...b, startDay: sd, startHalf: sh, endDay: ed, endHalf: eh };
          }

          if (drag.mode === "resize-left") {
            const origEnd = toHalves(drag.origEndDay, drag.origEndHalf);
            const newStart = Math.max(0, Math.min(origEnd - 1, toHalves(drag.origStartDay, drag.origStartHalf) + deltaHalves));
            const { day: sd, half: sh } = fromHalves(newStart);
            return { ...b, startDay: sd, startHalf: sh };
          }

          // resize-right
          const origStart = toHalves(drag.origStartDay, drag.origStartHalf);
          const newEnd = Math.max(origStart + 1, Math.min(DAYS_IN_APRIL * 2 - 1, toHalves(drag.origEndDay, drag.origEndHalf) + deltaHalves));
          const { day: ed, half: eh } = fromHalves(newEnd);
          return { ...b, endDay: ed, endHalf: eh };
        }),
      );
    };

    const onUp = () => {
      dragStateRef.current = null;
      setDragState(null);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Close add-menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showAddMenu]);

  function startDrag(e: React.MouseEvent, block: SimBlock, mode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    didMoveRef.current = false;
    const drag: DragState = {
      blockId: block.id,
      mode,
      startMouseX: e.clientX,
      origStartDay: block.startDay,
      origStartHalf: block.startHalf,
      origEndDay: block.endDay,
      origEndHalf: block.endHalf,
    };
    dragStateRef.current = drag;
    setDragState(drag);
  }

  function addSimBlock(employeeId: string) {
    const colorIdx = colorCounterRef.current % SIM_COLORS.length;
    colorCounterRef.current++;
    // Find first non-weekend slot
    let startDay = 7;
    while (startDay <= DAYS_IN_APRIL && isClosedDay(startDay)) startDay++;
    let endDay = startDay + 4;
    while (endDay <= DAYS_IN_APRIL && isClosedDay(endDay)) endDay++;
    endDay = Math.min(endDay, DAYS_IN_APRIL);

    setSimBlocks((prev) => [
      ...prev,
      {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        employeeId,
        startDay,
        startHalf: 0,
        endDay,
        endHalf: 1,
        colorIdx,
        status: "pending",
      },
    ]);
    setShowAddMenu(false);
  }

  function removeBlock(id: string) {
    setSimBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function updateBlockStatus(id: string, status: SimBlock["status"]) {
    setSimBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const selectedBlock = simBlocks.find((b) => b.id === selectedBlockId);
  const selectedEmployee = selectedBlock
    ? employees.find((e) => e.id === selectedBlock.employeeId)
    : undefined;

  return (
    <div className="space-y-3">
      {/* Results panel (shown after Run Simulation) */}
      {simResultsVisible && simBlocks.length > 0 && (
        <SimResultsPanel
          simBlocks={simBlocks}
          employees={employees}
          onClose={() => setSimResultsVisible(false)}
          onSelectBlock={(id) => setSelectedBlockId(id)}
        />
      )}

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        {/* Calendar header */}
        <div className="px-6 py-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-foreground text-sm">
                April 2026 — Leave Calendar
              </h3>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {employees.length} employees
              </span>
              {simBlocks.length > 0 && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  {simBlocks.length} simulation{simBlocks.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Add simulation period */}
              <div className="relative" ref={addMenuRef}>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-xl h-8 px-3 text-[12px] font-medium border-dashed border-amber-400 text-amber-700 hover:bg-amber-50 hover:border-amber-500"
                  onClick={() => setShowAddMenu((v) => !v)}
                >
                  <Plus className="size-3.5" />
                  Add simulation period
                  <ChevronDown className={cn("size-3 transition-transform", showAddMenu && "rotate-180")} />
                </Button>

                {showAddMenu && (
                  <div className="absolute right-0 top-full mt-1.5 z-30 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden min-w-[220px]">
                    <div className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/30">
                      Select employee
                    </div>
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                        onClick={() => addSimBlock(emp.id)}
                      >
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-semibold text-white",
                            emp.color,
                          )}
                        >
                          {emp.initials}
                        </div>
                        <span className="text-[13px] text-foreground">{emp.name}</span>
                        <span className="ml-auto text-[11px] text-muted-foreground">{emp.department}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Run Simulation */}
              {simBlocks.length > 0 && (
                <Button
                  size="sm"
                  className="gap-1.5 rounded-xl h-8 px-3.5 text-[12px] font-semibold bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  onClick={() => setSimResultsVisible(true)}
                >
                  <Play className="size-3.5" />
                  Run Simulation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable calendar grid */}
        <div
          className="overflow-x-auto select-none"
          style={{ cursor: dragState ? "grabbing" : "default" }}
        >
          <div style={{ minWidth: NAME_COL_WIDTH + totalDaysWidth }}>
            {/* Day header row */}
            <div
              className="flex border-b border-border/60"
              style={{ backgroundColor: "hsl(var(--muted) / 0.2)" }}
            >
              {/* Name column header */}
              <div
                className="shrink-0 sticky left-0 z-20 bg-muted/20 border-r border-border/40 flex items-end px-5 py-2"
                style={{ width: NAME_COL_WIDTH }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Employee
                </span>
              </div>

              {/* Day columns */}
              <div className="flex" style={{ width: totalDaysWidth }}>
                {days.map((d) => {
                  const closed = isClosedDay(d);
                  const weekend = isWeekend(d);
                  const holiday = COMPANY_HOLIDAYS.includes(d);
                  return (
                    <div
                      key={d}
                      className={cn(
                        "flex flex-col items-center justify-end border-r border-border/20 last:border-r-0 py-2",
                        closed && "bg-muted/40",
                      )}
                      style={{ width: DAY_COL_WIDTH }}
                      title={holiday ? "Company Holiday" : weekend ? "Weekend" : undefined}
                    >
                      <span
                        className={cn(
                          "text-[9px] font-medium leading-none",
                          closed ? "text-muted-foreground/30" : "text-muted-foreground/50",
                        )}
                      >
                        {getDayLabel(d)}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-semibold leading-snug",
                          closed ? "text-muted-foreground/30" : "text-foreground/70",
                          holiday && "line-through",
                        )}
                      >
                        {d}
                      </span>
                      {/* AM/PM tick */}
                      <div className="flex w-full px-px mt-0.5">
                        <div className="flex-1 text-center text-[7px] text-muted-foreground/25">
                          am
                        </div>
                        <div className="w-px self-stretch bg-border/20" />
                        <div className="flex-1 text-center text-[7px] text-muted-foreground/25">
                          pm
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employee rows */}
            {employees.map((emp) => {
              const empBlocks = simBlocks.filter((b) => b.employeeId === emp.id);

              return (
                <div
                  key={emp.id}
                  className="flex border-b border-border/40 hover:bg-muted/10 transition-colors group"
                  style={{ minHeight: ROW_HEIGHT }}
                >
                  {/* Sticky name cell */}
                  <div
                    className="shrink-0 sticky left-0 z-10 bg-card group-hover:bg-muted/10 transition-colors border-r border-border/40 flex items-center px-5"
                    style={{ width: NAME_COL_WIDTH }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm",
                          emp.color,
                        )}
                      >
                        {emp.initials}
                      </div>
                      <span className="font-medium text-foreground text-[13px] whitespace-nowrap">
                        {emp.name}
                      </span>
                    </div>
                  </div>

                  {/* Days area — relatively positioned for absolute children */}
                  <div
                    className="relative"
                    style={{ width: totalDaysWidth, height: ROW_HEIGHT }}
                  >
                    {/* Weekend/holiday column overlays */}
                    {days.map((d) =>
                      isClosedDay(d) ? (
                        <div
                          key={d}
                          className="absolute inset-y-0 bg-muted/25 pointer-events-none"
                          style={{ left: toX(d), width: DAY_COL_WIDTH }}
                        />
                      ) : null,
                    )}

                    {/* Day separator lines */}
                    {days.map((d) => (
                      <div
                        key={d}
                        className="absolute inset-y-0 border-r border-border/10 pointer-events-none"
                        style={{ left: toX(d) + DAY_COL_WIDTH - 1, width: 1 }}
                      />
                    ))}

                    {/* Half-day separator lines */}
                    {days.map((d) => (
                      <div
                        key={`h-${d}`}
                        className="absolute inset-y-0 border-r border-border/5 pointer-events-none"
                        style={{ left: toX(d) + DAY_COL_WIDTH / 2 - 1, width: 1 }}
                      />
                    ))}

                    {/* Real leave blocks */}
                    {emp.leaves.map((lr, i) => {
                      const left = toX(lr.start);
                      const width = toX(lr.end + 1) - left;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "absolute rounded-lg flex items-center justify-center border",
                            LEAVE_BAND_BG[lr.type],
                            LEAVE_BAND_BORDER[lr.type],
                          )}
                          style={{
                            left: left + 2,
                            width: width - 4,
                            top: 12,
                            height: 30,
                          }}
                        >
                          <div className={cn("size-1.5 rounded-full", LEAVE_DOT[lr.type])} />
                        </div>
                      );
                    })}

                    {/* Simulation blocks */}
                    {empBlocks.map((block) => {
                      const color = SIM_COLORS[block.colorIdx % SIM_COLORS.length];
                      const left = blockLeft(block);
                      const width = Math.max(blockWidth(block), DAY_COL_WIDTH / 2);
                      const isDragging = dragState?.blockId === block.id;
                      const isSelected = selectedBlockId === block.id;

                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "absolute flex items-center rounded-lg border-2 border-dashed select-none",
                            color.bg,
                            color.border,
                            isDragging && "shadow-lg opacity-90 z-20",
                            isSelected && "ring-2 ring-primary/40 ring-offset-1 z-10",
                            block.status === "approved" && "border-solid",
                            block.status === "refused" && "opacity-40",
                          )}
                          style={{
                            left: left + 2,
                            width: width - 4,
                            top: 6,
                            height: 44,
                            zIndex: isDragging ? 20 : isSelected ? 10 : 5,
                            cursor: isDragging ? "grabbing" : "grab",
                          }}
                          onMouseUp={() => {
                            if (!didMoveRef.current) {
                              setSelectedBlockId(
                                block.id === selectedBlockId ? null : block.id,
                              );
                            }
                            didMoveRef.current = false;
                          }}
                        >
                          {/* Left resize handle */}
                          <div
                            className={cn(
                              "absolute left-0 inset-y-0 w-3 rounded-l-lg cursor-ew-resize flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity",
                              color.handle,
                            )}
                            onMouseDown={(e) => startDrag(e, block, "resize-left")}
                          >
                            <GripVertical className="size-2.5 text-white" />
                          </div>

                          {/* Body (drag to move) */}
                          <div
                            className="flex-1 flex items-center justify-center mx-3 overflow-hidden"
                            onMouseDown={(e) => startDrag(e, block, "move")}
                          >
                            {width > 55 && (
                              <span className={cn("text-[10px] font-semibold truncate", color.text)}>
                                {blockDurationLabel(block)}
                              </span>
                            )}
                          </div>

                          {/* Right resize handle */}
                          <div
                            className={cn(
                              "absolute right-0 inset-y-0 w-3 rounded-r-lg cursor-ew-resize flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity",
                              color.handle,
                            )}
                            onMouseDown={(e) => startDrag(e, block, "resize-right")}
                          >
                            <GripVertical className="size-2.5 text-white" />
                          </div>

                          {/* Status badge */}
                          {block.status !== "pending" && (
                            <div className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-sm">
                              {block.status === "approved" ? (
                                <CheckCircle2 className="size-3 text-emerald-500" />
                              ) : (
                                <X className="size-3 text-rose-500" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 px-6 py-4 border-t border-border/60">
            {(
              [
                { label: "Vacation", dot: "bg-blue-400" },
                { label: "Sick", dot: "bg-rose-400" },
                { label: "Conference", dot: "bg-indigo-500" },
              ] as const
            ).map(({ label, dot }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full", dot)} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded border-2 border-dashed border-amber-400 bg-amber-100" />
              <span className="text-[11px] text-muted-foreground">Simulation (drag to move/resize)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-muted/60" />
              <span className="text-[11px] text-muted-foreground">Weekend / Holiday</span>
            </div>
            {COMPANY_HOLIDAYS.length > 0 && (
              <span className="text-[10px] text-muted-foreground/60 ml-auto">
                Holidays: Apr {COMPANY_HOLIDAYS.join(", Apr ")} (configured in Settings)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Block detail sheet */}
      {selectedBlock && selectedEmployee && (
        <SimBlockSheet
          block={selectedBlock}
          employee={selectedEmployee}
          onClose={() => setSelectedBlockId(null)}
          onApprove={() => {
            updateBlockStatus(
              selectedBlock.id,
              selectedBlock.status === "approved" ? "pending" : "approved",
            );
          }}
          onRefuse={() => {
            updateBlockStatus(selectedBlock.id, "refused");
            setSelectedBlockId(null);
          }}
          onDelete={() => removeBlock(selectedBlock.id)}
        />
      )}
    </div>
  );
}

/* ─── Small components ──────────────────────────────────── */

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-card border border-border/60 p-5 gap-2.5 shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
          {title}
        </p>
        <button className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors">
          <PenSquare className="size-3.5" />
        </button>
      </div>
      <p className="text-[32px] font-bold tracking-tight text-foreground leading-none">
        {value}
      </p>
    </div>
  );
}

function CriticalityBadge({ value }: { value: Criticality }) {
  const cls: Record<Criticality, string> = {
    High: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm",
    Medium: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm",
    Low: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
        cls[value],
      )}
    >
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: TodayStatus }) {
  const cls: Record<TodayStatus, string> = {
    "Has Leave": "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm",
    Available: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm",
    Remote: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
        cls[value],
      )}
    >
      {value}
    </span>
  );
}

function DeptBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground/70">
      {value}
    </span>
  );
}

/* ─── Employee Modal ────────────────────────────────────── */

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
}

function EmployeeModal({ open, onClose, employee }: EmployeeModalProps) {
  if (!open) return null;
  const isEdit = !!employee;

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
          <Field label="Full Name">
            <input
              type="text"
              defaultValue={employee?.name}
              placeholder="e.g. John Doe"
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              defaultValue={employee?.email}
              placeholder="e.g. john@company.com"
            />
          </Field>
          <Field label="Department">
            <select defaultValue={employee?.department ?? ""}>
              <option value="" disabled>Select a department</option>
              {["Management", "Engineering", "Design", "Data", "Security", "DevOps"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Role / Position">
            <input type="text" placeholder="e.g. Senior Developer" />
          </Field>
          <Field label="Start Date">
            <input type="date" />
          </Field>
          <Field label="Criticality Level">
            <select defaultValue={employee?.criticality ?? ""}>
              <option value="" disabled>Select criticality</option>
              {["High", "Medium", "Low"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement;
}) {
  const inputCls =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-foreground/70">{label}</label>
      {children.type === "select" ? (
        <select
          className={cn(inputCls, "appearance-none cursor-pointer")}
          {...(children.props as object)}
        >
          {(children.props as { children: React.ReactNode }).children}
        </select>
      ) : (
        <input className={inputCls} {...(children.props as object)} />
      )}
    </div>
  );
}

/* ─── Employee List ─────────────────────────────────────── */

function EmployeeList({
  employees,
  onView,
}: {
  employees: Employee[];
  onView: (emp: Employee) => void;
}) {
  const cols = [
    "Employee",
    "Department",
    "Skills",
    "Projects",
    "Criticality",
    "Bus Factor",
    "Today's Status",
    "Actions",
  ];

  return (
    <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border/60">
        <h3 className="font-semibold text-foreground text-sm">All Employees</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            {cols.map((col) => (
              <th
                key={col}
                className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-muted/20 transition-colors group">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-semibold text-white shadow-md",
                      emp.color,
                    )}
                  >
                    {emp.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-[14px]">{emp.name}</p>
                    <p className="text-[12px] text-muted-foreground">{emp.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <DeptBadge value={emp.department} />
              </td>
              <td className="px-5 py-4">
                <span className="font-semibold text-foreground text-[14px]">{emp.skills}</span>
                <span className="ml-1 text-muted-foreground text-[11px]">skills</span>
              </td>
              <td className="px-5 py-4">
                <span className="font-semibold text-foreground text-[14px]">{emp.projects}</span>
                <span className="ml-1 text-muted-foreground text-[11px]">projects</span>
              </td>
              <td className="px-5 py-4">
                <CriticalityBadge value={emp.criticality} />
              </td>
              <td className="px-5 py-4">
                <span className="font-semibold text-foreground text-[14px]">{emp.busFactor}</span>
              </td>
              <td className="px-5 py-4">
                <StatusBadge value={emp.todayStatus} />
              </td>
              <td className="px-5 py-4">
                <Button
                  size="sm"
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-[12px] font-medium shadow-sm shadow-primary/10 btn-press"
                  onClick={() => onView(emp)}
                >
                  <Eye className="size-3.5" />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Employees Page ────────────────────────────────────── */

export default function Employees() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const editEmployee = undefined;

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
    if (searchParams.get("tab") === "calendar") {
      setActiveTab("calendar");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  const totalEmployee = EMPLOYEES.length;
  const criticalStaff = EMPLOYEES.filter((e) => e.criticality === "High").length;
  const onLeave = EMPLOYEES.filter((e) => e.todayStatus === "Has Leave").length;
  const avgSkills = (
    EMPLOYEES.reduce((s, e) => s + e.skills, 0) / EMPLOYEES.length
  ).toFixed(1);

  function openView(emp: Employee) {
    navigate(`/employees/${emp.id}`);
  }

  return (
    <>
      <div className="space-y-5 page-enter">
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={String(totalEmployee).padStart(2, "0")} />
          <StatCard title="Critical Staff" value={String(criticalStaff).padStart(2, "0")} />
          <StatCard title="On Leave" value={String(onLeave).padStart(2, "0")} />
          <StatCard title="Avg. Skills/Person" value={avgSkills} />
        </div>

        <div className="flex items-center gap-2">
          {(["list", "calendar"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-card border border-border/60 text-foreground hover:bg-muted/50",
              )}
            >
              {tab === "list" ? "Employee list" : "Leave Calendar"}
            </button>
          ))}
        </div>

        {activeTab === "list" ? (
          <>
            <div className="relative w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employee ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-card pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <EmployeeList employees={filtered} onView={openView} />
          </>
        ) : (
          <LeaveCalendar employees={EMPLOYEES} />
        )}
      </div>

      <EmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editEmployee}
      />
    </>
  );
}
