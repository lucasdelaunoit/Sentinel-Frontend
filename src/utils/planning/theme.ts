import type { ImpactLevel } from "@/types/planning";
import type { AbsenceType } from "@/types/dashboard";

export interface SimColor {
  bg: string;
  border: string;
  fg: string;
}

export const SIM_COLORS: readonly SimColor[] = [
  { bg: "var(--planning-sim-1-bg)", border: "var(--planning-sim-1-border)", fg: "var(--planning-sim-1-fg)" },
  { bg: "var(--planning-sim-2-bg)", border: "var(--planning-sim-2-border)", fg: "var(--planning-sim-2-fg)" },
  { bg: "var(--planning-sim-3-bg)", border: "var(--planning-sim-3-border)", fg: "var(--planning-sim-3-fg)" },
  { bg: "var(--planning-sim-4-bg)", border: "var(--planning-sim-4-border)", fg: "var(--planning-sim-4-fg)" },
  { bg: "var(--planning-sim-5-bg)", border: "var(--planning-sim-5-border)", fg: "var(--planning-sim-5-fg)" },
  { bg: "var(--planning-sim-6-bg)", border: "var(--planning-sim-6-border)", fg: "var(--planning-sim-6-fg)" },
] as const;

export function simColor(idx: number): SimColor {
  return SIM_COLORS[idx % SIM_COLORS.length];
}

export interface ImpactTheme {
  text: string;
  bg: string;
  border: string;
  dot: string;
}

export const IMPACT_THEME: Record<ImpactLevel, ImpactTheme> = {
  critical: {
    text: "text-danger-foreground",
    bg: "bg-danger/10",
    border: "border-danger/30",
    dot: "bg-danger",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    dot: "bg-warning",
  },
  safe: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    dot: "bg-success",
  },
};

export interface AbsenceTheme {
  label: string;
  bg: string;
  border: string;
  dot: string;
}

export const ABSENCE_THEME: Record<AbsenceType, AbsenceTheme> = {
  vacation: {
    label: "Vacation",
    bg: "bg-info/10",
    border: "border-info/30",
    dot: "bg-info",
  },
  sick: {
    label: "Sick leave",
    bg: "bg-danger/10",
    border: "border-danger/30",
    dot: "bg-danger",
  },
  conference: {
    label: "Conference",
    bg: "bg-planned/10",
    border: "border-planned/30",
    dot: "bg-planned",
  },
};

export function capacityToneClass(ratio: number): string {
  if (ratio >= 0.9) return "bg-success";
  if (ratio >= 0.7) return "bg-success/70";
  if (ratio >= 0.5) return "bg-warning/70";
  if (ratio >= 0.3) return "bg-warning";
  return "bg-danger";
}
