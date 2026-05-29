import { useEffect } from "react";
import { useTabParam } from "@/hooks/useTabParam";
import { useParams, Link } from "react-router-dom";
import { usePage } from "@/context/PageContext";
import { SquaresFourIcon, FolderIcon, CertificateIcon, CalendarDotsIcon } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import useGetUser from "@/api/users/useGetUser";
import useGetUserStats from "@/api/users/useGetUserStats";
import UserProfileCard from "@/components/specified/pages/user/UserProfileCard.tsx";
import UserStatsSection from "@/components/specified/pages/user/UserStatsSection.tsx";
import UserOverviewTab from "@/components/specified/pages/user/UserOverviewTab.tsx";
import UserAbsencesTab from "@/components/specified/pages/user/UserAbsencesTab.tsx";
import UserProjectsTab from "@/components/specified/pages/user/UserProjectsTab.tsx";
import UserSkillsTab from "@/components/specified/pages/user/UserSkillsTab.tsx";

const USER_TABS = ["overview", "projects", "skills", "absences"] as const;

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { setTitle, setBreadcrumb } = usePage();
  const [activeTab, setActiveTab] = useTabParam("overview", USER_TABS);

  const { data: user, isLoading, isError } = useGetUser(id);
  const { data: stats, isLoading: isLoadingStats } = useGetUserStats(id);

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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-foreground">Employee not found</p>
        <Link to="/users" className="text-[13px] text-primary hover:underline underline-offset-4">
          Back to employees
        </Link>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title={isLoading ? "Loading…" : user ? `${user.firstname} ${user.lastname}` : "Employee"}
        breadcrumb="Employee"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <UserProfileCard user={user} isLoading={isLoading} />

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
