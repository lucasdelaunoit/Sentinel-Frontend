import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Activity,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/data/projects";
import { EMPLOYEE_DETAILS } from "@/data/employees";
import SimulateLeaveModal from "@/components/SimulateLeaveModal";

/* ─── Avatar ──────────────────────────────────────────────── */

function Avatar({
  initials,
  color,
  size = "sm",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm",
        size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs",
        color,
      )}
    >
      {initials}
    </div>
  );
}

function AvatarGroup({
  members,
  extra,
}: {
  members: Array<{ initials: string; color: string }>;
  extra?: number;
}) {
  return (
    <div className="flex items-center">
      {members.map((m, i) => (
        <div
          key={i}
          className="ring-2 ring-card rounded-full"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar initials={m.initials} color={m.color} size="sm" />
        </div>
      ))}
      {extra != null && extra > 0 && (
        <div
          className="ring-2 ring-card flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
          style={{ marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ─── Bars ────────────────────────────────────────────────── */

function HealthBar({ value }: { value: number }) {
  const color =
    value >= 70
      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
      : value >= 55
        ? "bg-gradient-to-r from-amber-400 to-amber-500"
        : "bg-gradient-to-r from-rose-400 to-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted shadow-inner">
        <div
          className={cn("h-full rounded-full shadow-sm", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-sm"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{value}%</span>
    </div>
  );
}

/* ─── KCI Radar Chart ─────────────────────────────────────── */

const AXES = ["FRONTEND", "BACKEND", "DEVOPS", "DATABASE", "SECURITY", "TESTING"];

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
  const pts = Array.from({ length: 6 }, (_, i) => radarPoint(cx, cy, r, i));
  return (
    pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + "Z"
  );
}

function KCIRadarChart() {
  const cx = 100,
    cy = 100,
    maxR = 70,
    labelR = maxR * 1.35;
  const coverageToday = [0.72, 0.68, 0.82, 0.58, 0.5, 0.78];
  const recommended = [0.92, 0.88, 0.93, 0.87, 0.88, 0.92];
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
      {gridLevels.map((r) => (
        <path
          key={r}
          d={hexPath(cx, cy, r * maxR)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}
      {AXES.map((_, i) => {
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
        d={radarPath(recommended, cx, cy, maxR)}
        fill="#DBEAFE"
        fillOpacity="0.35"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      <path
        d={radarPath(coverageToday, cx, cy, maxR)}
        fill="#FECACA"
        fillOpacity="0.55"
        stroke="#F87171"
        strokeWidth="2"
      />
      {AXES.map((label, i) => {
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
            letterSpacing="0.5"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Stat Card ───────────────────────────────────────────── */

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  trend: React.ReactNode;
  trendUp?: boolean;
  trendColor?: string;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({
  title,
  value,
  trend,
  trendUp = true,
  trendColor,
  icon: Icon,
}: StatCardProps) {
  const color = trendColor ?? (trendUp ? "text-emerald-600" : "text-rose-500");
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-muted-foreground tracking-wide">
          {title}
        </p>
        <div className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground/50 group-hover:bg-muted group-hover:text-muted-foreground transition-colors">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="text-[28px] font-bold tracking-tight text-foreground leading-none">
        {value}
      </div>
      <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", color)}>
        {trendUp ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {trend}
      </div>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [simulateOpen, setSimulateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("simulate") === "true") {
      setSimulateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const employees = Object.values(EMPLOYEE_DETAILS);
  const onLeaveCount = employees.filter(
    (e) => e.todayStatus === "Has Leave",
  ).length;
  const atRiskProjects = PROJECTS.filter(
    (p) => p.riskScore >= 15 || p.health < 60,
  ).length;
  const teamAvailable = employees.filter(
    (e) => e.todayStatus !== "Has Leave",
  ).length;

  const statusEvents = [...employees]
    .sort((a, b) => {
      const order: Record<string, number> = {
        "Has Leave": 0,
        Remote: 1,
        Available: 2,
      };
      return order[a.todayStatus] - order[b.todayStatus];
    })
    .slice(0, 4)
    .map((e) => ({
      type:
        e.todayStatus === "Has Leave"
          ? "leave"
          : e.todayStatus === "Remote"
            ? "remote"
            : "available",
      name: e.name,
      role: e.role,
      initials: e.initials,
      time:
        e.todayStatus === "Has Leave"
          ? "On leave"
          : e.todayStatus === "Remote"
            ? "Remote"
            : "Available",
    }));

  const criticalProjects = [...PROJECTS]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 2);

  const displayProjects = [...PROJECTS]
    .filter((p) => p.status !== "Completed")
    .sort((a, b) => b.riskScore - a.riskScore);

  return (
    <>
      <div className="space-y-6 page-enter">
        {/* Today's Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="On Leave Today"
            value={String(onLeaveCount)}
            trend={
              onLeaveCount > 0
                ? `${onLeaveCount} member${onLeaveCount > 1 ? "s" : ""} absent`
                : "Full team available"
            }
            trendUp={onLeaveCount > 0}
            trendColor={onLeaveCount > 0 ? "text-rose-500" : "text-emerald-600"}
            icon={CalendarClock}
          />
          <StatCard
            title="Projects at Risk"
            value={String(atRiskProjects)}
            trend={
              atRiskProjects > 0
                ? `${atRiskProjects} need attention`
                : "All projects healthy"
            }
            trendUp={atRiskProjects > 0}
            trendColor={atRiskProjects > 0 ? "text-rose-500" : "text-emerald-600"}
            icon={AlertTriangle}
          />
          <StatCard
            title="Knowledge Coverage"
            value="68%"
            trend="+3% this week"
            trendUp={true}
            trendColor="text-emerald-600"
            icon={Activity}
          />
          <StatCard
            title="Team Available"
            value={`${teamAvailable}/${employees.length}`}
            trend={`${Math.round((teamAvailable / employees.length) * 100)}% capacity today`}
            trendUp={teamAvailable >= employees.length * 0.75}
            trendColor={
              teamAvailable >= employees.length * 0.75
                ? "text-emerald-600"
                : "text-amber-500"
            }
            icon={Users}
          />
        </div>

        {/* Today's Overview Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Team Status */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">
                Team Status
              </h3>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Today
              </span>
            </div>
            <div className="space-y-3">
              {statusEvents.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
                      e.type === "leave"
                        ? "bg-gradient-to-br from-rose-400 to-rose-500"
                        : e.type === "remote"
                          ? "bg-gradient-to-br from-blue-400 to-blue-500"
                          : "bg-gradient-to-br from-emerald-400 to-emerald-500",
                    )}
                  >
                    {e.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {e.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{e.role}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      e.type === "leave"
                        ? "text-rose-600 bg-rose-50"
                        : e.type === "remote"
                          ? "text-blue-600 bg-blue-50"
                          : "text-emerald-600 bg-emerald-50",
                    )}
                  >
                    {e.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KCI Mini Chart */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">
                Knowledge Coverage
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +3% vs last week
              </span>
            </div>
            <div className="flex items-center gap-4">
              <KCIRadarChart />
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-sm bg-rose-400 shadow-sm" />
                  <span className="text-muted-foreground">Current: 68%</span>
                </div>
                <div
                  className="flex items-center gap-2"
                >
                  <div
                    className="size-2.5 rounded-sm border border-blue-300 bg-blue-100"
                    style={{ borderStyle: "dashed" }}
                  />
                  <span className="text-muted-foreground">Target: 90%</span>
                </div>
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide font-medium">
                    Weakest areas
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-rose-400 shrink-0" />
                    <span className="text-muted-foreground">Security (50%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-muted-foreground">Database (58%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Projects */}
          <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">
                Critical Projects
              </h3>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {atRiskProjects} at risk
              </span>
            </div>
            <div className="space-y-2.5">
              {criticalProjects.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left hover:opacity-90 cursor-pointer",
                    i === 0
                      ? "bg-gradient-to-r from-rose-50/80 to-rose-50/40 border-rose-100/50 hover:from-rose-50 hover:to-rose-50"
                      : "bg-gradient-to-r from-amber-50/80 to-amber-50/40 border-amber-100/50 hover:from-amber-50 hover:to-amber-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
                      i === 0
                        ? "bg-gradient-to-br from-rose-500 to-rose-600"
                        : "bg-gradient-to-br from-amber-500 to-amber-600",
                    )}
                  >
                    {p.id.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {p.name}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-medium",
                        i === 0 ? "text-rose-600" : "text-amber-600",
                      )}
                    >
                      Bus factor: {p.busFactor} • Risk: {p.riskScore}
                    </p>
                  </div>
                  <Eye
                    className={cn(
                      "size-4 shrink-0",
                      i === 0 ? "text-rose-400/70" : "text-amber-400/70",
                    )}
                  />
                </button>
              ))}
              <div className="pt-1">
                <button
                  onClick={() => navigate("/projects")}
                  className="w-full flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors font-medium py-2 rounded-xl hover:bg-muted/30"
                >
                  View all projects
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-foreground">Active Projects</h3>
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                {displayProjects.length} shown
              </span>
            </div>
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              View all
              <ArrowRight className="size-3" />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                {[
                  "ID",
                  "Project Name",
                  "Status",
                  "Progress",
                  "Risk",
                  "Bus Factor",
                  "Health",
                  "Team",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {displayProjects.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-muted/20 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground/70">
                      {p.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 max-w-[220px]">
                    <p className="font-semibold text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {p.description.slice(0, 55)}…
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                        p.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
                          : p.status === "On Hold"
                            ? "bg-amber-50 text-amber-700 ring-amber-200/60"
                            : "bg-violet-50 text-violet-700 ring-violet-200/60",
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ProgressBar value={p.progress} />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        p.riskScore >= 20
                          ? "text-rose-500"
                          : p.riskScore >= 15
                            ? "text-orange-500"
                            : "text-amber-500",
                      )}
                    >
                      {p.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        p.busFactor <= 1
                          ? "text-rose-500"
                          : p.busFactor <= 2
                            ? "text-amber-500"
                            : "text-emerald-600",
                      )}
                    >
                      {p.busFactor}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <HealthBar value={p.health} />
                  </td>
                  <td className="px-4 py-4">
                    <AvatarGroup
                      members={p.team.slice(0, 3)}
                      extra={p.team.length > 3 ? p.team.length - 3 : 0}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${p.id}`);
                      }}
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SimulateLeaveModal
        open={simulateOpen}
        onClose={() => setSimulateOpen(false)}
        employees={employees}
      />
    </>
  );
}
