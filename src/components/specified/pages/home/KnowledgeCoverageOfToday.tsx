import { useMemo } from "react";
import { USER_DETAILS, type SkillCategory } from "@/data/users.ts";
import { ChartContainer, type ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart.tsx";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";

const AXES: SkillCategory[] = ["FRONTEND", "BACKEND", "DEVOPS", "DATABASE", "SECURITY", "TESTING"];

const TARGET_BY_AXIS: Record<SkillCategory, number> = {
  FRONTEND: 92,
  BACKEND: 88,
  DEVOPS: 93,
  DATABASE: 87,
  SECURITY: 88,
  TESTING: 92,
};

const chartConfig = {
  coverage: { label: "Current", color: "#f87171" },
  target: { label: "Target", color: "#93c5fd" },
} satisfies ChartConfig;

export default function KnowledgeCoverageOfToday() {
  const users = useMemo(() => Object.values(USER_DETAILS), []);

  const chartData = useMemo(
    () =>
      AXES.map((cat) => {
        const count = users.filter((e) => e.skills.some((s) => s.category === cat && s.level >= 3)).length;
        return {
          axis: cat,
          coverage: Math.round((count / users.length) * 100),
          target: TARGET_BY_AXIS[cat],
        };
      }),
    [users],
  );

  return (
    <ComposedCard title="Today's Knowledge Coverage">
      <ChartContainer config={chartConfig} className="mx-auto max-h-[290px] aspect-square -mt-5">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fontWeight: 600, fill: "#6B7280" }} />
          <Radar
            dataKey="target"
            fill="var(--color-muted-foreground)"
            fillOpacity={0.2}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
          <Radar
            dataKey="coverage"
            fill="var(--color-primary)"
            fillOpacity={0.45}
            stroke="var(--color-primary)"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} className="mt-10" />
        </RadarChart>
      </ChartContainer>
    </ComposedCard>
  );
}
