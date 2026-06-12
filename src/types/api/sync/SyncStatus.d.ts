type SyncState = "idle" | "queued" | "running" | "failed";

interface SyncStatusProgress {
  processed: number;
  total: number;
  percent: number;
}

interface SyncStatus {
  state: SyncState;
  last_calculated_at: string | null;
  progress: SyncStatusProgress | null;
  error: string | null;
}
