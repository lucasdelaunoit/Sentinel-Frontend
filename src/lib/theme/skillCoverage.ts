import { type Tone, TONE_SOLID_BADGE, TONE_TEXT, deriveFromTone } from "@/lib/theme/tone.ts";

/** Project knowledge coverage status mapped onto the semantic tone scale. */
export const COVERAGE_TONE: Record<ProjectKnowledgeCoverageStatus, Tone> = {
  uncovered: "danger",
  silo: "warning",
  covered: "success",
};

export const COVERAGE_LABEL: Record<ProjectKnowledgeCoverageStatus, string> = {
  uncovered: "Uncovered",
  silo: "Knowledge Silo",
  covered: "Covered",
};

export const COVERAGE_TEXT = deriveFromTone(COVERAGE_TONE, TONE_TEXT);

/** Solid badge/chip classes. */
export const COVERAGE_BADGE = deriveFromTone(COVERAGE_TONE, TONE_SOLID_BADGE);
