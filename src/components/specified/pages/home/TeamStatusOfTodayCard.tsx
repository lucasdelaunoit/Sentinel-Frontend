import { cn } from "@/lib/utils.ts";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart.tsx";
import { RadialBarChart, RadialBar } from "recharts";
import useGetEmployees from "@/api/employees/useGetEmployees.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Feedback from "@/components/layout/Feedback";
import useGetTeamToday from "@/api/employees/useGetTeamToday.ts";

type SheetFilter = "all" | "available" | "remote";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CapacityDonut({ percent }: { percent: number }) {
  const color = percent >= 80 ? "#097155" : percent >= 60 ? "#f59e0b" : "#ef4444";
  const data = [{ value: percent, fill: color }];
  const config = { value: { label: "Capacity" } } satisfies ChartConfig;
  const endAngle = 90 - (percent / 100) * 360;

  return (
    <ChartContainer config={config} className="aspect-square size-5" initialDimension={{ width: 28, height: 28 }}>
      <RadialBarChart data={data} startAngle={90} endAngle={endAngle} innerRadius={6} outerRadius={10}>
        <RadialBar dataKey="value" cornerRadius={3} />
      </RadialBarChart>
    </ChartContainer>
  );
}

const STATUS_STYLES = {
  leave: {
    avatar: "bg-destructive-foreground",
    badge: "text-rose-600 bg-rose-50",
    label: "On leave",
  },
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
} as const;

type StatusType = keyof typeof STATUS_STYLES;

function toTypeFromCard(status: string): StatusType {
  if (status === "Has Leave") return "leave";
  if (status === "Remote") return "remote";
  return "available";
}

function toTypeFromRemote(isRemote: boolean): StatusType {
  return isRemote ? "remote" : "available";
}

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

export default function TeamStatusOfTodayCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SheetFilter>("all");

  const { data, isLoading } = useGetTeamToday();

  const isRemoteFilter = FILTER_IS_REMOTE[filter];
  const { data: employeesPage, isLoading: isSheetLoading } = useGetEmployees(
    {
      search,
      filters: isRemoteFilter !== undefined ? [{ field: "is_remote", value: isRemoteFilter }] : [],
      per_page: 100,
    },
    sheetOpen,
  );

  const cardEmployees = data?.employees ?? [];
  const capacityPct = data?.capacity_pct ?? 0;
  const total = data?.total ?? 0;
  const availableCount = Math.round((capacityPct / 100) * total);

  const sheetEmployees = employeesPage?.data ?? [];

  return (
    <>
      <Card className="p-5 flex flex-col">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Team Status</CardTitle>
          <div className="flex items-center gap-2 text-secondary-foreground">
            <span className="text-xs">
              <span className="font-semibold tabular-nums">{capacityPct}%</span> present
            </span>
            <CapacityDonut percent={capacityPct} />
          </div>
        </div>

        <CardContent className="p-0 flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <TeamStatusSkeleton />
            ) : cardEmployees.length === 0 ? (
              <Feedback variant="success" title="All hands on deck" description="Everyone is available today" />
            ) : (
              <div className="space-y-1">
                {cardEmployees.map((e) => {
                  const s = STATUS_STYLES[toTypeFromCard(e.today_status)];
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
                          {e.initials}
                        </div>
                      }
                      title={e.name}
                      description={e.role}
                      action={
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", s.badge)}>
                          {s.label}
                        </span>
                      }
                      className="hover:bg-secondary p-1.5"
                    />
                  );
                })}
              </div>
            )}
          </div>

          <SecondaryButton label="View full team →" onClick={() => setSheetOpen(true)} />
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-[360px]">
          <SheetHeader className="p-5 pb-4 border-b border-border/40">
            <SheetTitle>Full Team</SheetTitle>
            <SheetDescription>
              {total} members · {availableCount} available today
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-3 border-b border-border/40">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {isSheetLoading ? (
              <TeamStatusSkeleton />
            ) : sheetEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No results</p>
            ) : (
              sheetEmployees.map((e) => {
                const s = STATUS_STYLES[toTypeFromRemote(e.is_remote)];
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
        </SheetContent>
      </Sheet>
    </>
  );
}
