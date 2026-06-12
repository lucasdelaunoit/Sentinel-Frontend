import { type Tone, TONE_BG, TONE_TEXT, deriveFromTone } from "@/lib/theme/tone.ts";

/** Calculation sync state (idle / queued / running / failed) mapped onto the semantic tone scale. */
export const SYNC_STATE_TONE: Record<SyncState, Tone> = {
  idle: "success",
  queued: "info",
  running: "info",
  failed: "danger",
};

export const SYNC_STATE_LABEL: Record<SyncState, string> = {
  idle: "Synced",
  queued: "Update queued",
  running: "Recalculating",
  failed: "Sync failed",
};

export const SYNC_STATE_TEXT = deriveFromTone(SYNC_STATE_TONE, TONE_TEXT);

/** Solid fill — progress bar, dots. */
export const SYNC_STATE_BG = deriveFromTone(SYNC_STATE_TONE, TONE_BG);
