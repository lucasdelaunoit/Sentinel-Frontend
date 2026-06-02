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
  /** Raw calendar span in days (half-aware), weekends & holidays included. */
  total_days: number;
  /**
   * Working days actually consumed — weekends + company holidays removed.
   * Live-recomputed while the absence is upcoming, frozen once it starts (hybrid policy).
   */
  normalized_days: number;
  created_at: string;
  updated_at: string;
}
