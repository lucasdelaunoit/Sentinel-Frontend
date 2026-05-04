import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Plus,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  Trash2,
  ChevronDown,
  Users,
  CalendarCheck,
  Zap,
  Play,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import TopBar from "@/components/layout/TopBar";
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
  startDay: number;
  startHalf: 0 | 1;
  endDay: number;
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

interface AprilLeave {
  start: number;
  end: number;
  type: LeaveType;
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
const DAYS_IN_APRIL = 30;
const APRIL_FIRST_DAY = 3; // April 1, 2026 = Wednesday
const TODAY_DAY = 23; // April 23, 2026

const SIM_COLORS = [
  { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-800", handle: "bg-amber-400", dot: "bg-amber-400", ring: "ring-amber-300" },
  { bg: "bg-violet-100", border: "border-violet-400", text: "text-violet-800", handle: "bg-violet-400", dot: "bg-violet-400", ring: "ring-violet-300" },
  { bg: "bg-teal-100", border: "border-teal-400", text: "text-teal-800", handle: "bg-teal-400", dot: "bg-teal-400", ring: "ring-teal-300" },
  { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-800", handle: "bg-orange-400", dot: "bg-orange-400", ring: "ring-orange-300" },
  { bg: "bg-pink-100", border: "border-pink-400", text: "text-pink-800", handle: "bg-pink-400", dot: "bg-pink-400", ring: "ring-pink-300" },
  { bg: "bg-sky-100", border: "border-sky-400", text: "text-sky-800", handle: "bg-sky-400", dot: "bg-sky-400", ring: "ring-sky-300" },
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
  return `${halves / 2} days`;
}

/* ─── Leave data helpers ──────────────────────────────────── */

function parseAprilDay(dateStr: string): number | null {
  const m = dateStr.match(/^2026-04-(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

function getAprilLeaves(empId: string): AprilLeave[] {
  const emp = EMPLOYEE_DETAILS[empId];
  if (!emp) return [];
  return emp.leaves
    .filter((l) => l.status === "approved")
    .flatMap((l) => {
      const start = parseAprilDay(l.startDate);
      const end = parseAprilDay(l.endDate);
      if (start !== null && end !== null) return [{ start, end, type: l.type as LeaveType }];
      return [];
    });
}

function isOnRealLeave(empId: string, day: number): boolean {
  return getAprilLeaves(empId).some((l) => day >= l.start && day <= l.end);
}

function isOnSimLeave(empId: string, day: number, blocks: SimBlock[]): boolean {
  return blocks.some((b) => b.employeeId === empId && day >= b.startDay && day <= b.endDay);
}

/* ─── Simulation engine ───────────────────────────────────── */

function skillMatch(required: string, empSkill: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const r = norm(required), e = norm(empSkill);
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
      const uncovered: string[] = [], siloed: string[] = [], safe: string[] = [];
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
    critical: { label: "Critical Impact", sub: "Key skills will be uncovered", Icon: ShieldAlert, cls: "text-rose-700 bg-rose-50 border-rose-200" },
    warning: { label: "Moderate Impact", sub: "Some skills may be at risk", Icon: AlertTriangle, cls: "text-amber-700 bg-amber-50 border-amber-200" },
    safe: { label: "Safe to Approve", sub: "All required skills are covered", Icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  };
  const lm = levelMeta[overallLevel];
  const projectDot: Record<ImpactLevel, string> = { critical: "bg-rose-400", warning: "bg-amber-400", safe: "bg-emerald-400" };
  const projectCard: Record<ImpactLevel, string> = { critical: "border-rose-200 bg-rose-50/60", warning: "border-amber-200 bg-amber-50/60", safe: "border-emerald-200 bg-emerald-50/60" };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-[440px] flex-col bg-card shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        <div className={cn("h-[3px] w-full shrink-0", color.handle)} />
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-md", employee.color)}>
              {employee.initials}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-foreground leading-tight">{employee.name}</h2>
              <p className="text-[12px] text-muted-foreground">{employee.department} · Absence simulation</p>
            </div>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
          <div className={cn("rounded-xl border-2 border-dashed p-4 space-y-2.5", color.border, color.bg)}>
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", color.text)}>Simulated Absence Period</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              <span className="text-muted-foreground">From</span>
              <span className={cn("font-semibold text-right", color.text)}>{formatHalfDate(block.startDay, block.startHalf)}</span>
              <span className="text-muted-foreground">To</span>
              <span className={cn("font-semibold text-right", color.text)}>{formatHalfDate(block.endDay, block.endHalf)}</span>
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Project Impact ({projects.length})</p>
              {projects.map((p) => (
                <div key={p.id} className={cn("rounded-xl border p-3.5 space-y-2", projectCard[p.level])}>
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full shrink-0", projectDot[p.level])} />
                    <span className="text-[13px] font-semibold text-foreground">{p.name}</span>
                  </div>
                  {p.uncovered.length > 0 && (
                    <p className="text-[11px] text-rose-700"><span className="font-semibold">Uncovered: </span>{p.uncovered.join(", ")}</p>
                  )}
                  {p.siloed.length > 0 && (
                    <p className="text-[11px] text-amber-700"><span className="font-semibold">At risk: </span>{p.siloed.join(", ")}</p>
                  )}
                  {p.safe.length > 0 && (
                    <p className="text-[11px] text-emerald-700"><span className="font-semibold">Covered: </span>{p.safe.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 px-7 py-5 border-t border-border/60">
          <Button variant="ghost" onClick={onDelete} className="w-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9 text-[12px] gap-1.5">
            <Trash2 className="size-3.5" /> Remove simulation block
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
  onAddBlock,
  onSelectBlock,
  onRemoveBlock,
  onClearAll,
  combinedResult,
}: {
  mode: Mode;
  simBlocks: SimBlock[];
  onAddBlock: (empId: string) => void;
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onClearAll: () => void;
  combinedResult: { projects: ProjectImpact[]; overallLevel: ImpactLevel };
}) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!addMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [addMenuOpen]);

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
  const projectDot: Record<ImpactLevel, string> = { critical: "bg-rose-400", warning: "bg-amber-400", safe: "bg-emerald-400" };

  if (mode === "view") {
    const totalEmps = EMPLOYEES_LIST.length;
    const onLeaveToday = EMPLOYEES_LIST.filter((e) => isOnRealLeave(e.id, TODAY_DAY)).length;
    const availableToday = totalEmps - onLeaveToday;

    const upcomingLeaves = EMPLOYEES_LIST.flatMap((emp) =>
      getAprilLeaves(emp.id)
        .filter((l) => l.start >= TODAY_DAY)
        .map((l) => ({ emp, leave: l })),
    ).sort((a, b) => a.leave.start - b.leave.start).slice(0, 6);

    const leaveTypeMeta: Record<LeaveType, { label: string; dot: string }> = {
      vacation: { label: "Vacation", dot: "bg-blue-400" },
      sick: { label: "Sick leave", dot: "bg-rose-400" },
      conference: { label: "Conference", dot: "bg-indigo-500" },
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Today — Apr {TODAY_DAY}</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-[13px] text-foreground">Available</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">{availableToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-rose-400" />
                <span className="text-[13px] text-foreground">On Leave</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">{onLeaveToday}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(availableToday / totalEmps) * 100}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">{Math.round((availableToday / totalEmps) * 100)}% team available</p>
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
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm", emp.color)}>
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{emp.name}</p>
                      <p className="text-[11px] text-muted-foreground">Apr {leave.start}–{leave.end}</p>
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
            {([["bg-blue-400", "Vacation"], ["bg-rose-400", "Sick Leave"], ["bg-indigo-500", "Conference"]] as const).map(([dot, label]) => (
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

  // Simulate mode
  return (
    <div className="flex flex-col gap-4">
      {/* Header + add */}
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
            <button onClick={onClearAll} className="text-[11px] text-amber-700/60 hover:text-rose-600 transition-colors font-medium">
              Clear all
            </button>
          )}
        </div>

        <div className="px-5 py-3">
          <div className="relative" ref={addMenuRef}>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 rounded-xl h-8 px-3 text-[12px] font-semibold border-amber-300 text-amber-700 hover:bg-amber-100 bg-amber-50"
              onClick={() => setAddMenuOpen((v) => !v)}
            >
              <Plus className="size-3.5" />
              Add absence
              <ChevronDown className={cn("size-3 ml-auto transition-transform duration-150", addMenuOpen && "rotate-180")} />
            </Button>

            {addMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/30">
                  Select employee
                </div>
                {EMPLOYEES_LIST.map((emp) => (
                  <button
                    key={emp.id}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    onClick={() => { onAddBlock(emp.id); setAddMenuOpen(false); }}
                  >
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm", emp.color)}>
                      {emp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{emp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Block list */}
        {simBlocks.length > 0 && (
          <div className="border-t border-amber-200/60 divide-y divide-amber-200/40">
            {simBlocks.map((block) => {
              const emp = EMPLOYEE_DETAILS[block.employeeId];
              const color = SIM_COLORS[block.colorIdx % SIM_COLORS.length];
              const impact = getEmployeeImpactLevel(block.employeeId, [block]);
              return (
                <div key={block.id} className="flex items-center gap-2.5 px-4 py-2.5 group">
                  <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left" onClick={() => onSelectBlock(block.id)}>
                    <div className={cn("size-2 rounded-full shrink-0", color.dot)} />
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white", emp?.color ?? "bg-muted")}>
                      {emp?.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{emp?.name}</p>
                      <p className="text-[10px] text-muted-foreground">Apr {block.startDay}–{block.endDay} · {blockDurationLabel(block)}</p>
                    </div>
                  </button>
                  {impact && (
                    <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0", levelBadge[impact])}>
                      {levelIcon[impact]}
                      <span className="capitalize">{impact}</span>
                    </div>
                  )}
                  <button onClick={() => onRemoveBlock(block.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-500 ml-1">
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

      {/* Combined impact */}
      {simBlocks.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20 flex items-center gap-2">
            <Play className="size-3.5 text-primary" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Combined Impact</p>
            {combinedResult.projects.length > 0 && (
              <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ml-auto", levelBadge[combinedResult.overallLevel])}>
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
                    <p className="text-[11px] text-rose-700 pl-4"><span className="font-semibold">Uncovered: </span>{p.uncovered.join(", ")}</p>
                  )}
                  {p.siloed.length > 0 && (
                    <p className="text-[11px] text-amber-700 pl-4"><span className="font-semibold">At risk: </span>{p.siloed.join(", ")}</p>
                  )}
                  {p.safe.length > 0 && (
                    <p className="text-[11px] text-emerald-700 pl-4"><span className="font-semibold">Covered: </span>{p.safe.join(", ")}</p>
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
  isClosedDay,
}: {
  days: number[];
  simBlocks: SimBlock[];
  isClosedDay: (d: number) => boolean;
}) {
  const total = EMPLOYEES_LIST.length;

  function getAvailability(day: number): number {
    if (isClosedDay(day)) return -1; // closed
    const absent = EMPLOYEES_LIST.filter(
      (e) => isOnRealLeave(e.id, day) || isOnSimLeave(e.id, day, simBlocks),
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
              className={cn("border-r border-border/10 last:border-r-0 flex flex-col items-center justify-end pb-1 gap-1", closed && "bg-muted/40")}
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
  setSimBlocks,
  selectedBlockId,
  setSelectedBlockId,
}: {
  mode: Mode;
  simBlocks: SimBlock[];
  setSimBlocks: React.Dispatch<React.SetStateAction<SimBlock[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
}) {
  const { settings } = useCalendarSettings();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const didMoveRef = useRef(false);

  const days = Array.from({ length: DAYS_IN_APRIL }, (_, i) => i + 1);
  const totalDaysWidth = DAYS_IN_APRIL * DAY_COL_WIDTH;

  function isClosedDay(day: number): boolean {
    const dow = getDayOfWeek(day);
    return !settings.workingDays.includes(dow) || settings.holidays.some((h) => h.day === day);
  }

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
          const ne = Math.max(os + 1, Math.min(DAYS_IN_APRIL * 2 - 1, toHalves(drag.origEndDay, drag.origEndHalf) + dH));
          const { day: ed, half: eh } = fromHalves(ne);
          return { ...b, endDay: ed, endHalf: eh };
        }),
      );
    };
    const onUp = () => { dragStateRef.current = null; setDragState(null); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [setSimBlocks]);

  function startDrag(e: React.MouseEvent, block: SimBlock, dragMode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    didMoveRef.current = false;
    const drag: DragState = {
      blockId: block.id, mode: dragMode, startMouseX: e.clientX,
      origStartDay: block.startDay, origStartHalf: block.startHalf,
      origEndDay: block.endDay, origEndHalf: block.endHalf,
    };
    dragStateRef.current = drag;
    setDragState(drag);
  }

  return (
    <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
      {/* Scrollable grid */}
      <div className="overflow-x-auto select-none" style={{ cursor: dragState ? "grabbing" : "default" }}>
        <div style={{ minWidth: NAME_COL_WIDTH + totalDaysWidth }}>
          {/* Day header */}
          <div className="flex border-b border-border/60 bg-muted/20">
            <div className="shrink-0 sticky left-0 z-20 bg-muted/20 border-r border-border/40 flex items-end px-5 pb-2 pt-3" style={{ width: NAME_COL_WIDTH }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Employee</span>
            </div>
            <div className="flex" style={{ width: totalDaysWidth }}>
              {days.map((d) => {
                const closed = isClosedDay(d);
                const isHoliday = settings.holidays.some((h) => h.day === d);
                const isToday = d === TODAY_DAY;
                return (
                  <div
                    key={d}
                    className={cn("flex flex-col items-center justify-end border-r border-border/20 last:border-r-0 pb-1.5 pt-2 relative", closed && "bg-muted/40")}
                    style={{ width: DAY_COL_WIDTH }}
                    title={isHoliday ? settings.holidays.find((h) => h.day === d)?.label : undefined}
                  >
                    {isToday && <div className="absolute top-0 inset-x-0 h-0.5 bg-primary rounded-b" />}
                    <span className={cn("text-[9px] font-medium leading-none", closed ? "text-muted-foreground/25" : isToday ? "text-primary font-bold" : "text-muted-foreground/50")}>
                      {getDayLabel(d)}
                    </span>
                    <span className={cn("text-[11px] font-bold leading-snug", closed ? "text-muted-foreground/25" : isToday ? "text-primary" : "text-foreground/70", isHoliday && "line-through")}>
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

          {/* Capacity strip */}
          <CapacityStrip days={days} simBlocks={simBlocks} isClosedDay={isClosedDay} />

          {/* Employee rows */}
          {EMPLOYEES_LIST.map((emp) => {
            const aprilLeaves = getAprilLeaves(emp.id);
            const empBlocks = simBlocks.filter((b) => b.employeeId === emp.id);
            const impactLevel = mode === "simulate" ? getEmployeeImpactLevel(emp.id, simBlocks) : null;

            return (
              <div
                key={emp.id}
                className="flex border-b border-border/40 hover:bg-muted/10 transition-colors group last:border-b-0"
                style={{ minHeight: ROW_HEIGHT }}
              >
                {/* Name — sticky */}
                <div className="shrink-0 sticky left-0 z-10 bg-card group-hover:bg-muted/10 transition-colors border-r border-border/40 flex items-center px-5 gap-2.5" style={{ width: NAME_COL_WIDTH }}>
                  <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm", emp.color)}>
                    {emp.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-[13px] whitespace-nowrap truncate">{emp.name}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                  </div>
                  {impactLevel && impactLevel !== "safe" && (
                    <div className={cn(
                      "flex shrink-0 size-5 items-center justify-center rounded-full",
                      impactLevel === "critical" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600",
                    )}>
                      {impactLevel === "critical" ? <ShieldAlert className="size-3" /> : <AlertTriangle className="size-3" />}
                    </div>
                  )}
                </div>

                {/* Days area */}
                <div className="relative" style={{ width: totalDaysWidth, height: ROW_HEIGHT }}>
                  {/* Today highlight */}
                  <div className="absolute inset-y-0 pointer-events-none bg-primary/5" style={{ left: toX(TODAY_DAY), width: DAY_COL_WIDTH }} />

                  {/* Closed day overlays */}
                  {days.map((d) =>
                    isClosedDay(d) ? (
                      <div key={d} className="absolute inset-y-0 bg-muted/30 pointer-events-none" style={{ left: toX(d), width: DAY_COL_WIDTH }} />
                    ) : null,
                  )}

                  {/* Day separators */}
                  {days.map((d) => (
                    <div key={d} className="absolute inset-y-0 border-r border-border/10 pointer-events-none" style={{ left: toX(d) + DAY_COL_WIDTH - 1, width: 1 }} />
                  ))}

                  {/* Half-day separators */}
                  {days.map((d) => (
                    <div key={`h${d}`} className="absolute inset-y-0 border-r border-dashed border-border/8 pointer-events-none" style={{ left: toX(d) + DAY_COL_WIDTH / 2 - 1, width: 1 }} />
                  ))}

                  {/* Real leave bands */}
                  {aprilLeaves.map((lr, i) => {
                    const left = toX(lr.start);
                    const width = toX(lr.end + 1) - left;
                    return (
                      <div
                        key={i}
                        className={cn("absolute rounded-lg flex items-center justify-center border", LEAVE_BAND_BG[lr.type], LEAVE_BAND_BORDER[lr.type])}
                        style={{ left: left + 2, width: width - 4, top: 10, height: 34 }}
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
                          color.bg, color.border,
                          isDragging && "shadow-xl opacity-95 z-20",
                          isSelected && `ring-2 ${color.ring} ring-offset-1 z-10 shadow-md`,
                        )}
                        style={{ left: left + 2, width: width - 4, top: 6, height: 44, zIndex: isDragging ? 20 : isSelected ? 10 : 5, cursor: isDragging ? "grabbing" : "grab" }}
                        onMouseUp={() => {
                          if (!didMoveRef.current) setSelectedBlockId(block.id === selectedBlockId ? null : block.id);
                          didMoveRef.current = false;
                        }}
                      >
                        <div className={cn("absolute left-0 inset-y-0 w-3.5 rounded-l-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity", color.handle)} onMouseDown={(e) => startDrag(e, block, "resize-left")}>
                          <GripVertical className="size-2.5 text-white" />
                        </div>
                        <div className="flex-1 flex items-center justify-center mx-3.5 overflow-hidden" onMouseDown={(e) => startDrag(e, block, "move")}>
                          {width > 50 && <span className={cn("text-[11px] font-bold truncate", color.text)}>{blockDurationLabel(block)}</span>}
                        </div>
                        <div className={cn("absolute right-0 inset-y-0 w-3.5 rounded-r-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity", color.handle)} onMouseDown={(e) => startDrag(e, block, "resize-right")}>
                          <GripVertical className="size-2.5 text-white" />
                        </div>
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
          {([["bg-blue-400", "Vacation"], ["bg-rose-400", "Sick leave"], ["bg-indigo-500", "Conference"]] as const).map(([dot, label]) => (
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
  );
}

/* ─── Planning Page ───────────────────────────────────────── */

export default function Planning() {
  const [mode, setMode] = useState<Mode>("view");
  const [simBlocks, setSimBlocks] = useState<SimBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const colorCounterRef = useRef(0);
  const { settings } = useCalendarSettings();

  function isClosedDay(day: number): boolean {
    const dow = getDayOfWeek(day);
    return !settings.workingDays.includes(dow) || settings.holidays.some((h) => h.day === day);
  }

  function addBlock(empId: string) {
    const colorIdx = colorCounterRef.current++ % SIM_COLORS.length;
    let startDay = TODAY_DAY + 1;
    while (startDay <= DAYS_IN_APRIL && isClosedDay(startDay)) startDay++;
    if (startDay > DAYS_IN_APRIL) startDay = TODAY_DAY;
    let endDay = Math.min(startDay + 4, DAYS_IN_APRIL);
    while (endDay > startDay && isClosedDay(endDay)) endDay--;
    setSimBlocks((prev) => [
      ...prev,
      { id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, employeeId: empId, startDay, startHalf: 0, endDay, endHalf: 1, colorIdx },
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

  // Stats
  const totalEmps = EMPLOYEES_LIST.length;
  const availableToday = EMPLOYEES_LIST.filter((e) => !isOnRealLeave(e.id, TODAY_DAY)).length;
  const onLeaveToday = totalEmps - availableToday;
  const workingDaysLeft = Array.from({ length: DAYS_IN_APRIL }, (_, i) => i + 1)
    .filter((d) => d > TODAY_DAY && !isClosedDay(d)).length;
  const atRiskProjects = mode === "simulate" ? combinedResult.projects.filter((p) => p.level !== "safe").length : 0;

  return (
    <>
      <TopBar
        title="Team Planning"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
              <button
                onClick={() => setMode("view")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150",
                  mode === "view" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <CalendarCheck className="size-3.5" />
                View
              </button>
              <button
                onClick={() => setMode("simulate")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150",
                  mode === "simulate"
                    ? "bg-amber-500 shadow-sm text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Zap className="size-3.5" />
                Simulate
                {mode === "simulate" && simBlocks.length > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold">
                    {simBlocks.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <button className="flex size-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors">
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-[13px] font-semibold text-foreground min-w-[96px] text-center">April 2026</span>
              <button className="flex size-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Available Today" value={String(availableToday).padStart(2, "0")} icon={Users} isLoading={false} comment={null} />
          <StatCard title="On Leave Today" value={String(onLeaveToday).padStart(2, "0")} icon={CalendarCheck} isLoading={false} comment={null} />
          <StatCard title="Working Days Left" value={String(workingDaysLeft).padStart(2, "0")} icon={Activity} isLoading={false} comment={null} />
          <StatCard
            title="Projects at Risk"
            value={mode === "simulate" && simBlocks.length > 0 ? String(atRiskProjects).padStart(2, "0") : "—"}
            icon={ShieldAlert}
            isLoading={false}
            comment={null}
          />
        </div>

        {/* Main workspace */}
        <div className="flex gap-5 items-start">
          {/* Gantt */}
          <div className="flex-1 min-w-0">
            <PlanningGantt
              mode={mode}
              simBlocks={simBlocks}
              setSimBlocks={setSimBlocks}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
            />
          </div>

          {/* Context panel */}
          <div className="w-[272px] shrink-0">
            <ContextPanel
              mode={mode}
              simBlocks={simBlocks}
              onAddBlock={addBlock}
              onSelectBlock={setSelectedBlockId}
              onRemoveBlock={removeBlock}
              onClearAll={clearAll}
              combinedResult={combinedResult}
            />
          </div>
        </div>
      </div>

      {/* Block detail sheet */}
      {selectedBlock && selectedEmployee && (
        <SimBlockSheet
          block={selectedBlock}
          employee={selectedEmployee}
          onClose={() => setSelectedBlockId(null)}
          onDelete={() => removeBlock(selectedBlock.id)}
        />
      )}
    </>
  );
}
