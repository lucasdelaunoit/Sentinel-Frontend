import { ShieldAlert, Users, BookOpen, CalendarClock } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import DeadlineCountdownCard from "@/components/common/cards/DeadlineCountdownCard";
import type { ProjectStats } from "@/types/dashboard";

interface ProjectStatsSectionProps {
  stats: ProjectStats;
}

export default function ProjectStatsSection({ stats }: ProjectStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Fragility" icon={ShieldAlert} card={stats.fragility} />
      <StatCard title="Team Availability" icon={Users} card={stats.team_availability} />
      <StatCard title="Knowledge Coverage" icon={BookOpen} card={stats.knowledge_coverage} />
      <DeadlineCountdownCard title="Deadline" card={stats.deadline_countdown} />
    </div>
  );
}

ProjectStatsSection.Skeleton = function ProjectStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard.Skeleton title="Fragility" icon={ShieldAlert} />
      <StatCard.Skeleton title="Team Availability" icon={Users} />
      <StatCard.Skeleton title="Knowledge Coverage" icon={BookOpen} />
      <DeadlineCountdownCard.Skeleton title="Deadline" />
    </div>
  );
};
