interface Absence {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  type: AbsenceType | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}
