import { useState } from "react";
import StatCardView from "@/components/common/cards/StatCardView";
import useGetDashboardStats from "@/hooks/useGetDashboardStats";
import ProjectsAtRiskModal from "@/components/specified/pages/home/stat-modals/ProjectsAtRiskModal";
import KnowledgeCoverageModal from "@/components/specified/pages/home/stat-modals/KnowledgeCoverageModal";
import TeamAvailabilityModal from "@/components/specified/pages/home/stat-modals/TeamAvailabilityModal";
import AbsenceImpactModal from "@/components/specified/pages/home/stat-modals/AbsenceImpactModal";
import { ChartPolarIcon, LightningIcon, UserIcon, WarningIcon } from "@phosphor-icons/react";

type ModalKey = "risk" | "coverage" | "availability" | "impact";

export default function HomeStatCardsSection() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const [modalOpen, setModalOpen] = useState<ModalKey | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCardView
          title="Fragile Projects"
          icon={WarningIcon}
          card={stats?.fragile_projects}
          isLoading={isLoading}
          onClick={() => setModalOpen("risk")}
        />
        <StatCardView
          title="Knowledge Coverage"
          icon={ChartPolarIcon}
          card={stats?.knowledge_coverage}
          isLoading={isLoading}
          onClick={() => setModalOpen("coverage")}
        />
        <StatCardView
          title="Team Availability"
          icon={UserIcon}
          card={stats?.team_availability}
          isLoading={isLoading}
          onClick={() => setModalOpen("availability")}
        />
        <StatCardView
          title="Absence Impact"
          icon={LightningIcon}
          card={stats?.absence_impact}
          isLoading={isLoading}
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
