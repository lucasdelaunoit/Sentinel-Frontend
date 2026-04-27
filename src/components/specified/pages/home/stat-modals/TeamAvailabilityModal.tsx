import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import StatDetailModal from "@/components/common/StatDetailModal"
import { Skeleton } from "@/components/ui/skeleton"
import useGetTeamAvailabilityDetail from "@/hooks/useGetTeamAvailabilityDetail"

interface Props {
  onClose: () => void
}

export default function TeamAvailabilityModal({ onClose }: Props) {
  const { data, isLoading } = useGetTeamAvailabilityDetail()

  return (
    <StatDetailModal title="Team Availability" onClose={onClose}>
      {isLoading ? (
        <TeamAvailabilitySkeleton />
      ) : !data ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Data unavailable</p>
      ) : data.absent_employees.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <Users className="size-8 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">Full team is available today</p>
          <p className="text-xs text-muted-foreground">No employees are currently on leave.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Employees currently on leave and their potential impact on active projects.
          </p>

          <div className="space-y-3">
            {data.absent_employees.map(emp => (
              <div key={emp.id} className="rounded-xl border border-border/60 p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                    {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{emp.name}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                    emp.criticality === "High"
                      ? "bg-rose-50 text-rose-600 border-rose-200/60"
                      : emp.criticality === "Medium"
                      ? "bg-amber-50 text-amber-600 border-amber-200/60"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200/60",
                  )}>
                    {emp.criticality}
                  </span>
                </div>

                {emp.projects.length > 0 && (
                  <p className="text-xs text-muted-foreground pl-11">
                    Active on:{" "}
                    <span className="text-foreground font-medium">{emp.projects.join(", ")}</span>
                  </p>
                )}

                {emp.skills.length > 0 && (
                  <div className="pl-11 flex flex-wrap gap-1">
                    {emp.skills.slice(0, 4).map(s => (
                      <span key={s} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                        {s}
                      </span>
                    ))}
                    {emp.skills.length > 4 && (
                      <span className="text-[10px] text-muted-foreground px-1 py-0.5">
                        +{emp.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {data.degraded_projects && data.degraded_projects.length > 0 && (
            <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 p-3 text-xs">
              <p className="font-semibold text-amber-700 mb-1">Degraded projects</p>
              <p className="text-amber-600">{data.degraded_projects.join(", ")}</p>
            </div>
          )}
        </>
      )}
    </StatDetailModal>
  )
}

function TeamAvailabilitySkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-3/4" />
      {[0, 1].map(i => (
        <div key={i} className="rounded-xl border border-border/60 p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
          <div className="pl-11 flex gap-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </>
  )
}
