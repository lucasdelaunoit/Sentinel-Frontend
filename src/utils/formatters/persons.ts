export function getFullName(firstname: string, lastname: string): string {
  return `${firstname} ${lastname}`.trim();
}

export function getInitials(firstname: string, lastname: string): string {
  const a = firstname?.[0] ?? "";
  const b = lastname?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}
