import type { AbsenceType } from "@/types/absence";

export type ImpactLevel = "critical" | "warning" | "safe";
export type PlanningMode = "view" | "simulate";
export type Half = 0 | 1;

export interface SimBlock {
  id: string;
  userId: string;
  startDate: string;
  startHalf: Half;
  endDate: string;
  endHalf: Half;
  colorIdx: number;
}

export interface ViewLeave {
  start: number;
  end: number;
  type: AbsenceType | null;
}

export interface BlockDisplayRange {
  startDay: number;
  endDay: number;
  startHalf: Half;
  endHalf: Half;
  clippedStart: boolean;
  clippedEnd: boolean;
}

export interface PlanningAbsence {
  id: number;
  type: AbsenceType | null;
  start_date: string;
  start_half: Half;
  end_date: string;
  end_half: Half;
  reason?: string | null;
}

export interface PlanningUserSkill {
  id: number;
  name: string;
  level: number;
}

export interface PlanningUserProject {
  id: number;
  name: string;
}

export interface PlanningUser {
  id: string;
  firstname: string;
  lastname: string;
  initials: string;
  title: string;
  department: { id: number; name: string } | null;
  color: string;
  skills: PlanningUserSkill[];
  projects: PlanningUserProject[];
  absences: PlanningAbsence[];
}

export interface PlanningCapacityToday {
  available: number;
  on_leave: number;
  total: number;
}

export interface PlanningResponse {
  month: string;
  users: PlanningUser[];
  capacity_today: PlanningCapacityToday | null;
}

export interface PlanningCapacityDay {
  day: number;
  ratio: number;
  available: number;
  on_leave: number;
}

export interface PlanningCapacityResponse {
  days: PlanningCapacityDay[];
}

export interface SimulateAbsenceInput {
  user_id: string;
  start_date: string;
  start_half: Half;
  end_date: string;
  end_half: Half;
}

export interface ProjectImpact {
  id: string;
  name: string;
  level: ImpactLevel;
  uncovered_skills: string[];
  siloed_skills: string[];
  safe_skills: string[];
}

export interface SimulateResponse {
  overall_level: ImpactLevel;
  projects: ProjectImpact[];
  per_user_impact: Record<string, ImpactLevel>;
}
