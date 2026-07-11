export const humanReviewActions = {
  APPROVE_RECOMMENDED: "approve_recommended",
  SWITCH_TO_HUMAN: "switch_to_human",
  BLOCK_EXECUTION: "block_execution",
  CONFIRM_POLICY_BLOCK: "confirm_policy_block",
}

const REVIEW_TIMESTAMP = "2026-07-03T11:05:00Z"

function getFirstEligibleOption(options) {
  return options.find((option) => option.eligible) || null
}

function getRecommendedOption(options, recommendation) {
  return (
    options.find(
      (option) =>
        option.eligible && option.pathType === recommendation.recommendedPath,
    ) || getFirstEligibleOption(options)
  )
}

function getHumanFallbackOption(options, governance) {
  if (!governance.allowedPaths.includes("human")) {
    return null
  }

  return (
    options.find(
      (option) => option.eligible && option.pathType === "human",
    ) || null
  )
}

function isHumanReviewRequired(governance) {
  return (
    governance.status === "needs_human_review" ||
    governance.status === "blocked" ||
    governance.approvalRequired
  )
}

function buildAction({
  id,
  label,
  description,
  enabled,
  disabledReason = null,
  decisionStatus,
  resultingOption = null,
  resultReason,
}) {
  return {
    id,
    label,
    description,
    enabled,
    disabledReason,
    decisionStatus,
    resultingPath: resultingOption?.pathType || null,
    resultingOptionId: resultingOption?.id || null,
    resultingOptionName: resultingOption?.displayName || null,
    resultReason,
  }
}

export function buildHumanReviewActions({
  governance,
  recommendation,
  options,
}) {
  if (!isHumanReviewRequired(governance)) {
    return []
  }

  const recommendedOption = getRecommendedOption(options, recommendation)
  const humanFallbackOption = getHumanFallbackOption(options, governance)

  if (governance.status === "blocked") {
    return [
      buildAction({
        id: humanReviewActions.SWITCH_TO_HUMAN,
        label: "Route to human-led fallback",
        description:
          "Use a human owner only if governance still allows the human path.",
        enabled: Boolean(humanFallbackOption),
        disabledReason:
          "Human-led fallback is not allowed by the current governance result.",
        decisionStatus: "approved",
        resultingOption: humanFallbackOption,
        resultReason:
          "Human reviewer routed the blocked work to an allowed human-led fallback.",
      }),
      buildAction({
        id: humanReviewActions.CONFIRM_POLICY_BLOCK,
        label: "Confirm policy block",
        description:
          "Record that launch stays unavailable because policy blocks the work.",
        enabled: true,
        decisionStatus: "blocked",
        resultReason:
          "Human reviewer confirmed that policy blocks launch for this task.",
      }),
    ]
  }

  return [
    buildAction({
      id: humanReviewActions.APPROVE_RECOMMENDED,
      label: "Approve recommended option",
      description:
        "Approve the recommended execution option and allow the demo launch.",
      enabled: Boolean(recommendedOption),
      disabledReason: "No eligible recommended option is available.",
      decisionStatus: "approved",
      resultingOption: recommendedOption,
      resultReason:
        "Human reviewer approved the recommended execution option.",
    }),
    buildAction({
      id: humanReviewActions.SWITCH_TO_HUMAN,
      label: "Switch to human-led execution",
      description:
        "Override the recommendation and use an eligible human-led option.",
      enabled: Boolean(humanFallbackOption),
      disabledReason: "No eligible human-led option is available.",
      decisionStatus: "approved",
      resultingOption: humanFallbackOption,
      resultReason:
        "Human reviewer redirected the task to human-led execution.",
    }),
    buildAction({
      id: humanReviewActions.BLOCK_EXECUTION,
      label: "Block execution",
      description:
        "Stop the task from launching after human review.",
      enabled: true,
      decisionStatus: "blocked",
      resultReason:
        "Human reviewer blocked execution after review.",
    }),
  ]
}

function getEnabledDecisionAction(actions, humanReviewDecision) {
  if (!humanReviewDecision?.action) {
    return null
  }

  const action = actions.find(
    (candidate) => candidate.id === humanReviewDecision.action,
  )

  if (!action?.enabled) {
    return null
  }

  return action
}

export function resolveSelectedOptionAfterHumanReview({
  governance,
  recommendation,
  options,
  humanReviewDecision,
}) {
  const defaultOption = getFirstEligibleOption(options)
  const actions = buildHumanReviewActions({
    governance,
    recommendation,
    options,
  })
  const decisionAction = getEnabledDecisionAction(actions, humanReviewDecision)

  if (!decisionAction) {
    return defaultOption
  }

  if (decisionAction.decisionStatus === "blocked") {
    return null
  }

  return (
    options.find((option) => option.id === decisionAction.resultingOptionId) ||
    defaultOption
  )
}

export function buildHumanReviewState({
  task,
  recommendation,
  governance,
  options,
  selectedOption,
  humanReviewDecision,
}) {
  const required = isHumanReviewRequired(governance)
  const actions = buildHumanReviewActions({
    governance,
    recommendation,
    options,
  })
  const decisionAction = getEnabledDecisionAction(actions, humanReviewDecision)
  const decision = decisionAction
    ? {
        id: `review_${task.id}_${decisionAction.id}`,
        taskId: task.id,
        action: decisionAction.id,
        label: decisionAction.label,
        decisionStatus: decisionAction.decisionStatus,
        selectedPath: selectedOption?.pathType || null,
        selectedOptionId: selectedOption?.id || null,
        selectedOptionName: selectedOption?.displayName || null,
        actorName: "Current workspace administrator",
        actorRole: "Workspace administrator",
        decidedAt: REVIEW_TIMESTAMP,
        reason: decisionAction.resultReason,
      }
    : null

  let status = "not_required"

  if (required) {
    status = governance.status === "blocked" ? "blocked" : "needs_human_review"
  }

  if (decision) {
    status = decision.decisionStatus
  }

  return {
    taskId: task.id,
    required,
    status,
    reason: governance.policyReason,
    launchUnavailable:
      governance.status === "blocked" || decision?.decisionStatus === "blocked",
    humanFallbackAvailable: actions.some(
      (action) =>
        action.id === humanReviewActions.SWITCH_TO_HUMAN && action.enabled,
    ),
    actions,
    decision,
  }
}
