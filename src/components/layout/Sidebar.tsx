import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePage } from "@/context/PageContext";
import { CalendarDotsIcon, FolderOpenIcon, GearIcon, HouseIcon, UsersIcon } from "@phosphor-icons/react";

const WIDTH_EXPANDED = 240;
const WIDTH_COLLAPSED = 72;
const SQUARE = 44;

type NavItem = {
  label: string;
  icon: LucideIcon;
  to: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: HouseIcon, to: "/dashboard" },
  { label: "Employees", icon: UsersIcon, to: "/employees" },
  { label: "Projects", icon: FolderOpenIcon, to: "/projects" },
  { label: "Planning", icon: CalendarDotsIcon, to: "/planning" },
  { label: "Settings", icon: GearIcon, to: "/settings" },
];

function SidebarLabel({
  collapsed,
  className,
  children,
}: {
  collapsed: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden={collapsed}
      className={cn(
        "min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-[opacity,transform] duration-200 ease-out",
        collapsed ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100 delay-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SidebarRow({
  leading,
  trailing,
  collapsed,
  className,
  children,
}: {
  leading: ReactNode;
  trailing?: ReactNode;
  collapsed: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex shrink-0 items-center justify-center" style={{ width: SQUARE, height: SQUARE }}>
        {leading}
      </div>
      {children}
      {!collapsed && trailing}
    </div>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0 items-center justify-center" style={{ width: SQUARE, height: SQUARE }}>
        <img src="/logo.svg" alt="Sentinel" className="size-10 rounded-xl bg-secondary-foreground p-2" />
      </div>
      <SidebarLabel collapsed={collapsed}>
        <span className="text-2xl font-bold leading-none tracking-tight text-sidebar-accent-foreground">Sentinel</span>
      </SidebarLabel>
    </div>
  );
}

function SidebarNavItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "group block rounded-xl transition-colors duration-200",
          isActive
            ? "bg-primary/30 text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )
      }
    >
      <SidebarRow collapsed={collapsed} leading={<Icon className="size-[18px]" weight="bold" />}>
        <SidebarLabel collapsed={collapsed} className="pr-3">
          <span className="text-sm font-medium leading-none">{item.label}</span>
        </SidebarLabel>
      </SidebarRow>
    </NavLink>
  );
}

function SidebarProfile({ collapsed }: { collapsed: boolean }) {
  return (
    <SidebarRow
      collapsed={collapsed}
      leading={
        <div
          className="flex size-10 items-center justify-center rounded-xl bg-secondary-foreground text-xs font-bold text-primary-foreground shadow-lg shadow-sidebar-primary/20"
          title={collapsed ? "Admin User · Manager" : undefined}
        >
          AD
        </div>
      }
      trailing={
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/40 transition-colors duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          aria-label="Account settings"
        >
          <Settings className="size-3.5" />
        </button>
      }
    >
      <SidebarLabel collapsed={collapsed}>
        <p className="truncate text-[13px] font-semibold leading-tight text-sidebar-accent-foreground">Admin User</p>
        <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground/40">Manager</p>
      </SidebarLabel>
    </SidebarRow>
  );
}

function SectionDivider({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-sidebar-border/40 to-transparent",
        position === "top" ? "top-0" : "bottom-0",
      )}
    />
  );
}

export default function Sidebar() {
  const { sidebarCollapsed: collapsed } = usePage();

  return (
    <aside
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border/60 bg-sidebar transition-[width] duration-300 ease-in-out"
      style={{ width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED }}
    >
      <header className="relative shrink-0 px-3.5 py-4">
        <SidebarBrand collapsed={collapsed} />
        <SectionDivider position="bottom" />
      </header>

      <nav className="flex-1 overflow-y-auto px-3.5 pt-4">
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-200",
            collapsed ? "max-h-0 opacity-0" : "max-h-8 opacity-100",
          )}
        >
          <p className="mb-2 pl-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Navigation
          </p>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <SidebarNavItem item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      <footer className="relative shrink-0 px-3.5 py-4">
        <SectionDivider position="top" />
        <SidebarProfile collapsed={collapsed} />
      </footer>
    </aside>
  );
}
