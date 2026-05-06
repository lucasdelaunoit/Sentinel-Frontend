import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, PlayCircle, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePage } from "@/context/PageContext";
import type { ReactNode } from "react";
import { SidebarIcon, SidebarSimpleIcon } from "@phosphor-icons/react";

interface TopBarProps {
  title: string;
  actions?: ReactNode;
}

export default function TopBar({ title, actions }: TopBarProps): ReactNode {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { title: contextTitle, breadcrumb: contextBreadcrumb, sidebarCollapsed, toggleSidebar } = usePage();

  const isHome = path === "/" || path === "/dashboard";
  const isEmployees = path === "/employees";
  const isProjects = path === "/projects";
  const isEmployeeDetail = /^\/employees\/[^/]+$/.test(path);
  const isProjectDetail = /^\/projects\/[^/]+$/.test(path);
  const isSettings = path === "/settings";

  let breadcrumb = "Overview";

  if (isHome) {
    breadcrumb = "Overview";
    title = "Today";
  } else if (isEmployees) {
    breadcrumb = "HR";
    title = "All Employees";
  } else if (isProjects) {
    breadcrumb = "Portfolio";
    title = "All Projects";
  } else if (isEmployeeDetail) {
    breadcrumb = contextBreadcrumb || "HR";
    title = contextTitle || "Employee Detail";
  } else if (isProjectDetail) {
    breadcrumb = contextBreadcrumb || "Portfolio";
    title = contextTitle || "Project Detail";
  } else if (isSettings) {
    breadcrumb = "Admin";
    title = "Settings";
  }

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
            <ChevronRight className="size-3 text-muted-foreground/40" />
            <span className="font-medium text-foreground/60">{breadcrumb}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground leading-tight tracking-tight mt-0.5">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isProjects && (
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10 btn-press"
            onClick={() => navigate("/projects?action=add")}
          >
            <PenSquare className="size-4" />
            New Project
          </Button>
        )}
        {isEmployeeDetail && (
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 text-[13px] font-medium rounded-xl shadow-sm shadow-primary/10 btn-press"
            onClick={() => navigate(`${path}?simulate=true`)}
          >
            <PlayCircle className="size-4" />
            Simulate Leave
          </Button>
        )}
        {actions}
      </div>
    </header>
  );
}
