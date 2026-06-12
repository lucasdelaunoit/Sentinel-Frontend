import { useEffect, useRef } from "react";
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

const ACTIVE_POLL_MS = 4000;
const IDLE_POLL_MS = 15000;

/**
 * Shared base for the sync-status hooks. Polls fast while a calculation is
 * queued/running, slow otherwise. When a run finishes (active → idle) it
 * invalidates the given query keys so the stale metric cards refresh themselves.
 */
export default function useSyncStatusQuery(
  queryKey: QueryKey,
  url: string,
  invalidateOnSettle: QueryKey[],
  enabled = true,
) {
  const queryClient = useQueryClient();

  const query = useQuery<SyncStatus>({
    queryKey,
    queryFn: async () => {
      const { data } = await axiosClient.get<SyncStatus>(url);
      return data;
    },
    enabled,
    refetchInterval: (q) => {
      const state = q.state.data?.state;
      return state === "queued" || state === "running" ? ACTIVE_POLL_MS : IDLE_POLL_MS;
    },
    retry: 1,
  });

  const previousState = useRef<SyncState | undefined>(undefined);
  useEffect(() => {
    const state = query.data?.state;
    const wasActive = previousState.current === "queued" || previousState.current === "running";
    if (wasActive && state === "idle") {
      invalidateOnSettle.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    }
    previousState.current = state;
  }, [query.data?.state]);

  return query;
}
