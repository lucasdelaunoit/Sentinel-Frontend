import { RadialBarChart, RadialBar } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";

type PercentDonutSize = "sm" | "md" | "lg";

interface SizeSpec {
  container: string;
  pixels: number;
  innerRadius: number;
  outerRadius: number;
}

const SIZE_SPECS: Record<PercentDonutSize, SizeSpec> = {
  sm: { container: "size-5", pixels: 28, innerRadius: 6, outerRadius: 10 },
  md: { container: "size-8", pixels: 44, innerRadius: 10, outerRadius: 16 },
  lg: { container: "size-12", pixels: 64, innerRadius: 14, outerRadius: 22 },
};

export interface Threshold {
  min: number;
  color: string;
}

const DEFAULT_THRESHOLDS: Threshold[] = [
  { min: 80, color: "#097155" },
  { min: 60, color: "#f59e0b" },
  { min: 0, color: "#ef4444" },
];

interface PercentDonutProps {
  percent: number;
  size?: PercentDonutSize;
  className?: string;
  label?: string;
  thresholds?: Threshold[];
  cornerRadius?: number;
}

function resolveColor(percent: number, thresholds: Threshold[]): string {
  const sorted = [...thresholds].sort((a, b) => b.min - a.min);
  const match = sorted.find((t) => percent >= t.min);
  return match?.color ?? sorted[sorted.length - 1].color;
}

export default function PercentDonut({
  percent,
  size = "sm",
  className,
  label = "Value",
  thresholds = DEFAULT_THRESHOLDS,
  cornerRadius = 3,
}: PercentDonutProps) {
  const spec = SIZE_SPECS[size];
  const safePercent = Math.max(0, Math.min(100, percent));
  const color = resolveColor(safePercent, thresholds);
  const data = [{ value: safePercent, fill: color }];
  const config = { value: { label } } satisfies ChartConfig;
  const endAngle = 90 - (safePercent / 100) * 360;

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-square", spec.container, className)}
      initialDimension={{ width: spec.pixels, height: spec.pixels }}
    >
      <RadialBarChart
        data={data}
        startAngle={90}
        endAngle={endAngle}
        innerRadius={spec.innerRadius}
        outerRadius={spec.outerRadius}
      >
        <RadialBar dataKey="value" cornerRadius={cornerRadius} />
      </RadialBarChart>
    </ChartContainer>
  );
}

interface PercentDonutSkeletonProps {
  size?: PercentDonutSize;
}

PercentDonut.Skeleton = function PercentDonutSkeleton({ size = "sm" }: PercentDonutSkeletonProps) {
  return <Skeleton className={cn("rounded-full", SIZE_SPECS[size].container)} />;
};
