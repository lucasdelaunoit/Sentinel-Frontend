import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { useState } from "react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart.tsx";
import { RadialBarChart, RadialBar } from "recharts";
import useGetUsers from "@/api/users/useGetUsers.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import useGetTeamToday from "@/api/users/useGetTeamToday.ts";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import UserStatusBadge from "@/components/specified/models/employees/badges/UserStatusBadge.tsx";

type SheetFilter = "all" | "available" | "remote";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CapacityDonut({ percent }: { percent: number }) {
  const color = percent >= 80 ? "#097155" : percent >= 60 ? "#f59e0b" : "#ef4444";
  const data = [{ value: percent, fill: color }];
  const config = { value: { label: "Capacity" } } satisfies ChartConfig;
  const endAngle = 90 - (percent / 100) * 360;

  return (
    <ChartContainer config={config} className="aspect-square size-5" initialDimension={{ width: 28, height: 28 }}>
      <RadialBarChart data={data} startAngle={90} endAngle={endAngle} innerRadius={6} outerRadius={10}>
        <RadialBar dataKey="value" cornerRadius={3} />
      </RadialBarChart>
    </ChartContainer>
  );
}

function toUserStatus(todayStatus: string): UserStatus {
  return todayStatus === "Has Leave" ? "away" : "available";
}

const FILTER_IS_REMOTE: Record<SheetFilter, boolean | undefined> = {
  all: undefined,
  available: false,
  remote: true,
};

function TeamStatusSkeleton() {
  return (
    <div className="space-y-1 py-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-1.5 rounded-xl">
          <Skeleton className="size-8 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function TeamStatusOfTodayCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search] = useState("");
  const [filter] = useState<SheetFilter>("all");

  const { data, isLoading } = useGetTeamToday();

  const isRemoteFilter = FILTER_IS_REMOTE[filter];
  const { data: usersPage } = useGetUsers(
    {
      search,
      filters: isRemoteFilter !== undefined ? [{ field: "is_remote", value: isRemoteFilter }] : [],
      per_page: 100,
    },
    sheetOpen,
  );

  const cardUsers = data?.employees ?? [];
  const capacityPct = data?.capacity_pct ?? 0;

  const capacityAction = (
    <div className="flex items-center gap-2 text-secondary-foreground ml-auto">
      <span className="text-xs">
        <span className="font-semibold tabular-nums">{capacityPct}%</span> present
      </span>
      <CapacityDonut percent={capacityPct} />
    </div>
  );

  return (
    <ComposedCard title="Today's Team Status" action={capacityAction} className="flex flex-col">
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1 flex flex-col justify-center mb-4">
          {isLoading ? (
            <TeamStatusSkeleton />
          ) : cardUsers.length === 0 ? (
            <Feedback variant="success" title="All hands on deck" description="Everyone is available today" />
          ) : (
            <div className="space-y-4 p-0.5">
              {cardUsers.map((e) => (
                <SecondaryCard
                  key={e.id}
                  before={<UserAvatar initials={initials(`${e.firstname} ${e.lastname}`)} variant={toUserStatus(e.today_status)} />}
                  title={`${e.firstname} ${e.lastname}`}
                  description={e.role}
                  action={<UserStatusBadge status={toUserStatus(e.today_status)} />}
                />
              ))}
            </div>
          )}
        </div>
        <SecondaryButton label="View full team →" onClick={() => setSheetOpen(true)} />
      </div>
    </ComposedCard>
  );
}
