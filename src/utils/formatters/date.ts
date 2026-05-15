type DateInput = Date | string | number | null | undefined;

function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(input: DateInput, locale = "fr-BE"): string {
  const d = toDate(input);
  if (!d) return "";
  return d.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatDateLong(input: DateInput, locale = "fr-BE"): string {
  const d = toDate(input);
  if (!d) return "";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export function formatDateTime(input: DateInput, locale = "fr-BE"): string {
  const d = toDate(input);
  if (!d) return "";
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(input: DateInput, locale = "fr-BE"): string {
  const d = toDate(input);
  if (!d) return "";
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function formatDateRange(start: DateInput, end: DateInput, locale = "fr-BE"): string {
  const a = formatDate(start, locale);
  const b = formatDate(end, locale);
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export function formatRelative(input: DateInput, locale = "fr-BE"): string {
  const d = toDate(input);
  if (!d) return "";
  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, sec] of units) {
    if (Math.abs(diffSec) >= sec || unit === "second") {
      return rtf.format(Math.round(diffSec / sec), unit);
    }
  }
  return "";
}

export function daysBetween(start: DateInput, end: DateInput): number {
  const a = toDate(start);
  const b = toDate(end);
  if (!a || !b) return 0;
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function isPast(input: DateInput): boolean {
  const d = toDate(input);
  return !!d && d.getTime() < Date.now();
}

export function isFuture(input: DateInput): boolean {
  const d = toDate(input);
  return !!d && d.getTime() > Date.now();
}
