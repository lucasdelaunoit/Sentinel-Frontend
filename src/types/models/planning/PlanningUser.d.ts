/**
 * Planning projection of a user: shared org identity (from `User`) plus the month's
 * absences for gantt rendering. Skills/projects/initials/color are NOT planning concerns —
 * initials are derived client-side (getInitials), status drives the avatar variant.
 */
type PlanningUser = Pick<User, "id" | "firstname" | "lastname" | "title" | "department" | "status"> & {
  absences: PlanningAbsence[];
};
