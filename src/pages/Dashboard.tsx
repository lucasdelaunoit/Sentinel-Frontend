import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ArrowRight, CalendarCheck, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/data/projects";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import { Button } from "@/components/ui/button.tsx";
import HomeStatCardsSection from "@/components/specified/pages/home/HomeStatCardsSection.tsx";
import TeamTodayCard from "@/components/specified/pages/home/TeamTodayCard.tsx";
import KnowledgeCoverageCard from "@/components/specified/pages/home/KnowledgeCoverageCard.tsx";
import ImportPlanningSheet from "@/components/specified/pages/home/ImportPlanningSheet.tsx";
import CriticalProjectsRiskCard from "@/components/specified/pages/home/CriticalProjectsRiskCard.tsx";
import SinglePointsOfFailureCard from "@/components/specified/pages/home/SinglePointsOfFailureCard.tsx";
import VulnerableSkillsCard from "@/components/specified/pages/home/VulnerableSkillsCard.tsx";
import UpcomingRiskEventsCard from "@/components/specified/pages/home/UpcomingRiskEventsCard.tsx";

/* ─── Avatar ──────────────────────────────────────────────── */

function Avatar({ initials, color, size = "sm" }: { initials: string; color: string; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm",
        size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs",
        color,
      )}
    >
      {initials}
    </div>
  );
}

function AvatarGroup({ members, extra }: { members: Array<{ initials: string; color: string }>; extra?: number }) {
  return (
    <div className="flex items-center">
      {members.map((m, i) => (
        <div key={i} className="ring-2 ring-card rounded-full" style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar initials={m.initials} color={m.color} size="sm" />
        </div>
      ))}
      {extra != null && extra > 0 && (
        <div
          className="ring-2 ring-card flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
          style={{ marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ─── Bars ────────────────────────────────────────────────── */

import { getTrajectoryTier, TONE_BG, TONE_TEXT } from "@/lib/scoring";

function HealthBar({ value }: { value: number }) {
  const tier = getTrajectoryTier(value);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted shadow-inner">
        <div className={cn("h-full rounded-full shadow-sm", TONE_BG[tier.tone])} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-[11px] font-semibold whitespace-nowrap", TONE_TEXT[tier.tone])}>
        {tier.label}
        <span className="ml-1 tabular-nums opacity-70">{value}</span>
      </span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-sm"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{value}%</span>
    </div>
  );
}

/* ─── Risk Distribution Bar ───────────────────────────────── */

const RISK_LEVELS = [
  {
    label: "Critical",
    threshold: 25,
    color: "bg-rose-500",
    text: "text-rose-600",
    badge: "bg-rose-50 text-rose-600 border-rose-200/60",
  },
  {
    label: "High",
    threshold: 15,
    color: "bg-orange-500",
    text: "text-orange-600",
    badge: "bg-orange-50 text-orange-600 border-orange-200/60",
  },
  {
    label: "Medium",
    threshold: 8,
    color: "bg-amber-400",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-600 border-amber-200/60",
  },
  {
    label: "Low",
    threshold: 0,
    color: "bg-emerald-500",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  },
];

function getRiskLevel(score: number) {
  return (
    RISK_LEVELS.find((l, i) => score >= l.threshold && (i === 0 || score < RISK_LEVELS[i - 1].threshold)) ??
    RISK_LEVELS[3]
  );
}

/* ─── Dashboard ───────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const [importSheetOpen, setImportSheetOpen] = useState(false);

  const displayProjects = [...PROJECTS]
    .filter((p) => p.status !== "Completed")
    .sort((a, b) => b.riskScore - a.riskScore);

  return (
    <>
      <TopBar
        title="Dashboard"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="font-semibold" size="lg" onClick={() => setImportSheetOpen(true)}>
              <CalendarCheck className="size-4" /> Import planning
            </Button>
            <Button onClick={() => navigate("/?simulate=true")} size="lg">
              <PlayCircle className="size-4" /> Simulate Leave
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* Today's Stats */}
        <HomeStatCardsSection />

        {/* Section 2 — Core Operational Insights */}
        <div className="grid grid-cols-3 gap-5 items-start">
          <TeamTodayCard />
          <KnowledgeCoverageCard />
          <CriticalProjectsRiskCard />
        </div>

        {/* Section 3 — Organizational Vulnerabilities */}
        <div className="grid grid-cols-2 gap-5 items-start">
          <SinglePointsOfFailureCard />
          <VulnerableSkillsCard />
        </div>

        {/* Section 4 — Upcoming Risk Events */}
        <UpcomingRiskEventsCard />

        {/* Projects Table */}
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-foreground">Active Projects</h3>
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                {displayProjects.length} shown
              </span>
            </div>
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              View all
              <ArrowRight className="size-3" />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                {["ID", "Project Name", "Status", "Progress", "Fragility", "Bus Factor", "Trajectory", "Team", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {displayProjects.map((p) => {
                const level = getRiskLevel(p.riskScore);
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground/70">{p.id}</span>
                    </td>
                    <td className="px-4 py-4 max-w-[220px]">
                      <p className="font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.description.slice(0, 55)}…</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
                          p.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
                            : p.status === "On Hold"
                              ? "bg-amber-50 text-amber-700 ring-amber-200/60"
                              : "bg-violet-50 text-violet-700 ring-violet-200/60",
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ProgressBar value={p.progress} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", level.text)}>{p.riskScore}</span>
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wide px-1 py-0.5 rounded border hidden group-hover:inline",
                            level.badge,
                          )}
                        >
                          {level.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "text-sm font-bold",
                          p.busFactor <= 1 ? "text-rose-500" : p.busFactor <= 2 ? "text-amber-500" : "text-emerald-600",
                        )}
                      >
                        {p.busFactor}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <HealthBar value={p.health} />
                    </td>
                    <td className="px-4 py-4">
                      <AvatarGroup members={p.team.slice(0, 3)} extra={p.team.length > 3 ? p.team.length - 3 : 0} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${p.id}`);
                        }}
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ImportPlanningSheet open={importSheetOpen} onOpenChange={setImportSheetOpen} />
    </>
  );
}
