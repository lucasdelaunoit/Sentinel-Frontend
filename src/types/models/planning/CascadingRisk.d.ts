interface CascadingRisk {
  type: "DOMINO" | "SKILL_CHAIN";
  trigger_user_id: string;
  if_also_absent: string[];
  consequence: string;
  probability_hint: "low" | "moderate" | "high";
}
