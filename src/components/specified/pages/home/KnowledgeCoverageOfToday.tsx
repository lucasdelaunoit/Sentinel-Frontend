import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import { useMemo } from "react";
import { EMPLOYEE_DETAILS, type SkillCategory } from "@/data/employees.ts";
import {ChartContainer, type ChartConfig, ChartLegend, ChartLegendContent} from "@/components/ui/chart.tsx";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";

const AXES: SkillCategory[] = ["FRONTEND", "BACKEND", "DEVOPS", "DATABASE", "SECURITY", "TESTING"];

const TARGET_BY_AXIS: Record<SkillCategory, number> = {
  FRONTEND: 92, BACKEND: 88, DEVOPS: 93, DATABASE: 87, SECURITY: 88, TESTING: 92,
};

const chartConfig = {
  coverage: { label: "Current", color: "#f87171" },
  target:   { label: "Target",  color: "#93c5fd" },
} satisfies ChartConfig;

export default function KnowledgeCoverageOfToday() {
  const employees = useMemo(() => Object.values(EMPLOYEE_DETAILS), []);

  const chartData = useMemo(() =>
    AXES.map(cat => {
      const count = employees.filter(e =>
        e.skills.some(s => s.category === cat && s.level >= 3),
      ).length;
      return {
        axis: cat,
        coverage: Math.round((count / employees.length) * 100),
        target: TARGET_BY_AXIS[cat],
      };
    }),
    [employees],
  );

  return (
    <Card className="p-5">
      <CardTitle>Today's Knowledge Coverage</CardTitle>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[220px]">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 8, fontWeight: 600, fill: "#6B7280" }}
            />
            <Radar
              dataKey="target"
              fill="var(--color-target)"
              fillOpacity={0.15}
              stroke="var(--color-target)"
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
            <Radar
              dataKey="coverage"
              fill="var(--color-coverage)"
              fillOpacity={0.45}
              stroke="var(--color-coverage)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}