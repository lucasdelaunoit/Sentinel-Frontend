import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useAuth } from "@/context/AuthContext";
import { getFullName, getInitials } from "@/utils/formatters/persons";

export default function SidebarProfile({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const displayName = user ? getFullName(user) : "Guest";
  const subtitle = user?.email ?? "Not signed in";
  const initials = user ? getInitials(user) : "·";

  return (
    <NavLink
      to="/profile"
      title={collapsed ? `${displayName} · ${subtitle}` : undefined}
      className={({ isActive }) =>
        cn(
          "group flex w-full items-center gap-2 rounded-xl outline-none transition-colors",
          isActive ? "bg-sidebar-accent/60" : "hover:bg-sidebar-accent/50 focus-visible:bg-sidebar-accent/50",
        )
      }
    >
      <div className="flex shrink-0 items-center justify-center w-11 h-11">
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary-foreground text-xs font-bold text-primary-foreground shadow-lg shadow-sidebar-primary/20">
          {initials}
        </div>
      </div>
      <div
        aria-hidden={collapsed}
        className={cn(
          "min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left transition-[opacity,transform] duration-200 ease-out",
          collapsed ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100 delay-100",
        )}
      >
        <p className="truncate text-[13px] font-semibold leading-tight text-sidebar-accent-foreground">{displayName}</p>
        <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground/40">{subtitle}</p>
      </div>
      {!collapsed && (
        <ChevronRight className="mr-2 size-4 shrink-0 text-sidebar-foreground/40 transition-transform group-hover:translate-x-0.5" />
      )}
    </NavLink>
  );
}
