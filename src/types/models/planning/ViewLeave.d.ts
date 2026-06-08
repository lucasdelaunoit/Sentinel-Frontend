interface ViewLeave {
  /** Underlying absence id, so a rendered leave can be traced back to its record. */
  id: number;
  start: number;
  end: number;
  type: AbsenceType | null;
}
