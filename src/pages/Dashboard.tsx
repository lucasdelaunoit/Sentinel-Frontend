import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheckIcon, PlayCircleIcon } from "@phosphor-icons/react";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { Button } from "@/components/ui/button.tsx";
import SyncStatusCard from "@/components/common/cards/SyncStatusCard.tsx";
import useGetDashboardSyncStatus from "@/api/dashboard/useGetDashboardSyncStatus";
import useTriggerFullRecalculation from "@/api/dashboard/useTriggerFullRecalculation";
import HomeStatCardsSection from "@/components/specified/pages/home/HomeStatCardsSection.tsx";
import UpcomingRiskEventsCard from "@/components/specified/pages/home/UpcomingRiskEventsCard.tsx";
import ImportPlanningSheet from "@/components/specified/pages/home/ImportPlanningSheet.tsx";
import TeamStatusOfTodayCard from "@/components/specified/pages/home/TeamStatusOfTodayCard.tsx";
import KnowledgeCoverageOfToday from "@/components/specified/pages/home/KnowledgeCoverageOfToday.tsx";
import CriticalProjectsCard from "@/components/specified/pages/home/CriticalProjectsCard.tsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [importSheetOpen, setImportSheetOpen] = useState(false);

  const { data: syncStatus, isLoading: isLoadingSync } = useGetDashboardSyncStatus();
  const { triggerFullRecalculation, isLoading: isRecalculating } = useTriggerFullRecalculation();

  return (
    <>
      <TopBar
        title="Dashboard"
        actions={
          <div className="flex gap-2">
            {isLoadingSync ? (
              <SyncStatusCard.Skeleton />
            ) : (
              <SyncStatusCard
                status={syncStatus}
                isRecalculating={isRecalculating}
                onRecalculate={() => triggerFullRecalculation().catch(() => {})}
              />
            )}
            <Button variant="outline" className="font-semibold" size="lg" onClick={() => setImportSheetOpen(true)}>
              <CalendarCheckIcon className="size-4" /> Import planning
            </Button>
            <Button onClick={() => navigate("/planning")} size="lg">
              <PlayCircleIcon className="size-4" /> Simulate Leave
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        <HomeStatCardsSection />

        <div className="grid grid-cols-3 gap-5 items-stretch">
          <TeamStatusOfTodayCard />
          <KnowledgeCoverageOfToday />
          <CriticalProjectsCard />
        </div>

        <UpcomingRiskEventsCard />
      </div>

      <ImportPlanningSheet open={importSheetOpen} onOpenChange={setImportSheetOpen} />
    </>
  );
}
