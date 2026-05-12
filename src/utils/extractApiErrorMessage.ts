import { AxiosError } from "axios";

interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export default function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as LaravelErrorBody | undefined;
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstFieldError ?? body?.message ?? fallback;
  }
  return fallback;
}
