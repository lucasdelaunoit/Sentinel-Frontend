/** GET /users/:id/absences/stats */
interface UserAbsenceStats {
  total_absences: StatCardData;
  days_off: StatCardData;
  upcoming: StatCardData;
}
