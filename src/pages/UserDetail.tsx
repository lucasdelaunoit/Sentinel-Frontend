import { useEffect } from "react";
import { useTabParam } from "@/hooks/useTabParam";
import { useParams, useNavigate } from "react-router-dom";
import { usePage } from "@/context/PageContext";
import { SquaresFourIcon, FolderIcon, CertificateIcon, CalendarDotsIcon } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import useGetUser from "@/api/user/useGetUser";
import useGetUserStats from "@/api/user/useGetUserStats";
import useGetUserSyncStatus from "@/api/user/useGetUserSyncStatus";
import useTriggerUserRecalculation from "@/api/user/useTriggerUserRecalculation";
import SyncStatusCard from "@/components/common/cards/SyncStatusCard.tsx";
import UserProfileCard from "@/components/specified/pages/user/UserProfileCard.tsx";
import UserStatsSection from "@/components/specified/pages/user/UserStatsSection.tsx";
import UserOverviewTab from "@/components/specified/pages/user/UserOverviewTab.tsx";
import UserAbsencesTab from "@/components/specified/pages/user/UserAbsencesTab.tsx";
import UserProjectsTab from "@/components/specified/pages/user/UserProjectsTab.tsx";
import UserSkillsTab from "@/components/specified/pages/user/UserSkillsTab.tsx";

const USER_TABS = ["overview", "projects", "skills", "absences"] as const;

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setTitle, setBreadcrumb } = usePage();
  const [activeTab, setActiveTab] = useTabParam("overview", USER_TABS);

  const { data: user, isLoading, isError } = useGetUser(id);
  const { data: stats, isLoading: isLoadingStats } = useGetUserStats(id);
  const { data: syncStatus, isLoading: isLoadingSync } = useGetUserSyncStatus(id);
  const { triggerUserRecalculation, isLoading: isRecalculating } = useTriggerUserRecalculation();

  useEffect(() => {
    if (user) {
      setTitle(`${user.firstname} ${user.lastname}`);
      setBreadcrumb("HR");
    }
    return () => {
      setTitle("");
      setBreadcrumb("");
    };
  }, [user?.id]);

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Feedback
          variant="danger"
          title="Employee not found"
          description="This employee doesn't exist or was removed."
          action={
            <Button variant="link" size="sm" onClick={() => navigate("/users")}>
              Back to employees
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <TopBar
        title={isLoading ? <Skeleton className="h-6 w-48" /> : user ? `${user.firstname} ${user.lastname}` : "Employee"}
        breadcrumb={[
          { label: "Employees", to: "/users" },
          ...(isLoading ? [] : [{ label: user ? `${user.firstname} ${user.lastname}` : "Employee" }]),
        ]}
        actions={
          isLoadingSync ? (
            <SyncStatusCard.Skeleton />
          ) : (
            <SyncStatusCard
              status={syncStatus}
              isRecalculating={isRecalculating}
              onRecalculate={() => id && triggerUserRecalculation({ id }).catch(() => {})}
            />
          )
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <UserProfileCard user={user} />

        {/* ── Stats ─────────────────────────────────────────────── */}
        {isLoadingStats || !stats ? <UserStatsSection.Skeleton /> : <UserStatsSection stats={stats} />}

        {/* ── Tabs ──────────────────────────────────────────────── */}
        {id && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="overview">
                <SquaresFourIcon className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FolderIcon className="size-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="skills">
                <CertificateIcon className="size-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="absences">
                <CalendarDotsIcon className="size-4" />
                Absences
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <UserOverviewTab userId={id} onViewAbsences={() => setActiveTab("absences")} />
            </TabsContent>
            <TabsContent value="projects">
              <UserProjectsTab userId={id} />
            </TabsContent>
            <TabsContent value="skills">
              <UserSkillsTab userId={id} />
            </TabsContent>
            <TabsContent value="absences">
              <UserAbsencesTab userId={id} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
