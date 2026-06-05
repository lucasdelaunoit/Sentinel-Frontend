import ProjectHealthCard from "@/components/specified/pages/project/overviewTab/ProjectHealthCard.tsx";
import ProjectTodaySnapshot from "@/components/specified/pages/project/overviewTab/ProjectTodaySnapshot.tsx";
import ProjectFragilityAlertsCard from "@/components/specified/pages/project/overviewTab/ProjectFragilityAlertsCard.tsx";
import ProjectAbsenceImpactCard from "@/components/specified/pages/project/overviewTab/ProjectAbsenceImpactCard.tsx";

interface ProjectOverviewTabProps {
  projectId: string | undefined;
}

export default function ProjectOverviewTab({ projectId }: ProjectOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
      <div className="lg:col-span-3 space-y-4">
        <ProjectFragilityAlertsCard projectId={projectId} />
        <ProjectAbsenceImpactCard projectId={projectId} />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <ProjectHealthCard projectId={projectId} />
        <ProjectTodaySnapshot projectId={projectId} />
      </div>
    </div>
  );
}
