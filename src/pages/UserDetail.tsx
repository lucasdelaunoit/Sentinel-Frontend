import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePage } from "@/context/PageContext";
import {
  PenSquare,
  Plus,
  Calendar,
  Mail,
  Phone,
  User,
  CalendarDays,
  ShieldAlert,
  Users as UsersIcon,
  Code2,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard";
import StatCard from "@/components/common/cards/StatCard";
import {
  USER_DETAILS,
  type UserDetail,
  type LeaveType,
  type SkillCategory,
} from "@/data/users";

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

function CompetencyRadar({ user }: { user: UserDetail }) {
  const cx = 145;
  const cy = 145;
  const maxR = 95;
  const labelR = maxR * 1.3;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const scores = RADAR_AXES.map((cat) => {
    const catSkills = user.skills.filter((s) => s.category === cat);
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

/* ─── Overview Tab ────────────────────────────────────────── */

function OverviewTab({ user }: { user: UserDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ComposedCard
        title="Leaves"
        action={
          <>
            <div className="flex-1" />
            <Button size="xs" variant="outline" className="gap-1.5 text-[10px]">
              <Calendar className="size-3" />
              Request
            </Button>
          </>
        }
        headerClassName="mb-4"
      >
        <div className="space-y-2.5">
          {user.leaves.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">
              No leaves recorded
            </p>
          ) : (
            user.leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LeaveBadge type={leave.type} />
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
                <LeaveStatusBadge status={leave.status} />
              </div>
            ))
          )}
        </div>
      </ComposedCard>

      <ComposedCard
        title="Projects"
        action={
          <>
            <div className="flex-1" />
            <Button size="xs" variant="outline" className="gap-1.5 text-[10px]">
              <Plus className="size-3" />
              Assign
            </Button>
          </>
        }
        headerClassName="mb-4"
      >
        <div className="space-y-2.5">
          {user.projects.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">
              No projects assigned
            </p>
          ) : (
            user.projects.map((proj) => (
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
      </ComposedCard>
    </div>
  );
}

/* ─── Projects Tab ────────────────────────────────────────── */

function ProjectsTab({ user }: { user: UserDetail }) {
  return (
    <ComposedCard
      title="Projects"
      action={
        <>
          <div className="flex-1" />
          <Button size="xs" variant="outline" className="gap-1.5 text-[10px]">
            <Plus className="size-3" />
            Assign project
          </Button>
        </>
      }
      className="p-0 overflow-hidden"
      headerClassName="px-6 pt-5 pb-4 border-b border-border/60"
    >
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
          {user.projects.map((proj) => (
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
    </ComposedCard>
  );
}

/* ─── Skills Tab ──────────────────────────────────────────── */

function SkillsTab({ user }: { user: UserDetail }) {
  const left = user.skills.filter((_, i) => i % 2 === 0);
  const right = user.skills.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <ComposedCard
        title="Skills & Proficiency"
        action={
          <>
            <div className="flex-1" />
            <Button
              size="xs"
              variant="ghost"
              className="gap-1.5 text-[11px] text-muted-foreground"
            >
              <Plus className="size-3.5" />
              Add Skill
            </Button>
          </>
        }
        className="lg:col-span-3"
        headerClassName="mb-5"
      >
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {left.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} />
          ))}
          {right.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} />
          ))}
        </div>
      </ComposedCard>

      <ComposedCard
        title="Competency Radar"
        className="lg:col-span-2"
        headerClassName="mb-4"
      >
        <CompetencyRadar user={user} />
      </ComposedCard>
    </div>
  );
}

/* ─── Employee Detail Page ────────────────────────────────── */

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();

  const { setTitle, setBreadcrumb } = usePage();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const fallbackKey = Object.keys(USER_DETAILS)[0];
  const user: UserDetail | undefined =
    (id && USER_DETAILS[id]) || USER_DETAILS[fallbackKey];

  useEffect(() => {
    if (user) {
      setTitle(user.name);
      setBreadcrumb("HR");
    }
    return () => {
      setTitle("");
      setBreadcrumb("");
    };
  }, [user?.id]);


  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-foreground">
          Employee not found
        </p>
        <Link
          to="/users"
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
      <TopBar title={user.name} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero card ─────────────────────────────────────────── */}
        <section className="rounded-2xl bg-card border border-border/60 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex size-20 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-md",
                  user.color,
                )}
              >
                {user.initials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {user.name}
                  </h2>
                  {user.onLeaveUntil && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                      On Leave until {user.onLeaveUntil}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {user.role} · {user.department}
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <PenSquare className="size-4" />
              Edit profile
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoChip
              icon={<Mail className="size-3.5" />}
              label="Email"
              value={user.email}
            />
            <InfoChip
              icon={<Phone className="size-3.5" />}
              label="Phone"
              value={user.phone}
            />
            <InfoChip
              icon={<User className="size-3.5" />}
              label="Manager"
              value={user.manager}
            />
            <InfoChip
              icon={<CalendarDays className="size-3.5" />}
              label="Start Date"
              value={new Date(user.startDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Criticality"
            icon={ShieldAlert}
            isLoading={false}
            comment={null}
            value={
              <span
                className={cn(
                  user.criticality === "High"
                    ? "text-rose-500"
                    : user.criticality === "Medium"
                      ? "text-amber-500"
                      : "text-emerald-500",
                )}
              >
                {user.criticality}
              </span>
            }
          />
          <StatCard
            title="Bus Factor in Org"
            icon={UsersIcon}
            isLoading={false}
            value={<span className="text-amber-500">{user.busFactor}</span>}
            comment={
              <span className="text-[12px] text-muted-foreground">
                {user.busFactor <= 1 ? "Critical dependency" : "Distributed"}
              </span>
            }
          />
          <StatCard
            title="Skills"
            icon={Code2}
            isLoading={false}
            value={user.skills.length}
            comment={
              <span className="text-[12px] text-muted-foreground">
                {user.skills.filter((s) => s.level >= 4).length} expert-level
              </span>
            }
          />
          <StatCard
            title="Active Projects"
            icon={FolderKanban}
            isLoading={false}
            value={
              user.projects.filter((p) => p.status === "Active").length
            }
            comment={
              <span className="text-[12px] text-muted-foreground">
                {user.projects.length} total
              </span>
            }
          />
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

        {activeTab === "overview" && <OverviewTab user={user} />}
        {activeTab === "projects" && <ProjectsTab user={user} />}
        {activeTab === "skills" && <SkillsTab user={user} />}
      </div>

    </>
  );
}

/* ─── Bits ────────────────────────────────────────────────── */

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className="text-[13px] font-medium text-foreground truncate">
        {value}
      </p>
    </div>
  );
}
