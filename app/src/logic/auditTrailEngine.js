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

export function buildAuditTrail({
  task,
  analysis,
  recommendation,
  governance,
  selectedOption,
  execution,
  outcome,
}) {
  const governanceState = getGovernanceLifecycleState(governance)
  const executionActorType = getExecutionActorType(selectedOption)
  const launchEventStatus = getLaunchEventStatus(execution, governanceState)
  const hasLaunched = execution?.launchStatus === "launched"
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
    buildEvent({
      taskId: task.id,
      id: "audit_005_option_selected",
      label: "Execution option selected",
      description: selectedOption
        ? `${selectedOption.displayName} was selected for the ${formatValue(selectedOption.pathType)} path.`
        : "No eligible execution option has been selected.",
      actorType: "human",
      relativeTimestamp: "T+04m",
      status: selectedOption ? "completed" : "pending",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_006_execution_launched",
      label: "Execution launched",
      description: hasLaunched
        ? `Execution launched through ${selectedOption.displayName}.`
        : "Execution is waiting for approval or an eligible launch option.",
      actorType: "human",
      relativeTimestamp: "T+05m",
      status: launchEventStatus,
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_007_execution_in_progress",
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
      id: "audit_008_execution_completed",
      label: "Execution completed",
      description: outcome?.outputSummary || "No completed output is available yet.",
      actorType: executionActorType,
      relativeTimestamp: "T+45m",
      status: isCompleted ? "completed" : "pending",
    }),
    buildEvent({
      taskId: task.id,
      id: "audit_009_outcome_reviewed",
      label: "Outcome reviewed",
      description: isReviewed
        ? `Human review recorded: ${formatValue(outcome.reviewOutcome)}.`
        : "Outcome review has not been recorded yet.",
      actorType: "human",
      relativeTimestamp: "T+50m",
      status: isReviewed ? "completed" : "pending",
    }),
  ]
}
