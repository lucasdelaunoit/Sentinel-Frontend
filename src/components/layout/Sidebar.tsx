import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  PlayCircle,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Employees", icon: Users, to: "/employees" },
  { label: "Projects", icon: FolderOpen, to: "/projects" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

const quickActions: NavItem[] = [
  { label: "Simulate Leave", icon: PlayCircle, to: "/?simulate=true" },
];

function SidebarNavLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/30 text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )
      }
    >
      <item.icon
        className={cn(
          "size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110")}
      />
      <span className="flex-1">{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-sidebar border-r border-sidebar-border/60">
      {/* Logo */}
      <div className="relative px-4 py-5">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent" />
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.svg"
            alt="Sentinel"
            className="size-[47px] shrink-0 rounded-xl bg-secondary-foreground p-[8px]"
          />
          <div className="flex flex-col justify-center">
            <div className="text-2xl font-bold text-sidebar-accent-foreground leading-none tracking-tight">
              Sentinel
            </div>

          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6">
          <p className="mb-2 px-3.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Navigation
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <SidebarNavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
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
      <div className="relative px-4 py-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-xs font-bold text-white shadow-lg shadow-sidebar-primary/20">
              AD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-semibold text-sidebar-accent-foreground leading-tight">
              Admin User
            </p>
            <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground/40">
              Manager
            </p>
          </div>
          <button className="flex size-7 items-center justify-center rounded-lg text-sidebar-foreground/30 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors">
            <Settings className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
