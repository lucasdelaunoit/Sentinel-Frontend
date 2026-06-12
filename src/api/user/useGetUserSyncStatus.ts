import useSyncStatusQuery from "@/api/sync/useSyncStatusQuery";

export default function useGetUserSyncStatus(userId: string | undefined) {
  return useSyncStatusQuery(
    ["users", userId, "sync-status"],
    `/api/users/${userId}/sync-status`,
    [["users", userId]],
    !!userId,
  );
}
