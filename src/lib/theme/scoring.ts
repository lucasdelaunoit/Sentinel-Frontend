import type { Tone } from "@/lib/theme/tone.ts";

export type FragilityKey = "solid" | "stable" | "stretched" | "fragile" | "critical";
export type TrajectoryKey = "off_course" | "drifting" | "wobbling" | "on_track" | "cruising";

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
