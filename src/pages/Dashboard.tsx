import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, PlayCircle } from "lucide-react";

import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { Button } from "@/components/ui/button.tsx";
import HomeStatCardsSection from "@/components/specified/pages/home/HomeStatCardsSection.tsx";
import TeamTodayCard from "@/components/specified/pages/home/TeamTodayCard.tsx";
import KnowledgeCoverageCard from "@/components/specified/pages/home/KnowledgeCoverageCard.tsx";
import CriticalProjectsRiskCard from "@/components/specified/pages/home/CriticalProjectsRiskCard.tsx";
import SinglePointsOfFailureCard from "@/components/specified/pages/home/SinglePointsOfFailureCard.tsx";
import VulnerableSkillsCard from "@/components/specified/pages/home/VulnerableSkillsCard.tsx";
import UpcomingRiskEventsCard from "@/components/specified/pages/home/UpcomingRiskEventsCard.tsx";
import ProjectsRequiringAttentionCard from "@/components/specified/pages/home/ProjectsRequiringAttentionCard.tsx";
import ImportPlanningSheet from "@/components/specified/pages/home/ImportPlanningSheet.tsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [importSheetOpen, setImportSheetOpen] = useState(false);

  return (
    <>
      <TopBar
        title="Dashboard"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="font-semibold" size="lg" onClick={() => setImportSheetOpen(true)}>
              <CalendarCheck className="size-4" /> Import planning
            </Button>
            <Button onClick={() => navigate("/?simulate=true")} size="lg">
              <PlayCircle className="size-4" /> Simulate Leave
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* Section 1 — Executive Overview */}
        <HomeStatCardsSection />

        {/* Section 2 — Core Operational Insights */}
        <div className="grid grid-cols-3 gap-5 items-start">
          <TeamTodayCard />
          <KnowledgeCoverageCard />
          <CriticalProjectsRiskCard />
        </div>

        {/* Section 3 — Organizational Vulnerabilities */}
        <div className="grid grid-cols-2 gap-5 items-start">
          <SinglePointsOfFailureCard />
          <VulnerableSkillsCard />
        </div>

        {/* Section 4 — Upcoming Risk Events */}
        <UpcomingRiskEventsCard />

        {/* Section 5 — Projects Requiring Attention */}
        <ProjectsRequiringAttentionCard />
      </div>

      <ImportPlanningSheet open={importSheetOpen} onOpenChange={setImportSheetOpen} />
    </>
  );
}
