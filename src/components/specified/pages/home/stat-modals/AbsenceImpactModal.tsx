import { BookOpen } from "lucide-react"
import StatDetailModal from "@/components/common/StatDetailModal"
import { Skeleton } from "@/components/ui/skeleton"
import useGetAbsenceImpactDetail from "@/hooks/useGetAbsenceImpactDetail"

interface Props {
  onClose: () => void
}

export default function AbsenceImpactModal({ onClose }: Props) {
  const { data, isLoading } = useGetAbsenceImpactDetail()

  return (
    <StatDetailModal title="Absence Impact" onClose={onClose}>
      {isLoading ? (
        <AbsenceImpactSkeleton />
      ) : !data ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Data unavailable</p>
      ) : data.uncovered_skills.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <BookOpen className="size-8 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">No skills became uncovered</p>
          <p className="text-xs text-muted-foreground">All skills have at least one available backup today.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Skills with zero available coverage due to today's absences.
          </p>

          <div className="space-y-3">
            {data.uncovered_skills.map(skill => (
              <div key={skill.skill_id} className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{skill.skill_name}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-600 border-rose-200/60 shrink-0">
                    0 coverage
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <p className="text-muted-foreground">
                    Was covered by:{" "}
                    <span className="text-foreground font-medium">{skill.previously_covered_by}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Required by:{" "}
                    <span className="text-foreground font-medium">{skill.required_by_project}</span>
                  </p>
                  {skill.before_status && (
                    <p className="text-muted-foreground">
                      Prior status:{" "}
                      <span className="text-foreground font-medium capitalize">{skill.before_status}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </StatDetailModal>
  )
}

function AbsenceImpactSkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-3/4" />
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-xl border border-border/60 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </>
  )
}
