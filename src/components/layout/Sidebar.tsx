import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Grid3x3,
  PlayCircle,
  Shield,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  to: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Employees', icon: Users, to: '/employees' },
  { label: 'Projects', icon: FolderOpen, to: '/projects' },
  { label: 'Skill Matrix', icon: Grid3x3, to: '/skill-matrix' },
]

const quickActions: NavItem[] = [
  { label: 'Simulate Leave', icon: PlayCircle, to: '/simulate' },
]

function SidebarNavLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              'size-4 shrink-0',
              isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60',
            )}
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Shield className="size-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-sidebar-accent-foreground leading-none">
            Sentinel
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-widest text-sidebar-foreground/50 uppercase">
            Risk Analyzer
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Navigation
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <SidebarNavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Quick Actions
          </p>
          <div className="space-y-0.5">
            {quickActions.map((item) => (
              <SidebarNavLink key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* User profile */}
      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-white">
          AD
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
            Admin User
          </p>
          <p className="truncate text-xs text-sidebar-foreground/50">Manager</p>
        </div>
        <button className="text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors">
          <Settings className="size-4" />
        </button>
      </div>
    </aside>
  )
}
