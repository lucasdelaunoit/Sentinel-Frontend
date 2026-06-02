/**
 * Which half of a day an absence boundary falls on.
 * "morning"   → starts/ends at the AM half (08:00–12:00 conceptually)
 * "afternoon" → starts/ends at the PM half (13:00–17:00 conceptually)
 *
 * An absence is the inclusive range [start_date.start_half … end_date.end_half].
 */
type AbsenceHalf = "morning" | "afternoon";
