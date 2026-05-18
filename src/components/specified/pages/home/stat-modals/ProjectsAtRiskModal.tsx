import { useNavigate } from "react-router-dom"
import { ArrowRight, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import StatDetailModal from "@/components/common/StatDetailModal"
import { Skeleton } from "@/components/ui/skeleton"
import useGetProjectsAtRiskDetail from "@/hooks/useGetProjectsAtRiskDetail"
import { getFragilityTier, getTrajectoryTier, TONE_TEXT, TONE_BG } from "@/lib/scoring"

interface Props {
  onClose: () => void
}

export default function ProjectsAtRiskModal({ onClose }: Props) {
  const navigate = useNavigate()
  const { data, isLoading } = useGetProjectsAtRiskDetail()

  return (
    <StatDetailModal title="Fragile Projects" onClose={onClose}>
      {isLoading ? (
        <ProjectsAtRiskSkeleton />
      ) : !data ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Data unavailable</p>
      ) : data.critical.length === 0 && data.unstable.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <ShieldAlert className="size-8 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">All projects are healthy</p>
          <p className="text-xs text-muted-foreground">No critical or unstable projects at this time.</p>
        </div>
      ) : (
        [
          ...data.critical.map(p => ({ ...p, tag: "Critical" as const })),
          ...data.unstable.map(p => ({ ...p, tag: "Unstable" as const })),
        ].map(p => (
          <div key={p.id} className="rounded-xl border border-border/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm">{p.name}</p>
              <span className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                p.tag === "Critical"
                  ? "bg-rose-50 text-rose-600 border-rose-200/60"
                  : "bg-orange-50 text-orange-600 border-orange-200/60",
              )}>
                {p.tag}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-0.5">Fragility</p>
                <p className={cn("font-semibold", TONE_TEXT[getFragilityTier(p.risk_score).tone])}>
                  {getFragilityTier(p.risk_score).label}
                  <span className="ml-1 tabular-nums opacity-70">{p.risk_score}</span>
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Bus Factor</p>
                <p className={cn("font-semibold", p.bus_factor === 1 ? "text-danger" : "text-warning")}>
                  {p.bus_factor}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Trajectory</p>
                <p className={cn("font-semibold", TONE_TEXT[getTrajectoryTier(p.health).tone])}>
                  {getTrajectoryTier(p.health).label}
                  <span className="ml-1 tabular-nums opacity-70">{p.health}</span>
                </p>
              </div>
            </div>

            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", TONE_BG[getTrajectoryTier(p.health).tone])}
                style={{ width: `${p.health}%` }}
              />
            </div>

            {p.missing_skills.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Missing skills</p>
                <div className="flex flex-wrap gap-1">
                  {p.missing_skills.map(s => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {p.siloed_skills.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Siloed skills</p>
                <div className="flex flex-wrap gap-1">
                  {p.siloed_skills.map(s => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { onClose(); navigate(`/projects/${p.id}`) }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              View project details <ArrowRight className="size-3" />
            </button>
          </div>
        ))
      )}
    </StatDetailModal>
  )
}

function ProjectsAtRiskSkeleton() {
  return (
    <>
      {[0, 1].map(i => (
        <div key={i} className="rounded-xl border border-border/60 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
            <Skeleton className="h-8 rounded-lg" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </>
  )
}
