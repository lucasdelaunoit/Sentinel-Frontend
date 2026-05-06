import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import StatCard from "@/components/common/cards/StatCard";
import useGetDashboardStats from "@/hooks/useGetDashboardStats";
import ProjectsAtRiskModal from "@/components/specified/pages/home/stat-modals/ProjectsAtRiskModal";
import KnowledgeCoverageModal from "@/components/specified/pages/home/stat-modals/KnowledgeCoverageModal";
import TeamAvailabilityModal from "@/components/specified/pages/home/stat-modals/TeamAvailabilityModal";
import AbsenceImpactModal from "@/components/specified/pages/home/stat-modals/AbsenceImpactModal";
import { ChartPolarIcon, LightningIcon, UserIcon, WarningIcon } from "@phosphor-icons/react";

type ModalKey = "risk" | "coverage" | "availability" | "impact";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "text-destructive-foreground",
  warning: "text-amber-500",
  ok: "text-emerald-600",
};

export default function HomeStatCardsSection() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const [modalOpen, setModalOpen] = useState<ModalKey | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Projects at Risk"
          value={stats ? String(stats.projects_at_risk.value) : "—"}
          icon={WarningIcon}
          onClick={() => setModalOpen("risk")}
          isLoading={statsLoading}
          comment={
            <div
              className={cn(
                "text-sm flex items-center gap-1",
                stats ? SEVERITY_COLOR[stats.projects_at_risk.severity] : "text-secondary-foreground",
              )}
            >
              <ArrowRightIcon size={13} />
              <span className="font-semibold">{stats?.projects_at_risk.insight ?? "Unavailable"}</span>
            </div>
          }
        />
        <StatCard
          title="Knowledge Coverage"
          value={stats ? `${stats.knowledge_coverage.value}%` : "—"}
          icon={ChartPolarIcon}
          onClick={() => setModalOpen("coverage")}
          isLoading={statsLoading}
          comment={
            <div
              className={cn(
                "text-sm flex items-center gap-1",
                stats ? SEVERITY_COLOR[stats.knowledge_coverage.severity] : "text-secondary-foreground",
              )}
            >
              <ArrowRightIcon size={13} />
              <span className="font-semibold">{stats?.knowledge_coverage.insight ?? "Unavailable"}</span>
            </div>
          }
        />
        <StatCard
          title="Team Availability"
          value={stats ? stats.team_availability.value : "—"}
          icon={UserIcon}
          onClick={() => setModalOpen("availability")}
          isLoading={statsLoading}
          comment={
            <div
              className={cn(
                "text-sm flex items-center gap-1",
                stats ? SEVERITY_COLOR[stats.team_availability.severity] : "text-secondary-foreground",
              )}
            >
              <ArrowRightIcon size={13} />
              <span className="font-semibold">{stats?.team_availability.insight ?? "Unavailable"}</span>
            </div>
          }
        />
        <StatCard
          title="Absence Impact"
          value={stats ? String(stats.absence_impact.value) : "—"}
          icon={LightningIcon}
          onClick={() => setModalOpen("impact")}
          isLoading={statsLoading}
          comment={
            <div
              className={cn(
                "text-sm flex items-center gap-1",
                stats ? SEVERITY_COLOR[stats.absence_impact.severity] : "text-secondary-foreground",
              )}
            >
              <ArrowRightIcon size={13} />
              <span className="font-semibold">{stats?.absence_impact.insight ?? "Unavailable"}</span>
            </div>
          }
        />
      </div>

      {modalOpen === "risk" && <ProjectsAtRiskModal onClose={() => setModalOpen(null)} />}
      {modalOpen === "coverage" && <KnowledgeCoverageModal onClose={() => setModalOpen(null)} />}
      {modalOpen === "availability" && <TeamAvailabilityModal onClose={() => setModalOpen(null)} />}
      {modalOpen === "impact" && <AbsenceImpactModal onClose={() => setModalOpen(null)} />}
    </>
  );
}
