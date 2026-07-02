export const lifecycleConcepts = [
  "recommended",
  "approved",
  "needs_human_review",
  "blocked",
  "selected",
  "launched",
  "in_progress",
  "completed",
  "reviewed",
]

export function getGovernanceLifecycleState(governanceResult) {
  if (!governanceResult) {
    return "needs_human_review"
  }

  const recommendedPathBlocked = governanceResult.blockedPaths.includes(
    governanceResult.recommendedPath,
  )

  if (
    governanceResult.status === "selected_option_blocked" ||
    governanceResult.status === "recommended_path_blocked" ||
    recommendedPathBlocked
  ) {
    return "blocked"
  }

  if (governanceResult.approvalRequired) {
    return "needs_human_review"
  }

  return "approved"
}

function buildStep(id, label, description, status) {
  return {
    id,
    label,
    description,
    status,
  }
}

export function buildLifecycleState({
  task,
  recommendation,
  governance,
  selectedOption,
  execution,
  outcome,
}) {
  const governanceState = getGovernanceLifecycleState(governance)
  const hasSelection = Boolean(selectedOption && execution?.selectedOptionId)
  const hasLaunched = execution?.launchStatus === "launched"
  const isBlocked =
    governanceState === "blocked" || execution?.launchStatus === "blocked"
  const isCompleted = outcome?.status === "completed"
  const isReviewed = Boolean(outcome?.reviewOutcome)

  let currentStage = governanceState

  if (isBlocked) {
    currentStage = "blocked"
  } else if (isReviewed) {
    currentStage = "reviewed"
  } else if (isCompleted) {
    currentStage = "completed"
  } else if (hasLaunched) {
    currentStage = "in_progress"
  } else if (hasSelection) {
    currentStage = "selected"
  }

  const governanceLabelByState = {
    approved: "Approved",
    needs_human_review: "Needs human review",
    blocked: "Blocked",
  }

  const launchStatus = (() => {
    if (execution?.launchStatus === "launched") return "launched"
    if (execution?.launchStatus === "pending_approval") {
      return "needs_human_review"
    }
    if (isBlocked) return "blocked"
    return "pending"
  })()

  return {
    taskId: task.id,
    currentStage,
    governanceState,
    concepts: lifecycleConcepts,
    steps: [
      buildStep(
        "recommended",
        "Recommended",
        `${recommendation.recommendedPath} path recommended with ${recommendation.confidence}% confidence.`,
        "completed",
      ),
      buildStep(
        governanceState,
        governanceLabelByState[governanceState],
        governance.policyReason,
        governanceState,
      ),
      buildStep(
        "selected",
        "Selected",
        hasSelection
          ? `${selectedOption.displayName} selected for execution.`
          : "No execution option has been selected yet.",
        hasSelection ? "selected" : "pending",
      ),
      buildStep(
        "launched",
        "Launched",
        hasLaunched
          ? "Execution has been launched."
          : "Execution has not launched yet.",
        launchStatus,
      ),
      buildStep(
        "in_progress",
        "In progress",
        hasLaunched
          ? "The selected execution option is working through the task."
          : "Work will start after launch.",
        isCompleted ? "completed" : hasLaunched ? "in_progress" : "pending",
      ),
      buildStep(
        "completed",
        "Completed",
        outcome?.outputSummary || "No completed output has been recorded yet.",
        isCompleted ? "completed" : "pending",
      ),
      buildStep(
        "reviewed",
        "Reviewed",
        outcome?.reviewNotes || "No outcome review has been recorded yet.",
        isReviewed ? "reviewed" : "pending",
      ),
    ],
  }
}
