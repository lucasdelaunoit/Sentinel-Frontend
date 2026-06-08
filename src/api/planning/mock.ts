import { USER_DETAILS, USERS_LIST } from "@/data/users";
import { PROJECTS } from "@/data/projects";

export const PLANNING_MOCK_ENABLED = false;

/* ─────────────────────── helpers ─────────────────────── */

function skillMatch(required: string, empSkill: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const r = norm(required);
  const e = norm(empSkill);
  return r === e || r.includes(e) || e.includes(r);
}

function severityFromImpact(level: ImpactLevel): PlanningSeverity {
  return level === "critical" ? "critical" : level === "warning" ? "medium" : "safe";
}

function eachDate(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(start);
  const e = new Date(end);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function halfDuration(a: SimulateAbsenceInput): number {
  const days = eachDate(a.start_date, a.end_date).length;
  let total = days;
  if (a.start_half === 1) total -= 0.5;
  if (a.end_half === 0) total -= 0.5;
  return Math.max(0.5, total);
}

function isWeekend(date: string): boolean {
  const d = new Date(date).getDay();
  return d === 0 || d === 6;
}

/* ─────────────────────── month payload ─────────────────────── */

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
      u.leaves.some((l) => l.startDate <= todayStr && l.endDate >= todayStr),
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
      u.leaves.some((l) => l.startDate <= dateStr && l.endDate >= dateStr),
    ).length;
    const available = total - onLeave;
    return { day, ratio: total === 0 ? 0 : available / total, available, on_leave: onLeave };
  });

  return { days };
}

/* ─────────────────────── baseline (no sim) ─────────────────────── */

const BASELINE = {
  risk_score: 42,
  bus_factor: 3,
  coverage_pct: 78,
  projects_healthy_count: PROJECTS.filter((p) => p.health >= 70).length,
};

function emptyResponse(month: string): SimulateResponse {
  return {
    totals: {
      risk_score: BASELINE.risk_score,
      risk_score_delta: 0,
      bus_factor: BASELINE.bus_factor,
      bus_factor_delta: 0,
      coverage_pct: BASELINE.coverage_pct,
      coverage_delta_pct: 0,
      absent_fte_days: 0,
      absent_headcount_peak: 0,
      absent_headcount_peak_date: null,
      org_capacity_loss_pct: 0,
      projects_at_risk_count: 0,
      projects_blocked_count: 0,
      critical_skills_uncovered_count: 0,
      severity: "safe",
    },
    per_user_impact: {},
    per_project_impact: [],
    per_skill_impact: [],
    per_day_load: [],
    hotspots: [],
    skill_concentration_shifts: [],
    cascading_risks: [],
    warnings: [],
    recommendations: [],
    comparison_vs_baseline: {
      risk_score: { before: BASELINE.risk_score, after: BASELINE.risk_score, delta_pct: 0 },
      bus_factor: { before: BASELINE.bus_factor, after: BASELINE.bus_factor },
      coverage_pct: { before: BASELINE.coverage_pct, after: BASELINE.coverage_pct },
      projects_healthy_count: { before: BASELINE.projects_healthy_count, after: BASELINE.projects_healthy_count },
    },
    meta: {
      computed_at: new Date().toISOString(),
      computation_ms: 1,
      absences_evaluated: 0,
      month,
    },
    overall_level: "safe",
    projects: [],
  };
}

/* ─────────────────────── rich simulate ─────────────────────── */

export async function simulatePlanningMock(absences: SimulateAbsenceInput[]): Promise<SimulateResponse> {
  const month = absences[0]?.start_date.slice(0, 7) ?? new Date().toISOString().slice(0, 7);
  if (absences.length === 0) return emptyResponse(month);

  const startTs = Date.now();
  const absentIds = new Set(absences.map((a) => String(a.user_id)));

  /* per-user duration totals */
  const userDays: Record<string, number> = {};
  for (const a of absences) {
    const id = String(a.user_id);
    userDays[id] = (userDays[id] ?? 0) + halfDuration(a);
  }

  /* per-project impact */
  const projectImpacts: ProjectImpact[] = [];
  const skillAggregator = new Map<string, { id: number; name: string; ownersAbsent: Set<string>; ownersTotal: Set<string>; projects: Set<number>; datesUncovered: Set<string>; isCritical: boolean }>();

  for (const project of PROJECTS) {
    const teamIds = project.team.map((m) => m.id);
    const affectedByAbsence = teamIds.some((id) => absentIds.has(id));
    if (!affectedByAbsence) continue;

    const activeTeam = project.team.filter((m) => !absentIds.has(m.id)).map((m) => USER_DETAILS[m.id]).filter(Boolean);
    const fullTeam = project.team.map((m) => USER_DETAILS[m.id]).filter(Boolean);

    const uncovered: string[] = [];
    const siloed: string[] = [];
    const safe: string[] = [];
    const skillsAtRisk: ProjectImpact["skills_at_risk"] = [];
    const spofs: ProjectImpact["single_points_of_failure_created"] = [];

    project.skills.forEach((skillName, sIdx) => {
      const ownersBefore = fullTeam.filter((m) => m.skills.some((s) => skillMatch(skillName, s.name) && s.level >= 2));
      const ownersAfter = activeTeam.filter((m) => m.skills.some((s) => skillMatch(skillName, s.name) && s.level >= 2));
      const ownersLost = ownersBefore.filter((m) => !ownersAfter.find((a) => a.id === m.id)).map((m) => m.id);

      const cBefore = ownersBefore.length;
      const cAfter = ownersAfter.length;
      let sev: PlanningSeverity = "safe";
      if (cAfter === 0) {
        uncovered.push(skillName);
        sev = "critical";
      } else if (cAfter === 1) {
        siloed.push(skillName);
        sev = "medium";
        if (cBefore > 1) spofs.push({ skill_id: sIdx, skill_name: skillName, owner_left: ownersAfter[0].id });
      } else {
        safe.push(skillName);
      }

      if (cBefore !== cAfter) {
        const datesAffected = absences
          .filter((a) => ownersLost.includes(String(a.user_id)))
          .flatMap((a) => eachDate(a.start_date, a.end_date));

        skillsAtRisk.push({
          skill_id: sIdx,
          name: skillName,
          required_level: 3,
          owners_left: cAfter,
          owners_lost: ownersLost,
          severity: sev,
          dates_affected: Array.from(new Set(datesAffected)),
        });

        const key = skillName;
        const acc = skillAggregator.get(key) ?? {
          id: sIdx,
          name: skillName,
          ownersAbsent: new Set<string>(),
          ownersTotal: new Set<string>(),
          projects: new Set<number>(),
          datesUncovered: new Set<string>(),
          isCritical: sev === "critical",
        };
        ownersBefore.forEach((m) => acc.ownersTotal.add(m.id));
        ownersLost.forEach((id) => acc.ownersAbsent.add(id));
        acc.projects.add(Number.parseInt(project.id.replace(/[^0-9]/g, ""), 10));
        if (sev === "critical") {
          datesAffected.forEach((d) => acc.datesUncovered.add(d));
          acc.isCritical = true;
        }
        skillAggregator.set(key, acc);
      }
    });

    const level: ImpactLevel = uncovered.length > 0 ? "critical" : siloed.length > 0 ? "warning" : "safe";
    const statusBefore: ProjectImpact["status_before"] = project.health >= 70 ? "healthy" : "at_risk";
    const statusAfter: ProjectImpact["status_after"] =
      uncovered.length > 0 ? "blocked" : siloed.length > 0 ? "at_risk" : statusBefore;

    const busBefore = project.busFactor;
    const busAfter = Math.max(1, busBefore - Math.min(absences.filter((a) => teamIds.includes(String(a.user_id))).length, busBefore - 1));
    const covBefore = Math.round((safe.length + siloed.length + uncovered.length === 0 ? 100 : ((safe.length + siloed.length) / project.skills.length) * 100));
    const covAfter = Math.round(project.skills.length === 0 ? 100 : (safe.length / project.skills.length) * 100);
    const riskBefore = project.riskScore;
    const riskAfter = Math.min(100, riskBefore + uncovered.length * 18 + siloed.length * 8);

    projectImpacts.push({
      project_id: Number.parseInt(project.id.replace(/[^0-9]/g, ""), 10),
      name: project.name,
      status_before: statusBefore,
      status_after: statusAfter,
      bus_factor_before: busBefore,
      bus_factor_after: busAfter,
      bus_factor_delta: busAfter - busBefore,
      coverage_pct_before: covBefore,
      coverage_pct_after: covAfter,
      coverage_delta_pct: covAfter - covBefore,
      risk_score_before: riskBefore,
      risk_score_after: riskAfter,
      risk_delta: riskAfter - riskBefore,
      skills_at_risk: skillsAtRisk,
      single_points_of_failure_created: spofs,
      milestones_at_risk:
        statusAfter === "blocked"
          ? [{ id: `${project.id}-m1`, name: "Next milestone", date: project.endDate, confidence_delta_pct: -25 }]
          : [],
      effective_team_size_before: fullTeam.length,
      effective_team_size_after: activeTeam.length,
      recommendation:
        uncovered.length > 0 ? `Cover ${uncovered[0]} — reassign or upskill` : siloed.length > 0 ? `Cross-train on ${siloed[0]}` : null,
      level,
    });
  }

  /* per-user impact */
  const perUser: Record<string, UserImpact> = {};
  for (const id of absentIds) {
    const emp = USER_DETAILS[id];
    if (!emp) continue;
    const empProjectsImpact = projectImpacts.filter((p) =>
      emp.projects.some((up) => Number.parseInt(up.id.replace(/[^0-9]/g, ""), 10) === p.project_id),
    );
    const level: ImpactLevel = empProjectsImpact.some((p) => p.level === "critical")
      ? "critical"
      : empProjectsImpact.some((p) => p.level === "warning")
        ? "warning"
        : "safe";
    const daysOff = userDays[id] ?? 0;
    const candidates = USERS_LIST.filter((u) => !absentIds.has(u.id) && u.id !== id)
      .map((u) => {
        const overlap = emp.skills.filter((s) => u.skills.some((us) => skillMatch(s.name, us.name))).length;
        const pct = emp.skills.length === 0 ? 0 : Math.round((overlap / emp.skills.length) * 100);
        return { user_id: u.id, name: u.name, skill_match_pct: pct, available_days: Math.max(0, 20 - daysOff), cost_signal: pct >= 70 ? ("ok" as const) : pct >= 40 ? ("stretch" as const) : ("overloaded" as const) };
      })
      .sort((a, b) => b.skill_match_pct - a.skill_match_pct)
      .slice(0, 3);

    perUser[id] = {
      user_id: id,
      level,
      days_off: daysOff,
      working_days_in_month: 20,
      absence_ratio_pct: Math.round((daysOff / 20) * 100),
      skills_uncovered: empProjectsImpact
        .flatMap((p) => p.skills_at_risk.filter((s) => s.severity === "critical"))
        .map((s) => ({ skill_id: s.skill_id, name: s.name, level: 4, is_critical: true, owners_left: s.owners_left })),
      projects_affected: empProjectsImpact.map((p) => ({
        project_id: p.project_id,
        name: p.name,
        role: emp.projects.find((up) => Number.parseInt(up.id.replace(/[^0-9]/g, ""), 10) === p.project_id)?.role ?? null,
        criticality: severityFromImpact(p.level),
      })),
      replacement_candidates: candidates,
      overlap_with_other_sims: Array.from(absentIds)
        .filter((other) => other !== id)
        .map((other) => {
          const myDates = new Set(absences.filter((a) => String(a.user_id) === id).flatMap((a) => eachDate(a.start_date, a.end_date)));
          const otherDates = absences.filter((a) => String(a.user_id) === other).flatMap((a) => eachDate(a.start_date, a.end_date));
          const shared = otherDates.filter((d) => myDates.has(d));
          return shared.length > 0 ? { user_id: other, dates: shared } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
      is_critical_employee: emp.criticality === "High",
      bus_factor_contribution: emp.busFactor,
    };
  }

  /* per-skill impact */
  const perSkill: SkillImpact[] = Array.from(skillAggregator.values()).map((agg) => {
    const ownersTotal = agg.ownersTotal.size;
    const ownersLeft = Math.max(0, ownersTotal - agg.ownersAbsent.size);
    const covBefore = ownersTotal === 0 ? 100 : 100;
    const covAfter = ownersTotal === 0 ? 100 : Math.round((ownersLeft / ownersTotal) * 100);
    const severity: PlanningSeverity = ownersLeft === 0 ? "critical" : ownersLeft === 1 ? "high" : ownersLeft <= 2 ? "medium" : "low";
    return {
      skill_id: agg.id,
      name: agg.name,
      category: null,
      is_critical_for_org: agg.isCritical,
      owners_total: ownersTotal,
      owners_absent: agg.ownersAbsent.size,
      owners_left: ownersLeft,
      coverage_pct_before: covBefore,
      coverage_pct_after: covAfter,
      redundancy_before: Math.max(0, ownersTotal - 1),
      redundancy_after: Math.max(0, ownersLeft - 1),
      dates_uncovered: Array.from(agg.datesUncovered).sort(),
      projects_impacted: Array.from(agg.projects),
      severity,
    };
  });

  /* per-day load */
  const dayMap = new Map<string, { absents: Set<string>; fte: number }>();
  for (const a of absences) {
    const dates = eachDate(a.start_date, a.end_date);
    dates.forEach((d, i) => {
      const acc = dayMap.get(d) ?? { absents: new Set<string>(), fte: 0 };
      acc.absents.add(String(a.user_id));
      let weight = 1;
      if (i === 0 && a.start_half === 1) weight = 0.5;
      if (i === dates.length - 1 && a.end_half === 0) weight = 0.5;
      acc.fte += weight;
      dayMap.set(d, acc);
    });
  }

  const total = USERS_LIST.length;
  const perDayLoad: DayLoad[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, info]) => {
      const ratio = info.absents.size / total;
      const sev: PlanningSeverity = ratio >= 0.4 ? "critical" : ratio >= 0.25 ? "high" : ratio >= 0.15 ? "medium" : ratio > 0 ? "low" : "safe";
      return {
        date,
        is_weekend: isWeekend(date),
        is_holiday: false,
        absent_user_ids: Array.from(info.absents),
        absent_count: info.absents.size,
        absent_fte: info.fte,
        coverage_pct: Math.round((1 - ratio) * 100),
        capacity_pct: Math.round((1 - info.fte / total) * 100),
        critical_skills_uncovered: perSkill
          .filter((s) => s.severity === "critical" && s.dates_uncovered.includes(date))
          .map((s) => s.skill_id),
        severity: sev,
      };
    });

  /* hotspots */
  const hotspots: Hotspot[] = [];
  let run: { start: string; end: string; days: DayLoad[] } | null = null;
  for (const d of perDayLoad) {
    if (d.severity === "high" || d.severity === "critical") {
      if (!run) run = { start: d.date, end: d.date, days: [d] };
      else {
        run.end = d.date;
        run.days.push(d);
      }
    } else if (run) {
      hotspots.push({
        date_range: [run.start, run.end],
        reason: `${run.days[0].absent_count} absences overlap`,
        absent_user_ids: Array.from(new Set(run.days.flatMap((x) => x.absent_user_ids))),
        projects_impacted: Array.from(new Set(projectImpacts.filter((p) => p.level !== "safe").map((p) => p.project_id))),
        severity: run.days.some((x) => x.severity === "critical") ? "critical" : "high",
      });
      run = null;
    }
  }
  if (run) {
    hotspots.push({
      date_range: [run.start, run.end],
      reason: `${run.days[0].absent_count} absences overlap`,
      absent_user_ids: Array.from(new Set(run.days.flatMap((x) => x.absent_user_ids))),
      projects_impacted: Array.from(new Set(projectImpacts.filter((p) => p.level !== "safe").map((p) => p.project_id))),
      severity: run.days.some((x) => x.severity === "critical") ? "critical" : "high",
    });
  }

  /* skill concentration shifts */
  const shifts: SkillConcentrationShift[] = perSkill
    .filter((s) => s.owners_left === 1 && s.owners_total > 1)
    .map((s) => ({
      skill_id: s.skill_id,
      skill_name: s.name,
      from_owners: s.owners_total,
      to_owners: s.owners_left,
      new_sole_owner: null,
      creates_bus_factor_1: true,
    }));

  /* cascading risks */
  const cascading: CascadingRisk[] = [];
  for (const id of absentIds) {
    const emp = USER_DETAILS[id];
    if (!emp || emp.criticality !== "High") continue;
    cascading.push({
      type: "DOMINO",
      trigger_user_id: id,
      if_also_absent: [],
      consequence: `If a second senior is absent, ${emp.projects[0]?.name ?? "key project"} blocks`,
      probability_hint: "moderate",
    });
  }

  /* warnings */
  const warnings: SimWarning[] = [];
  for (const s of perSkill) {
    if (s.owners_left === 0) {
      s.dates_uncovered.forEach((date) =>
        warnings.push({ code: "CRITICAL_SKILL_GONE", severity: "critical", skill_id: s.skill_id, date, message: `No ${s.name} owner on ${date}`, actionable: true }),
      );
    }
  }
  for (const sh of shifts) {
    warnings.push({ code: "BUS_FACTOR_1_CREATED", severity: "high", skill_id: sh.skill_id, message: `${sh.skill_name} → bus factor 1` });
  }
  for (const d of perDayLoad) {
    if (d.absent_count >= 4) {
      warnings.push({ code: "PEAK_OVERLAP", severity: "high", date: d.date, user_ids: d.absent_user_ids, message: `${d.absent_count} absences overlap on ${d.date}` });
    }
  }

  /* recommendations */
  const recs: Recommendation[] = [];
  let recId = 1;
  for (const u of Object.values(perUser)) {
    const top = u.replacement_candidates[0];
    if (u.level === "critical" && top && top.skill_match_pct >= 70) {
      recs.push({
        id: `r${recId++}`,
        type: "REASSIGN",
        priority: recId,
        title: `Cover for ${USER_DETAILS[u.user_id]?.name ?? u.user_id}`,
        detail: `Assign ${top.name} (${top.skill_match_pct}% skill match) during absence`,
        impact_preview: { risk_score_delta: -12, coverage_delta_pct: 8 },
      });
    }
  }
  for (const s of perSkill.filter((x) => x.owners_left <= 1 && x.is_critical_for_org)) {
    recs.push({
      id: `r${recId++}`,
      type: "UPSKILL",
      priority: recId,
      title: `Cross-train on ${s.name}`,
      detail: `Only ${s.owners_left} owner${s.owners_left === 1 ? "" : "s"} left — train one more engineer`,
    });
  }
  for (const h of hotspots.filter((x) => x.severity === "critical")) {
    recs.push({
      id: `r${recId++}`,
      type: "RESCHEDULE",
      priority: recId,
      title: `Spread absences around ${h.date_range[0]}`,
      detail: `${h.absent_user_ids.length} overlapping — shift one absence by 2 days`,
      impact_preview: { absent_headcount_peak: Math.max(1, h.absent_user_ids.length - 1) },
    });
  }

  /* totals */
  const headcountPeak = perDayLoad.reduce(
    (max, d) => (d.absent_count > max.count ? { count: d.absent_count, date: d.date } : max),
    { count: 0, date: null as string | null },
  );
  const fteDays = perDayLoad.reduce((sum, d) => sum + d.absent_fte, 0);
  const projectsAtRisk = projectImpacts.filter((p) => p.level !== "safe").length;
  const projectsBlocked = projectImpacts.filter((p) => p.status_after === "blocked").length;
  const criticalSkillsCount = perSkill.filter((s) => s.severity === "critical").length;
  const riskAfter = Math.min(100, BASELINE.risk_score + projectsAtRisk * 5 + projectsBlocked * 10 + criticalSkillsCount * 6);
  const coverageAfter = Math.max(0, BASELINE.coverage_pct - projectsAtRisk * 3 - criticalSkillsCount * 4);
  const busAfter = Math.max(1, BASELINE.bus_factor - shifts.length);

  const severity: PlanningSeverity =
    criticalSkillsCount > 0 || projectsBlocked > 0 ? "critical" : projectsAtRisk > 0 ? "high" : "low";
  const overall_level: ImpactLevel = severity === "critical" ? "critical" : severity === "high" ? "warning" : "safe";

  return {
    totals: {
      risk_score: riskAfter,
      risk_score_delta: riskAfter - BASELINE.risk_score,
      bus_factor: busAfter,
      bus_factor_delta: busAfter - BASELINE.bus_factor,
      coverage_pct: coverageAfter,
      coverage_delta_pct: coverageAfter - BASELINE.coverage_pct,
      absent_fte_days: Math.round(fteDays * 10) / 10,
      absent_headcount_peak: headcountPeak.count,
      absent_headcount_peak_date: headcountPeak.date,
      org_capacity_loss_pct: Math.round((fteDays / (total * 20)) * 100),
      projects_at_risk_count: projectsAtRisk,
      projects_blocked_count: projectsBlocked,
      critical_skills_uncovered_count: criticalSkillsCount,
      severity,
    },
    per_user_impact: perUser,
    per_project_impact: projectImpacts,
    per_skill_impact: perSkill,
    per_day_load: perDayLoad,
    hotspots,
    skill_concentration_shifts: shifts,
    cascading_risks: cascading,
    warnings,
    recommendations: recs,
    comparison_vs_baseline: {
      risk_score: { before: BASELINE.risk_score, after: riskAfter, delta_pct: Math.round(((riskAfter - BASELINE.risk_score) / BASELINE.risk_score) * 100) },
      bus_factor: { before: BASELINE.bus_factor, after: busAfter },
      coverage_pct: { before: BASELINE.coverage_pct, after: coverageAfter },
      projects_healthy_count: { before: BASELINE.projects_healthy_count, after: BASELINE.projects_healthy_count - projectsBlocked },
    },
    meta: {
      computed_at: new Date().toISOString(),
      computation_ms: Date.now() - startTs,
      absences_evaluated: absences.length,
      month,
    },
    overall_level,
    projects: projectImpacts,
  };
}
