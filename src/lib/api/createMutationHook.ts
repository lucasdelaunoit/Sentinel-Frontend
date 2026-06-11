import { useMutation, useQueryClient, type QueryKey, type UseMutateAsyncFunction } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosClient } from "./client";
import { extractApiErrorMessage } from "./errors";

type PrivateApi = typeof axiosClient;

/** Either a static value, or one derived from the mutation's variables and result. */
type Derivable<T, TVars, TData> = T | ((vars: TVars, data: TData) => T);

interface MutationConfig<TVars, TData> {
  /** Performs the request. Receives the shared axios instance and the call variables. */
  mutationFn: (api: PrivateApi, vars: TVars) => Promise<TData>;
  /** Query keys to invalidate on success. May depend on the variables and result. */
  invalidateKeys?: Derivable<QueryKey[], TVars, TData>;
  /** Success toast. Omit for silent mutations. May depend on the variables and result. */
  successMessage?: Derivable<string, TVars, TData>;
  /** Fallback error toast message; an API-provided message wins when present. */
  errorMessage: string;
}

/** The named-object shape mandated by the Mutation Hook Contract (see CLAUDE.md). */
type NamedMutationResult<K extends string, TVars, TData> = {
  [P in K]: UseMutateAsyncFunction<TData, Error, TVars>;
} & {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
};

function resolve<T, TVars, TData>(value: Derivable<T, TVars, TData>, vars: TVars, data: TData): T {
  return typeof value === "function" ? (value as (vars: TVars, data: TData) => T)(vars, data) : value;
}

/**
 * Builds a mutation hook that follows the Mutation Hook Contract: it returns a named
 * object `{ [action]: mutateAsync, isLoading, isError, error, isSuccess }`, handles
 * cache invalidation and toasts internally, and never exposes the raw useMutation result.
 *
 * `TVars` and `TData` are inferred from `mutationFn`; annotate its `vars` parameter to
 * drive the inference (e.g. `(api, { id }: DeletePayload) => api.delete(...)`).
 */
export function createMutationHook<K extends string, TVars, TData>(
  action: K,
  config: MutationConfig<TVars, TData>,
): () => NamedMutationResult<K, TVars, TData> {
  return function useGeneratedMutation() {
    const queryClient = useQueryClient();

    const mutation = useMutation<TData, Error, TVars>({
      mutationFn: (vars) => config.mutationFn(axiosClient, vars),
      onSuccess: (data, vars) => {
        if (config.invalidateKeys) {
          for (const key of resolve(config.invalidateKeys, vars, data))
            queryClient.invalidateQueries({ queryKey: key });
        }

        if (config.successMessage !== undefined) toast.success(resolve(config.successMessage, vars, data));
      },
      onError: (error) => {
        toast.error(extractApiErrorMessage(error, config.errorMessage));
      },
    });

    return {
      [action]: mutation.mutateAsync,
      isLoading: mutation.isPending,
      isError: mutation.isError,
      error: mutation.error,
      isSuccess: mutation.isSuccess,
    } as NamedMutationResult<K, TVars, TData>;
  };
}
