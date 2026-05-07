import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils.ts";

export type SidebarNavItemData = {
  label: string;
  icon: PhosphorIcon;
  to: string;
};

export default function SidebarNavItem({ item, collapsed }: { item: SidebarNavItemData; collapsed: boolean }) {
  const ItemIcon = item.icon;
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
      <div className="flex items-center">
        <div className="flex shrink-0 items-center justify-center w-[42px] h-11">
          <ItemIcon className="size-[18px]" weight="bold" />
        </div>
        <div
          aria-hidden={collapsed}
          className={cn(
            "min-w-0 flex-1 overflow-hidden whitespace-nowrap pr-3 transition-[opacity,transform] duration-200 ease-out",
            collapsed ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100 delay-100",
          )}
        >
          <span className="text-sm font-medium leading-none">{item.label}</span>
        </div>
      </div>
    </NavLink>
  );
}
