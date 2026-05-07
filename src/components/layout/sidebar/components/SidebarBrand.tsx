import { cn } from "@/lib/utils.ts";

export default function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0 items-center justify-center" style={{ width: 44, height: 44 }}>
        <img src="/logo.svg" alt="Sentinel" className="size-10 rounded-xl bg-secondary-foreground p-2" />
      </div>
      <div
        aria-hidden={collapsed}
        className={cn(
          "min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-[opacity,transform] duration-200 ease-out",
          collapsed ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100 delay-100",
        )}
      >
        <span className="text-2xl font-bold leading-none tracking-tight text-sidebar-accent-foreground">Sentinel</span>
      </div>
    </div>
  );
}
