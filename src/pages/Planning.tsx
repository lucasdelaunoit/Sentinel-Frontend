import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Plus,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  Trash2,
  Users,
  CalendarCheck,
  Zap,
  Play,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EMPLOYEE_DETAILS, EMPLOYEES_LIST } from "@/data/employees";
import type { EmployeeDetail } from "@/data/employees";
import { PROJECTS } from "@/data/projects";
import { useCalendarSettings } from "@/hooks/useCalendarSettings";
import StatCard from "@/components/common/cards/StatCard";

/* ─── Types ───────────────────────────────────────────────── */

type Mode = "view" | "simulate";
type LeaveType = "vacation" | "sick" | "conference";
type ImpactLevel = "critical" | "warning" | "safe";
type DragMode = "move" | "resize-left" | "resize-right";

interface SimBlock {
  id: string;
  employeeId: string;
  startDate: string;
  startHalf: 0 | 1;
  endDate: string;
  endHalf: 0 | 1;
  colorIdx: number;
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

interface DrawState {
  employeeId: string;
  anchorDay: number;
  anchorHalf: 0 | 1;
  currentDay: number;
  currentHalf: 0 | 1;
  containerLeft: number;
}

interface ViewLeave {
  start: number;
  end: number;
  type: LeaveType;
}

interface BlockDisplayRange {
  startDay: number;
  endDay: number;
  startHalf: 0 | 1;
  endHalf: 0 | 1;
  clippedStart: boolean;
  clippedEnd: boolean;
}

interface ProjectImpact {
  id: string;
  name: string;
  level: ImpactLevel;
  uncovered: string[];
  siloed: string[];
  safe: string[];
}

/* ─── Constants ───────────────────────────────────────────── */

const DAY_COL_WIDTH = 44;
const ROW_HEIGHT = 56;
const NAME_COL_WIDTH = 192;
const CAPACITY_ROW_HEIGHT = 36;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

/* ─── Calendar helpers ────────────────────────────────────── */

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function makeDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateStr(dateStr: string): { year: number; month: number; day: number } | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: parseInt(m[1], 10), month: parseInt(m[2], 10), day: parseInt(m[3], 10) };
}

function getDayOfWeekForDay(day: number, firstDayOfWeek: number): number {
  return (firstDayOfWeek + day - 1) % 7;
}

function getDayLabel(day: number, firstDayOfWeek: number): string {
  return DAY_NAMES[getDayOfWeekForDay(day, firstDayOfWeek)].slice(0, 2);
}

function toHalves(day: number, half: 0 | 1): number {
  return (day - 1) * 2 + half;
}

function fromHalves(h: number, daysInMonth: number): { day: number; half: 0 | 1 } {
  const c = Math.max(0, Math.min(daysInMonth * 2 - 1, h));
  return { day: Math.floor(c / 2) + 1, half: (c % 2) as 0 | 1 };
}

function toX(day: number, half: 0 | 1 = 0): number {
  return (day - 1) * DAY_COL_WIDTH + half * (DAY_COL_WIDTH / 2);
}

function formatHalfDate(dateStr: string, half: 0 | 1): string {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return `${dateStr} ${half === 0 ? "AM" : "PM"}`;
  const monthAbbr = MONTH_NAMES[parsed.month - 1].slice(0, 3);
  return `${monthAbbr} ${parsed.day} ${half === 0 ? "AM" : "PM"}`;
}

function blockDurationLabel(b: SimBlock): string {
  const days =
    Math.round(
      (new Date(b.endDate + "T12:00:00").getTime() - new Date(b.startDate + "T12:00:00").getTime()) / 86400000,
    ) + 1;
  const halves = days * 2 - b.startHalf - (1 - b.endHalf);
  if (halves === 1) return "½ day";
  if (halves === 2) return "1 day";
  return `${halves / 2} days`;
}

function getBlockDisplayRange(block: SimBlock, viewYear: number, viewMonth: number): BlockDisplayRange | null {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const viewStart = makeDateStr(viewYear, viewMonth, 1);
  const viewEnd = makeDateStr(viewYear, viewMonth, daysInMonth);

  if (block.endDate < viewStart || block.startDate > viewEnd) return null;

  const clippedStart = block.startDate < viewStart;
  const clippedEnd = block.endDate > viewEnd;

  let startDay: number;
  let startHalf: 0 | 1;
  if (clippedStart) {
    startDay = 1;
    startHalf = 0;
  } else {
    const parsed = parseDateStr(block.startDate);
    startDay = parsed ? parsed.day : 1;
    startHalf = block.startHalf;
  }

  let endDay: number;
  let endHalf: 0 | 1;
  if (clippedEnd) {
    endDay = daysInMonth;
    endHalf = 1;
  } else {
    const parsed = parseDateStr(block.endDate);
    endDay = parsed ? parsed.day : daysInMonth;
    endHalf = block.endHalf;
  }

  return { startDay, endDay, startHalf, endHalf, clippedStart, clippedEnd };
}

function drawDisplayRange(draw: DrawState): { startDay: number; startHalf: 0 | 1; endDay: number; endHalf: 0 | 1 } {
  const anchorH = toHalves(draw.anchorDay, draw.anchorHalf);
  const currH = toHalves(draw.currentDay, draw.currentHalf);
  if (anchorH <= currH) {
    return { startDay: draw.anchorDay, startHalf: draw.anchorHalf, endDay: draw.currentDay, endHalf: draw.currentHalf };
  }
  return { startDay: draw.currentDay, startHalf: draw.currentHalf, endDay: draw.anchorDay, endHalf: draw.anchorHalf };
}

/* ─── Leave data helpers ──────────────────────────────────── */

function getViewLeaves(empId: string, viewYear: number, viewMonth: number): ViewLeave[] {
  const emp = EMPLOYEE_DETAILS[empId];
  if (!emp) return [];
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const viewStart = makeDateStr(viewYear, viewMonth, 1);
  const viewEnd = makeDateStr(viewYear, viewMonth, daysInMonth);

  return emp.leaves
    .filter((l) => l.status === "approved" && l.endDate >= viewStart && l.startDate <= viewEnd)
    .map((l) => {
      const startParsed = parseDateStr(l.startDate);
      const endParsed = parseDateStr(l.endDate);
      const start = l.startDate < viewStart ? 1 : (startParsed?.day ?? 1);
      const end = l.endDate > viewEnd ? daysInMonth : (endParsed?.day ?? daysInMonth);
      return { start, end, type: l.type as LeaveType };
    });
}

function isOnRealLeave(empId: string, day: number, viewYear: number, viewMonth: number): boolean {
  return getViewLeaves(empId, viewYear, viewMonth).some((l) => day >= l.start && day <= l.end);
}

function hasLeaveOverlap(
  empId: string,
  startDay: number,
  endDay: number,
  viewYear: number,
  viewMonth: number,
): boolean {
  return getViewLeaves(empId, viewYear, viewMonth).some((l) => l.start <= endDay && l.end >= startDay);
}

function clampDrawEnd(
  empId: string,
  anchorDay: number,
  anchorHalf: 0 | 1,
  targetDay: number,
  targetHalf: 0 | 1,
  viewYear: number,
  viewMonth: number,
  daysInMonth: number,
): { day: number; half: 0 | 1 } {
  const leaves = getViewLeaves(empId, viewYear, viewMonth);
  const anchorH = toHalves(anchorDay, anchorHalf);
  const targetH = toHalves(targetDay, targetHalf);
  if (anchorH <= targetH) {
    const blocking = leaves
      .filter((l) => l.start <= targetDay && l.end >= anchorDay)
      .sort((a, b) => a.start - b.start)[0];
    if (!blocking) return { day: targetDay, half: targetHalf };
    return fromHalves(Math.max(anchorH, toHalves(blocking.start, 0) - 1), daysInMonth);
  } else {
    const blocking = leaves.filter((l) => l.start <= anchorDay && l.end >= targetDay).sort((a, b) => b.end - a.end)[0];
    if (!blocking) return { day: targetDay, half: targetHalf };
    return fromHalves(Math.min(anchorH, toHalves(blocking.end, 1) + 1), daysInMonth);
  }
}

function isOnSimLeave(empId: string, day: number, blocks: SimBlock[], viewYear: number, viewMonth: number): boolean {
  return blocks.some((b) => {
    if (b.employeeId !== empId) return false;
    const range = getBlockDisplayRange(b, viewYear, viewMonth);
    if (!range) return false;
    return day >= range.startDay && day <= range.endDay;
  });
}

/* ─── Simulation engine ───────────────────────────────────── */

function skillMatch(required: string, empSkill: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const r = norm(required),
    e = norm(empSkill);
  return r === e || r.includes(e) || e.includes(r);
}

function runCombinedSimulation(blocks: SimBlock[]): { projects: ProjectImpact[]; overallLevel: ImpactLevel } {
  if (blocks.length === 0) return { projects: [], overallLevel: "safe" };
  const absentIds = new Set(blocks.map((b) => b.employeeId));
  const projectMap = new Map<string, ProjectImpact>();

  for (const empId of absentIds) {
    const emp = EMPLOYEE_DETAILS[empId];
    if (!emp) continue;
    for (const pr of emp.projects) {
      if (projectMap.has(pr.id)) continue;
      const project = PROJECTS.find((p) => p.id === pr.id);
      if (!project) continue;
      const activeTeam = project.team
        .filter((m) => !absentIds.has(m.id))
        .map((m) => EMPLOYEE_DETAILS[m.id])
        .filter(Boolean);
      const uncovered: string[] = [],
        siloed: string[] = [],
        safe: string[] = [];
      for (const skill of project.skills) {
        const n = activeTeam.filter((m) => m.skills.some((s) => skillMatch(skill, s.name) && s.level >= 2)).length;
        if (n === 0) uncovered.push(skill);
        else if (n === 1) siloed.push(skill);
        else safe.push(skill);
      }
      const level: ImpactLevel = uncovered.length > 0 ? "critical" : siloed.length > 0 ? "warning" : "safe";
      projectMap.set(pr.id, { id: pr.id, name: project.name, level, uncovered, siloed, safe });
    }
  }

  const projects = Array.from(projectMap.values());
  const overallLevel: ImpactLevel = projects.some((p) => p.level === "critical")
    ? "critical"
    : projects.some((p) => p.level === "warning")
      ? "warning"
      : "safe";
  return { projects, overallLevel };
}

function getEmployeeImpactLevel(empId: string, blocks: SimBlock[]): ImpactLevel | null {
  const empBlocks = blocks.filter((b) => b.employeeId === empId);
  if (empBlocks.length === 0) return null;
  const { overallLevel } = runCombinedSimulation(empBlocks);
  return overallLevel;
}

/* ─── SimBlock Detail Sheet ───────────────────────────────── */

function SimBlockSheet({
  block,
  employee,
  onClose,
  onDelete,
}: {
  block: SimBlock;
  employee: EmployeeDetail;
  onClose: () => void;
  onDelete: () => void;
}) {
  const color = SIM_COLORS[block.colorIdx % SIM_COLORS.length];
  const { projects, overallLevel } = useMemo(() => runCombinedSimulation([block]), [block]);

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
      <div className="relative z-10 flex h-full w-[440px] flex-col bg-card shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
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
              <p className="text-[12px] text-muted-foreground">{employee.department} · Absence simulation</p>
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
          <div className={cn("rounded-xl border-2 border-dashed p-4 space-y-2.5", color.border, color.bg)}>
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", color.text)}>Simulated Absence Period</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              <span className="text-muted-foreground">From</span>
              <span className={cn("font-semibold text-right", color.text)}>
                {formatHalfDate(block.startDate, block.startHalf)}
              </span>
              <span className="text-muted-foreground">To</span>
              <span className={cn("font-semibold text-right", color.text)}>
                {formatHalfDate(block.endDate, block.endHalf)}
              </span>
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground text-right">{blockDurationLabel(block)}</span>
            </div>
          </div>

          <div className={cn("flex items-start gap-3 rounded-xl border p-3.5", lm.cls)}>
            <lm.Icon className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold">{lm.label}</p>
              <p className="text-[11px] opacity-75">{lm.sub}</p>
            </div>
          </div>

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
        </div>

        <div className="shrink-0 px-7 py-5 border-t border-border/60">
          <Button
            variant="ghost"
            onClick={onDelete}
            className="w-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9 text-[12px] gap-1.5"
          >
            <Trash2 className="size-3.5" /> Remove simulation block
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── AddBlock Sheet ──────────────────────────────────────── */

function AddBlockSheet({
  viewYear,
  viewMonth,
  onClose,
  onAdd,
}: {
  viewYear: number;
  viewMonth: number;
  onClose: () => void;
  onAdd: (empId: string, startDate: string, startHalf: 0 | 1, endDate: string, endHalf: 0 | 1) => void;
}) {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  function nextWorkingDay(from: number): number {
    const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
    let d = from;
    while (d <= daysInMonth) {
      const dow = getDayOfWeekForDay(d, firstDayOfWeek);
      if (dow !== 0 && dow !== 6) return d;
      d++;
    }
    return from;
  }

  const defaultStart = nextWorkingDay(Math.min(new Date().getDate() + 1, daysInMonth));
  const defaultEnd = Math.min(defaultStart + 4, daysInMonth);

  const [selectedEmpId, setSelectedEmpId] = useState(EMPLOYEES_LIST[0]?.id ?? "");
  const [startDate, setStartDate] = useState(makeDateStr(viewYear, viewMonth, defaultStart));
  const [startHalf, setStartHalf] = useState<0 | 1>(0);
  const [endDate, setEndDate] = useState(makeDateStr(viewYear, viewMonth, defaultEnd));
  const [endHalf, setEndHalf] = useState<0 | 1>(1);

  const isValid = endDate >= startDate;

  const durationLabel = useMemo(() => {
    if (!isValid) return "Invalid range";
    const days =
      Math.round((new Date(endDate + "T12:00:00").getTime() - new Date(startDate + "T12:00:00").getTime()) / 86400000) +
      1;
    const halves = days * 2 - startHalf - (1 - endHalf);
    if (halves <= 0) return "Invalid range";
    if (halves === 1) return "½ day";
    if (halves === 2) return "1 day";
    return `${halves / 2} days`;
  }, [startDate, startHalf, endDate, endHalf, isValid]);

  function handleAdd() {
    if (!isValid) return;
    onAdd(selectedEmpId, startDate, startHalf, endDate, endHalf);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-[400px] flex-col bg-card shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="h-[3px] w-full shrink-0 bg-amber-400" />
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <h2 className="text-[16px] font-bold text-foreground">Add Absence</h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Employee</label>
            <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40 max-h-48 overflow-y-auto">
              {EMPLOYEES_LIST.map((emp) => (
                <button
                  key={emp.id}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
                    selectedEmpId === emp.id ? "bg-amber-50 border-l-2 border-amber-400" : "hover:bg-muted/40",
                  )}
                  onClick={() => setSelectedEmpId(emp.id)}
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
                    <p className="text-[12px] font-medium text-foreground truncate">{emp.name}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                  </div>
                  {selectedEmpId === emp.id && <div className="size-1.5 rounded-full bg-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <div className="flex rounded-xl border border-border/60 overflow-hidden">
                <button
                  onClick={() => setStartHalf(0)}
                  className={cn(
                    "flex-1 py-1.5 text-[11px] font-semibold transition-colors",
                    startHalf === 0 ? "bg-amber-400 text-white" : "bg-muted/20 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  AM
                </button>
                <button
                  onClick={() => setStartHalf(1)}
                  className={cn(
                    "flex-1 py-1.5 text-[11px] font-semibold transition-colors",
                    startHalf === 1 ? "bg-amber-400 text-white" : "bg-muted/20 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  PM
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <div className="flex rounded-xl border border-border/60 overflow-hidden">
                <button
                  onClick={() => setEndHalf(0)}
                  className={cn(
                    "flex-1 py-1.5 text-[11px] font-semibold transition-colors",
                    endHalf === 0 ? "bg-amber-400 text-white" : "bg-muted/20 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  AM
                </button>
                <button
                  onClick={() => setEndHalf(1)}
                  className={cn(
                    "flex-1 py-1.5 text-[11px] font-semibold transition-colors",
                    endHalf === 1 ? "bg-amber-400 text-white" : "bg-muted/20 text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border-2 border-dashed px-4 py-3 flex items-center justify-between",
              isValid ? "border-amber-300 bg-amber-50" : "border-rose-300 bg-rose-50",
            )}
          >
            <span className="text-[11px] text-muted-foreground">Duration</span>
            <span className={cn("text-[13px] font-bold", isValid ? "text-amber-800" : "text-rose-700")}>
              {durationLabel}
            </span>
          </div>

          {!isValid && <p className="text-[11px] text-rose-600">End date must be on or after start date.</p>}
        </div>

        <div className="shrink-0 px-7 py-5 border-t border-border/60 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-9 text-[12px]">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!isValid}
            className="flex-1 rounded-xl h-9 text-[12px] bg-amber-500 hover:bg-amber-600 text-white gap-1.5 disabled:opacity-50"
          >
            <Plus className="size-3.5" /> Add Block
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Context Panel ───────────────────────────────────────── */

function ContextPanel({
  mode,
  simBlocks,
  viewYear,
  viewMonth,
  onOpenAddSheet,
  onSelectBlock,
  onRemoveBlock,
  onClearAll,
  combinedResult,
}: {
  mode: Mode;
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  onOpenAddSheet: () => void;
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onClearAll: () => void;
  combinedResult: { projects: ProjectImpact[]; overallLevel: ImpactLevel };
}) {
  const TODAY = new Date(2026, 4, 6);
  const todayInView = TODAY.getFullYear() === viewYear && TODAY.getMonth() + 1 === viewMonth;
  const todayDay = todayInView ? TODAY.getDate() : null;

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
  const projectDot: Record<ImpactLevel, string> = {
    critical: "bg-rose-400",
    warning: "bg-amber-400",
    safe: "bg-emerald-400",
  };

  if (mode === "view") {
    const totalEmps = EMPLOYEES_LIST.length;
    let availableToday: number | null = null;
    let onLeaveToday: number | null = null;

    if (todayDay !== null) {
      onLeaveToday = EMPLOYEES_LIST.filter((e) => isOnRealLeave(e.id, todayDay, viewYear, viewMonth)).length;
      availableToday = totalEmps - onLeaveToday;
    }

    const monthAbbr = MONTH_NAMES[viewMonth - 1].slice(0, 3);

    const upcomingLeaves = EMPLOYEES_LIST.flatMap((emp) =>
      getViewLeaves(emp.id, viewYear, viewMonth)
        .filter((l) => todayDay === null || l.start >= todayDay)
        .map((l) => ({ emp, leave: l })),
    )
      .sort((a, b) => a.leave.start - b.leave.start)
      .slice(0, 6);

    const leaveTypeMeta: Record<LeaveType, { label: string; dot: string }> = {
      vacation: { label: "Vacation", dot: "bg-blue-400" },
      sick: { label: "Sick leave", dot: "bg-rose-400" },
      conference: { label: "Conference", dot: "bg-indigo-500" },
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {todayDay !== null ? `Today — ${monthAbbr} ${todayDay}` : `${MONTH_NAMES[viewMonth - 1]} ${viewYear}`}
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-[13px] text-foreground">Available</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {availableToday !== null ? availableToday : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-rose-400" />
                <span className="text-[13px] text-foreground">On Leave</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {onLeaveToday !== null ? onLeaveToday : "—"}
              </span>
            </div>
            {availableToday !== null && (
              <>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${(availableToday / totalEmps) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {Math.round((availableToday / totalEmps) * 100)}% team available
                </p>
              </>
            )}
          </div>
        </div>

        {upcomingLeaves.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Upcoming Leaves</p>
            </div>
            <div className="divide-y divide-border/40">
              {upcomingLeaves.map(({ emp, leave }, i) => {
                const meta = leaveTypeMeta[leave.type];
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm",
                        emp.color,
                      )}
                    >
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{emp.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {monthAbbr} {leave.start}–{leave.end}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("size-1.5 rounded-full", meta.dot)} />
                      <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Legend</p>
          <div className="space-y-2">
            {(
              [
                ["bg-blue-400", "Vacation"],
                ["bg-rose-400", "Sick Leave"],
                ["bg-indigo-500", "Conference"],
              ] as const
            ).map(([dot, label]) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cn("size-2 rounded-full", dot)} />
                <span className="text-[12px] text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="size-3 rounded bg-muted/60" />
              <span className="text-[12px] text-muted-foreground">Weekend / Holiday</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-600" />
            <p className="text-[13px] font-bold text-amber-900">Scenario</p>
            {simBlocks.length > 0 && (
              <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                {simBlocks.length}
              </span>
            )}
          </div>
          {simBlocks.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-amber-700/60 hover:text-rose-600 transition-colors font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="px-5 py-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 rounded-xl h-8 px-3 text-[12px] font-semibold border-amber-300 text-amber-700 hover:bg-amber-100 bg-amber-50"
            onClick={onOpenAddSheet}
          >
            <Plus className="size-3.5" />
            Add absence
          </Button>
        </div>

        {simBlocks.length > 0 && (
          <div className="border-t border-amber-200/60 divide-y divide-amber-200/40">
            {simBlocks.map((block) => {
              const emp = EMPLOYEE_DETAILS[block.employeeId];
              const color = SIM_COLORS[block.colorIdx % SIM_COLORS.length];
              const impact = getEmployeeImpactLevel(block.employeeId, [block]);
              return (
                <div key={block.id} className="flex items-center gap-2.5 px-4 py-2.5 group">
                  <button
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                    onClick={() => onSelectBlock(block.id)}
                  >
                    <div className={cn("size-2 rounded-full shrink-0", color.dot)} />
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white",
                        emp?.color ?? "bg-muted",
                      )}
                    >
                      {emp?.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{emp?.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatHalfDate(block.startDate, block.startHalf)} –{" "}
                        {formatHalfDate(block.endDate, block.endHalf)} · {blockDurationLabel(block)}
                      </p>
                    </div>
                  </button>
                  {impact && (
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0",
                        levelBadge[impact],
                      )}
                    >
                      {levelIcon[impact]}
                      <span className="capitalize">{impact}</span>
                    </div>
                  )}
                  <button
                    onClick={() => onRemoveBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-500 ml-1"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {simBlocks.length === 0 && (
          <div className="px-5 py-4 text-center">
            <p className="text-[12px] text-amber-700/60">No absences simulated yet.</p>
            <p className="text-[11px] text-amber-600/50 mt-0.5">Add employees above to begin.</p>
          </div>
        )}
      </div>

      {simBlocks.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20 flex items-center gap-2">
            <Play className="size-3.5 text-primary" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Combined Impact</p>
            {combinedResult.projects.length > 0 && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ml-auto",
                  levelBadge[combinedResult.overallLevel],
                )}
              >
                {levelIcon[combinedResult.overallLevel]}
                <span className="capitalize">{combinedResult.overallLevel}</span>
              </div>
            )}
          </div>

          {combinedResult.projects.length === 0 ? (
            <div className="px-5 py-4 text-center">
              <CheckCircle2 className="size-5 text-emerald-400 mx-auto mb-1.5" />
              <p className="text-[12px] text-emerald-700 font-medium">No project impact</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">All skills remain covered.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {combinedResult.projects.map((p) => (
                <div key={p.id} className="px-5 py-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full shrink-0", projectDot[p.level])} />
                    <span className="text-[12px] font-semibold text-foreground truncate">{p.name}</span>
                  </div>
                  {p.uncovered.length > 0 && (
                    <p className="text-[11px] text-rose-700 pl-4">
                      <span className="font-semibold">Uncovered: </span>
                      {p.uncovered.join(", ")}
                    </p>
                  )}
                  {p.siloed.length > 0 && (
                    <p className="text-[11px] text-amber-700 pl-4">
                      <span className="font-semibold">At risk: </span>
                      {p.siloed.join(", ")}
                    </p>
                  )}
                  {p.safe.length > 0 && (
                    <p className="text-[11px] text-emerald-700 pl-4">
                      <span className="font-semibold">Covered: </span>
                      {p.safe.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Capacity Strip ──────────────────────────────────────── */

function CapacityStrip({
  days,
  simBlocks,
  viewYear,
  viewMonth,
  isClosedDay,
}: {
  days: number[];
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  isClosedDay: (d: number) => boolean;
}) {
  const total = EMPLOYEES_LIST.length;

  function getAvailability(day: number): number {
    if (isClosedDay(day)) return -1;
    const absent = EMPLOYEES_LIST.filter(
      (e) => isOnRealLeave(e.id, day, viewYear, viewMonth) || isOnSimLeave(e.id, day, simBlocks, viewYear, viewMonth),
    ).length;
    return (total - absent) / total;
  }

  function capacityColor(ratio: number): string {
    if (ratio >= 0.9) return "bg-emerald-400";
    if (ratio >= 0.7) return "bg-emerald-300";
    if (ratio >= 0.5) return "bg-amber-300";
    if (ratio >= 0.3) return "bg-amber-400";
    return "bg-rose-400";
  }

  return (
    <div className="flex border-b border-border/40">
      <div
        className="shrink-0 sticky left-0 z-20 bg-muted/20 border-r border-border/40 flex items-center px-5"
        style={{ width: NAME_COL_WIDTH, height: CAPACITY_ROW_HEIGHT }}
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Capacity</span>
      </div>
      <div className="flex" style={{ width: days.length * DAY_COL_WIDTH }}>
        {days.map((d) => {
          const ratio = getAvailability(d);
          const closed = ratio === -1;
          return (
            <div
              key={d}
              className={cn(
                "border-r border-border/10 last:border-r-0 flex flex-col items-center justify-end pb-1 gap-1",
                closed && "bg-muted/40",
              )}
              style={{ width: DAY_COL_WIDTH, height: CAPACITY_ROW_HEIGHT }}
            >
              {!closed && (
                <>
                  <div
                    className={cn("rounded-sm w-[18px] transition-all", capacityColor(ratio))}
                    style={{ height: Math.max(3, Math.round(ratio * 18)) }}
                    title={`${Math.round(ratio * 100)}% available`}
                  />
                  <span className="text-[7px] font-medium text-muted-foreground/40">{Math.round(ratio * 100)}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Planning Gantt ──────────────────────────────────────── */

function PlanningGantt({
  mode,
  simBlocks,
  viewYear,
  viewMonth,
  setSimBlocks,
  selectedBlockId,
  setSelectedBlockId,
  onCreateBlock,
}: {
  mode: Mode;
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  setSimBlocks: React.Dispatch<React.SetStateAction<SimBlock[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  onCreateBlock: (empId: string, startDate: string, startHalf: 0 | 1, endDate: string, endHalf: 0 | 1) => void;
}) {
  const { settings } = useCalendarSettings();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const didMoveRef = useRef(false);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const drawStateRef = useRef<DrawState | null>(null);
  const onCreateBlockRef = useRef(onCreateBlock);
  useEffect(() => {
    onCreateBlockRef.current = onCreateBlock;
  }, [onCreateBlock]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalDaysWidth = daysInMonth * DAY_COL_WIDTH;

  const TODAY = new Date(2026, 4, 6);
  const todayInView = TODAY.getFullYear() === viewYear && TODAY.getMonth() + 1 === viewMonth;
  const todayDay = todayInView ? TODAY.getDate() : null;

  function isClosedDay(day: number): boolean {
    const dow = getDayOfWeekForDay(day, firstDayOfWeek);
    return !settings.workingDays.includes(dow) || settings.holidays.some((h) => h.day === day);
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragStateRef.current;
      if (drag) {
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
              const ns = Math.max(0, Math.min(daysInMonth * 2 - 1 - span, os + dH));
              const { day: sd, half: sh } = fromHalves(ns, daysInMonth);
              const { day: ed, half: eh } = fromHalves(ns + span, daysInMonth);
              if (hasLeaveOverlap(b.employeeId, sd, ed, viewYear, viewMonth)) return b;
              return {
                ...b,
                startDate: makeDateStr(viewYear, viewMonth, sd),
                startHalf: sh,
                endDate: makeDateStr(viewYear, viewMonth, ed),
                endHalf: eh,
              };
            }
            if (drag.mode === "resize-left") {
              const oe = toHalves(drag.origEndDay, drag.origEndHalf);
              const ns = Math.max(0, Math.min(oe - 1, toHalves(drag.origStartDay, drag.origStartHalf) + dH));
              const { day: sd, half: sh } = fromHalves(ns, daysInMonth);
              if (hasLeaveOverlap(b.employeeId, sd, drag.origEndDay, viewYear, viewMonth)) return b;
              return { ...b, startDate: makeDateStr(viewYear, viewMonth, sd), startHalf: sh };
            }
            const os = toHalves(drag.origStartDay, drag.origStartHalf);
            const ne = Math.max(
              os + 1,
              Math.min(daysInMonth * 2 - 1, toHalves(drag.origEndDay, drag.origEndHalf) + dH),
            );
            const { day: ed, half: eh } = fromHalves(ne, daysInMonth);
            if (hasLeaveOverlap(b.employeeId, drag.origStartDay, ed, viewYear, viewMonth)) return b;
            return { ...b, endDate: makeDateStr(viewYear, viewMonth, ed), endHalf: eh };
          }),
        );
        return;
      }

      const draw = drawStateRef.current;
      if (draw) {
        const relX = Math.max(0, e.clientX - draw.containerLeft);
        const halfIdx = Math.max(0, Math.min(daysInMonth * 2 - 1, Math.floor(relX / (DAY_COL_WIDTH / 2))));
        const { day, half } = fromHalves(halfIdx, daysInMonth);
        const clamped = clampDrawEnd(
          draw.employeeId,
          draw.anchorDay,
          draw.anchorHalf,
          day,
          half,
          viewYear,
          viewMonth,
          daysInMonth,
        );
        const updated = { ...draw, currentDay: clamped.day, currentHalf: clamped.half };
        drawStateRef.current = updated;
        setDrawState(updated);
      }
    };

    const onUp = () => {
      const draw = drawStateRef.current;
      if (draw) {
        const { startDay, startHalf, endDay, endHalf } = drawDisplayRange(draw);
        onCreateBlockRef.current(
          draw.employeeId,
          makeDateStr(viewYear, viewMonth, startDay),
          startHalf,
          makeDateStr(viewYear, viewMonth, endDay),
          endHalf,
        );
        drawStateRef.current = null;
        setDrawState(null);
      }
      dragStateRef.current = null;
      setDragState(null);
      didMoveRef.current = false;
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [setSimBlocks, viewYear, viewMonth, daysInMonth]);

  function startDrag(e: React.MouseEvent, block: SimBlock, dragMode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    didMoveRef.current = false;
    const range = getBlockDisplayRange(block, viewYear, viewMonth);
    if (!range) return;
    const drag: DragState = {
      blockId: block.id,
      mode: dragMode,
      startMouseX: e.clientX,
      origStartDay: range.startDay,
      origStartHalf: range.startHalf,
      origEndDay: range.endDay,
      origEndHalf: range.endHalf,
    };
    dragStateRef.current = drag;
    setDragState(drag);
  }

  function startDraw(e: React.MouseEvent<HTMLDivElement>, empId: string) {
    if (mode !== "simulate") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, e.clientX - rect.left);
    const halfIdx = Math.max(0, Math.min(daysInMonth * 2 - 1, Math.floor(relX / (DAY_COL_WIDTH / 2))));
    const { day, half } = fromHalves(halfIdx, daysInMonth);
    if (isOnRealLeave(empId, day, viewYear, viewMonth)) return;
    const draw: DrawState = {
      employeeId: empId,
      anchorDay: day,
      anchorHalf: half,
      currentDay: day,
      currentHalf: half,
      containerLeft: rect.left,
    };
    drawStateRef.current = draw;
    setDrawState(draw);
  }

  return (
    <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
      <div
        className="overflow-x-auto select-none"
        style={{ cursor: dragState ? "grabbing" : drawState ? "crosshair" : "default" }}
      >
        <div style={{ minWidth: NAME_COL_WIDTH + totalDaysWidth }}>
          <div className="flex border-b border-border/60 bg-muted/20">
            <div
              className="shrink-0 sticky left-0 z-20 bg-muted/20 border-r border-border/40 flex items-end px-5 pb-2 pt-3"
              style={{ width: NAME_COL_WIDTH }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Employee</span>
            </div>
            <div className="flex" style={{ width: totalDaysWidth }}>
              {days.map((d) => {
                const closed = isClosedDay(d);
                const isHoliday = settings.holidays.some((h) => h.day === d);
                const isToday = d === todayDay;
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
                      {getDayLabel(d, firstDayOfWeek)}
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

          <CapacityStrip
            days={days}
            simBlocks={simBlocks}
            viewYear={viewYear}
            viewMonth={viewMonth}
            isClosedDay={isClosedDay}
          />

          {EMPLOYEES_LIST.map((emp) => {
            const viewLeaves = getViewLeaves(emp.id, viewYear, viewMonth);
            const empBlocks = simBlocks.filter((b) => b.employeeId === emp.id);
            const empBlocksInView = empBlocks
              .map((b) => ({ block: b, range: getBlockDisplayRange(b, viewYear, viewMonth) }))
              .filter((x) => x.range !== null) as { block: SimBlock; range: BlockDisplayRange }[];
            const impactLevel = mode === "simulate" ? getEmployeeImpactLevel(emp.id, simBlocks) : null;

            return (
              <div
                key={emp.id}
                className="flex border-b border-border/40 hover:bg-muted/10 transition-colors group last:border-b-0"
                style={{ minHeight: ROW_HEIGHT }}
              >
                <div
                  className="shrink-0 sticky left-0 z-10 bg-card group-hover:bg-muted/10 transition-colors border-r border-border/40 flex items-center px-5 gap-2.5"
                  style={{ width: NAME_COL_WIDTH }}
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm",
                      emp.color,
                    )}
                  >
                    {emp.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-[13px] whitespace-nowrap truncate">{emp.name}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                  </div>
                  {impactLevel && impactLevel !== "safe" && (
                    <div
                      className={cn(
                        "flex shrink-0 size-5 items-center justify-center rounded-full",
                        impactLevel === "critical" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600",
                      )}
                    >
                      {impactLevel === "critical" ? (
                        <ShieldAlert className="size-3" />
                      ) : (
                        <AlertTriangle className="size-3" />
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  style={{
                    width: totalDaysWidth,
                    height: ROW_HEIGHT,
                    cursor: mode === "simulate" && !dragState && !drawState ? "crosshair" : undefined,
                  }}
                  onMouseDown={(e) => startDraw(e, emp.id)}
                >
                  {todayDay !== null && (
                    <div
                      className="absolute inset-y-0 pointer-events-none bg-primary/5"
                      style={{ left: toX(todayDay), width: DAY_COL_WIDTH }}
                    />
                  )}

                  {days.map((d) =>
                    isClosedDay(d) ? (
                      <div
                        key={d}
                        className="absolute inset-y-0 bg-muted/30 pointer-events-none"
                        style={{ left: toX(d), width: DAY_COL_WIDTH }}
                      />
                    ) : null,
                  )}

                  {days.map((d) => (
                    <div
                      key={d}
                      className="absolute inset-y-0 border-r border-border/10 pointer-events-none"
                      style={{ left: toX(d) + DAY_COL_WIDTH - 1, width: 1 }}
                    />
                  ))}

                  {days.map((d) => (
                    <div
                      key={`h${d}`}
                      className="absolute inset-y-0 border-r border-dashed border-border/8 pointer-events-none"
                      style={{ left: toX(d) + DAY_COL_WIDTH / 2 - 1, width: 1 }}
                    />
                  ))}

                  {viewLeaves.map((lr, i) => {
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
                        style={{ left: left + 2, width: width - 4, top: 10, height: 34 }}
                      >
                        <div className={cn("size-1.5 rounded-full", LEAVE_DOT[lr.type])} />
                      </div>
                    );
                  })}

                  {/* Draw preview */}
                  {drawState?.employeeId === emp.id &&
                    (() => {
                      const { startDay, startHalf, endDay, endHalf } = drawDisplayRange(drawState);
                      const left = toX(startDay, startHalf);
                      const right = toX(endDay, endHalf) + DAY_COL_WIDTH / 2;
                      const width = Math.max(right - left, DAY_COL_WIDTH / 2);
                      return (
                        <div
                          className="absolute rounded-xl border-2 border-dashed border-amber-400 bg-amber-100/50 pointer-events-none"
                          style={{ left: left + 2, width: width - 4, top: 6, height: 44, zIndex: 30 }}
                        />
                      );
                    })()}

                  {empBlocksInView.map(({ block, range }) => {
                    const color = SIM_COLORS[block.colorIdx % SIM_COLORS.length];
                    const left = toX(range.startDay, range.startHalf);
                    const right = toX(range.endDay, range.endHalf) + DAY_COL_WIDTH / 2;
                    const width = Math.max(right - left, DAY_COL_WIDTH / 2);
                    const isDragging = dragState?.blockId === block.id;
                    const isSelected = selectedBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        className={cn(
                          "absolute flex items-center rounded-xl border-2 border-dashed select-none transition-shadow duration-100",
                          color.bg,
                          color.border,
                          range.clippedStart && "rounded-l-none opacity-90",
                          range.clippedEnd && "rounded-r-none opacity-90",
                          isDragging && "shadow-xl opacity-95 z-20",
                          isSelected && `ring-2 ${color.ring} ring-offset-1 z-10 shadow-md`,
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
                          if (!didMoveRef.current) setSelectedBlockId(block.id === selectedBlockId ? null : block.id);
                          didMoveRef.current = false;
                        }}
                      >
                        {range.clippedStart ? (
                          <div
                            className={cn(
                              "absolute left-0 inset-y-0 w-5 flex items-center justify-center opacity-60",
                              color.text,
                            )}
                          >
                            <ArrowLeft className="size-3" />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "absolute left-0 inset-y-0 w-3.5 rounded-l-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",
                              color.handle,
                            )}
                            onMouseDown={(e) => startDrag(e, block, "resize-left")}
                          >
                            <GripVertical className="size-2.5 text-white" />
                          </div>
                        )}
                        <div
                          className="flex-1 flex items-center justify-center mx-3.5 overflow-hidden"
                          onMouseDown={(e) => startDrag(e, block, "move")}
                        >
                          {width > 50 && (
                            <span className={cn("text-[11px] font-bold truncate", color.text)}>
                              {blockDurationLabel(block)}
                            </span>
                          )}
                        </div>
                        {range.clippedEnd ? (
                          <div
                            className={cn(
                              "absolute right-0 inset-y-0 w-5 flex items-center justify-center opacity-60",
                              color.text,
                            )}
                          >
                            <ArrowRight className="size-3" />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "absolute right-0 inset-y-0 w-3.5 rounded-r-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",
                              color.handle,
                            )}
                            onMouseDown={(e) => startDrag(e, block, "resize-right")}
                          >
                            <GripVertical className="size-2.5 text-white" />
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

        <div className="flex flex-wrap items-center gap-5 px-5 py-3.5 border-t border-border/60 bg-muted/10">
          {(
            [
              ["bg-blue-400", "Vacation"],
              ["bg-rose-400", "Sick leave"],
              ["bg-indigo-500", "Conference"],
            ] as const
          ).map(([dot, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn("size-2 rounded-full", dot)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
          {mode === "simulate" && (
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded border-2 border-dashed border-amber-400 bg-amber-100" />
              <span className="text-[11px] text-muted-foreground">Simulation block · drag to adjust</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded bg-muted/60" />
            <span className="text-[11px] text-muted-foreground">Weekend / Holiday</span>
          </div>
          {todayDay !== null && (
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-primary/10 border border-primary/20" />
              <span className="text-[11px] text-muted-foreground">Today</span>
            </div>
          )}
          {settings.holidays.length > 0 && (
            <span className="text-[10px] text-muted-foreground/50 ml-auto">
              {settings.holidays
                .map((h) => `${MONTH_NAMES[viewMonth - 1].slice(0, 3)} ${h.day} (${h.label})`)
                .join(" · ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Planning Page ───────────────────────────────────────── */

export default function Planning() {
  const [mode, setMode] = useState<Mode>("view");
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(4);
  const [simBlocks, setSimBlocks] = useState<SimBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const colorCounterRef = useRef(0);
  const { settings } = useCalendarSettings();

  const daysInViewMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  function isClosedDay(day: number): boolean {
    const dow = getDayOfWeekForDay(day, firstDayOfWeek);
    return !settings.workingDays.includes(dow) || settings.holidays.some((h) => h.day === day);
  }

  function navigateMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 12) {
      m = 1;
      y++;
    }
    if (m < 1) {
      m = 12;
      y--;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function addBlock(empId: string, startDate: string, startHalf: 0 | 1, endDate: string, endHalf: 0 | 1) {
    const colorIdx = colorCounterRef.current++ % SIM_COLORS.length;
    setSimBlocks((prev) => [
      ...prev,
      {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        employeeId: empId,
        startDate,
        startHalf,
        endDate,
        endHalf,
        colorIdx,
      },
    ]);
  }

  function addBlockQuick(empId: string) {
    const colorIdx = colorCounterRef.current++ % SIM_COLORS.length;
    let startDay = Math.min(new Date().getDate() + 1, daysInViewMonth);
    while (startDay <= daysInViewMonth && isClosedDay(startDay)) startDay++;
    if (startDay > daysInViewMonth) startDay = 1;
    let endDay = Math.min(startDay + 4, daysInViewMonth);
    while (endDay > startDay && isClosedDay(endDay)) endDay--;
    setSimBlocks((prev) => [
      ...prev,
      {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        employeeId: empId,
        startDate: makeDateStr(viewYear, viewMonth, startDay),
        startHalf: 0,
        endDate: makeDateStr(viewYear, viewMonth, endDay),
        endHalf: 1,
        colorIdx,
      },
    ]);
  }

  function removeBlock(id: string) {
    setSimBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function clearAll() {
    setSimBlocks([]);
    setSelectedBlockId(null);
  }

  const combinedResult = useMemo(() => runCombinedSimulation(simBlocks), [simBlocks]);

  const selectedBlock = simBlocks.find((b) => b.id === selectedBlockId);
  const selectedEmployee = selectedBlock ? EMPLOYEE_DETAILS[selectedBlock.employeeId] : undefined;

  const TODAY = new Date(2026, 4, 6);
  const todayInView = TODAY.getFullYear() === viewYear && TODAY.getMonth() + 1 === viewMonth;
  const todayDay = todayInView ? TODAY.getDate() : null;

  const totalEmps = EMPLOYEES_LIST.length;
  const availableToday =
    todayDay !== null ? EMPLOYEES_LIST.filter((e) => !isOnRealLeave(e.id, todayDay, viewYear, viewMonth)).length : null;
  const onLeaveToday = availableToday !== null ? totalEmps - availableToday : null;

  const workingDaysLeft = (() => {
    const allDays = Array.from({ length: daysInViewMonth }, (_, i) => i + 1);
    if (todayDay !== null) {
      return allDays.filter((d) => d > todayDay && !isClosedDay(d)).length;
    }
    return allDays.filter((d) => !isClosedDay(d)).length;
  })();

  const atRiskProjects = mode === "simulate" ? combinedResult.projects.filter((p) => p.level !== "safe").length : 0;

  return (
    <>
      <TopBar
        title="Team Planning"
        actions={
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => setMode(mode === "view" ? "simulate" : "view")}
              className={cn(
                "gap-1.5 rounded-xl h-8 px-3.5 text-[12px] font-semibold transition-all",
                mode === "simulate"
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                  : "bg-muted/50 hover:bg-muted text-foreground border border-border/60",
              )}
            >
              <Zap className={cn("size-3.5", mode === "simulate" && "text-white")} />
              {mode === "simulate" ? "Exit Simulation" : "Start Simulation"}
              {mode === "simulate" && simBlocks.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold">
                  {simBlocks.length}
                </span>
              )}
            </Button>

            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                className="flex size-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-[13px] font-semibold text-foreground min-w-[104px] text-center">
                {MONTH_NAMES[viewMonth - 1]} {viewYear}
              </span>
              <button
                className="flex size-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Available Today"
            value={availableToday !== null ? String(availableToday).padStart(2, "0") : "—"}
            icon={Users}
            isLoading={false}
            comment={null}
          />
          <StatCard
            title="On Leave Today"
            value={onLeaveToday !== null ? String(onLeaveToday).padStart(2, "0") : "—"}
            icon={CalendarCheck}
            isLoading={false}
            comment={null}
          />
          <StatCard
            title="Working Days Left"
            value={String(workingDaysLeft).padStart(2, "0")}
            icon={Activity}
            isLoading={false}
            comment={null}
          />
          <StatCard
            title="Projects at Risk"
            value={mode === "simulate" && simBlocks.length > 0 ? String(atRiskProjects).padStart(2, "0") : "—"}
            icon={ShieldAlert}
            isLoading={false}
            comment={null}
          />
        </div>

        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            <PlanningGantt
              mode={mode}
              simBlocks={simBlocks}
              viewYear={viewYear}
              viewMonth={viewMonth}
              setSimBlocks={setSimBlocks}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
              onCreateBlock={addBlock}
            />
          </div>

          <div className="w-[272px] shrink-0">
            <ContextPanel
              mode={mode}
              simBlocks={simBlocks}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onOpenAddSheet={() => setShowAddSheet(true)}
              onSelectBlock={setSelectedBlockId}
              onRemoveBlock={removeBlock}
              onClearAll={clearAll}
              combinedResult={combinedResult}
            />
          </div>
        </div>
      </div>

      {selectedBlock && selectedEmployee && (
        <SimBlockSheet
          block={selectedBlock}
          employee={selectedEmployee}
          onClose={() => setSelectedBlockId(null)}
          onDelete={() => removeBlock(selectedBlock.id)}
        />
      )}

      {showAddSheet && (
        <AddBlockSheet
          viewYear={viewYear}
          viewMonth={viewMonth}
          onClose={() => setShowAddSheet(false)}
          onAdd={addBlock}
        />
      )}
    </>
  );
}
