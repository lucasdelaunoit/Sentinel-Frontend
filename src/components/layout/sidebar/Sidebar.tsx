import { cn } from "@/lib/utils.ts";
import { usePage } from "@/context/PageContext.tsx";
import { CalendarDotsIcon, FolderOpenIcon, GearIcon, HouseIcon, UsersIcon } from "@phosphor-icons/react";
import SidebarNavItem, { type SidebarNavItemData } from "@/components/layout/sidebar/components/SidebarNavItem.tsx";
import SidebarBrand from "@/components/layout/sidebar/components/SidebarBrand.tsx";
import SidebarProfile from "@/components/layout/sidebar/components/SidebarProfile.tsx";

const WIDTH_EXPANDED = 240;
const WIDTH_COLLAPSED = 72;

const navItems: SidebarNavItemData[] = [
  { label: "Dashboard", icon: HouseIcon, to: "/dashboard" },
  { label: "Employees", icon: UsersIcon, to: "/users" },
  { label: "Projects", icon: FolderOpenIcon, to: "/projects" },
  { label: "Planning", icon: CalendarDotsIcon, to: "/planning" },
  { label: "Settings", icon: GearIcon, to: "/settings" },
];

export default function Sidebar() {
  const { sidebarCollapsed: collapsed } = usePage();

  return (
    <aside
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border/60 bg-sidebar transition-[width] duration-300 ease-in-out"
      style={{ width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED }}
    >
      <header className="relative shrink-0 px-3.5 py-4">
        <SidebarBrand collapsed={collapsed} />
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
        <SidebarProfile collapsed={collapsed} />
      </footer>
    </aside>
  );
}
