import type { Tone } from "@/lib/theme/tone.ts";

export type FragilityKey = "solid" | "stable" | "stretched" | "fragile" | "critical";

export interface FragilityTier {
  key: FragilityKey;
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

export function getFragilityTier(raw: number): FragilityTier {
  return FRAGILITY_TIERS.find((t) => raw >= t.min && raw <= t.max) ?? FRAGILITY_TIERS[0];
}
