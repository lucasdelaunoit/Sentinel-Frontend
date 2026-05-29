import { AbsenceType, ABSENCE_TYPE_LABEL } from "@/types/absence";

/* ── Per-type Tailwind class maps ────────────────────────── */

export const ABSENCE_TYPE_DOT: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-500",
  [AbsenceType.Conference]: "bg-violet-500",
  [AbsenceType.Training]: "bg-amber-500",
  [AbsenceType.Parental]: "bg-emerald-500",
  [AbsenceType.Sabbatical]: "bg-indigo-500",
  [AbsenceType.Other]: "bg-slate-500",
};

export const ABSENCE_TYPE_CALENDAR_BG: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-500/15 text-blue-700 ring-blue-300/60",
  [AbsenceType.Conference]: "bg-violet-500/15 text-violet-700 ring-violet-300/60",
  [AbsenceType.Training]: "bg-amber-500/15 text-amber-700 ring-amber-300/60",
  [AbsenceType.Parental]: "bg-emerald-500/15 text-emerald-700 ring-emerald-300/60",
  [AbsenceType.Sabbatical]: "bg-indigo-500/15 text-indigo-700 ring-indigo-300/60",
  [AbsenceType.Other]: "bg-slate-500/15 text-slate-700 ring-slate-300/60",
};

const NEUTRAL = {
  dot: "bg-muted-foreground",
  calendarBg: "bg-muted text-muted-foreground ring-border/60",
  pillBg: "bg-muted",
  text: "text-muted-foreground",
  label: "Unspecified",
};

/* ── Null-safe accessors ─────────────────────────────────── */

export function typeDot(t: AbsenceType | null) {
  return t ? ABSENCE_TYPE_DOT[t] : NEUTRAL.dot;
}
export function typeCalendarBg(t: AbsenceType | null) {
  return t ? ABSENCE_TYPE_CALENDAR_BG[t] : NEUTRAL.calendarBg;
}
export function typeLabel(t: AbsenceType | null) {
  return t ? ABSENCE_TYPE_LABEL[t] : NEUTRAL.label;
}
