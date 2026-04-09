import { useLocation } from "react-router-dom";
import {
  CalendarCheck,
  ChevronRight,
  PlayCircle,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  const location = useLocation();

  const PAGE_CONFIG: Record<string, { breadcrumb: string; title: string }> = {
    "/": { breadcrumb: "Overview", title: "Today" },
    "/dashboard": { breadcrumb: "Overview", title: "Today" },
    "/employees": { breadcrumb: "HR", title: "All Employees" },
    "/projects": { breadcrumb: "Portfolio", title: "All Projects" },
  };

  const config = PAGE_CONFIG[location.pathname] ?? {
    breadcrumb: "Sentinel",
    title: "Dashboard",
  };

  const isHome =
    location.pathname === "/" || location.pathname === "/dashboard";
  const isEmployees = location.pathname === "/employees";
  const isProjects = location.pathname === "/projects";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Sentinel</span>
          <ChevronRight className="size-3" />
          <span>{config.breadcrumb}</span>
        </div>
        <h1 className="text-xl font-bold text-foreground leading-tight">
          {config.title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {isEmployees && (
          <Button className="gap-2 bg-foreground text-background hover:bg-foreground/85 rounded-xl h-9 px-4 font-semibold">
            <PenSquare className="size-4" />
            Add a New Employee
          </Button>
        )}
        {isProjects && (
          <Button className="gap-2 bg-foreground text-background hover:bg-foreground/85 rounded-xl h-9 px-4 font-semibold">
            <PenSquare className="size-4" />
            New Project
          </Button>
        )}
        {isHome && (
          <>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm">
              <CalendarCheck className="size-3.5" />
              Import planning
            </Button>
            <Button className="gap-2 bg-foreground text-background hover:bg-foreground/85 h-9 px-5 text-sm font-medium">
              <PlayCircle className="size-4" />
              Simulate Leave
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
