import { Button } from "@/components/ui/button.tsx";
import { usePage } from "@/context/PageContext.tsx";
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CaretRightIcon, SidebarIcon, SidebarSimpleIcon } from "@phosphor-icons/react";

export interface Crumb {
  label: string;
  to?: string;
}

interface TopBarProps {
  title: ReactNode;
  breadcrumb?: Crumb[];
  actions?: ReactNode;
}

const ROOT_CRUMB: Crumb = { label: "Sentinel", to: "/dashboard" };

export default function TopBar({ title, breadcrumb = [], actions }: TopBarProps): ReactNode {
  const { sidebarCollapsed, toggleSidebar } = usePage();

  const crumbs: Crumb[] = [ROOT_CRUMB, ...breadcrumb];

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
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && <CaretRightIcon className="size-2.5 mb-0.5 text-muted-foreground" />}
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to} className="font-medium transition-colors hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "font-medium text-foreground/60" : "font-medium"}>{crumb.label}</span>
                  )}
                </Fragment>
              );
            })}
          </div>
          <h1 className="text-xl font-bold text-foreground leading-tight tracking-tight mt-0.5">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}
