interface SkillConcentrationShift {
  skill_id: number;
  skill_name: string;
  from_owners: number;
  to_owners: number;
  new_sole_owner: string | null;
  creates_bus_factor_1: boolean;
}
