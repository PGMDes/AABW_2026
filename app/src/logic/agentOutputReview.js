const OUTPUT_REVIEW_TIMESTAMP = "2026-07-03T11:30:00Z"
const DEFAULT_REVIEWER = "Jordan Lee"

const agentOutputReviewActionMap = {
  accept_output: {
    id: "accept_output",
    label: "Accept output",
    decisionStatus: "accepted_for_use",
    finalState: "Accepted for use",
    description:
      "Mark the Agent output as ready to use and record Human acceptance.",
    stateDescription:
      "Human accepted the controlled Agent output. The task can use this draft as the final work product.",
    lifecycleDescription:
      "Human accepted the Agent output for use after review.",
    auditDescription: "Human accepted the Agent output for use.",
  },
  request_revision: {
    id: "request_revision",
    label: "Request revision",
    decisionStatus: "needs_revision",
    finalState: "Needs revision",
    description:
      "Keep the output in review and ask for another pass before final use.",
    stateDescription:
      "Human requested a revision. The demo will not regenerate automatically; run the demo agent again when a new pass is wanted.",
    lifecycleDescription:
      "Human requested a revision after reviewing the Agent output.",
    auditDescription: "Human requested a revision to the Agent output.",
  },
  reroute_to_human: {
    id: "reroute_to_human",
    label: "Reroute to Human",
    decisionStatus: "rerouted_to_human",
    finalState: "Human-led final execution",
    description:
      "Use the Agent draft as reference, but move final execution to a Human.",
    stateDescription:
      "Human rerouted final execution. The Agent output remains visible as context, but final work is Human-led.",
    lifecycleDescription:
      "Human rerouted final execution after reviewing the Agent output.",
    auditDescription:
      "Human rerouted final execution to a Human-led path after Agent output review.",
  },
}

export const agentOutputReviewActions = Object.values(
  agentOutputReviewActionMap,
)

export function getAgentOutputReviewAction(actionId) {
  return agentOutputReviewActionMap[actionId] || null
}

export function createAgentOutputReviewDecision({ taskId, action, agentRun }) {
  const actionConfig = getAgentOutputReviewAction(action)

  if (!taskId || !agentRun?.id || !actionConfig) {
    return null
  }

  return {
    taskId,
    action,
    agentRunId: agentRun.id,
    actorName: DEFAULT_REVIEWER,
    decidedAt: OUTPUT_REVIEW_TIMESTAMP,
  }
}

export function getAgentOutputReviewDecisionSummary(decision) {
  if (!decision) {
    return null
  }

  const actionConfig = getAgentOutputReviewAction(decision.action)

  if (!actionConfig) {
    return null
  }

  return {
    ...actionConfig,
    taskId: decision.taskId,
    agentRunId: decision.agentRunId,
    actorName: decision.actorName || DEFAULT_REVIEWER,
    decidedAt: decision.decidedAt || OUTPUT_REVIEW_TIMESTAMP,
  }
}

export function getValidAgentOutputReviewDecision(agentRun, decision) {
  if (!agentRun || !decision) {
    return null
  }

  const decisionSummary = getAgentOutputReviewDecisionSummary(decision)

  if (
    !decisionSummary ||
    decisionSummary.taskId !== agentRun.taskId ||
    decisionSummary.agentRunId !== agentRun.id
  ) {
    return null
  }

  return decision
}

export function buildLifecycleWithAgentOutputReview(lifecycle, decision) {
  const decisionSummary = getAgentOutputReviewDecisionSummary(decision)

  if (!decisionSummary) {
    return lifecycle
  }

  return {
    ...lifecycle,
    currentStage: decisionSummary.decisionStatus,
    steps: [
      ...lifecycle.steps,
      {
        id: "agent_output_review",
        label: "Agent output review",
        description: `${decisionSummary.actorName} recorded: ${decisionSummary.lifecycleDescription}`,
        status: decisionSummary.decisionStatus,
      },
    ],
  }
}

export function buildAuditTrailWithAgentOutputReview(auditTrail, decision) {
  const decisionSummary = getAgentOutputReviewDecisionSummary(decision)

  if (!decisionSummary) {
    return auditTrail
  }

  return [
    ...auditTrail,
    {
      id: `${decisionSummary.taskId}_audit_012_agent_output_review_decision`,
      label: "Agent output review decision",
      description: `${decisionSummary.actorName} recorded output review for ${decisionSummary.agentRunId}: ${decisionSummary.auditDescription}`,
      actorType: "human",
      relativeTimestamp: "T+55m",
      status: decisionSummary.decisionStatus,
    },
  ]
}
