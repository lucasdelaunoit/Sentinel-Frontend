import {
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Activity,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs",
        color,
      )}
    >
      {initials}
    </div>
  );
}

const AVATAR_COLORS: Record<string, string> = {
  SC: "bg-indigo-500",
  MJ: "bg-blue-500",
  DK: "bg-amber-500",
  ER: "bg-rose-500",
  LW: "bg-emerald-500",
  AK: "bg-violet-500",
  W: "bg-green-500",
};

function AvatarGroup({
  members,
  extra,
}: {
  members: string[];
  extra?: number;
}) {
  return (
    <div className="flex items-center">
      {members.map((m, i) => (
        <div
          key={m}
          className="ring-2 ring-card rounded-full"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar
            initials={m}
            color={AVATAR_COLORS[m] ?? "bg-gray-400"}
            size="sm"
          />
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

function HealthBar({ value }: { value: number }) {
  const color =
    value >= 70
      ? "bg-amber-400"
      : value >= 55
        ? "bg-orange-500"
        : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", color)}
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
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{value}%</span>
    </div>
  );
}

const AXES = [
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

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  trend: React.ReactNode;
  trendUp?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({
  title,
  value,
  trend,
  trendUp = true,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card border border-border p-4">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground/50">
          <Icon className="size-3.5" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </div>
      <div
        className={cn(
          "flex items-center gap-1 text-xs font-medium",
          trendUp ? "text-emerald-600" : "text-rose-500",
        )}
      >
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

const projects = [
  {
    id: "P001",
    name: "Cloud Migration Platform",
    desc: "Migrate legacy infrastructure to cloud-native arch...",
    status: "Active",
    progress: 62,
    riskScore: 18,
    busFactor: 1,
    health: 64,
    team: ["SC", "MJ", "DK"],
    extra: 2,
  },
  {
    id: "P002",
    name: "Data Analytics Pipeline",
    desc: "Build real-time data pipeline for business analyti...",
    status: "Active",
    progress: 35,
    riskScore: 22,
    busFactor: 1,
    health: 48,
    team: ["MJ", "ER", "LW"],
    extra: 1,
  },
  {
    id: "P003",
    name: "Customer Portal Redesign",
    desc: "Redesign and rebuild the customer-facing portal wi...",
    status: "Active",
    progress: 28,
    riskScore: 10,
    busFactor: 2,
    health: 78,
    team: ["SC", "ER", "AK"],
    extra: 0,
  },
];

const todayEvents = [
  {
    type: "leave",
    name: "Sarah Chen",
    role: "Backend Dev",
    initials: "SC",
    time: "On leave",
  },
  {
    type: "leave",
    name: "Marc Johnson",
    role: "DevOps",
    initials: "MJ",
    time: "On leave",
  },
  {
    type: "leave",
    name: "Emma Wilson",
    role: "Frontend",
    initials: "EW",
    time: "On leave",
  },
  {
    type: "return",
    name: "David Kim",
    role: "Security",
    initials: "DK",
    time: "Back today",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="On Leave Today"
          value="4"
          trend="+2 from yesterday"
          trendUp={true}
          icon={CalendarClock}
        />
        <StatCard
          title="Projects at Risk"
          value="2"
          trend="Same as yesterday"
          trendUp={true}
          icon={AlertTriangle}
        />
        <StatCard
          title="Knowledge Coverage"
          value="68%"
          trend="+3% this week"
          trendUp={true}
          icon={Activity}
        />
        <StatCard
          title="Team Available"
          value="12/16"
          trend="75% capacity"
          trendUp={true}
          icon={Users}
        />
      </div>

      {/* Today's Overview Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Today's Leave & Returns */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Today's Team Status
          </h3>
          <div className="space-y-3">
            {todayEvents.map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    e.type === "leave" ? "bg-amber-500" : "bg-emerald-500",
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
                    "shrink-0 text-xs font-medium",
                    e.type === "leave" ? "text-amber-600" : "text-emerald-600",
                  )}
                >
                  {e.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* KCI Mini Chart */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Today's KCI</h3>
            <span className="text-xs font-medium text-emerald-600">
              +3% vs last week
            </span>
          </div>
          <div className="flex items-center gap-4">
            <KCIRadarChart />
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-sm bg-rose-400" />
                <span className="text-muted-foreground">Current: 68%</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-sm border border-blue-300 bg-blue-100"
                  style={{ borderStyle: "dashed" }}
                />
                <span className="text-muted-foreground">Target: 90%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Projects Today */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Critical Projects{" "}
            <span className="text-muted-foreground font-normal">(2)</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-rose-50 border border-rose-100">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                P1
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Cloud Migration
                </p>
                <p className="text-xs text-rose-600">
                  Bus factor: 1 • Risk: 18
                </p>
              </div>
              <Eye className="size-4 text-rose-400" />
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                P2
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Data Pipeline
                </p>
                <p className="text-xs text-amber-600">
                  Bus factor: 1 • Risk: 22
                </p>
              </div>
              <Eye className="size-4 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">All Projects</h3>
          <span className="text-xs text-muted-foreground">
            3 active projects
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                ID
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Project Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Risk
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bus Factor
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Health
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Team
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-xs font-mono font-semibold text-muted-foreground">
                  {p.id}
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.desc}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset">
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
                  <span className="text-sm font-bold text-orange-500">
                    {p.busFactor}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <HealthBar value={p.health} />
                </td>
                <td className="px-4 py-4">
                  <AvatarGroup members={p.team} extra={p.extra} />
                </td>
                <td className="px-4 py-4">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
