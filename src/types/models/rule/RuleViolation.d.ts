type RuleViolationSubjectType = "project" | "employee" | "skill";

interface RuleViolation {
  rule_id: number;
  rule_name: string;
  rule_type: RuleType;
  subject_type: RuleViolationSubjectType;
  subject_id: number;
  subject_name: string;
  message: string;
}
