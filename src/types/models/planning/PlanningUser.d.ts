/**
 * Planning projection of a user: shared org identity (from `User`) plus the month's
 * absences for gantt rendering. Skills/projects/initials/color are NOT planning concerns —
 * initials are derived client-side (getInitials), status drives the avatar variant.
 */
type PlanningUser = Pick<User, "firstname" | "lastname" | "title" | "department" | "status"> & {
  /** Planning endpoint serializes ids as strings (see PlanningService), unlike UserResource. */
  id: string;
  absences: PlanningAbsence[];
};
