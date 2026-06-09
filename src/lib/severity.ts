/** --------- STYLING ---------- */
interface SeverityColor {
  foregroundColor: string;
  backgroundColor: string;
}

export const SEVERITY_COLORS: Record<Severity, SeverityColor> = {
  ok: { backgroundColor: "success", foregroundColor: "background" },
  warning: { backgroundColor: "warning", foregroundColor: "background" },
  critical: { backgroundColor: "danger", foregroundColor: "background" },
};

export const SEVERITY_COLORS_CLASSNAMES = Object.fromEntries(
  Object.entries(SEVERITY_COLORS).map(([severity, color]) => [
    severity,
    `text-${color.foregroundColor} bg-${color.backgroundColor}`,
  ]),
) as Record<Severity, string>;

/** --------- STYLING ---------- */
export const SEVERITY_LABELS: Record<Severity, string> = {
  ok: "Safe",
  warning: "Warning",
  critical: "Critical",
};
