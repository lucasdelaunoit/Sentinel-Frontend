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
