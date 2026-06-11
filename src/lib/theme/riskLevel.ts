import type { Tone } from "@/lib/theme/tone.ts";

export type RiskLevel = "critical" | "high" | "medium" | "low";

/** Maps a discrete risk level onto the semantic tone scale. */
export const RISK_TONE: Record<RiskLevel, Tone> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};
