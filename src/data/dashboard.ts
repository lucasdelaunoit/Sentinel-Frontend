/**
 * Dashboard mock data layer.
 *
 * Self-contained, narrative-coherent mock powering the resilience-intelligence
 * dashboard cards (Sections 2–5). Built as static data per the PoC decision to
 * decouple the UI from backend gaps; wire to live endpoints in a later pass.
 *
 * Trends (`deteriorating` / `stable` / `improving`) are mocked — there is no
 * historical time-series backend yet.
 */

import type { Tone } from "@/lib/scoring";

/* ─── Shared vocabulary ───────────────────────────────────── */

export type RiskLevel = "critical" | "high" | "medium" | "low";
export type Trend = "deteriorating" | "stable" | "improving";

/** Maps a discrete risk level onto the existing semantic tone scale. */
export const RISK_TONE: Record<RiskLevel, Tone> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const TREND_LABEL: Record<Trend, string> = {
  deteriorating: "Deteriorating",
  stable: "Stable",
  improving: "Improving",
};

/* ─── Section 2 · Card 1 — Team Today ─────────────────────── */

export type AbsenceReason = "Vacation" | "Sick leave" | "Conference" | "Remote";

export interface TeamTodayMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  reason: AbsenceReason;
  /** Number of projects affected by this person's absence today. */
  impactedProjects: number;
  /** When set, the absence materially degrades operations. */
  impact: RiskLevel | null;
}

/** People unavailable today, ordered by operational impact. */
export const TEAM_TODAY: TeamTodayMember[] = [
  {
    id: "E003",
    name: "Sarah Chen",
    role: "DevOps Engineer",
    initials: "SC",
    reason: "Vacation",
    impactedProjects: 2,
    impact: "high",
  },
  {
    id: "E001",
    name: "Clint Cambier",
    role: "Backend Developer",
    initials: "CC",
    reason: "Sick leave",
    impactedProjects: 2,
    impact: "high",
  },
  {
    id: "E008",
    name: "James Park",
    role: "Frontend Developer",
    initials: "JP",
    reason: "Conference",
    impactedProjects: 1,
    impact: "medium",
  },
  {
    id: "E005",
    name: "Emily Rodriguez",
    role: "UX/UI Designer",
    initials: "ER",
    reason: "Remote",
    impactedProjects: 1,
    impact: null,
  },
  {
    id: "E007",
    name: "Lisa Wang",
    role: "Data Engineer",
    initials: "LW",
    reason: "Vacation",
    impactedProjects: 0,
    impact: null,
  },
];

/** Today's presence snapshot, aligned with the Team Today list. */
export const TEAM_PRESENCE = {
  present: 18,
  total: 23,
  absent: 5,
};

/* ─── Section 2 · Card 2 — Knowledge Coverage Radar ───────── */

export interface CoverageDomain {
  axis: string;
  /** Current coverage % (0–100). */
  value: number;
}

export const COVERAGE = {
  /** Org-wide coverage %. */
  global: 74,
  /** Number of skills below the redundancy threshold. */
  underCovered: 21,
  target: 70,
  domains: [
    { axis: "Frontend", value: 88 },
    { axis: "Backend", value: 71 },
    { axis: "DevOps Tooling", value: 46 },
    { axis: "Cloud Platforms", value: 38 },
    { axis: "Database", value: 67 },
    { axis: "Communication", value: 90 },
  ] as CoverageDomain[],
  weakest: ["Cloud Platforms", "DevOps Tooling"],
  strongest: ["Communication", "Frontend"],
  issue: "Cloud expertise concentrated in 1 employee",
};

/* ─── Section 2 · Card 3 — Critical Projects ──────────────── */

export interface CriticalProject {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: RiskLevel;
  /** Plain-language reasons the project is fragile. */
  issues: string[];
  /** Person whose loss most threatens the project. */
  criticalDependency: string;
  coverage: number;
  trend: Trend;
}

export const CRITICAL_PROJECTS: CriticalProject[] = [
  {
    id: "P001",
    name: "Cloud Migration Platform",
    riskScore: 82,
    riskLevel: "critical",
    issues: ["Bus factor = 1", "Missing cloud redundancy", "2 upcoming absences"],
    criticalDependency: "Sarah Chen",
    coverage: 61,
    trend: "deteriorating",
  },
  {
    id: "P002",
    name: "Data Analytics Pipeline",
    riskScore: 78,
    riskLevel: "high",
    issues: ["Bus factor = 1", "Backend expertise siloed", "Upcoming DevOps absence"],
    criticalDependency: "Clint Cambier",
    coverage: 64,
    trend: "deteriorating",
  },
  {
    id: "P004",
    name: "Security Compliance Audit",
    riskScore: 71,
    riskLevel: "high",
    issues: ["Single security owner", "No compliance backup"],
    criticalDependency: "David Kim",
    coverage: 58,
    trend: "stable",
  },
  {
    id: "P003",
    name: "Customer Portal Redesign",
    riskScore: 54,
    riskLevel: "medium",
    issues: ["Frontend lead stretched", "Design redundancy thin"],
    criticalDependency: "Sarah Chen",
    coverage: 72,
    trend: "improving",
  },
];

/* ─── Section 3 · Card 4 — Single Points of Failure ───────── */

export interface SpofEmployee {
  id: string;
  name: string;
  role: string;
  initials: string;
  risk: RiskLevel;
  /** Projects that critically depend on this person. */
  impactedProjects: number;
  /** Skills only this person holds at a usable level. */
  uniqueCriticalSkills: number;
  /** Plain-language reason there is no fallback. */
  replacement: string;
  criticalSkills: string[];
  /** Who could cover if this person left; null = nobody. */
  coverageFallback: string | null;
}

export const SINGLE_POINTS_OF_FAILURE: SpofEmployee[] = [
  {
    id: "E003",
    name: "Sarah Chen",
    role: "DevOps Engineer",
    initials: "SC",
    risk: "critical",
    impactedProjects: 4,
    uniqueCriticalSkills: 3,
    replacement: "No backend replacement",
    criticalSkills: ["Kubernetes", "GraphQL", "Redis"],
    coverageFallback: null,
  },
  {
    id: "E001",
    name: "Clint Cambier",
    role: "Backend Developer",
    initials: "CC",
    risk: "critical",
    impactedProjects: 3,
    uniqueCriticalSkills: 2,
    replacement: "No senior backend backup",
    criticalSkills: ["Node.js", "GraphQL"],
    coverageFallback: null,
  },
  {
    id: "E006",
    name: "David Kim",
    role: "Security Engineer",
    initials: "DK",
    risk: "high",
    impactedProjects: 2,
    uniqueCriticalSkills: 3,
    replacement: "Only certified security owner",
    criticalSkills: ["Penetration Testing", "SIEM", "Network Security"],
    coverageFallback: null,
  },
  {
    id: "E004",
    name: "Michael Johnson",
    role: "DevOps Engineer",
    initials: "MJ",
    risk: "high",
    impactedProjects: 2,
    uniqueCriticalSkills: 1,
    replacement: "Partial overlap with Sarah Chen",
    criticalSkills: ["Terraform", "Prometheus"],
    coverageFallback: "Sarah Chen (partial)",
  },
];

/* ─── Section 3 · Card 5 — Most Vulnerable Skills ─────────── */

export interface VulnerableSkill {
  id: string;
  name: string;
  /** People qualified at a usable level. */
  qualified: number;
  /** Qualified people needed for safe redundancy. */
  needed: number;
  risk: RiskLevel;
  /** Projects that depend on this skill. */
  projects: number;
  /** Additional qualified people required to remove the silo. */
  missingBackups: number;
  trend: Trend;
}

export const VULNERABLE_SKILLS: VulnerableSkill[] = [
  {
    id: "SK1",
    name: "Kubernetes",
    qualified: 1,
    needed: 3,
    risk: "critical",
    projects: 4,
    missingBackups: 2,
    trend: "deteriorating",
  },
  {
    id: "SK2",
    name: "GraphQL",
    qualified: 1,
    needed: 3,
    risk: "critical",
    projects: 3,
    missingBackups: 2,
    trend: "deteriorating",
  },
  {
    id: "SK3",
    name: "Penetration Testing",
    qualified: 1,
    needed: 2,
    risk: "high",
    projects: 2,
    missingBackups: 1,
    trend: "stable",
  },
  {
    id: "SK4",
    name: "Redis",
    qualified: 2,
    needed: 3,
    risk: "high",
    projects: 3,
    missingBackups: 1,
    trend: "deteriorating",
  },
  {
    id: "SK5",
    name: "Terraform",
    qualified: 2,
    needed: 3,
    risk: "medium",
    projects: 2,
    missingBackups: 1,
    trend: "improving",
  },
];

/* ─── Section 4 — Upcoming Risk Events ────────────────────── */
/* Now wired to the live API — see useGetUpcomingRiskEvents + types/dashboard.d.ts. */

/* ─── Section 5 — Projects Requiring Attention ────────────── */

export interface AttentionProject {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  riskScore: number;
  /** Plain-language reasons the project needs action. */
  issues: string[];
  coverage: number;
  trend: Trend;
  criticalEmployee: string;
  /** Recommended remediation. */
  suggestedAction: string;
}

export const PROJECTS_REQUIRING_ATTENTION: AttentionProject[] = [
  {
    id: "P001",
    name: "Cloud Migration Platform",
    riskLevel: "critical",
    riskScore: 82,
    issues: ["Bus factor = 1", "Missing cloud redundancy", "Upcoming DevOps absence"],
    coverage: 61,
    trend: "deteriorating",
    criticalEmployee: "Sarah Chen",
    suggestedAction: "Train a secondary Kubernetes engineer",
  },
  {
    id: "P002",
    name: "Data Analytics Pipeline",
    riskLevel: "high",
    riskScore: 78,
    issues: ["Bus factor = 1", "Backend expertise siloed", "Overlapping absences"],
    coverage: 64,
    trend: "deteriorating",
    criticalEmployee: "Clint Cambier",
    suggestedAction: "Add backup for GraphQL & Node.js",
  },
  {
    id: "P004",
    name: "Security Compliance Audit",
    riskLevel: "high",
    riskScore: 71,
    issues: ["Single security owner", "Certification expiring", "No compliance backup"],
    coverage: 58,
    trend: "stable",
    criticalEmployee: "David Kim",
    suggestedAction: "Cross-train a second compliance reviewer",
  },
];
