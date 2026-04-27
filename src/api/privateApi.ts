/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import axios from "axios"

/* -------- /React/ -------- */
import { useMemo } from "react"

/* ------------------- (Constants) ------------------ */

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000"

/* ------------------- (Hook) ------------------ */

/**
 * usePrivateApi - Returns an axios instance pre-configured with the API base URL.
 * Add auth headers here once a token store is in place (e.g. localStorage or a context).
 */
export default function usePrivateApi() {
  return useMemo(
    () =>
      axios.create({
        baseURL: API_BASE,
        headers: { "Content-Type": "application/json" },
        // withCredentials: true, // For later
        // Authorization: `Bearer ${token}`,
      }),
    [],
  )
}
