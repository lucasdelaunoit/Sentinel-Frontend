import { CalendarCheck, Eye, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ─── Helpers ─────────────────────────────────────────────── */

function Avatar({
  initials,
  color,
  size = 'sm',
}: {
  initials: string
  color: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        size === 'sm' ? 'size-7 text-[10px]' : 'size-9 text-xs',
        color,
      )}
    >
      {initials}
    </div>
  )
}

const AVATAR_COLORS: Record<string, string> = {
  SC: 'bg-indigo-500',
  MJ: 'bg-blue-500',
  DK: 'bg-amber-500',
  ER: 'bg-rose-500',
  LW: 'bg-emerald-500',
  AK: 'bg-violet-500',
  W: 'bg-green-500',
}

function AvatarGroup({
  members,
  extra,
}: {
  members: string[]
  extra?: number
}) {
  return (
    <div className="flex items-center">
      {members.map((m, i) => (
        <div
          key={m}
          className="ring-2 ring-card rounded-full"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar initials={m} color={AVATAR_COLORS[m] ?? 'bg-gray-400'} size="sm" />
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
  )
}

function BusFactor({ value, color = 'orange' }: { value: number; color?: 'orange' | 'red' | 'amber' }) {
  const cls =
    color === 'red'
      ? 'text-rose-500'
      : color === 'amber'
        ? 'text-amber-500'
        : 'text-orange-500'
  return <span className={cn('text-sm font-bold', cls)}>{value}</span>
}

function HealthBar({ value }: { value: number }) {
  const color =
    value >= 70
      ? 'bg-amber-400'
      : value >= 55
        ? 'bg-orange-500'
        : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-medium text-foreground">{value}%</span>
    </div>
  )
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset">
      {label}
    </span>
  )
}

/* ─── Radar Chart ─────────────────────────────────────────── */

const AXES = ['FRONTEND', 'BACKEND', 'DEVOPS', 'DATABASE', 'SECURITY', 'TESTING']

function radarPoint(cx: number, cy: number, r: number, i: number) {
  const angle = ((-90 + i * 60) * Math.PI) / 180
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function radarPath(values: number[], cx: number, cy: number, maxR: number) {
  const pts = values.map((v, i) => radarPoint(cx, cy, v * maxR, i))
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z'
}

function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => radarPoint(cx, cy, r, i))
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z'
}

function KCIRadarChart() {
  const cx = 165
  const cy = 165
  const maxR = 110
  const labelR = maxR * 1.28

  const coverageToday = [0.72, 0.68, 0.82, 0.58, 0.50, 0.78]
  const recommended = [0.92, 0.88, 0.93, 0.87, 0.88, 0.92]
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]

  return (
    <svg width="330" height="330" viewBox="0 0 330 330" className="mx-auto">
      {/* Grid hexagons */}
      {gridLevels.map((r) => (
        <path
          key={r}
          d={hexPath(cx, cy, r * maxR)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {AXES.map((_, i) => {
        const p = radarPoint(cx, cy, maxR, i)
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
        )
      })}
      {/* Recommended coverage (dashed blue) */}
      <path
        d={radarPath(recommended, cx, cy, maxR)}
        fill="#DBEAFE"
        fillOpacity="0.35"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      {/* Coverage today (solid pink) */}
      <path
        d={radarPath(coverageToday, cx, cy, maxR)}
        fill="#FECACA"
        fillOpacity="0.55"
        stroke="#F87171"
        strokeWidth="2"
      />
      {/* Axis labels */}
      {AXES.map((label, i) => {
        const p = radarPoint(cx, cy, labelR, i)
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="600"
            fill="#6B7280"
            letterSpacing="0.8"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

/* ─── Stat Card ───────────────────────────────────────────── */

interface StatCardProps {
  title: string
  value: React.ReactNode
  trend: React.ReactNode
  trendUp?: boolean
  icon: React.ComponentType<{ className?: string }>
}

function StatCard({ title, value, trend, trendUp = true, icon: Icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground/50">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      <div
        className={cn(
          'flex items-center gap-1 text-xs font-medium',
          trendUp ? 'text-emerald-600' : 'text-rose-500',
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
  )
}

/* ─── Project data ────────────────────────────────────────── */

const projects = [
  {
    id: 'P001',
    name: 'Cloud Migration Platform',
    desc: 'Migrate legacy infrastructure to cloud-native arch...',
    status: 'Active',
    progress: 62,
    riskScore: 18,
    busFactor: 1,
    health: 64,
    team: ['SC', 'MJ', 'DK'],
    extra: 2,
  },
  {
    id: 'P002',
    name: 'Data Analytics Pipeline',
    desc: 'Build real-time data pipeline for business analyti...',
    status: 'Active',
    progress: 35,
    riskScore: 22,
    busFactor: 1,
    health: 48,
    team: ['MJ', 'ER', 'LW'],
    extra: 1,
  },
  {
    id: 'P003',
    name: 'Customer Portal Redesign',
    desc: 'Redesign and rebuild the customer-facing portal wi...',
    status: 'Active',
    progress: 28,
    riskScore: 10,
    busFactor: 2,
    health: 78,
    team: ['SC', 'ER', 'AK'],
    extra: 0,
  },
]

/* ─── Dashboard Page ──────────────────────────────────────── */

import { Users, AlertTriangle, BookOpen, Activity } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Today</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur. Lectus amet sed et purus.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm">
            <CalendarCheck className="size-3.5" />
            Import planning
          </Button>
          <Button
            size="sm"
            className="gap-1.5 h-8 text-sm bg-foreground text-background hover:bg-foreground/85"
          >
            <CalendarCheck className="size-3.5" />
            Simulate a leave
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="On Leave"
          value="4"
          trend="+2 since last day"
          trendUp={true}
          icon={Users}
        />
        <StatCard
          title="Project At Risk Today"
          value="2"
          trend="+2 from yesterday"
          trendUp={false}
          icon={AlertTriangle}
        />
        <StatCard
          title="Knowledge Coverage (KCI)"
          value="78%"
          trend="+2% from last month"
          trendUp={true}
          icon={BookOpen}
        />
        <StatCard
          title="Overall Health Today"
          value={<span className="text-emerald-600">Healthy</span>}
          trend="No immediate blockers"
          trendUp={true}
          icon={Activity}
        />
      </div>

      {/* Middle row: KCI chart + Critical Projects */}
      <div className="grid grid-cols-5 gap-4">
        {/* KCI Radar card */}
        <div className="col-span-3 rounded-xl bg-card border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Knowledge Coverage Index Today (KCI)
            </h3>
            <select className="text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 text-muted-foreground focus:outline-none">
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last month</option>
            </select>
          </div>

          <div className="flex items-start gap-6">
            {/* Legend */}
            <div className="shrink-0 space-y-2 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Legende :
              </p>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-sm border border-rose-300 bg-rose-200" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Coverage today
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-sm border border-blue-300 bg-blue-100" style={{ borderStyle: 'dashed' }} />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Recommended coverage
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1">
              <KCIRadarChart />
            </div>
          </div>
        </div>

        {/* Right column: Critical Projects + Skill Gap */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Critical Projects */}
          <div className="rounded-xl bg-card border border-border shadow-sm p-5 flex-1">
            <h3 className="font-semibold text-foreground mb-4">
              Critical projects{' '}
              <span className="text-muted-foreground font-normal">(2)</span>
            </h3>
            <div className="space-y-3">
              {/* Project 1 */}
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                  P1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    Project 1
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
                  Bus factor : 1
                </span>
                <Button
                  size="xs"
                  className="shrink-0 gap-1 bg-foreground text-background hover:bg-foreground/85 h-6 px-2 text-[11px]"
                >
                  <Eye className="size-3" />
                  View
                </Button>
              </div>

              {/* Project 2 */}
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                  GM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    Gérard Martic
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    clint@qite.be
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
                  Bus factor : 8
                </span>
                <Button
                  size="xs"
                  className="shrink-0 gap-1 bg-foreground text-background hover:bg-foreground/85 h-6 px-2 text-[11px]"
                >
                  <Eye className="size-3" />
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Skill Gap Alerts */}
          <div className="rounded-xl bg-card border border-border shadow-sm p-5">
            <h3 className="font-semibold text-foreground mb-3">Skill Gap Alerts</h3>
            <div className="rounded-lg bg-rose-50 border border-rose-100 p-3">
              <p className="text-2xl font-bold text-rose-600">3</p>
              <p className="text-xs text-rose-500 mt-0.5">
                Uncovered skills across all projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Health Summary */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Project Health Summary</h3>
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
                Risk Score
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
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
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
                  <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge label={p.status} />
                </td>
                <td className="px-4 py-4">
                  <ProgressBar value={p.progress} />
                </td>
                <td className="px-4 py-4">
                  <BusFactor
                    value={p.riskScore}
                    color={p.riskScore >= 20 ? 'red' : p.riskScore >= 15 ? 'orange' : 'amber'}
                  />
                </td>
                <td className="px-4 py-4">
                  <BusFactor value={p.busFactor} color="orange" />
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
  )
}
