import { useState } from "react";
import { cn } from "@/lib/utils";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SecondaryCard from "@/components/common/cards/SecondaryCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useGetTeamToday from "@/api/employees/useGetTeamToday";
import useGetEmployees from "@/api/employees/useGetEmployees";

type SheetFilter = "all" | "available" | "remote";

type StatusType = "available" | "remote";

const STATUS_STYLES: Record<StatusType, { avatar: string; badge: string; label: string }> = {
  remote: {
    avatar: "bg-gradient-to-br from-blue-400 to-blue-500",
    badge: "text-blue-600 bg-blue-50",
    label: "Remote",
  },
  available: {
    avatar: "bg-primary",
    badge: "text-emerald-600 bg-emerald-50",
    label: "Available",
  },
};

const FILTER_LABELS: Record<SheetFilter, string> = {
  all: "All",
  available: "On-site",
  remote: "Remote",
};

const FILTER_ACTIVE: Record<SheetFilter, string> = {
  all: "bg-foreground text-background",
  available: "bg-emerald-500 text-white",
  remote: "bg-blue-500 text-white",
};

const FILTER_IS_REMOTE: Record<SheetFilter, boolean | undefined> = {
  all: undefined,
  available: false,
  remote: true,
};

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function toStatus(isRemote: boolean): StatusType {
  return isRemote ? "remote" : "available";
}

function TeamStatusSkeleton() {
  return (
    <div className="space-y-1 py-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-1.5 rounded-xl">
          <Skeleton className="size-8 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface EmployeesTodayStatusSheetProps {
  trigger?: React.ReactNode;
}

export default function EmployeesTodayStatusSheet({ trigger }: EmployeesTodayStatusSheetProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SheetFilter>("all");

  const { data } = useGetTeamToday();

  const isRemoteFilter = FILTER_IS_REMOTE[filter];
  const { data: employeesPage, isLoading } = useGetEmployees(
    {
      search,
      filters: isRemoteFilter !== undefined ? [{ field: "is_remote", value: isRemoteFilter }] : [],
      per_page: 100,
    },
  );

  const total = data?.total ?? 0;
  const capacityPct = data?.capacity_pct ?? 0;
  const availableCount = Math.round((capacityPct / 100) * total);
  const employees = employeesPage?.data ?? [];

  return (
    <ComposedSheet
      trigger={trigger}
      title="Full Team"
      description={`${total} members · ${availableCount} available today`}
      subheader={
        <div className="space-y-3">
          <Input
            placeholder="Search by name or title…"
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
            className="h-8 text-sm"
          />
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "available", "remote"] as SheetFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors",
                  filter === f ? FILTER_ACTIVE[f] : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-1">
        {isLoading ? (
          <TeamStatusSkeleton />
        ) : employees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No results</p>
        ) : (
          employees.map((e) => {
            const s = STATUS_STYLES[toStatus(e.is_remote)];
            return (
              <SecondaryCard
                key={e.id}
                before={
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
                      s.avatar,
                    )}
                  >
                    {initials(e.name)}
                  </div>
                }
                title={e.name}
                description={e.title}
                action={
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", s.badge)}>
                    {s.label}
                  </span>
                }
              />
            );
          })
        )}
      </div>
    </ComposedSheet>
  );
}
