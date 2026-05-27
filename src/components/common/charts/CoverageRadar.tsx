import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";

import { ChartContainer, type ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";

export interface CoverageRadarDatum {
  /** Axis label rendered around the chart. */
  axis: string;
  /** Primary series value (0–100). */
  value: number;
  /** Optional reference series value (0–100). */
  target?: number;
}

interface CoverageRadarProps {
  data: CoverageRadarDatum[];
  valueLabel?: string;
  targetLabel?: string;
  showTarget?: boolean;
  className?: string;
}

interface AngleTickProps {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  payload?: { value: string };
}

/** Anchors each axis label by side (left = end, right = start) and wraps long names so they never clip the svg edge. */
function AngleTick({ x = 0, y = 0, cx = 0, cy = 0, payload }: AngleTickProps) {
  const label = payload?.value ?? "";
  const anchor = x > cx + 4 ? "start" : x < cx - 4 ? "end" : "middle";
  const words = label.split(" ");

  return (
    <text x={x} y={y} textAnchor={anchor} fill="#6B7280" fontSize={11} fontWeight={600}>
      {words.map((word, i) => (
        <tspan key={word} x={x} dy={i === 0 ? (y < cy ? -(words.length - 1) * 12 : 0) : 12}>
          {word}
        </tspan>
      ))}
    </text>
  );
}

export default function CoverageRadar({
  data,
  valueLabel = "Current",
  targetLabel = "Target",
  showTarget = true,
  className,
}: CoverageRadarProps) {
  const config = {
    value: { label: valueLabel, color: "var(--color-primary)" },
    target: { label: targetLabel, color: "var(--color-muted-foreground)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className={cn("mx-auto max-h-[320px] aspect-square -mt-2", className)}>
      <RadarChart data={data} outerRadius="80%" margin={{ top: 10, right: 50, bottom: 0, left: 50 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="axis" tick={<AngleTick />} />
        {showTarget && (
          <Radar
            dataKey="target"
            fill="var(--color-target)"
            fillOpacity={0.2}
            stroke="var(--color-target)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
        )}
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.45}
          stroke="var(--color-value)"
          strokeWidth={2}
        />
        <ChartLegend content={<ChartLegendContent />} className="mt-2" />
      </RadarChart>
    </ChartContainer>
  );
}

CoverageRadar.Skeleton = function CoverageRadarSkeleton({ className }: Pick<CoverageRadarProps, "className">) {
  return (
    <div className={cn("mx-auto max-h-[320px] aspect-square -mt-2 flex items-center justify-center w-full", className)}>
      <Skeleton className="size-56 rounded-full" />
    </div>
  );
};
