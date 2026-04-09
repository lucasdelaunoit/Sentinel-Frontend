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

const AVATAR_COLORS: Record<string, string> = {
  SC: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  MJ: "bg-gradient-to-br from-blue-500 to-blue-600",
  DK: "bg-gradient-to-br from-amber-500 to-amber-600",
  ER: "bg-gradient-to-br from-rose-500 to-rose-600",
  LW: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  AK: "bg-gradient-to-br from-violet-500 to-violet-600",
  W: "bg-gradient-to-br from-green-500 to-green-600",
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
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] font-medium",
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
    <div className="space-y-6 page-enter">
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
            {todayEvents.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
                    e.type === "leave"
                      ? "bg-gradient-to-br from-amber-400 to-amber-500"
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
                      ? "text-amber-600 bg-amber-50"
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
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-sm border border-blue-300 bg-blue-100"
                  style={{ borderStyle: "dashed" }}
                />
                <span className="text-muted-foreground">Target: 90%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Projects Today */}
        <div className="rounded-2xl bg-card border border-border/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm">
              Critical Projects
            </h3>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              2 at risk
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-rose-50/80 to-rose-50/40 border border-rose-100/50 hover:from-rose-50 hover:to-rose-50 transition-all">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-[11px] font-bold text-white shadow-sm">
                P1
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Cloud Migration
                </p>
                <p className="text-[11px] text-rose-600 font-medium">
                  Bus factor: 1 • Risk: 18
                </p>
              </div>
              <Eye className="size-4 text-rose-400/70" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50/80 to-amber-50/40 border border-amber-100/50 hover:from-amber-50 hover:to-amber-50 transition-all">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-[11px] font-bold text-white shadow-sm">
                P2
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Data Pipeline
                </p>
                <p className="text-[11px] text-amber-600 font-medium">
                  Bus factor: 1 • Risk: 22
                </p>
              </div>
              <Eye className="size-4 text-amber-400/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">All Projects</h3>
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              3 active
            </span>
          </div>
          <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors font-medium">
            View all
            <ArrowRight className="size-3" />
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20">
              <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                ID
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Project Name
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Progress
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Risk
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Bus Factor
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Health
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Team
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {projects.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-muted/20 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className="text-[11px] font-mono font-semibold text-muted-foreground/70">
                    {p.id}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.desc}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60 ring-inset">
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
                  <button className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted">
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
