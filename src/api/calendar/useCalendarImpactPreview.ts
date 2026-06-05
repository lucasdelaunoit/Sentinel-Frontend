import { useMutation } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

/** A future absence whose working-day count would change under a pending calendar change. */
export interface CalendarImpactAffected {
  absence_id: number;
  user_id: number;
  user_name: string;
  start_date: string;
  end_date: string;
  before_days: number;
  after_days: number;
}

interface HolidayChange {
  name?: string;
  start_date: string;
  end_date: string;
  recurring: boolean;
}

export type CalendarChangePayload =
  | { type: "working_days"; working_days: number[] }
  | { type: "holiday_create"; holiday: HolidayChange }
  | { type: "holiday_update"; holiday_id: number; holiday: HolidayChange };

/**
 * Preview which FUTURE absences a pending calendar change would recount, without applying it.
 * Used to decide whether to surface the confirmation modal.
 */
export default function useCalendarImpactPreview() {
  const privateApi = usePrivateApi();

  const mutation = useMutation({
    mutationFn: async (payload: CalendarChangePayload) => {
      const { data } = await privateApi.post<{ affected: CalendarImpactAffected[] }>(
        "/api/settings/calendar/impact",
        payload,
      );
      return data.affected;
    },
  });

  return {
    previewImpact: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
