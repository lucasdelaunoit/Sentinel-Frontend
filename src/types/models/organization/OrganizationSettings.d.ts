type Methodology = "agile" | "waterfall" | "kanban" | "scrumban";
type TeamStructure = "cross-functional" | "functional" | "matrix" | "squad";
type RiskTolerance = "conservative" | "balanced" | "aggressive";
type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

interface OrganizationSettings {
  id: number;
  name: string;
  industry: string;
  size: CompanySize;
  location: string;
  methodology: Methodology;
  team_structure: TeamStructure;
  risk_tolerance: RiskTolerance;
  working_days: number[];
  timezone: string;
  standard_days_month: number;
}
