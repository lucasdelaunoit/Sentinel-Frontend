import { type Tone, TONE_BG, TONE_SOLID_BADGE, TONE_TEXT, deriveFromTone } from "@/lib/theme/tone.ts";

/** Metric severity (ok / warning / critical) mapped onto the semantic tone scale. */
export const SEVERITY_TONE: Record<Severity, Tone> = {
  ok: "success",
  warning: "warning",
  critical: "danger",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  ok: "Safe",
  warning: "Warning",
  critical: "Critical",
};

export const SEVERITY_TEXT = deriveFromTone(SEVERITY_TONE, TONE_TEXT);

/** Solid fill — dots, avatars, filled bars. */
export const SEVERITY_BG = deriveFromTone(SEVERITY_TONE, TONE_BG);

/** Solid badge/chip classes. */
export const SEVERITY_BADGE = deriveFromTone(SEVERITY_TONE, TONE_SOLID_BADGE);

/** Subtle cell/row tint — escalates with severity, invisible when ok. */
export const SEVERITY_TINT: Record<Severity, string> = {
  ok: "",
  warning: "bg-warning/10",
  critical: "bg-danger/20",
};
