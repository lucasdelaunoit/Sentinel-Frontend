interface MetricResult {
  value: string;
  severity: Severity;
  value_raw: number | string | null;
  insight?: string | null;
}
