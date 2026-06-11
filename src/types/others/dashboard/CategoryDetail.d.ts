interface CategoryDetail {
  category_id: number;
  category_name: string;
  coverage_pct: number;
  safe: number;
  siloed: number;
  uncovered: number;
  siloed_skills: string[];
  uncovered_skills: string[];
}
