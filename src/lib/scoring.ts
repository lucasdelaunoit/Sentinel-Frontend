export type FragilityKey = "solid" | "stable" | "stretched" | "fragile" | "critical";
export type TrajectoryKey = "off_course" | "drifting" | "wobbling" | "on_track" | "cruising";

export type Tone = "success" | "warning" | "danger";

export type RiskLevel = "critical" | "high" | "medium" | "low";

/** Maps a discrete risk level onto the semantic tone scale. */
export const RISK_TONE: Record<RiskLevel, Tone> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
};

export interface FragilityTier {
  key: FragilityKey;
  label: string;
  tone: Tone;
  min: number;
  max: number;
}

export interface TrajectoryTier {
  key: TrajectoryKey;
  label: string;
  tone: Tone;
  min: number;
  max: number;
}

export const FRAGILITY_TIERS: FragilityTier[] = [
  { key: "solid", label: "Solid", tone: "success", min: 0, max: 20 },
  { key: "stable", label: "Stable", tone: "success", min: 21, max: 40 },
  { key: "stretched", label: "Stretched", tone: "warning", min: 41, max: 60 },
  { key: "fragile", label: "Fragile", tone: "warning", min: 61, max: 80 },
  { key: "critical", label: "Critical", tone: "danger", min: 81, max: 100 },
];

export const TRAJECTORY_TIERS: TrajectoryTier[] = [
  { key: "off_course", label: "Off course", tone: "danger", min: 0, max: 20 },
  { key: "drifting", label: "Drifting", tone: "warning", min: 21, max: 40 },
  { key: "wobbling", label: "Wobbling", tone: "warning", min: 41, max: 60 },
  { key: "on_track", label: "On track", tone: "success", min: 61, max: 80 },
  { key: "cruising", label: "Cruising", tone: "success", min: 81, max: 100 },
];

export function getFragilityTier(raw: number): FragilityTier {
  return FRAGILITY_TIERS.find((t) => raw >= t.min && raw <= t.max) ?? FRAGILITY_TIERS[0];
}

export function getTrajectoryTier(raw: number): TrajectoryTier {
  return TRAJECTORY_TIERS.find((t) => raw >= t.min && raw <= t.max) ?? TRAJECTORY_TIERS[0];
}

export const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export const TONE_BG: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export const TONE_SOFT_BG: Record<Tone, string> = {
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-danger/10",
};

export const TONE_SOFT_BORDER: Record<Tone, string> = {
  success: "border-success/40",
  warning: "border-warning/40",
  danger: "border-danger/40",
};
