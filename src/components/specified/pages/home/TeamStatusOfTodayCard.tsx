import {cn} from "@/lib/utils.ts";
import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";
import {useMemo} from "react";
import {EMPLOYEE_DETAILS} from "@/data/employees.ts";

export default function TeamStatusOfTodayCard() {
  const employees = useMemo(() => Object.values(EMPLOYEE_DETAILS), []);


  const statusEvents = [...employees]
    .sort((a, b) => {
      const order: Record<string, number> = { "Has Leave": 0, Remote: 1, Available: 2 };
      return order[a.todayStatus] - order[b.todayStatus];
    })
    .slice(0, 4)
    .map(e => ({
      type: e.todayStatus === "Has Leave" ? "leave" : e.todayStatus === "Remote" ? "remote" : "available",
      name: e.name,
      role: e.role,
      initials: e.initials,
      time: e.todayStatus === "Has Leave" ? "On leave" : e.todayStatus === "Remote" ? "Remote" : "Available",
    }));

  const teamAvailable = employees.filter(e => e.todayStatus !== "Has Leave").length;
  const onLeaveCount = employees.filter(e => e.todayStatus === "Has Leave").length;

  return (
    <Card className="p-5">
      <CardTitle>Today's Team Status</CardTitle>
      <CardContent>
        <div className="space-y-3">
          {statusEvents.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
                  e.type === "leave"
                    ? "bg-gradient-to-br from-rose-400 to-rose-500"
                    : e.type === "remote"
                      ? "bg-gradient-to-br from-blue-400 to-blue-500"
                      : "bg-gradient-to-br from-emerald-400 to-emerald-500",
                )}
              >
                {e.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.role}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  e.type === "leave" ? "text-rose-600 bg-rose-50" : e.type === "remote" ? "text-blue-600 bg-blue-50" : "text-emerald-600 bg-emerald-50",
                )}
              >
                    {e.time}
                  </span>
            </div>
          ))}
        </div>
        {/* Capacity bar */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Capacity</span>
            <span className="text-[11px] font-semibold text-foreground">{Math.round((teamAvailable / employees.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm transition-all"
              style={{ width: `${(teamAvailable / employees.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{teamAvailable} available</span>
            <span className="text-[10px] text-muted-foreground">{onLeaveCount} on leave</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}