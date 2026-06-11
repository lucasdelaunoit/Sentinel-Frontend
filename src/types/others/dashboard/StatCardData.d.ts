/** Universal stat card shape returned by all *stats endpoints. */
interface StatCardData {
  value: string;
  severity: Severity;
  change: string;
  hint: string | null;
  raw: number | null;
  value_raw?: number | null;
  insight?: string | null;
}
