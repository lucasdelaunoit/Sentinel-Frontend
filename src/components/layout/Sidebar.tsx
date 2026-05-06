import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FolderOpen, CalendarDays, Settings } from "lucide-react";
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
          "group relative flex w-full items-center rounded-xl text-sm font-medium transition-all duration-300",
          collapsed ? "justify-center px-5 py-2.5" : "gap-3 px-3.5 py-2.5",
          isActive
            ? "bg-primary/30 text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )
      }
    >
      <item.icon className="size-[18px] shrink-0 transition-transform duration-200" />
      <span
        className={cn(
          "whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200 leading-none",
          collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100 flex-1",
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
      <div className={cn("relative shrink-0", collapsed ? "px-2.5 pt-5" : "px-4 py-5")}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent" />
        <div
          className={cn(
            "flex items-center overflow-hidden transition-all duration-300",
            collapsed ? "justify-center gap-0" : "gap-3.5",
          )}
        >
          <img
            src="/logo.svg"
            alt="Sentinel"
            className="size-[47px] shrink-0 rounded-xl bg-secondary-foreground p-[8px]"
          />
          <span
            className={cn(
              "text-2xl font-bold text-sidebar-accent-foreground leading-none tracking-tight whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200",
              collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
            )}
          >
            Sentinel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div
          className={cn(
            "overflow-hidden transition-[opacity,max-height] duration-200",
            collapsed ? "max-h-0 opacity-0" : "max-h-8 opacity-100",
          )}
        >
          <p className="mb-2 px-3.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Navigation
          </p>
        </div>
        <div className={cn(collapsed ? "space-y-1" : "space-y-0.5")}>
          {navItems.map((item) => (
            <SidebarNavLink key={item.label} item={item} collapsed={collapsed} />
          ))}
        </div>
      </div>

      {/* User profile */}
      <div className="relative px-4 py-4 shrink-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent" />
        <div
          className={cn(
            "flex items-center overflow-hidden transition-all duration-300",
            collapsed ? "justify-center gap-0" : "gap-3",
          )}
        >
          <div
            className={cn(
              "flex  shrink-0 rounded-xl bg-secondary-foreground items-center justify-center text-xs font-bold text-primary-foreground shadow-lg shadow-sidebar-primary/20",
              collapsed ? "size-[35px]" : "size-[47px]",
            )}
            title={collapsed ? "Admin User · Manager" : undefined}
          >
            AD
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 overflow-hidden transition-[opacity,max-width] duration-200",
              collapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100",
            )}
          >
            <p className="truncate text-[13px] font-semibold text-sidebar-accent-foreground leading-tight whitespace-nowrap">
              Admin User
            </p>
            <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground/40 whitespace-nowrap">Manager</p>
          </div>
          <button
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/30 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200",
              collapsed ? "max-w-0 opacity-0 overflow-hidden pointer-events-none" : "max-w-[28px] opacity-100",
            )}
          >
            <Settings className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
