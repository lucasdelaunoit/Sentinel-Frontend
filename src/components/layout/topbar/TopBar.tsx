import { Button } from "@/components/ui/button.tsx";
import { usePage } from "@/context/PageContext.tsx";
import type { ReactNode } from "react";
import { CaretRightIcon, SidebarIcon, SidebarSimpleIcon } from "@phosphor-icons/react";

interface TopBarProps {
  title: string;
  breadcrumb?: string;
  actions?: ReactNode;
}

export default function TopBar({ title, breadcrumb = "ssss", actions }: TopBarProps): ReactNode {
  const { sidebarCollapsed, toggleSidebar } = usePage();

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="size-8 shrink-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <SidebarSimpleIcon className="size-5" /> : <SidebarIcon className="size-5" />}
        </Button>
        <div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="font-medium">Sentinel</span>
            <CaretRightIcon className="size-2.5 mb-0.5 text-muted-foreground" />
            <span className="font-medium text-foreground/60">{breadcrumb}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground leading-tight tracking-tight mt-0.5">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}
