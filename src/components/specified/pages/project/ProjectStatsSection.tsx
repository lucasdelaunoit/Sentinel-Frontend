import { BookOpenIcon, ShieldWarningIcon, UsersIcon } from "@phosphor-icons/react";
import StatCard from "@/components/common/cards/StatCard";
import DeadlineCountdownCard from "@/components/common/cards/DeadlineCountdownCard";

interface ProjectStatsSectionProps {
  stats: ProjectStats;
}

export default function ProjectStatsSection({ stats }: ProjectStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Fragility" icon={ShieldWarningIcon} card={stats.fragility} />
      <StatCard title="Team Availability" icon={UsersIcon} card={stats.team_availability} />
      <StatCard title="Knowledge Coverage" icon={BookOpenIcon} card={stats.knowledge_coverage} />
      <DeadlineCountdownCard title="Deadline" card={stats.deadline_countdown} />
    </div>
  );
}

ProjectStatsSection.Skeleton = function ProjectStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard.Skeleton title="Fragility" icon={ShieldWarningIcon} />
      <StatCard.Skeleton title="Team Availability" icon={UsersIcon} />
      <StatCard.Skeleton title="Knowledge Coverage" icon={BookOpenIcon} />
      <DeadlineCountdownCard.Skeleton title="Deadline" />
    </div>
  );
};
