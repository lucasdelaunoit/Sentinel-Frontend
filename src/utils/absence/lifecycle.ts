export type AbsenceLifecycle = "upcoming" | "ongoing" | "past";

export function lifecycleKey(start: string, end: string): AbsenceLifecycle {
  const today = new Date().setHours(0, 0, 0, 0);
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  if (today < s) return "upcoming";
  if (today > e) return "past";
  return "ongoing";
}

export function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function shortDateLabel(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function absenceDuration(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
}

export function dateRelativeLabel(date: string, kind: AbsenceLifecycle): string {
  if (kind === "ongoing") return "Today";
  const today = new Date().setHours(0, 0, 0, 0);
  const t = new Date(date).setHours(0, 0, 0, 0);
  const diffDays = Math.round((t - today) / 86_400_000);
  if (kind === "upcoming") {
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays}d`;
  }
  return `${Math.abs(diffDays)}d ago`;
}
