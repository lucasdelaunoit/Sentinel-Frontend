type CalendarDayStatus = "working" | "holiday" | "off";

interface CalendarPreviewDay {
  date: string;
  day: number;
  weekday: number;
  status: CalendarDayStatus;
}

interface CalendarSummary {
  year: number;
  month: number;
  working_days: number[];
  working_days_per_week: number;
  standard_days_month: number;
  working_days_in_month: number;
  company_holidays: CompanyHoliday[];
  preview: CalendarPreviewDay[];
}
