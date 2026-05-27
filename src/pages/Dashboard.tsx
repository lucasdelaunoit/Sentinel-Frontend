import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, PlayCircle } from "lucide-react";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { Button } from "@/components/ui/button.tsx";
import HomeStatCardsSection from "@/components/specified/pages/home/HomeStatCardsSection.tsx";
import SinglePointsOfFailureCard from "@/components/specified/pages/home/SinglePointsOfFailureCard.tsx";
import VulnerableSkillsCard from "@/components/specified/pages/home/VulnerableSkillsCard.tsx";
import UpcomingRiskEventsCard from "@/components/specified/pages/home/UpcomingRiskEventsCard.tsx";
import ImportPlanningSheet from "@/components/specified/pages/home/ImportPlanningSheet.tsx";
import TeamStatusOfTodayCard from "@/components/specified/pages/home/TeamStatusOfTodayCard.tsx";
import KnowledgeCoverageOfToday from "@/components/specified/pages/home/KnowledgeCoverageOfToday.tsx";
import CriticalProjectsCard from "@/components/specified/pages/home/CriticalProjectsCard.tsx";

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
          <TeamStatusOfTodayCard />
          <KnowledgeCoverageOfToday />
          <CriticalProjectsCard />
        </div>

        <UpcomingRiskEventsCard />
        {/* Section 3 — Organizational Vulnerabilities */}

        <div className="grid grid-cols-2 gap-5 items-start">
          <SinglePointsOfFailureCard />
          <VulnerableSkillsCard />
        </div>

        {/* Section 4 — Upcoming Risk Events */}
      </div>

      <ImportPlanningSheet open={importSheetOpen} onOpenChange={setImportSheetOpen} />
    </>
  );
}
