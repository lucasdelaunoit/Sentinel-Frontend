import ProjectCoverageSummary from "@/components/specified/pages/project/knowledgeTab/ProjectCoverageSummary.tsx";
import ProjectSkillCoverageCard from "@/components/specified/pages/project/knowledgeTab/ProjectSkillCoverageCard.tsx";
import ProjectCompetencyRadarCard from "@/components/specified/pages/project/knowledgeTab/ProjectCompetencyRadarCard.tsx";

interface ProjectKnowledgeTabProps {
  projectId: string | undefined;
}

export default function ProjectKnowledgeTab({ projectId }: ProjectKnowledgeTabProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <ProjectSkillCoverageCard projectId={projectId} />

      <div className="col-span-2 space-y-4">
        <ProjectCompetencyRadarCard projectId={projectId} />
        <ProjectCoverageSummary projectId={projectId} />
      </div>
    </div>
  );
}
