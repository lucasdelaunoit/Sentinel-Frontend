import axiosClient from "@/api/axiosClient"

/**
 * usePrivateApi - Returns the shared axios instance.
 * Auth header is injected by the request interceptor in axiosClient.
 */
export default function usePrivateApi() {
  return axiosClient
}
