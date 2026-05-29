/* ── Absence domain types ────────────────────────────────── */

export enum AbsenceType {
  Vacation = "vacation",
  Conference = "conference",
  Training = "training",
  Parental = "parental",
  Sabbatical = "sabbatical",
  Other = "other",
}

export interface Absence {
  id: number;
  user_id: number;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  type: AbsenceType | null;
  reason: string | null;
  created_at: string; // ISO8601
  updated_at: string;
}

/** Back-compat alias — call sites still use AbsenceItem. */
export type AbsenceItem = Absence;

export const ABSENCE_TYPE_LABEL: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "Vacation",
  [AbsenceType.Conference]: "Conference",
  [AbsenceType.Training]: "Training",
  [AbsenceType.Parental]: "Parental leave",
  [AbsenceType.Sabbatical]: "Sabbatical",
  [AbsenceType.Other]: "Other",
};

/** All enum values, for iteration (filter dropdowns, legends, etc.). */
export const ABSENCE_TYPE_VALUES: AbsenceType[] = Object.values(AbsenceType);

/** Safe label lookup with null fallback. */
export function absenceTypeLabel(type: AbsenceType | null | undefined, fallback = "Unspecified"): string {
  if (!type) return fallback;
  return ABSENCE_TYPE_LABEL[type] ?? fallback;
}
