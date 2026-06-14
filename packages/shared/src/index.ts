export type EntityId = string;

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export const humanAuthorityActionCategories = [
  "STRATEGIC",
  "FINANCIAL",
  "LEGAL",
  "COMPLIANCE",
  "MODERATION",
  "POLICY",
] as const;

export const governanceRiskLevels = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type HumanAuthorityActionCategory =
  (typeof humanAuthorityActionCategories)[number];

export type GovernanceRiskLevel = (typeof governanceRiskLevels)[number];

export interface AgentRecommendation {
  agentName: string;
  category: HumanAuthorityActionCategory | "ROUTINE_OPERATION";
  riskLevel: GovernanceRiskLevel;
  title: string;
  recommendation: string;
  explanation: string;
  confidence: number;
}

export function requiresHumanApproval(
  category: AgentRecommendation["category"],
  riskLevel: GovernanceRiskLevel,
): boolean {
  return (
    humanAuthorityActionCategories.includes(
      category as HumanAuthorityActionCategory,
    ) ||
    riskLevel === "HIGH" ||
    riskLevel === "CRITICAL"
  );
}
