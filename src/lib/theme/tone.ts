/**
 * Semantic tone scale — the single source of truth for risk/status coloring.
 *
 * Every domain enum (Severity, RiskLevel, coverage status, …) maps onto a Tone,
 * and every component resolves its classes from these maps. Class strings are
 * written out in full so the Tailwind JIT can see them — never build them with
 * template literals.
 */
export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-neutral",
};

export const TONE_BG: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-neutral",
};

export const TONE_SOFT_BG: Record<Tone, string> = {
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-danger/10",
  info: "bg-info/10",
  neutral: "bg-neutral/10",
};

export const TONE_SOFT_BORDER: Record<Tone, string> = {
  success: "border-success/40",
  warning: "border-warning/40",
  danger: "border-danger/40",
  info: "border-info/40",
  neutral: "border-neutral/40",
};

/** Solid chip: tone fill, page-background text. The standard Badge treatment. */
export const TONE_SOLID_BADGE: Record<Tone, string> = {
  success: "bg-success text-background",
  warning: "bg-warning text-background",
  danger: "bg-danger text-background",
  info: "bg-info text-background",
  neutral: "bg-neutral text-background",
};

/** Soft chip: translucent tone fill, tone-colored text. */
export const TONE_SOFT_BADGE: Record<Tone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  neutral: "bg-neutral/15 text-neutral",
};

/** Raw CSS variable, for chart fills (recharts, …) where Tailwind classes don't reach. */
export const TONE_CSS_VAR: Record<Tone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
  neutral: "var(--neutral)",
};

/** Projects a tone-keyed class map onto any domain enum that maps to Tone. */
export function deriveFromTone<K extends string>(
  toneByKey: Record<K, Tone>,
  toneMap: Record<Tone, string>,
): Record<K, string> {
  return Object.fromEntries(
    (Object.entries(toneByKey) as [K, Tone][]).map(([key, tone]) => [key, toneMap[tone]]),
  ) as Record<K, string>;
}
