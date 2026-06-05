interface ProjectMetrics {
  bus_factor: number;
  fragility_raw: number;
  fragility: "solid" | "stable" | "stretched" | "fragile" | "critical";
  redundancy: number;
}
