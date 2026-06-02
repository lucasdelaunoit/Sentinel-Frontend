import * as yup from "yup";
import { ABSENCE_TYPE_VALUES } from "@/utils/absence/absenceType.ts";
import { ABSENCE_HALF_VALUES, isValidHalfRange } from "@/utils/absence/halfDay.ts";

/* ─── Shared form shape ──────────────────────────────────── */

export interface AbsenceFormValues {
  type: AbsenceType;
  start_date: string;
  start_half: AbsenceHalf;
  end_date: string;
  end_half: AbsenceHalf;
  reason: string;
}

export const ABSENCE_FORM_DEFAULTS: AbsenceFormValues = {
  type: "vacation",
  start_date: "",
  start_half: "morning",
  end_date: "",
  end_half: "afternoon",
  reason: "",
};

export const absenceSchema = yup.object({
  type: yup.string().oneOf(ABSENCE_TYPE_VALUES).required("Type is required."),
  start_date: yup.string().required("Start date is required."),
  start_half: yup.string().oneOf(ABSENCE_HALF_VALUES).required(),
  end_date: yup
    .string()
    .required("End date is required.")
    .test("end-after-start", "End must be on or after the start (including the half-day).", function (value) {
      const { start_date, start_half, end_half } = this.parent;
      if (!start_date || !value) return true;
      return isValidHalfRange({ start_date, start_half, end_date: value, end_half });
    }),
  end_half: yup.string().oneOf(ABSENCE_HALF_VALUES).required(),
  reason: yup.string().max(255, "Reason must be 255 characters or fewer.").optional().default(""),
});
