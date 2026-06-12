import useSyncStatusQuery from "@/api/sync/useSyncStatusQuery";

export default function useGetProjectSyncStatus(projectId: string | undefined) {
  return useSyncStatusQuery(
    ["projects", projectId, "sync-status"],
    `/api/projects/${projectId}/sync-status`,
    [["projects", projectId]],
    !!projectId,
  );
}
