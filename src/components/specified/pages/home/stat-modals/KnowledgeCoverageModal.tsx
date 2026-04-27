import { cn } from "@/lib/utils"
import StatDetailModal from "@/components/common/StatDetailModal"
import { Skeleton } from "@/components/ui/skeleton"
import useGetKnowledgeCoverageDetail from "@/hooks/useGetKnowledgeCoverageDetail"

interface Props {
  onClose: () => void
}

export default function KnowledgeCoverageModal({ onClose }: Props) {
  const { data, isLoading } = useGetKnowledgeCoverageDetail()

  return (
    <StatDetailModal title="Knowledge Coverage" onClose={onClose}>
      {isLoading ? (
        <KnowledgeCoverageSkeleton />
      ) : !data ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Data unavailable</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            % of team members with proficiency ≥ 3 per skill category. Below 70% is considered at risk.
          </p>

          <div className="space-y-3">
            {data.categories.map(cat => {
              const isWeak = cat.coverage_pct < 70
              return (
                <div key={cat.category_id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{cat.category_name}</span>
                    <div className="flex items-center gap-2">
                      {cat.siloed > 0 && (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full">
                          {cat.siloed} siloed
                        </span>
                      )}
                      <span className={cn("text-xs font-semibold", isWeak ? "text-rose-500" : "text-emerald-600")}>
                        {cat.coverage_pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isWeak ? "bg-rose-400" : "bg-emerald-500")}
                      style={{ width: `${cat.coverage_pct}%` }}
                    />
                  </div>
                  {cat.uncovered_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {cat.uncovered_skills.map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {cat.siloed_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {cat.siloed_skills.map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {data.most_fragile && (
            <div className="rounded-xl bg-muted/40 border border-border/60 p-3 text-xs">
              <p className="font-semibold mb-0.5">Most fragile area</p>
              <p className="text-muted-foreground">{data.most_fragile}</p>
            </div>
          )}
        </>
      )}
    </StatDetailModal>
  )
}

function KnowledgeCoverageSkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-full" />
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
      <Skeleton className="h-14 w-full rounded-xl" />
    </>
  )
}
