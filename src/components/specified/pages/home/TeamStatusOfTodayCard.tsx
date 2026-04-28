import { cn } from "@/lib/utils.ts";
import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import { useMemo, useState } from "react";
import { EMPLOYEE_DETAILS } from "@/data/employees.ts";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart.tsx";
import { RadialBarChart, RadialBar } from "recharts";

type SheetFilter = "all" | "available" | "remote" | "leave";

function CapacityDonut({ percent }: { percent: number }) {
  const color = percent >= 80 ? "#097155" : percent >= 60 ? "#f59e0b" : "#ef4444";
  const data = [{ value: percent, fill: color }];
  const config = { value: { label: "Capacity" } } satisfies ChartConfig;
  const endAngle = 90 - (percent / 100) * 360;

  return (
    <ChartContainer
      config={config}
      className="aspect-square size-5"
      initialDimension={{ width: 28, height: 28 }}
    >
      <RadialBarChart data={data} startAngle={90} endAngle={endAngle} innerRadius={6} outerRadius={10}>
        <RadialBar dataKey="value" cornerRadius={3} />
      </RadialBarChart>
    </ChartContainer>
  );
}

const STATUS_STYLES = {
  leave: { avatar: "bg-destructive-foreground", badge: "text-rose-600 bg-rose-50", label: "On leave" },
  remote: { avatar: "bg-gradient-to-br from-blue-400 to-blue-500", badge: "text-blue-600 bg-blue-50", label: "Remote" },
  available: { avatar: "bg-primary", badge: "text-emerald-600 bg-emerald-50", label: "Available" },
} as const;

type StatusType = keyof typeof STATUS_STYLES;

function toType(status: string): StatusType {
  if (status === "Has Leave") return "leave";
  if (status === "Remote") return "remote";
  return "available";
}

const FILTER_LABELS: Record<SheetFilter, string> = {
  all: "All",
  available: "Available",
  remote: "Remote",
  leave: "On Leave",
};

const FILTER_ACTIVE: Record<SheetFilter, string> = {
  all: "bg-foreground text-background",
  available: "bg-emerald-500 text-white",
  remote: "bg-blue-500 text-white",
  leave: "bg-rose-500 text-white",
};

export default function TeamStatusOfTodayCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<SheetFilter>("all");

  const employees= useMemo(() => Object.values(EMPLOYEE_DETAILS), []);
  const absent = employees.filter(e => e.todayStatus !== "Available");
  const availableCount = employees.filter(e => e.todayStatus !== "Has Leave").length;
  const capacityPct = Math.round((availableCount / employees.length) * 100);

  const filteredEmployees = useMemo(() => {
    const byStatus = employees.filter(e => {
      if (filter === "available") return e.todayStatus === "Available";
      if (filter === "remote")    return e.todayStatus === "Remote";
      if (filter === "leave")     return e.todayStatus === "Has Leave";
      return true;
    });
    if (!search.trim()) return byStatus;
    const q = search.toLowerCase();
    return byStatus.filter(e =>
      e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)
    );
  }, [employees, filter, search]);

  return (
    <>
      <Card className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <CardTitle>Today's Team Status</CardTitle>
          <div className="flex items-center gap-2 text-secondary-foreground">
            <span><span className="text-sm font-semibold tabular-nums">{capacityPct}%</span> present</span>
            <CapacityDonut percent={capacityPct} />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="h-full">
            {absent.length === 0 ? (
              <div className="py-7 text-center">
                <p className="text-sm font-semibold text-emerald-600">All hands on deck</p>
                <p className="text-xs text-muted-foreground mt-0.5">Everyone is available today</p>
              </div>
            ) : (
              <div className="space-y-1">
                {absent.map(e => {
                  const s = STATUS_STYLES[toType(e.todayStatus)];
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary cursor-pointer transition-colors">
                      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm", s.avatar)}>
                        {e.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.role}</p>
                      </div>
                      <span className={cn("shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full", s.badge)}>
                      {s.label}
                    </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setSheetOpen(true)}
            className="mt-3 w-full py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            View full team →
          </button>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-[360px]">
          <SheetHeader className="p-5 pb-4 border-b border-border/40">
            <SheetTitle>Full Team</SheetTitle>
            <SheetDescription>
              {employees.length} members · {availableCount} available today
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-3 border-b border-border/40">
            <Input
              placeholder="Search by name or role…"
              value={search}
              onChange={ev => setSearch(ev.target.value)}
              className="h-8 text-sm"
            />
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "available", "remote", "leave"] as SheetFilter[]).map(f => (
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
            {filteredEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No results</p>
            ) : filteredEmployees.map(e => {
              const s = STATUS_STYLES[toType(e.todayStatus)];
              return (
                <div key={e.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm", s.avatar)}>
                    {e.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.role}</p>
                  </div>
                  <span className={cn("shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full", s.badge)}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
