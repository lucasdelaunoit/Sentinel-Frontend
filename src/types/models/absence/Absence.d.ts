interface Absence {
  id: number;
  user_id: number;
  start_date: string;
  /** Half of start_date the absence begins on. Null = legacy full-day (treat as "morning"). */
  start_half: AbsenceHalf | null;
  end_date: string;
  /** Half of end_date the absence ends on. Null = legacy full-day (treat as "afternoon"). */
  end_half: AbsenceHalf | null;
  type: AbsenceType | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}
