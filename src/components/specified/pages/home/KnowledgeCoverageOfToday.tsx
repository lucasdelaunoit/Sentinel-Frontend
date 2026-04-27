import { cn } from "@/lib/utils.ts";
import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import { useMemo } from "react";
import {EMPLOYEE_DETAILS, type SkillCategory} from "@/data/employees.ts";

const AXES: SkillCategory[] = ["FRONTEND", "BACKEND", "DEVOPS", "DATABASE", "SECURITY", "TESTING"];

export default function KnowledgeCoverageOfToday() {
  const employees= useMemo(() => Object.values(EMPLOYEE_DETAILS), []);

  /* ── Computed coverage ─────────────────────────────────── */
  const coverageByCategory = useMemo(() =>
      AXES.map(cat => {
        const count = employees.filter(e =>
          e.skills.some(s => s.category === cat && s.level >= 3),
        ).length;
        return count / employees.length;
      }),
    [employees],
  );


  const targetValues = [0.92, 0.88, 0.93, 0.87, 0.88, 0.92];
  const avgCoverage = useMemo(
    () => Math.round((coverageByCategory.reduce((a, b) => a + b, 0) / AXES.length) * 100),
    [coverageByCategory],
  );

  const weakestCategories = useMemo(() => {
    return AXES
      .map((axis, i) => ({ axis, value: coverageByCategory[i] }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 2);
  }, [coverageByCategory]);

  return (
    <Card className="p-5">
      {/* Header */}
      <CardTitle>Today's Knowledge Coverage</CardTitle>

      <CardContent className="p-0">
        <div className="flex items-center gap-4">
          <KCIRadarChart coverageValues={coverageByCategory} targetValues={targetValues} />
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-sm bg-rose-400 shadow-sm" />
              <span className="text-muted-foreground">Current: {avgCoverage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-sm border border-blue-300 bg-blue-100" style={{ borderStyle: "dashed" }} />
              <span className="text-muted-foreground">Target: 90%</span>
            </div>
            <div className="pt-2 border-t border-border/40 space-y-1.5">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide font-medium">Weakest areas</p>
              {weakestCategories.map(({ axis, value }) => (
                <div key={axis} className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full shrink-0", value < 0.3 ? "bg-rose-400" : "bg-amber-400")} />
                  <span className="text-muted-foreground">{axis} ({Math.round(value * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KCIRadarChart({
                         coverageValues,
                         targetValues,
                       }: {
  coverageValues: number[];
  targetValues: number[];
}) {
  const cx = 100,
    cy = 100,
    maxR = 70,
    labelR = maxR * 1.35;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
      {gridLevels.map((r) => (
        <path
          key={r}
          d={hexPath(cx, cy, r * maxR)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}
      {AXES.map((_, i) => {
        const p = radarPoint(cx, cy, maxR, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      })}
      <path
        d={radarPath(targetValues, cx, cy, maxR)}
        fill="#DBEAFE"
        fillOpacity="0.35"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      <path
        d={radarPath(coverageValues, cx, cy, maxR)}
        fill="#FECACA"
        fillOpacity="0.55"
        stroke="#F87171"
        strokeWidth="2"
      />
      {AXES.map((label, i) => {
        const p = radarPoint(cx, cy, labelR, i);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontWeight="600"
            fill="#6B7280"
            letterSpacing="0.5"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}


function radarPoint(cx: number, cy: number, r: number, i: number) {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function radarPath(values: number[], cx: number, cy: number, maxR: number) {
  const pts = values.map((v, i) => radarPoint(cx, cy, v * maxR, i));
  return (
    pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + "Z"
  );
}

function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => radarPoint(cx, cy, r, i));
  return (
    pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ") + "Z"
  );
}