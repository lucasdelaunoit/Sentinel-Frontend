/**
 * Planning-specific projection of a user (skills/projects/absences for a month).
 * Distinct from the org-wide `User` model — different shape and purpose.
 */
interface PlanningUser {
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
