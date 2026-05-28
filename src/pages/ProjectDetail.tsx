import { useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTabParam } from "@/hooks/useTabParam";
import { usePage } from "@/context/PageContext";
import { ShieldWarningIcon, UsersThreeIcon, BrainIcon } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PROJECTS, type ProjectData } from "@/data/projects";
import { USER_DETAILS, type UserDetail } from "@/data/users";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import useGetProject from "@/api/projects/useGetProject";
import useGetProjectStats from "@/api/projects/useGetProjectStats";
import ProjectProfileCard from "@/components/specified/pages/project/ProjectProfileCard.tsx";
import ProjectStatsSection from "@/components/specified/pages/project/ProjectStatsSection.tsx";
import ProjectTeamTab from "@/components/specified/pages/project/ProjectTeamTab.tsx";
import ProjectKnowledgeTab from "@/components/specified/pages/project/ProjectKnowledgeTab.tsx";
import ProjectOverviewTab from "@/components/specified/pages/project/ProjectOverviewTab.tsx";

/* ─── Risk computation ────────────────────────────────────── */

interface SkillCoverage {
  skill: string;
  holders: UserDetail[];
  activeHolders: UserDetail[];
  maxLevel: number;
}

function skillMatch(required: string, empSkillName: string) {
  return (
    empSkillName.toLowerCase().includes(required.toLowerCase()) ||
    required.toLowerCase().includes(empSkillName.toLowerCase())
  );
}

function computeCoverage(project: ProjectData, members: UserDetail[]): SkillCoverage[] {
  return project.skills.map((skill) => {
    const holders = members.filter((m) => m.skills.some((s) => skillMatch(skill, s.name)));
    const activeHolders = holders.filter((m) => m.todayStatus !== "Has Leave");
    const maxLevel = holders.length
      ? Math.max(...holders.flatMap((m) => m.skills.filter((s) => skillMatch(skill, s.name)).map((s) => s.level)))
      : 0;
    return { skill, holders, activeHolders, maxLevel };
  });
}

type AlertSeverity = "critical" | "warning" | "info";

/* ─── Project Detail Page ─────────────────────────────────── */

const tabs: { key: DetailTab; label: string; icon: typeof ShieldWarningIcon }[] = [
  { key: "overview", label: "Fragility Overview", icon: ShieldWarningIcon },
  { key: "team", label: "Team", icon: UsersThreeIcon },
  { key: "knowledge", label: "Knowledge", icon: BrainIcon },
];

const PROJECT_TABS = ["overview", "team", "knowledge"] as const;
type DetailTab = (typeof PROJECT_TABS)[number];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setTitle, setBreadcrumb } = usePage();
  const [activeTab, setActiveTab] = useTabParam<DetailTab>("overview", PROJECT_TABS);

  const { data: apiProject, isLoading, isError } = useGetProject(id);
  const { data: stats, isLoading: isLoadingStats } = useGetProjectStats(id);

  // Mock fallback for tabs (risk/team/knowledge) — to be migrated later
  const project = PROJECTS.find((p) => p.id === id) ?? PROJECTS[0];

  useEffect(() => {
    if (apiProject) {
      setTitle(apiProject.name);
      setBreadcrumb("Portfolio");
    }
    return () => {
      setTitle("");
      setBreadcrumb("");
    };
  }, [apiProject?.id]);

  const members = useMemo(
    () => (project?.team.map((m) => USER_DETAILS[m.id]).filter(Boolean) as UserDetail[]) ?? [],
    [project],
  );

  const coverage = useMemo(() => (project ? computeCoverage(project, members) : []), [project, members]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-foreground">Project not found</p>
        <Link to="/projects" className="text-[13px] text-primary hover:underline underline-offset-4">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <>
      <TopBar title={isLoading ? "Loading…" : (apiProject?.name ?? "Project")} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero ─────────────────────────────────────────────── */}
        {isLoading || !apiProject ? <ProjectProfileCard.Skeleton /> : <ProjectProfileCard project={apiProject} />}

        {/* ── Stats ────────────────────────────────────────────── */}
        {isLoadingStats || !stats ? <ProjectStatsSection.Skeleton /> : <ProjectStatsSection stats={stats} />}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                <tab.icon className="size-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-1">
            <ProjectOverviewTab
              project={project}
              members={members}
              coverage={coverage}
              onSimulate={() => navigate("/users?tab=calendar")}
            />
          </TabsContent>
          <TabsContent value="team" className="mt-1">
            <ProjectTeamTab projectId={id} />
          </TabsContent>
          <TabsContent value="knowledge" className="mt-1">
            <ProjectKnowledgeTab projectId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
