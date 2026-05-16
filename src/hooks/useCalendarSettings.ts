import { useState } from "react";

export interface CompanyHoliday {
  id: string;
  day: number;
  label: string;
}

export interface CalendarSettings {
  workingDays: number[];
  holidays: CompanyHoliday[];
}

const STORAGE_KEY = "sentinel_calendar_settings";

const DEFAULT_SETTINGS: CalendarSettings = {
  workingDays: [1, 2, 3, 4, 5],
  holidays: [{ id: "h1", day: 21, label: "Easter Monday" }],
};

function load(): CalendarSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CalendarSettings;
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

function save(s: CalendarSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useCalendarSettings() {
  const [settings, setSettings] = useState<CalendarSettings>(load);

  function update(next: CalendarSettings) {
    setSettings(next);
    save(next);
  }

  return { settings, update };
}
