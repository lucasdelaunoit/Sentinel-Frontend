interface PlanningAbsence {
  id: number;
  type: AbsenceType | null;
  start_date: string;
  start_half: Half;
  end_date: string;
  end_half: Half;
  reason?: string | null;
}
