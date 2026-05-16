import { USER_DETAILS, USERS_LIST } from "@/data/users";
import { PROJECTS } from "@/data/projects";
import type {
  PlanningResponse,
  PlanningUser,
  PlanningAbsence,
  PlanningCapacityResponse,
  SimulateAbsenceInput,
  SimulateResponse,
  ProjectImpact,
  ImpactLevel,
} from "@/types/planning";

export const PLANNING_MOCK_ENABLED = true;

function skillMatch(required: string, empSkill: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const r = norm(required);
  const e = norm(empSkill);
  return r === e || r.includes(e) || e.includes(r);
}

function buildPlanningUser(user: (typeof USERS_LIST)[number], month: string): PlanningUser {
  const [yearStr, monthStr] = month.split("-");
  const monthStart = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(Number(yearStr), Number(monthStr), 0).getDate();
  const monthEnd = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;

  const absences: PlanningAbsence[] = user.leaves
    .filter((l) => l.endDate >= monthStart && l.startDate <= monthEnd)
    .map((l, idx) => ({
      id: Number.parseInt(l.id.replace(/[^0-9]/g, ""), 10) || idx + 1,
      type: l.type,
      status: l.status,
      start_date: l.startDate,
      start_half: 0,
      end_date: l.endDate,
      end_half: 1,
      reason: null,
    }));

  const [firstname, ...rest] = user.name.split(" ");
  return {
    id: user.id,
    firstname: firstname ?? user.name,
    lastname: rest.join(" "),
    initials: user.initials,
    title: user.role,
    department: { id: 0, name: user.department },
    color: user.color,
    skills: user.skills.map((s, i) => ({ id: i, name: s.name, level: s.level })),
    projects: user.projects.map((p) => ({ id: Number.parseInt(p.id.replace(/[^0-9]/g, ""), 10), name: p.name })),
    absences,
  };
}

export async function fetchPlanningMock(month: string): Promise<PlanningResponse> {
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === Number(month.slice(0, 4)) && today.getMonth() + 1 === Number(month.slice(5, 7));

  let capacity_today: PlanningResponse["capacity_today"] = null;
  if (isCurrentMonth) {
    const todayStr = today.toISOString().slice(0, 10);
    const total = USERS_LIST.length;
    const onLeave = USERS_LIST.filter((u) =>
      u.leaves.some((l) => l.status === "approved" && l.startDate <= todayStr && l.endDate >= todayStr),
    ).length;
    capacity_today = { available: total - onLeave, on_leave: onLeave, total };
  }

  return {
    month,
    users: USERS_LIST.map((u) => buildPlanningUser(u, month)),
    capacity_today,
  };
}

export async function fetchPlanningCapacityMock(month: string): Promise<PlanningCapacityResponse> {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthNum = Number(monthStr);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const total = USERS_LIST.length;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`;
    const onLeave = USERS_LIST.filter((u) =>
      u.leaves.some((l) => l.status === "approved" && l.startDate <= dateStr && l.endDate >= dateStr),
    ).length;
    const available = total - onLeave;
    return { day, ratio: total === 0 ? 0 : available / total, available, on_leave: onLeave };
  });

  return { days };
}

export async function simulatePlanningMock(absences: SimulateAbsenceInput[]): Promise<SimulateResponse> {
  if (absences.length === 0) {
    return { overall_level: "safe", projects: [], per_user_impact: {} };
  }

  const absentIds = new Set(absences.map((a) => String(a.user_id)));
  const projectMap = new Map<string, ProjectImpact>();
  const perUser: Record<string, ImpactLevel> = {};

  for (const id of absentIds) {
    const emp = USER_DETAILS[id];
    if (!emp) continue;
    for (const pr of emp.projects) {
      if (projectMap.has(pr.id)) continue;
      const project = PROJECTS.find((p) => p.id === pr.id);
      if (!project) continue;
      const activeTeam = project.team
        .filter((m) => !absentIds.has(m.id))
        .map((m) => USER_DETAILS[m.id])
        .filter(Boolean);
      const uncovered: string[] = [];
      const siloed: string[] = [];
      const safe: string[] = [];
      for (const skill of project.skills) {
        const n = activeTeam.filter((m) =>
          m.skills.some((s) => skillMatch(skill, s.name) && s.level >= 2),
        ).length;
        if (n === 0) uncovered.push(skill);
        else if (n === 1) siloed.push(skill);
        else safe.push(skill);
      }
      const level: ImpactLevel =
        uncovered.length > 0 ? "critical" : siloed.length > 0 ? "warning" : "safe";
      projectMap.set(pr.id, {
        id: pr.id,
        name: project.name,
        level,
        uncovered_skills: uncovered,
        siloed_skills: siloed,
        safe_skills: safe,
      });
    }
  }

  const projects = Array.from(projectMap.values());

  for (const id of absentIds) {
    const userProjects = projects.filter((p) => {
      const emp = USER_DETAILS[id];
      return emp?.projects.some((up) => up.id === p.id);
    });
    perUser[id] = userProjects.some((p) => p.level === "critical")
      ? "critical"
      : userProjects.some((p) => p.level === "warning")
        ? "warning"
        : "safe";
  }

  const overall_level: ImpactLevel = projects.some((p) => p.level === "critical")
    ? "critical"
    : projects.some((p) => p.level === "warning")
      ? "warning"
      : "safe";

  return { overall_level, projects, per_user_impact: perUser };
}
