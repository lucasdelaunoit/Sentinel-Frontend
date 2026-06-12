import useSyncStatusQuery from "@/api/sync/useSyncStatusQuery";

export default function useGetDashboardSyncStatus() {
  return useSyncStatusQuery(["dashboard", "sync-status"], "/api/dashboard/sync-status", [
    ["dashboard"],
    ["projects-stats"],
    ["users-stats"],
  ]);
}
