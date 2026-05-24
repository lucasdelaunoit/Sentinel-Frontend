import { useState } from "react";
import StatCard from "@/components/common/cards/StatCard";
import useGetDashboardStats from "@/hooks/useGetDashboardStats";
import ProjectsAtRiskModal from "@/components/specified/pages/home/stat-modals/ProjectsAtRiskModal";
import KnowledgeCoverageModal from "@/components/specified/pages/home/stat-modals/KnowledgeCoverageModal";
import TeamAvailabilityModal from "@/components/specified/pages/home/stat-modals/TeamAvailabilityModal";
import AbsenceImpactModal from "@/components/specified/pages/home/stat-modals/AbsenceImpactModal";
import { ChartPolarIcon, LightningIcon, UserIcon, WarningIcon } from "@phosphor-icons/react";

type ModalKey = "risk" | "coverage" | "availability" | "impact";

export default function HomeStatCardsSection() {
  const { data: dashboardStatsData, isLoading } = useGetDashboardStats();
  const [modalOpen, setModalOpen] = useState<ModalKey | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Fragile Projects"
          icon={WarningIcon}
          card={dashboardStatsData?.fragile_projects}
          isLoading={isLoading || !dashboardStatsData}
          onClick={() => setModalOpen("risk")}
        />
        <StatCard
          title="Knowledge Coverage"
          icon={ChartPolarIcon}
          card={dashboardStatsData?.knowledge_coverage}
          isLoading={isLoading || !dashboardStatsData}
          onClick={() => setModalOpen("coverage")}
        />
        <StatCard
          title="Team Availability"
          icon={UserIcon}
          card={dashboardStatsData?.team_availability}
          isLoading={isLoading || !dashboardStatsData}
          onClick={() => setModalOpen("availability")}
        />
        <StatCard
          title="Absence Impact"
          icon={LightningIcon}
          card={dashboardStatsData?.absence_impact}
          isLoading={isLoading || !dashboardStatsData}
          onClick={() => setModalOpen("impact")}
        />
      </div>

      {modalOpen === "risk" && <ProjectsAtRiskModal onClose={() => setModalOpen(null)} />}
      {modalOpen === "coverage" && <KnowledgeCoverageModal onClose={() => setModalOpen(null)} />}
      {modalOpen === "availability" && <TeamAvailabilityModal onClose={() => setModalOpen(null)} />}
      {modalOpen === "impact" && <AbsenceImpactModal onClose={() => setModalOpen(null)} />}
    </>
  );
}
