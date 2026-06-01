/**
 * Dashboard mock data layer.
 *
 * Self-contained, narrative-coherent mock powering the resilience-intelligence
 * dashboard cards (Sections 2–5). Built as static data per the PoC decision to
 * decouple the UI from backend gaps; wire to live endpoints in a later pass.
 *
 * Trends (`deteriorating` / `stable` / `improving`) are mocked — there is no
 * historical time-series backend yet.
 */

import type { Tone } from "@/lib/scoring";

/* ─── Shared vocabulary ───────────────────────────────────── */

export type RiskLevel = "critical" | "high" | "medium" | "low";

/** Maps a discrete risk level onto the existing semantic tone scale. */
export const RISK_TONE: Record<RiskLevel, Tone> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
};
