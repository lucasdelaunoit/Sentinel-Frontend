import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenSquare, Search, ChevronsUpDown, ChevronUp, ChevronDown, Eye, AlertTriangle, CheckCircle2, Clock, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PROJECTS, type ProjectData, type ProjectStatus, type ProjectPriority } from '@/data/projects'

/* ─── Helpers ─────────────────────────────────────────────── */

type SortKey = 'name' | 'progress' | 'riskScore' | 'busFactor' | 'health' | 'endDate'
type SortDir = 'asc' | 'desc'

function healthColor(v: number) {
  if (v >= 75) return 'bg-emerald-500'
  if (v >= 55) return 'bg-amber-400'
  return 'bg-rose-500'
}

function riskColor(v: number) {
  if (v >= 20) return 'text-rose-500'
  if (v >= 12) return 'text-amber-500'
  return 'text-emerald-500'
}

function busFactorColor(v: number) {
  if (v <= 1) return 'text-rose-500'
  if (v <= 2) return 'text-amber-500'
  return 'text-emerald-500'
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Status & priority badges ─────────────────────────────── */

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-blue-100 text-blue-700',
  'On Hold': 'bg-amber-100 text-amber-700',
  Planning: 'bg-violet-100 text-violet-700',
}

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  Critical: 'bg-rose-500 text-white',
  High: 'bg-orange-400 text-white',
  Medium: 'bg-amber-400 text-white',
  Low: 'bg-muted text-muted-foreground',
}

function StatusBadge({ value }: { value: ProjectStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', STATUS_STYLES[value])}>
      {value}
    </span>
  )
}

function PriorityDot({ value }: { value: ProjectPriority }) {
  const dot: Record<ProjectPriority, string> = {
    Critical: 'bg-rose-500',
    High: 'bg-orange-400',
    Medium: 'bg-amber-400',
    Low: 'bg-muted-foreground/40',
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('size-1.5 rounded-full shrink-0', dot[value])} />
      <span className="text-xs text-foreground">{value}</span>
    </div>
  )
}

/* ─── Progress bar ─────────────────────────────────────────── */

function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? 'bg-blue-500' : value >= 60 ? 'bg-primary' : value >= 35 ? 'bg-amber-400' : 'bg-muted-foreground/30'
  return (
    <div className="flex items-center gap-2.5 min-w-[110px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-foreground w-8 text-right">{value}%</span>
    </div>
  )
}

/* ─── Health bar ───────────────────────────────────────────── */

function HealthBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5 min-w-[100px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full', healthColor(value))} style={{ width: `${value}%` }} />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-8 text-right', value >= 75 ? 'text-emerald-600' : value >= 55 ? 'text-amber-500' : 'text-rose-500')}>
        {value}
      </span>
    </div>
  )
}

/* ─── Avatar group ─────────────────────────────────────────── */

function AvatarGroup({ members, max = 4 }: { members: ProjectData['team']; max?: number }) {
  const visible = members.slice(0, max)
  const extra = members.length - max
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div
          key={m.id}
          title={m.name}
          className="ring-2 ring-card rounded-full"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <div className={cn('flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0', m.color)}>
            {m.initials}
          </div>
        </div>
      ))}
      {extra > 0 && (
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

/* ─── Sort header cell ─────────────────────────────────────── */

function SortTh({
  label,
  col,
  sort,
  onSort,
  className,
}: {
  label: string
  col: SortKey
  sort: { key: SortKey; dir: SortDir }
  onSort: (k: SortKey) => void
  className?: string
}) {
  const active = sort.key === col
  return (
    <th
      onClick={() => onSort(col)}
      className={cn(
        'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors',
        className,
      )}
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          sort.dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
        ) : (
          <ChevronsUpDown className="size-3 opacity-40" />
        )}
      </span>
    </th>
  )
}

/* ─── Stat card ────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-foreground',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-card border border-border px-5 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground/60">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className={cn('text-2xl font-bold tracking-tight leading-none mt-0.5', color)}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ─── Status filter ────────────────────────────────────────── */

const STATUS_FILTERS: (ProjectStatus | 'All')[] = ['All', 'Active', 'On Hold', 'Planning', 'Completed']

/* ─── Projects Page ────────────────────────────────────────── */

export default function Projects() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'name', dir: 'asc' })

  function toggleSort(key: SortKey) {
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const filtered = useMemo(() => {
    let list = PROJECTS.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || p.status === statusFilter
      return matchSearch && matchStatus
    })

    list = [...list].sort((a, b) => {
      let av: string | number, bv: string | number
      switch (sort.key) {
        case 'name':       av = a.name;       bv = b.name;       break
        case 'progress':   av = a.progress;   bv = b.progress;   break
        case 'riskScore':  av = a.riskScore;  bv = b.riskScore;  break
        case 'busFactor':  av = a.busFactor;  bv = b.busFactor;  break
        case 'health':     av = a.health;     bv = b.health;     break
        case 'endDate':    av = a.endDate;    bv = b.endDate;    break
      }
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sort.dir === 'asc' ? cmp : -cmp
    })

    return list
  }, [search, statusFilter, sort])

  // Stats
  const total = PROJECTS.length
  const active = PROJECTS.filter((p) => p.status === 'Active').length
  const atRisk = PROJECTS.filter((p) => p.health < 55 || p.riskScore >= 20).length
  const avgProgress = Math.round(PROJECTS.filter(p => p.status !== 'Completed').reduce((s, p) => s + p.progress, 0) / PROJECTS.filter(p => p.status !== 'Completed').length)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Projects</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Monitor health, risk and delivery across every project</p>
        </div>
        <Button className="gap-2 bg-foreground text-background hover:bg-foreground/85 rounded-xl h-9 px-4 font-semibold">
          <PenSquare className="size-4" />
          New Project
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Layers}        label="Total Projects"   value={total}   sub={`${PROJECTS.filter(p=>p.status==='Completed').length} completed`} />
        <StatCard icon={CheckCircle2}  label="Active"          value={active}  sub="Currently running" color="text-emerald-600" />
        <StatCard icon={AlertTriangle} label="At Risk"         value={atRisk}  sub="Low health or high risk" color={atRisk > 0 ? 'text-rose-500' : 'text-foreground'} />
        <StatCard icon={Clock}         label="Avg. Progress"   value={`${avgProgress}%`} sub="Excluding completed" />
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-4">
        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
                statusFilter === s
                  ? 'bg-foreground text-background'
                  : 'bg-card border border-border text-foreground hover:bg-muted',
              )}
            >
              {s}
              {s !== 'All' && (
                <span className={cn(
                  'ml-1.5 text-[10px]',
                  statusFilter === s ? 'text-background/60' : 'text-muted-foreground',
                )}>
                  {PROJECTS.filter((p) => p.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            Projects
            <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </h3>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-14">ID</th>
              <SortTh label="Project"    col="name"      sort={sort} onSort={toggleSort} />
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
              <SortTh label="Progress"   col="progress"  sort={sort} onSort={toggleSort} />
              <SortTh label="Risk"       col="riskScore" sort={sort} onSort={toggleSort} />
              <SortTh label="Bus Factor" col="busFactor" sort={sort} onSort={toggleSort} />
              <SortTh label="Health"     col="health"    sort={sort} onSort={toggleSort} />
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Team</th>
              <SortTh label="Due"        col="endDate"   sort={sort} onSort={toggleSort} />
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No projects match your filters
                </td>
              </tr>
            ) : (
              filtered.map((project) => (
                <ProjectRow key={project.id} project={project} sort={sort} onSort={toggleSort} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Project row ─────────────────────────────────────────── */

function ProjectRow({ project }: { project: ProjectData; sort: { key: SortKey; dir: SortDir }; onSort: (k: SortKey) => void }) {
  const navigate = useNavigate()
  const overdue = new Date(project.endDate) < new Date() && project.status !== 'Completed'

  return (
    <tr className="hover:bg-muted/10 transition-colors group cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
      {/* ID */}
      <td className="px-5 py-4">
        <span className="text-[11px] font-mono font-semibold text-muted-foreground">{project.id}</span>
      </td>

      {/* Project name + description */}
      <td className="px-5 py-4 max-w-[260px]">
        <p className="font-semibold text-foreground truncate">{project.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.description}</p>
        {/* Skills tags */}
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {project.skills.slice(0, 3).map((s) => (
            <span key={s} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {s}
            </span>
          ))}
          {project.skills.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{project.skills.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge value={project.status} />
      </td>

      {/* Priority */}
      <td className="px-5 py-4">
        <PriorityDot value={project.priority} />
      </td>

      {/* Progress */}
      <td className="px-5 py-4">
        <ProgressBar value={project.progress} />
      </td>

      {/* Risk */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'size-1.5 rounded-full shrink-0',
            project.riskScore >= 20 ? 'bg-rose-500' : project.riskScore >= 12 ? 'bg-amber-400' : 'bg-emerald-500',
          )} />
          <span className={cn('text-sm font-bold tabular-nums', riskColor(project.riskScore))}>
            {project.riskScore}
          </span>
        </div>
      </td>

      {/* Bus Factor */}
      <td className="px-5 py-4">
        <span className={cn('text-sm font-bold tabular-nums', busFactorColor(project.busFactor))}>
          {project.busFactor}
        </span>
      </td>

      {/* Health */}
      <td className="px-5 py-4">
        <HealthBar value={project.health} />
      </td>

      {/* Team */}
      <td className="px-5 py-4">
        <AvatarGroup members={project.team} />
      </td>

      {/* Due date */}
      <td className="px-5 py-4">
        <span className={cn('text-xs font-medium whitespace-nowrap', overdue ? 'text-rose-500' : 'text-foreground')}>
          {fmt(project.endDate)}
        </span>
        {overdue && (
          <p className="text-[10px] text-rose-400 mt-0.5">Overdue</p>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <Button
          size="sm"
          className="gap-1.5 bg-foreground text-background hover:bg-foreground/85 rounded-lg h-8 px-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <Eye className="size-3.5" />
          View
        </Button>
      </td>
    </tr>
  )
}
