import { useLocation } from "react-router-dom";
import {
  CalendarCheck,
  ChevronRight,
  PlayCircle,
  PenSquare,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  const location = useLocation();
  const path = location.pathname;

  const isHome = path === "/" || path === "/dashboard";
  const isEmployees = path === "/employees";
  const isProjects = path === "/projects";
  const isEmployeeDetail = path.startsWith("/employees/");
  const isProjectDetail = path.startsWith("/projects/");
  const isSettings = path === "/settings";

  let breadcrumb = "Sentinel";
  let title = "Dashboard";

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
    breadcrumb = "HR";
    title = "Employee Detail";
  } else if (isProjectDetail) {
    breadcrumb = "Portfolio";
    title = "Project Detail";
  } else if (isSettings) {
    breadcrumb = "Admin";
    title = "Settings";
  }

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-sm px-6">
      <div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
          <span className="font-medium">Sentinel</span>
          <ChevronRight className="size-3 text-muted-foreground/40" />
          <span className="font-medium text-foreground/60">{breadcrumb}</span>
        </div>
        <h1 className="text-[17px] font-semibold text-foreground leading-tight tracking-tight mt-0.5">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {isEmployees && (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10 btn-press">
            <PenSquare className="size-4" />
            Add a New Employee
          </Button>
        )}
        {isProjects && (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 px-4 text-[13px] font-medium shadow-sm shadow-primary/10 btn-press">
            <PenSquare className="size-4" />
            New Project
          </Button>
        )}
        {isHome && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-[12px] rounded-xl border-border/60 bg-card hover:bg-muted/50"
            >
              <CalendarCheck className="size-3.5" />
              Import planning
            </Button>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 text-[13px] font-medium rounded-xl shadow-sm shadow-primary/10 btn-press">
              <PlayCircle className="size-4" />
              Simulate Leave
            </Button>
          </>
        )}

        {/* Notification bell */}
        <button className="relative flex size-8 items-center justify-center rounded-xl text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="size-[18px]" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500" />
        </button>
      </div>
    </header>
  );
}
