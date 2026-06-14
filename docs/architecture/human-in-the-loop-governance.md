# Human-in-the-Loop Governance

Prontera Commerce operates under a Human-in-the-Loop (HITL) governance model.

AI agents, including CTO AI (Mr.P), CEO AI, and future marketplace agents, may analyze data, generate recommendations, automate routine operations, and assist users. Strategic, financial, legal, compliance, moderation, and policy decisions remain under human authority.

AI may recommend. Humans decide.

The Founder retains final decision-making authority across the platform.

No AI agent may override Founder decisions.

## Governance Principles

- AI agents must not independently execute high-impact strategic, financial, legal, compliance, moderation, or policy actions.
- AI agents must not override, bypass, or silently reinterpret Founder decisions.
- High-impact recommendations must include a clear explanation, confidence level, action category, risk level, and approval status before execution.
- Human reviewers must be able to approve, reject, cancel, or defer AI recommendations.
- Executed high-impact actions must retain an audit record tying the recommendation, reviewer, approval decision, and execution timestamp together.
- Routine automation may proceed when scoped and reversible, but it must be escalated when risk level, policy impact, or financial/compliance exposure increases.

## High-Impact Action Categories

The platform treats these categories as human-authority domains:

- `STRATEGIC`
- `FINANCIAL`
- `LEGAL`
- `COMPLIANCE`
- `MODERATION`
- `POLICY`

`ROUTINE_OPERATION` may be automated when the action is low-risk, reversible, and already covered by platform policy. Routine actions with `HIGH` or `CRITICAL` risk still require human approval.

## Approval Workflow

1. An AI agent creates a recommendation with title, category, risk level, explanation, confidence, and proposed action.
2. The recommendation is stored as a `GovernanceActionReview` record in `DRAFT` or `PENDING_APPROVAL`.
3. A human reviewer evaluates the recommendation and records an approval, rejection, or cancellation decision.
4. Only approved actions may proceed to execution.
5. Execution updates the review record with `EXECUTED` status and an execution timestamp.

## Data Model

`GovernanceActionReview` is the platform audit ledger for high-impact agent recommendations. It records:

- Agent name.
- Shop context, when applicable.
- Requesting user and reviewing user.
- Category and risk level.
- Recommendation, explanation, and confidence.
- Approval or rejection rationale.
- Review and execution timestamps.
- Metadata for agent-specific evidence, policy references, or workflow details.

Confidence is stored as an integer from `0` to `100`. It is not a substitute for authority; it only describes how strongly the agent supports its recommendation.

## Product And Engineering Requirements

- Interfaces that present AI recommendations must show explanation and confidence before approval controls.
- Approval controls must clearly identify the human reviewer.
- Financial, legal, compliance, moderation, policy, and strategic actions must default to `PENDING_APPROVAL`, not auto-execution.
- Services should use shared governance contracts from `@prontera/shared` to classify actions consistently.
- Secrets, payment credentials, private customer data, and legal documents must not be embedded directly in agent recommendation metadata.

## Founder Authority

The Founder has final decision-making authority across Prontera Commerce. Product workflows may delegate review to authorized operators, but escalation rules must preserve the Founder's ability to override or halt platform-level policy, financial, compliance, legal, and strategic decisions. No AI agent, including CTO AI (Mr.P), CEO AI, or future marketplace agents, may override Founder decisions.
