interface ReplacementCandidate {
  user_id: string;
  name: string;
  skill_match_pct: number;
  available_days: number;
  cost_signal: "ok" | "stretch" | "overloaded";
}
