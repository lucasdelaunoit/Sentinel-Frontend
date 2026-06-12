/** Skill proficiency scale (1–5). */
export const SKILL_LEVEL_MAX = 5;

export const SKILL_LEVEL_LABEL: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

/** Label for a level, or a fallback when the level is missing/out of range. */
export function skillLevelLabel(level: number | null | undefined, fallback = "—"): string {
  return (level != null && SKILL_LEVEL_LABEL[level]) || fallback;
}

/** Selected-state classes per level for level pickers. */
export const SKILL_LEVEL_PICKER_CLASS: Record<number, string> = {
  1: "bg-planned-foreground text-planned border-planned",
  2: "bg-danger-foreground text-danger border-danger",
  3: "bg-warning-foreground text-warning border-warning",
  4: "bg-info-foreground text-info border-info",
  5: "bg-success-foreground text-success border-success",
};
