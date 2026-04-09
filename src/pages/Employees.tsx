import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, PenSquare, X, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ─── Types ───────────────────────────────────────────────── */

type Criticality = "High" | "Medium" | "Low";
type TodayStatus = "Available" | "Has Leave" | "Remote";
type LeaveType = "vacation" | "sick" | "conference";
type Tab = "list" | "calendar";

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

/* ─── Calendar helpers ─────────────────────────────────────── */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_IN_APRIL = 30;
const APRIL_FIRST_DAY = 3;

function getDayName(dayOfMonth: number) {
  return DAY_NAMES[(APRIL_FIRST_DAY + dayOfMonth - 1) % 7];
}

const LEAVE_BAND_BG: Record<LeaveType, string> = {
  vacation: "bg-blue-50",
  sick: "bg-rose-50",
  conference: "bg-indigo-50",
};

const LEAVE_DOT: Record<LeaveType, string> = {
  vacation: "bg-blue-400",
  sick: "bg-rose-400",
  conference: "bg-indigo-500",
};

/* ─── Small components ─────────────────────────────────────── */

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
    Medium:
      "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm",
    Low: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm",
        cls[value],
      )}
    >
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: TodayStatus }) {
  const cls: Record<TodayStatus, string> = {
    "Has Leave":
      "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm",
    Available:
      "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm",
    Remote: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm",
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

/* ─── Employee Modal ───────────────────────────────────────── */

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
              <option value="" disabled>
                Select a department
              </option>
              {[
                "Management",
                "Engineering",
                "Design",
                "Data",
                "Security",
                "DevOps",
              ].map((d) => (
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
              <option value="" disabled>
                Select criticality
              </option>
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
      <label className="block text-[12px] font-medium text-foreground/70">
        {label}
      </label>
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

/* ─── Leave Calendar ───────────────────────────────────────── */

function LeaveCalendar({ employees }: { employees: Employee[] }) {
  const days = Array.from({ length: DAYS_IN_APRIL }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground text-sm">
            April 2026 — Leave Calendar
          </h3>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full uppercase tracking-wide">
            {employees.length} employees
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-card px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 border-b border-border/60 min-w-[180px]">
                Employee
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className="px-0 py-3 min-w-[36px] border-b border-border/60 text-center"
                >
                  <div className="text-[9px] text-muted-foreground/50 font-normal leading-none">
                    {getDayName(d)}
                  </div>
                  <div className="text-[11px] font-semibold text-foreground/70 leading-snug">
                    {d}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const leaveMap = new Map<number, LeaveRange>();
              emp.leaves.forEach((lr) => {
                for (let d = lr.start; d <= lr.end; d++) leaveMap.set(d, lr);
              });

              return (
                <tr key={emp.id} className="group">
                  <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/20 transition-colors px-6 py-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-semibold text-white shadow-sm",
                          emp.color,
                        )}
                      >
                        {emp.initials}
                      </div>
                      <span className="font-medium text-foreground text-[13px] whitespace-nowrap">
                        {emp.name}
                      </span>
                    </div>
                  </td>

                  {days.map((d) => {
                    const lr = leaveMap.get(d);
                    const isStart = lr?.start === d;
                    const isEnd = lr?.end === d;

                    return (
                      <td
                        key={d}
                        className="px-0 py-2.5 border-b border-border/40 group-hover:bg-muted/10 transition-colors"
                      >
                        {lr ? (
                          <div
                            className={cn(
                              "flex h-6 items-center justify-center",
                              LEAVE_BAND_BG[lr.type],
                              isStart && "rounded-l-lg ml-1",
                              isEnd && "rounded-r-lg mr-1",
                              !isStart && !isEnd && "w-full",
                            )}
                          >
                            <div
                              className={cn(
                                "size-1.5 rounded-full shadow-sm",
                                LEAVE_DOT[lr.type],
                              )}
                            />
                          </div>
                        ) : (
                          <div className="h-6" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center gap-6 px-6 py-4 border-t border-border/60">
          {(
            [
              { label: "Vacation", dot: "bg-blue-400" },
              { label: "Sick", dot: "bg-rose-400" },
              { label: "Conference", dot: "bg-indigo-500" },
            ] as const
          ).map(({ label, dot }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn("size-2 rounded-full shadow-sm", dot)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Employee List ────────────────────────────────────────── */

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
            <tr
              key={emp.id}
              className="hover:bg-muted/20 transition-colors group"
            >
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
                    <p className="font-semibold text-foreground text-[14px]">
                      {emp.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {emp.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <DeptBadge value={emp.department} />
              </td>
              <td className="px-5 py-4">
                <span className="font-semibold text-foreground text-[14px]">
                  {emp.skills}
                </span>
                <span className="ml-1 text-muted-foreground text-[11px]">
                  skills
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="font-semibold text-foreground text-[14px]">
                  {emp.projects}
                </span>
                <span className="ml-1 text-muted-foreground text-[11px]">
                  projects
                </span>
              </td>
              <td className="px-5 py-4">
                <CriticalityBadge value={emp.criticality} />
              </td>
              <td className="px-5 py-4">
                <span className="font-semibold text-foreground text-[14px]">
                  {emp.busFactor}
                </span>
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

/* ─── Employees Page ───────────────────────────────────────── */

export default function Employees() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const editEmployee = undefined;

  const filtered = EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  const totalEmployee = EMPLOYEES.length;
  const criticalStaff = EMPLOYEES.filter(
    (e) => e.criticality === "High",
  ).length;
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
          <StatCard
            title="Total Employees"
            value={String(totalEmployee).padStart(2, "0")}
          />
          <StatCard
            title="Critical Staff"
            value={String(criticalStaff).padStart(2, "0")}
          />
          <StatCard title="On Leave" value={String(onLeave).padStart(2, "0")} />
          <StatCard title="Avg. Skills/Person" value={avgSkills} />
        </div>

        <div className="flex items-center justify-between gap-4">
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

          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10 btn-press"
          >
            <Plus className="size-4" />
            Add Employee
          </Button>
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
