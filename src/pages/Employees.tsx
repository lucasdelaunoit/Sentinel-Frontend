import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  PenSquare,
  X,
  Plus,
  Play,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  GripVertical,
  Zap,
  CalendarCheck,
  Users,
  Activity,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EMPLOYEE_DETAILS } from "@/data/employees";
import { PROJECTS } from "@/data/projects";
import { useCalendarSettings } from "@/hooks/useCalendarSettings";
// TODO: replace mock EMPLOYEES below with API data once leave/calendar endpoint exists
import TopBar from "@/components/layout/TopBar.tsx";
import { PlusIcon } from "@phosphor-icons/react";
import useGetEmployees from "@/api/employees/useGetEmployees";
import useGetTeamToday from "@/api/employees/useGetTeamToday";
import type { LaravelQueryParams } from "@/types/laravel";
import EmployeeAvatar from "@/components/specified/models/employees/avatars/EmployeeAvatar.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeStatusBadge from "@/components/specified/models/employees/badges/EmployeeStatusBadge.tsx";
import { getInitials } from "@/utils/formatters/persons.ts";

/* ─── Types ────────────────────────────────────────────────── */

type Criticality = "High" | "Medium" | "Low";
type LeaveType = "vacation" | "sick" | "conference";
type Tab = "list" | "calendar";
type ImpactLevel = "critical" | "warning" | "safe";
type DragMode = "move" | "resize-left" | "resize-right";

interface LeaveRange {
  start: number;
  end: number;
  type: LeaveType;
}

interface SimBlock {
  id: string;
  employeeId: string;
  startDay: number;
  startHalf: 0 | 1; // 0 = AM, 1 = PM
  endDay: number;
  endHalf: 0 | 1; // inclusive
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

type EmpSortKey = "name" | "email" | "title";
type SortDir = "asc" | "desc";

const PER_PAGE_OPTIONS = [10, 15, 25, 50] as const;

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

const DAY_COL_WIDTH = 46;
const ROW_HEIGHT = 58;
const NAME_COL_WIDTH = 196;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_IN_APRIL = 30;
const APRIL_FIRST_DAY = 3; // April 1 2026 is Wednesday
const TODAY_DAY = 23; // April 23, 2026

const SIM_COLORS = [
  {
    bg: "bg-amber-100",
    border: "border-amber-400",
    text: "text-amber-800",
    handle: "bg-amber-400",
    dot: "bg-amber-400",
    ring: "ring-amber-300",
  },
  {
    bg: "bg-violet-100",
    border: "border-violet-400",
    text: "text-violet-800",
    handle: "bg-violet-400",
    dot: "bg-violet-400",
    ring: "ring-violet-300",
  },
  {
    bg: "bg-teal-100",
    border: "border-teal-400",
    text: "text-teal-800",
    handle: "bg-teal-400",
    dot: "bg-teal-400",
    ring: "ring-teal-300",
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-400",
    text: "text-orange-800",
    handle: "bg-orange-400",
    dot: "bg-orange-400",
    ring: "ring-orange-300",
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-400",
    text: "text-pink-800",
    handle: "bg-pink-400",
    dot: "bg-pink-400",
    ring: "ring-pink-300",
  },
  {
    bg: "bg-sky-100",
    border: "border-sky-400",
    text: "text-sky-800",
    handle: "bg-sky-400",
    dot: "bg-sky-400",
    ring: "ring-sky-300",
  },
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

function getDayLabel(day: number): string {
  return DAY_NAMES[getDayOfWeek(day)].slice(0, 2);
}

function toHalves(day: number, half: 0 | 1): number {
  return (day - 1) * 2 + half;
}

function fromHalves(h: number): { day: number; half: 0 | 1 } {
  const c = Math.max(0, Math.min(DAYS_IN_APRIL * 2 - 1, h));
  return { day: Math.floor(c / 2) + 1, half: (c % 2) as 0 | 1 };
}

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
  const d = halves / 2;
  return `${d} days`;
}

/* ─── Simulation engine ─────────────────────────────────── */

function skillMatch(required: string, empSkill: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const r = norm(required),
    e = norm(empSkill);
  return r === e || r.includes(e) || e.includes(r);
}

function runBlockSimulation(block: SimBlock): { projects: ProjectImpact[]; overallLevel: ImpactLevel } {
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
    const uncovered: string[] = [],
      siloed: string[] = [],
      safe: string[] = [];
    for (const skill of project.skills) {
      if (!emp.skills.some((s) => skillMatch(skill, s.name) && s.level >= 2)) continue;
      const n = teammates.filter((m) => m.skills.some((s) => skillMatch(skill, s.name) && s.level >= 2)).length;
      if (n === 0) uncovered.push(skill);
      else if (n === 1) siloed.push(skill);
      else safe.push(skill);
    }
    const level: ImpactLevel = uncovered.length > 0 ? "critical" : siloed.length > 0 ? "warning" : "safe";
    impacts.push({ id: project.id, name: project.name, level, uncovered, siloed, safe });
  }
  const overallLevel: ImpactLevel = impacts.some((p) => p.level === "critical")
    ? "critical"
    : impacts.some((p) => p.level === "warning")
      ? "warning"
      : "safe";
  return { projects: impacts, overallLevel };
}

/* ─── SimBlock Detail Sheet ─────────────────────────────── */

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
      sub: "All required skills are covered",
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
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-[460px] flex-col bg-card shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        <div className={cn("h-[3px] w-full shrink-0", color.handle)} />

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
              <h2 className="text-[16px] font-bold text-foreground leading-tight">{employee.name}</h2>
              <p className="text-[12px] text-muted-foreground">{employee.department} · Simulation</p>
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
          {/* Period card */}
          <div className={cn("rounded-xl border-2 border-dashed p-4 space-y-2.5", color.border, color.bg)}>
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", color.text)}>Simulation Period</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              <span className="text-muted-foreground">From</span>
              <span className={cn("font-semibold text-right", color.text)}>
                {formatHalfDate(block.startDay, block.startHalf)}
              </span>
              <span className="text-muted-foreground">To</span>
              <span className={cn("font-semibold text-right", color.text)}>
                {formatHalfDate(block.endDay, block.endHalf)}
              </span>
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground text-right">{blockDurationLabel(block)}</span>
            </div>
          </div>

          {/* Impact banner */}
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Project Impact ({projects.length})
              </p>
              {projects.map((p) => (
                <div key={p.id} className={cn("rounded-xl border p-3.5 space-y-2", projectCard[p.level])}>
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full shrink-0", projectDot[p.level])} />
                    <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                  </div>
                  {p.uncovered.length > 0 && (
                    <p className="text-[11px] text-rose-700">
                      <span className="font-semibold">Uncovered: </span>
                      {p.uncovered.join(", ")}
                    </p>
                  )}
                  {p.siloed.length > 0 && (
                    <p className="text-[11px] text-amber-700">
                      <span className="font-semibold">At risk: </span>
                      {p.siloed.join(", ")}
                    </p>
                  )}
                  {p.safe.length > 0 && (
                    <p className="text-[11px] text-emerald-700">
                      <span className="font-semibold">Covered: </span>
                      {p.safe.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

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

        <div className="shrink-0 px-7 py-5 border-t border-border/60 space-y-2">
          {block.status === "pending" && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onApprove}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-[13px] font-semibold shadow-sm gap-1.5"
              >
                <CheckCircle2 className="size-4" /> Approve
              </Button>
              <Button
                onClick={onRefuse}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10 text-[13px] font-semibold shadow-sm gap-1.5"
              >
                <X className="size-4" /> Refuse
              </Button>
            </div>
          )}
          {block.status !== "pending" && (
            <Button onClick={onApprove} variant="outline" className="w-full rounded-xl h-10 text-[13px] font-medium">
              Reset to Pending
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onDelete}
            className="w-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9 text-[12px] gap-1.5"
          >
            <Trash2 className="size-3.5" /> Remove simulation
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

  const levelBadge: Record<ImpactLevel, string> = {
    critical: "bg-rose-100 text-rose-700 border-rose-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    safe: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const levelIcon = {
    critical: <ShieldAlert className="size-3.5" />,
    warning: <AlertTriangle className="size-3.5" />,
    safe: <CheckCircle2 className="size-3.5" />,
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Play className="size-3.5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Simulation Results</h3>
          <div className="flex items-center gap-1.5">
            {criticalCount > 0 && (
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                {warningCount} warning
              </span>
            )}
            {safeCount > 0 && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
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
          const atRisk = projects.filter((p) => p.level !== "safe").length;
          return (
            <button
              key={block.id}
              className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-muted/20 transition-colors text-left"
              onClick={() => onSelectBlock(block.id)}
            >
              <div className={cn("size-3 rounded-full shrink-0", color.dot)} />
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white",
                  employee?.color ?? "bg-muted",
                )}
              >
                {employee?.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{employee?.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatHalfDate(block.startDay, block.startHalf)} → {formatHalfDate(block.endDay, block.endHalf)} ·{" "}
                  {blockDurationLabel(block)}
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                  levelBadge[overallLevel],
                )}
              >
                {levelIcon[overallLevel]}
                <span className="capitalize">{overallLevel}</span>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {block.status === "approved" && <span className="text-emerald-600 font-semibold">Approved</span>}
                {block.status === "refused" && <span className="text-rose-600 font-semibold">Refused</span>}
                {block.status === "pending" && (
                  <span>
                    {atRisk} project{atRisk !== 1 ? "s" : ""} at risk
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Leave Calendar ────────────────────────────────────── */

function LeaveCalendar({ employees }: { employees: Employee[] }) {
  const { settings } = useCalendarSettings();
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

  // Derive closed days from shared settings
  function isClosedDay(day: number): boolean {
    const dow = getDayOfWeek(day);
    const isNonWorking = !settings.workingDays.includes(dow);
    const isHoliday = settings.holidays.some((h) => h.day === day);
    return isNonWorking || isHoliday;
  }

  // Document-level drag handlers (never re-registered)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;
      const deltaX = e.clientX - drag.startMouseX;
      if (Math.abs(deltaX) > 4) didMoveRef.current = true;
      if (!didMoveRef.current) return;
      const dH = Math.round(deltaX / (DAY_COL_WIDTH / 2));
      setSimBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== drag.blockId) return b;
          if (drag.mode === "move") {
            const os = toHalves(drag.origStartDay, drag.origStartHalf);
            const oe = toHalves(drag.origEndDay, drag.origEndHalf);
            const span = oe - os;
            const ns = Math.max(0, Math.min(DAYS_IN_APRIL * 2 - 1 - span, os + dH));
            const { day: sd, half: sh } = fromHalves(ns);
            const { day: ed, half: eh } = fromHalves(ns + span);
            return { ...b, startDay: sd, startHalf: sh, endDay: ed, endHalf: eh };
          }
          if (drag.mode === "resize-left") {
            const oe = toHalves(drag.origEndDay, drag.origEndHalf);
            const ns = Math.max(0, Math.min(oe - 1, toHalves(drag.origStartDay, drag.origStartHalf) + dH));
            const { day: sd, half: sh } = fromHalves(ns);
            return { ...b, startDay: sd, startHalf: sh };
          }
          const os = toHalves(drag.origStartDay, drag.origStartHalf);
          const ne = Math.max(
            os + 1,
            Math.min(DAYS_IN_APRIL * 2 - 1, toHalves(drag.origEndDay, drag.origEndHalf) + dH),
          );
          const { day: ed, half: eh } = fromHalves(ne);
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
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setShowAddMenu(false);
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
    const colorIdx = colorCounterRef.current++ % SIM_COLORS.length;
    let startDay = 7;
    while (startDay <= DAYS_IN_APRIL && isClosedDay(startDay)) startDay++;
    let endDay = Math.min(startDay + 4, DAYS_IN_APRIL);
    while (endDay > startDay && isClosedDay(endDay)) endDay--;
    setSimBlocks((prev) => [
      ...prev,
      {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
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
  const selectedEmployee = selectedBlock ? employees.find((e) => e.id === selectedBlock.employeeId) : undefined;

  const pendingCount = simBlocks.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Results panel */}
      {simResultsVisible && simBlocks.length > 0 && (
        <SimResultsPanel
          simBlocks={simBlocks}
          employees={employees}
          onClose={() => setSimResultsVisible(false)}
          onSelectBlock={(id) => setSelectedBlockId(id)}
        />
      )}

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        {/* ── Toolbar ── */}
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm whitespace-nowrap">April 2026 — Leave Calendar</h3>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
              {employees.length} employees
            </span>
            {simBlocks.length > 0 && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                {simBlocks.length} sim · {pendingCount} pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Add simulation period */}
            <div className="relative" ref={addMenuRef}>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl h-8 px-3 text-[12px] font-semibold border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 bg-amber-50/50"
                onClick={() => setShowAddMenu((v) => !v)}
              >
                <Plus className="size-3.5" />
                Add simulation period
                <ChevronDown className={cn("size-3 transition-transform duration-150", showAddMenu && "rotate-180")} />
              </Button>

              {showAddMenu && (
                <div className="absolute right-0 top-full mt-1.5 z-30 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden w-[240px]">
                  <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/30">
                    Select employee
                  </div>
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                      onClick={() => addSimBlock(emp.id)}
                    >
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm",
                          emp.color,
                        )}
                      >
                        {emp.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Run Simulation — glows when pending */}
            {simBlocks.length > 0 && (
              <Button
                size="sm"
                className={cn(
                  "gap-1.5 rounded-xl h-8 px-4 text-[12px] font-bold shadow-sm transition-all",
                  pendingCount > 0
                    ? "bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
                onClick={() => setSimResultsVisible(true)}
              >
                <Play className="size-3.5" />
                Run Simulation
                {pendingCount > 0 && (
                  <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* ── Scrollable grid ── */}
        <div className="overflow-x-auto select-none" style={{ cursor: dragState ? "grabbing" : "default" }}>
          <div style={{ minWidth: NAME_COL_WIDTH + totalDaysWidth }}>
            {/* Day header */}
            <div className="flex border-b border-border/60 bg-muted/20">
              <div
                className="shrink-0 sticky left-0 z-20 bg-muted/20 border-r border-border/40 flex items-end px-5 pb-2 pt-3"
                style={{ width: NAME_COL_WIDTH }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  Employee
                </span>
              </div>
              <div className="flex" style={{ width: totalDaysWidth }}>
                {days.map((d) => {
                  const closed = isClosedDay(d);
                  const isHoliday = settings.holidays.some((h) => h.day === d);
                  const isToday = d === TODAY_DAY;
                  return (
                    <div
                      key={d}
                      className={cn(
                        "flex flex-col items-center justify-end border-r border-border/20 last:border-r-0 pb-1.5 pt-2 relative",
                        closed && "bg-muted/40",
                      )}
                      style={{ width: DAY_COL_WIDTH }}
                      title={isHoliday ? settings.holidays.find((h) => h.day === d)?.label : undefined}
                    >
                      {isToday && <div className="absolute top-0 inset-x-0 h-0.5 bg-primary rounded-b" />}
                      <span
                        className={cn(
                          "text-[9px] font-medium leading-none",
                          closed
                            ? "text-muted-foreground/25"
                            : isToday
                              ? "text-primary font-bold"
                              : "text-muted-foreground/50",
                        )}
                      >
                        {getDayLabel(d)}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-bold leading-snug",
                          closed ? "text-muted-foreground/25" : isToday ? "text-primary" : "text-foreground/70",
                          isHoliday && "line-through",
                        )}
                      >
                        {d}
                      </span>
                      <div className="flex w-full px-px mt-0.5">
                        <div className="flex-1 text-center text-[7px] text-muted-foreground/20">am</div>
                        <div className="w-px self-stretch bg-border/20" />
                        <div className="flex-1 text-center text-[7px] text-muted-foreground/20">pm</div>
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
                  {/* Name — sticky */}
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
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-[13px] whitespace-nowrap truncate">
                          {emp.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                      </div>
                    </div>
                  </div>

                  {/* Days area */}
                  <div className="relative" style={{ width: totalDaysWidth, height: ROW_HEIGHT }}>
                    {/* Today column highlight */}
                    <div
                      className="absolute inset-y-0 pointer-events-none bg-primary/5"
                      style={{ left: toX(TODAY_DAY), width: DAY_COL_WIDTH }}
                    />

                    {/* Closed day overlays */}
                    {days.map((d) =>
                      isClosedDay(d) ? (
                        <div
                          key={d}
                          className="absolute inset-y-0 bg-muted/30 pointer-events-none"
                          style={{ left: toX(d), width: DAY_COL_WIDTH }}
                        />
                      ) : null,
                    )}

                    {/* Day separators */}
                    {days.map((d) => (
                      <div
                        key={d}
                        className="absolute inset-y-0 border-r border-border/10 pointer-events-none"
                        style={{ left: toX(d) + DAY_COL_WIDTH - 1, width: 1 }}
                      />
                    ))}

                    {/* Half-day separators */}
                    {days.map((d) => (
                      <div
                        key={`h${d}`}
                        className="absolute inset-y-0 border-r border-dashed border-border/8 pointer-events-none"
                        style={{ left: toX(d) + DAY_COL_WIDTH / 2 - 1, width: 1 }}
                      />
                    ))}

                    {/* Real leave bands */}
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
                          style={{ left: left + 2, width: width - 4, top: 12, height: 32 }}
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
                            "absolute flex items-center rounded-xl border-2 border-dashed select-none transition-shadow duration-100",
                            color.bg,
                            color.border,
                            isDragging && "shadow-xl opacity-95 z-20",
                            isSelected && `ring-2 ${color.ring} ring-offset-1 z-10 shadow-md`,
                            block.status === "approved" && "border-solid",
                            block.status === "refused" && "opacity-35 grayscale",
                          )}
                          style={{
                            left: left + 2,
                            width: width - 4,
                            top: 7,
                            height: 44,
                            zIndex: isDragging ? 20 : isSelected ? 10 : 5,
                            cursor: isDragging ? "grabbing" : "grab",
                          }}
                          onMouseUp={() => {
                            if (!didMoveRef.current) setSelectedBlockId(block.id === selectedBlockId ? null : block.id);
                            didMoveRef.current = false;
                          }}
                        >
                          {/* Left resize handle */}
                          <div
                            className={cn(
                              "absolute left-0 inset-y-0 w-3.5 rounded-l-xl cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity",
                              color.handle,
                            )}
                            onMouseDown={(e) => startDrag(e, block, "resize-left")}
                          >
                            <GripVertical className="size-2.5 text-white" />
                          </div>

                          {/* Body */}
                          <div
                            className="flex-1 flex items-center justify-center gap-1.5 mx-3.5 overflow-hidden"
                            onMouseDown={(e) => startDrag(e, block, "move")}
                          >
                            {width > 50 && (
                              <span className={cn("text-[11px] font-bold truncate", color.text)}>
                                {blockDurationLabel(block)}
                              </span>
                            )}
                          </div>

                          {/* Right resize handle */}
                          <div
                            className={cn(
                              "absolute right-0 inset-y-0 w-3.5 rounded-r-xl cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity",
                              color.handle,
                            )}
                            onMouseDown={(e) => startDrag(e, block, "resize-right")}
                          >
                            <GripVertical className="size-2.5 text-white" />
                          </div>

                          {/* Status dot */}
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
          <div className="flex flex-wrap items-center gap-5 px-5 py-3.5 border-t border-border/60 bg-muted/10">
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
              <span className="text-[11px] text-muted-foreground">Simulation · drag to move/resize</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-muted/60" />
              <span className="text-[11px] text-muted-foreground">Weekend / Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-primary/10 border border-primary/20" />
              <span className="text-[11px] text-muted-foreground">Today</span>
            </div>
            {settings.holidays.length > 0 && (
              <span className="text-[10px] text-muted-foreground/50 ml-auto">
                {settings.holidays.map((h) => `Apr ${h.day} (${h.label})`).join(" · ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sheet */}
      {selectedBlock && selectedEmployee && (
        <SimBlockSheet
          block={selectedBlock}
          employee={selectedEmployee}
          onClose={() => setSelectedBlockId(null)}
          onApprove={() =>
            updateBlockStatus(selectedBlock.id, selectedBlock.status === "approved" ? "pending" : "approved")
          }
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

/* ─── Employee Modal ────────────────────────────────────── */

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
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

/* ─── Employee List ─────────────────────────────────────── */

function EmpSortTh({
  label,
  col,
  sort,
  onSort,
}: {
  label: string;
  col: EmpSortKey;
  sort: { key: EmpSortKey; dir: SortDir };
  onSort: (k: EmpSortKey) => void;
}) {
  const active = sort.key === col;
  return (
    <TableHead
      onClick={() => onSort(col)}
      className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 cursor-pointer select-none hover:text-foreground transition-colors"
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )
        ) : (
          <ChevronsUpDown className="size-3 opacity-40" />
        )}
      </span>
    </TableHead>
  );
}

function EmployeeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: EmpSortKey; dir: SortDir }>({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [remoteFilter, setRemoteFilter] = useState<boolean | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, remoteFilter, perPage]);

  function toggleSort(key: EmpSortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    setPage(1);
  }

  const params: LaravelQueryParams = {
    page,
    per_page: perPage,
    search: search || undefined,
    sorts: [{ field: sort.key, direction: sort.dir }],
    filters: remoteFilter !== null ? [{ field: "is_remote", value: remoteFilter }] : undefined,
    includes: ["department", "skills"],
  };

  const { data, isLoading, isError } = useGetEmployees(params);
  const employees = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;

  const pageNumbers = (() => {
    const count = Math.min(5, lastPage);
    let start = Math.max(1, page - 2);
    if (start + count - 1 > lastPage) start = Math.max(1, lastPage - count + 1);
    return Array.from({ length: count }, (_, i) => start + i);
  })();

  const toolbarAction = (
    <>
      {!isLoading && (
        <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
          {total}
        </span>
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-1">
        {([null, false, true] as (boolean | null)[]).map((val) => (
          <button
            key={String(val)}
            onClick={() => setRemoteFilter(val)}
            className={cn(
              "px-3 py-1 rounded-lg text-[11px] font-medium transition-all duration-150",
              remoteFilter === val
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {val === null ? "All" : val ? "Remote" : "On-site"}
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
      {/* Table */}
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
            <EmpSortTh label="Employee" col="name" sort={sort} onSort={toggleSort} />
            <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Department
            </TableHead>
            <EmpSortTh label="Title" col="title" sort={sort} onSort={toggleSort} />
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
            employees.map((emp) => {
              <TableRow
                key={emp.id}
                className="hover:bg-muted/20 transition-colors group cursor-pointer border-border/40"
                onClick={() => navigate(`/employees/${emp.id}`)}
              >
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar initials={getInitials(emp.name)} variant={emp.status} size="lg" />
                    <div>
                      <p className="font-semibold text-foreground text-[14px]">{emp.name}</p>
                      <p className="text-[12px] text-muted-foreground">{emp.email}</p>
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
              </TableRow>;
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {!isLoading && !isError && total > 0 && (
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-muted/10 flex-wrap gap-3">
          <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border border-border/60 rounded-lg bg-card px-2 py-1 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>
              per page · {from}–{to} of {total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "h-8 min-w-8 px-2 rounded-lg text-[12px] font-medium transition-all",
                  page === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/60 bg-card text-foreground hover:bg-muted/50",
                )}
              >
                {p}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg"
              disabled={page >= lastPage}
              onClick={() => setPage(lastPage)}
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </ComposedCard>
  );
}

/* ─── Simulation CTA banner (list view) ─────────────────── */

function SimulationCTA({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 flex items-center gap-5 shadow-sm">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 border border-amber-200 shadow-sm">
        <Zap className="size-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-bold text-amber-900">Leave Simulation Studio</h4>
        <p className="text-[12px] text-amber-700/80 mt-0.5">
          Plan absences, drag & resize simulation blocks, analyse project risk with half-day precision.
        </p>
      </div>
      <Button
        onClick={onOpen}
        className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-5 text-[13px] font-bold shadow-sm gap-2"
      >
        <Play className="size-3.5" />
        Open Calendar
      </Button>
    </div>
  );
}

/* ─── Employees Page ────────────────────────────────────── */

export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("list");
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

  const { data: teamToday, isLoading: statsLoading } = useGetTeamToday();
  const totalEmployee = teamToday?.total != null ? String(teamToday.total).padStart(2, "0") : "—";
  const onLeave = teamToday
    ? String(teamToday.employees.filter((e) => e.today_status === "Has Leave").length).padStart(2, "0")
    : "—";

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
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={totalEmployee}
            icon={Users}
            isLoading={statsLoading}
            comment={null}
          />
          <StatCard title="Critical Staff" value="—" icon={ShieldAlert} isLoading={statsLoading} comment={null} />
          <StatCard title="On Leave" value={onLeave} icon={CalendarCheck} isLoading={statsLoading} comment={null} />
          <StatCard title="Avg. Skills/Person" value="—" icon={Activity} isLoading={statsLoading} comment={null} />
        </div>

        {/* Tab switcher */}
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
            <SimulationCTA onOpen={() => setActiveTab("calendar")} />
            <EmployeeList />
          </>
        ) : (
          <LeaveCalendar employees={EMPLOYEES} />
        )}
      </div>

      <EmployeeModal open={modalOpen} onClose={() => setModalOpen(false)} employee={editEmployee} />
    </>
  );
}
