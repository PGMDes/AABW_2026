import { getGovernanceLifecycleState } from "./lifecycleEngine.js"

function formatValue(value) {
  if (!value) return "not set"

  return String(value).replaceAll("_", " ")
}

function buildEvent({
  taskId,
  id,
  label,
  description,
  actorType,
  relativeTimestamp,
  status,
}) {
  return {
    id: `${taskId}_${id}`,
    label,
    description,
    actorType,
    relativeTimestamp,
    status,
  }
}

function getExecutionActorType(selectedOption) {
  if (!selectedOption) {
    return "system"
  }

  return selectedOption.sourceType === "human_role" ? "human" : "agent"
}

function getLaunchEventStatus(execution, governanceState) {
  if (execution?.launchStatus === "launched") return "completed"
  if (execution?.launchStatus === "pending_approval") return "needs_human_review"
  if (execution?.launchStatus === "blocked" || governanceState === "blocked") {
    return "blocked"
  }

  return "pending"
}

function buildHumanReviewEvent({ task, governance, humanReview }) {
  if (!humanReview?.required) {
    return null
  }

  if (humanReview.decision) {
    return buildEvent({
      taskId: task.id,
      id: "audit_005_human_review_decision",
      label: "Human review decision",
      description: `${humanReview.decision.actorName} recorded decision: ${humanReview.decision.reason}`,
      actorType: "human",
      relativeTimestamp: "T+04m",
      status: humanReview.decision.decisionStatus,
    })
  }

  return buildEvent({
    taskId: task.id,
    id: "audit_005_human_review_decision",
    label: "Human review decision",
    description:
      governance.status === "blocked"
        ? "Human review can confirm the policy block, but launch is unavailable."
        : "Human review is required before launch can proceed.",
    actorType: "human",
    relativeTimestamp: "T+04m",
    status: governance.status === "blocked" ? "blocked" : "needs_human_review",
  })
}

export function buildAuditTrail({
  task,
  analysis,
  recommendation,
  governance,
  humanReview,
  selectedOption,
  execution,
  outcome,
}) {
  const governanceState = getGovernanceLifecycleState(governance)
  const executionActorType = getExecutionActorType(selectedOption)
  const launchEventStatus = getLaunchEventStatus(execution, governanceState)
  const hasLaunched = execution?.launchStatus === "launched"
  const isLaunchBlocked = execution?.launchStatus === "blocked"
  const isCompleted = outcome?.status === "completed"
  const isReviewed = Boolean(outcome?.reviewOutcome)

  return [
    buildEvent({
      taskId: task.id,
      id: "audit_001_task_submitted",
      label: "Task submitted",
      description: `${task.title} was submitted for routing.`,
      actorType: "human",
      relativeTimestamp: "T+00m",
      status: "completed",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_002_task_analyzed",
      label: "Task analyzed",
      description: `System classified the task as ${formatValue(analysis.taskType)} with ${formatValue(analysis.taskClarity)} clarity.`,
      actorType: "system",
      relativeTimestamp: "T+01m",
      status: "completed",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_003_recommendation_generated",
      label: "Recommendation generated",
      description: `${formatValue(recommendation.recommendedPath)} was recommended with ${recommendation.confidence}% confidence.`,
      actorType: "system",
      relativeTimestamp: "T+02m",
      status: "completed",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_004_governance_evaluated",
      label: "Governance evaluated",
      description: governance.policyReason,
      actorType: "system",
      relativeTimestamp: "T+03m",
      status: governanceState,
    }),
    buildHumanReviewEvent({ task, governance, humanReview }),
    buildEvent({
      taskId: task.id,
      id: "audit_006_option_selected",
      label: "Execution option selected",
      description: selectedOption
        ? `${selectedOption.displayName} was selected for the ${formatValue(selectedOption.pathType)} path.`
        : isLaunchBlocked
          ? "No execution option was selected because launch was blocked."
          : "No eligible execution option has been selected.",
      actorType: "human",
      relativeTimestamp: "T+05m",
      status: selectedOption ? "completed" : isLaunchBlocked ? "blocked" : "pending",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_007_execution_launched",
      label: "Execution launched",
      description: hasLaunched
        ? `Execution launched through ${selectedOption.displayName}.`
        : isLaunchBlocked
          ? "Execution was blocked and did not launch."
          : "Execution is waiting for approval or an eligible launch option.",
      actorType: "human",
      relativeTimestamp: "T+06m",
      status: launchEventStatus,
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_008_execution_in_progress",
      label: "Execution in progress",
      description: hasLaunched
        ? `${selectedOption.displayName} worked on the task.`
        : "Execution work has not started yet.",
      actorType: executionActorType,
      relativeTimestamp: "T+20m",
      status: isCompleted ? "completed" : hasLaunched ? "in_progress" : "pending",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_009_execution_completed",
      label: "Execution completed",
      description: outcome?.outputSummary || "No completed output is available yet.",
      actorType: executionActorType,
      relativeTimestamp: "T+45m",
      status: isCompleted ? "completed" : "pending",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_010_outcome_reviewed",
      label: "Outcome reviewed",
      description: isReviewed
        ? `Human review recorded: ${formatValue(outcome.reviewOutcome)}.`
        : "Outcome review has not been recorded yet.",
      actorType: "human",
      relativeTimestamp: "T+50m",
      status: isReviewed ? "completed" : "pending",
    }),
  ].filter(Boolean)
}
