export function getInitials(fullName: string): string {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
