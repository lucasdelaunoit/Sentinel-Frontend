import { useEffect } from "react";
import { useTabParam } from "@/hooks/useTabParam";
import { useParams, Link } from "react-router-dom";
import { usePage } from "@/context/PageContext";
import { Plus } from "lucide-react";
import { SquaresFourIcon, FolderIcon, CertificateIcon, CalendarDotsIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopBar from "@/components/layout/topbar/TopBar.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard";
import useGetUser from "@/api/users/useGetUser";
import useGetSkillsForUser from "@/api/users/useGetSkillsForUser";
import useGetUserStats from "@/api/users/useGetUserStats";
import type { UserSkillDetail } from "@/types/dashboard";
import UserProfileCard from "@/components/specified/pages/user/UserProfileCard.tsx";
import UserStatsSection from "@/components/specified/pages/user/UserStatsSection.tsx";
import UserOverviewTab from "@/components/specified/pages/user/UserOverviewTab.tsx";
import UserAbsencesTab from "@/components/specified/pages/user/UserAbsencesTab.tsx";
import UserProjectsTab from "@/components/specified/pages/user/UserProjectsTab.tsx";

/* ─── Radar chart ─────────────────────────────────────────── */

const RADAR_AXES = ["FRONTEND", "BACKEND", "DEVOPS", "DATABASE", "SECURITY", "TESTING"] as const;

function radarPoint(cx: number, cy: number, r: number, i: number) {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function radarPath(values: number[], cx: number, cy: number, maxR: number) {
  const pts = values.map((v, i) => radarPoint(cx, cy, v * maxR, i));
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";
}

function hexPath(cx: number, cy: number, r: number) {
  return (
    Array.from({ length: 6 }, (_, i) => radarPoint(cx, cy, r, i))
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + "Z"
  );
}

function CompetencyRadar({ skills }: { skills: UserSkillDetail[] }) {
  const cx = 145,
    cy = 145,
    maxR = 95,
    labelR = maxR * 1.3;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const scores = RADAR_AXES.map((cat) => {
    const catSkills = skills.filter((s) => s.category.name.toUpperCase() === cat);
    if (catSkills.length === 0) return 0.25;
    return catSkills.reduce((sum, s) => sum + s.pivot.level, 0) / (catSkills.length * 5);
  });

  return (
    <svg width="290" height="290" viewBox="0 0 290 290" className="mx-auto">
      {gridLevels.map((r) => (
        <path key={r} d={hexPath(cx, cy, r * maxR)} fill="none" stroke="#E5E7EB" strokeWidth="1" />
      ))}
      {RADAR_AXES.map((_, i) => {
        const p = radarPoint(cx, cy, maxR, i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />;
      })}
      <path
        d={radarPath(scores, cx, cy, maxR)}
        fill="#DBEAFE"
        fillOpacity="0.55"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      {RADAR_AXES.map((label, i) => {
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
            letterSpacing="0.8"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Skill bar ───────────────────────────────────────────── */

const LEVEL_LABEL: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

function skillColor(level: number) {
  if (level >= 4) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
  if (level >= 3) return "bg-gradient-to-r from-amber-400 to-amber-500";
  return "bg-gradient-to-r from-rose-400 to-rose-500";
}

function SkillBar({ name, level }: { name: string; level: number }) {
  const filled = level * 2;
  const color = skillColor(level);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">{name}</span>
        <span className="text-[11px] text-muted-foreground">
          {level}/5 — <span className="font-medium text-foreground">{LEVEL_LABEL[level]}</span>
        </span>
      </div>
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-1.5 flex-1 rounded-sm transition-colors shadow-inner", i < filled ? color : "bg-muted")}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Skeletons ───────────────────────────────────────────── */

function SkillBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-sm" />
    </div>
  );
}

/* ─── Skills Tab ──────────────────────────────────────────── */

function SkillsTab({ userId }: { userId: string }) {
  const { data: list, isLoading, isError } = useGetSkillsForUser(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ComposedCard title="Skills & Proficiency" className="lg:col-span-3" headerClassName="mb-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkillBarSkeleton key={i} />
            ))}
          </div>
        </ComposedCard>
        <ComposedCard title="Competency Radar" className="lg:col-span-2" headerClassName="mb-4">
          <Skeleton className="w-[290px] h-[290px] rounded-full mx-auto" />
        </ComposedCard>
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground text-center py-12">Failed to load skills.</p>;
  }

  const left = list.filter((_, i) => i % 2 === 0);
  const right = list.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <ComposedCard
        title="Skills & Proficiency"
        action={
          <>
            <div className="flex-1" />
            <Button size="xs" variant="ghost" className="gap-1.5 text-[11px] text-muted-foreground">
              <Plus className="size-3.5" />
              Add Skill
            </Button>
          </>
        }
        className="lg:col-span-3"
        headerClassName="mb-5"
      >
        {list.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-8">No skills recorded</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {left.map((skill) => (
              <SkillBar key={skill.id} name={skill.name} level={skill.pivot.level} />
            ))}
            {right.map((skill) => (
              <SkillBar key={skill.id} name={skill.name} level={skill.pivot.level} />
            ))}
          </div>
        )}
      </ComposedCard>

      <ComposedCard title="Competency Radar" className="lg:col-span-2" headerClassName="mb-4">
        {list.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-8">No skills to display</p>
        ) : (
          <CompetencyRadar skills={list} />
        )}
      </ComposedCard>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */

const USER_TABS = ["overview", "projects", "skills", "absences"] as const;

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { setTitle, setBreadcrumb } = usePage();
  const [activeTab, setActiveTab] = useTabParam("overview", USER_TABS);

  const { data: user, isLoading, isError } = useGetUser(id);
  const { data: stats, isLoading: isLoadingStats } = useGetUserStats(id);

  useEffect(() => {
    if (user) {
      setTitle(`${user.firstname} ${user.lastname}`);
      setBreadcrumb("HR");
    }
    return () => {
      setTitle("");
      setBreadcrumb("");
    };
  }, [user?.id]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-foreground">Employee not found</p>
        <Link to="/users" className="text-[13px] text-primary hover:underline underline-offset-4">
          Back to employees
        </Link>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title={isLoading ? "Loading…" : user ? `${user.firstname} ${user.lastname}` : "Employee"}
        breadcrumb="Employee"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 page-enter">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <UserProfileCard user={user} isLoading={isLoading} />

        {/* ── Stats ─────────────────────────────────────────────── */}
        {isLoadingStats || !stats ? <UserStatsSection.Skeleton /> : <UserStatsSection stats={stats} />}

        {/* ── Tabs ──────────────────────────────────────────────── */}
        {id && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">
                <SquaresFourIcon className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FolderIcon className="size-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="skills">
                <CertificateIcon className="size-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="absences">
                <CalendarDotsIcon className="size-4" />
                Absences
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <UserOverviewTab userId={id} onViewAbsences={() => setActiveTab("absences")} />
            </TabsContent>
            <TabsContent value="projects">
              <UserProjectsTab userId={id} />
            </TabsContent>
            <TabsContent value="skills">
              <SkillsTab userId={id} />
            </TabsContent>
            <TabsContent value="absences">
              <UserAbsencesTab userId={id} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
