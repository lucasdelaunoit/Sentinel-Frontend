/**
 * Half-day absence math.
 *
 * An absence spans the inclusive range [start_date.start_half … end_date.end_half].
 * Every day has two slots: morning (0) and afternoon (1). A "slot index" linearises
 * a (date, half) pair so ranges can be compared with plain integer arithmetic:
 *
 *   slot = dayIndex * 2 + (half === "afternoon" ? 1 : 0)
 *
 * Examples (0.5 = half day):
 *   morning-only single day      → start AM, end AM   → 0.5d
 *   afternoon-only single day    → start PM, end PM   → 0.5d
 *   full single day              → start AM, end PM   → 1d
 *   AM day A → AM day B (adj.)   → 1.5d
 */

import { shortDateLabel } from "@/utils/absence/lifecycle.ts";

export const ABSENCE_HALF_VALUES: AbsenceHalf[] = ["morning", "afternoon"];

export const ABSENCE_HALF_LABEL: Record<AbsenceHalf, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
};

export const ABSENCE_HALF_SHORT: Record<AbsenceHalf, string> = {
  morning: "AM",
  afternoon: "PM",
};

/** A boundary-half range. Halves may be null for legacy full-day records. */
export interface HalfRange {
  start_date: string;
  start_half?: AbsenceHalf | null;
  end_date: string;
  end_half?: AbsenceHalf | null;
}

/** Days since epoch for a "YYYY-MM-DD" string, timezone-safe. */
function dayIndex(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** Days since epoch for a Date, using its local Y/M/D (matches dayIndex). */
function dayIndexOf(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

function slot(date: string, half: AbsenceHalf): number {
  return dayIndex(date) * 2 + (half === "afternoon" ? 1 : 0);
}

/** Resolve a range to its inclusive [start, end] slot indices, applying legacy defaults. */
function rangeSlots(range: HalfRange): { start: number; end: number } {
  return {
    start: slot(range.start_date, range.start_half ?? "morning"),
    end: slot(range.end_date, range.end_half ?? "afternoon"),
  };
}

/** True when end is on or after start once halves are taken into account. */
export function isValidHalfRange(range: HalfRange): boolean {
  const { start, end } = rangeSlots(range);
  return end >= start;
}

/** Duration in days (multiples of 0.5). */
export function halfRangeDuration(range: HalfRange): number {
  const { start, end } = rangeSlots(range);
  return Math.max(0.5, (end - start + 1) / 2);
}

export type DayCoverage = "full" | "morning" | "afternoon";

/**
 * How much of `date` a range covers: both halves ("full"), the AM half only,
 * the PM half only, or null when the date is entirely outside the range.
 */
export function dayCoverage(range: HalfRange, date: Date): DayCoverage | null {
  const { start, end } = rangeSlots(range);
  const di = dayIndexOf(date);
  const morningCovered = di * 2 >= start && di * 2 <= end;
  const afternoonCovered = di * 2 + 1 >= start && di * 2 + 1 <= end;
  if (morningCovered && afternoonCovered) return "full";
  if (morningCovered) return "morning";
  if (afternoonCovered) return "afternoon";
  return null;
}

/** Two ranges overlap when their inclusive slot intervals intersect. */
export function rangesOverlap(a: HalfRange, b: HalfRange): boolean {
  const sa = rangeSlots(a);
  const sb = rangeSlots(b);
  return sa.start <= sb.end && sb.start <= sa.end;
}

/**
 * First existing absence that overlaps `candidate`, or null.
 * `excludeId` skips a record (used when editing it).
 */
export function findOverlappingAbsence<T extends HalfRange & { id: number }>(
  candidate: HalfRange,
  existing: T[],
  excludeId?: number,
): T | null {
  if (!candidate.start_date || !candidate.end_date) return null;
  for (const absence of existing) {
    if (absence.id === excludeId) continue;
    if (rangesOverlap(candidate, absence)) return absence;
  }
  return null;
}

/** "10 Jun (AM) → 12 Jun (PM)" — human-readable range with half hints. */
export function formatHalfRange(range: HalfRange): string {
  const start = shortDateLabel(range.start_date);
  const end = shortDateLabel(range.end_date);
  const startTag = ABSENCE_HALF_SHORT[range.start_half ?? "morning"];
  const endTag = ABSENCE_HALF_SHORT[range.end_half ?? "afternoon"];
  return `${start} (${startTag}) → ${end} (${endTag})`;
}
