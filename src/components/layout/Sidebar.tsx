import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CalendarDays,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePage } from "@/context/PageContext";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Employees", icon: Users, to: "/employees" },
  { label: "Projects", icon: FolderOpen, to: "/projects" },
  { label: "Planning", icon: CalendarDays, to: "/planning" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

function SidebarNavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex w-full items-center rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center" : "gap-3",
          isActive
            ? "bg-primary/30 text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )
      }
    >
      <item.icon className="size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
      <span
        className={cn(
          "flex-1 whitespace-nowrap overflow-hidden transition-all duration-300",
          collapsed ? "w-0 opacity-0" : "opacity-100",
        )}
      >
        {item.label}
      </span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed: collapsed } = usePage();
  return (
    <aside
      className="flex h-full shrink-0 flex-col bg-sidebar border-r border-sidebar-border/60 overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="relative px-3 py-5 shrink-0">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent" />
        <div className={cn("flex items-center gap-3.5 overflow-hidden", collapsed && "justify-center")}>
          <img
            src="/logo.svg"
            alt="Sentinel"
            className="size-[38px] shrink-0 rounded-xl bg-secondary-foreground p-[7px]"
          />
          <div
            className={cn(
              "flex flex-col justify-center transition-all duration-300 overflow-hidden whitespace-nowrap",
              collapsed ? "w-0 opacity-0" : "opacity-100",
            )}
          >
            <div className="text-xl font-bold text-sidebar-accent-foreground leading-none tracking-tight">Sentinel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        <div className="mb-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 transition-opacity duration-200">
              Navigation
            </p>
          )}
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <SidebarNavLink key={item.label} item={item} collapsed={collapsed} />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle + User profile */}
      <div className="relative px-2.5 py-3 shrink-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent" />

        {/* User */}
        <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
          <div
            className="flex size-[38px] shrink-0 rounded-xl bg-secondary-foreground items-center justify-center text-xs font-bold text-white shadow-lg shadow-sidebar-primary/20"
            title={collapsed ? "Admin User · Manager" : undefined}
          >
            AD
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap",
              collapsed ? "w-0 opacity-0" : "opacity-100",
            )}
          >
            <p className="truncate text-[13px] font-semibold text-sidebar-accent-foreground leading-tight">
              Admin User
            </p>
            <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground/40">Manager</p>
          </div>
          {!collapsed && (
            <button className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/30 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors">
              <Settings className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
