export const caseStageIds = [
  "intake",
  "analysis",
  "decision",
  "governance",
  "selection",
  "execution",
  "outcome",
]

const stageLabels = {
  intake: "Intake",
  analysis: "Analysis",
  decision: "Decision",
  governance: "Governance",
  selection: "Selection",
  execution: "Execution",
  outcome: "Outcome",
}

const stageActionLabels = {
  intake: "Review intake",
  analysis: "Review analysis",
  decision: "Review decision",
  governance: "Review governance",
  selection: "Select option",
  execution: "Launch",
  outcome: "Record outcome",
}

function isGovernanceBlocked(flowResult) {
  const governance = flowResult?.governance
  const reviewDecision = flowResult?.humanReview?.decision

  return (
    governance?.status === "blocked" ||
    reviewDecision?.decisionStatus === "blocked"
  )
}

function isGovernanceApproved(flowResult) {
  const governance = flowResult?.governance

  if (!governance || isGovernanceBlocked(flowResult)) {
    return false
  }

  if (!governance.approvalRequired) {
    return governance.status === "approved_for_launch"
  }

  return flowResult?.humanReview?.decision?.decisionStatus === "approved"
}

function buildStage(id, { available, completed, lockReason = null }) {
  let status = "locked"

  if (completed) {
    status = "completed"
  } else if (available) {
    status = "current"
  }

  return {
    id,
    label: stageLabels[id],
    status,
    available,
    completed,
    lockReason: available ? null : lockReason,
    actionLabel: stageActionLabels[id],
  }
}

export function getNextCaseAction(caseModel) {
  const nextStage = caseModel?.stages?.find(
    (stage) => stage.available && !stage.completed,
  )

  if (!nextStage) {
    return null
  }

  return {
    stageId: nextStage.id,
    label: nextStage.actionLabel,
  }
}

export function buildCaseViewModel(
  flowResult,
  agentRun = null,
  outputReviewDecision = null,
  userSelectedOptionId = null,
) {
  const hasTask = Boolean(flowResult?.task)
  const hasAnalysis = Boolean(flowResult?.analysis)
  const hasDecision = Boolean(flowResult?.recommendation)
  const governanceBlocked = isGovernanceBlocked(flowResult)
  const governanceApproved = isGovernanceApproved(flowResult)
  const hasUserSelection = Boolean(userSelectedOptionId)
  const hasAgentRun = Boolean(agentRun)
  const hasOutcomeDecision = Boolean(outputReviewDecision)

  const stages = [
    buildStage("intake", {
      available: hasTask,
      completed: hasTask,
      lockReason: "Available after task submission",
    }),
    buildStage("analysis", {
      available: hasTask,
      completed: hasAnalysis,
      lockReason: "Available after task submission",
    }),
    buildStage("decision", {
      available: hasAnalysis,
      completed: hasDecision,
      lockReason: "Available after task analysis",
    }),
    buildStage("governance", {
      available: hasDecision,
      completed: governanceApproved || governanceBlocked,
      lockReason: "Available after decision",
    }),
    buildStage("selection", {
      available: governanceApproved,
      completed: hasUserSelection,
      lockReason: governanceBlocked
        ? "Unavailable because governance blocked this case"
        : "Available after governance approval",
    }),
    buildStage("execution", {
      available: governanceApproved && hasUserSelection,
      completed: hasAgentRun,
      lockReason: !governanceApproved
        ? "Available after option selection and governance approval"
        : "Available after option selection",
    }),
    buildStage("outcome", {
      available: hasAgentRun,
      completed: hasOutcomeDecision,
      lockReason: "Available after execution",
    }),
  ]

  const caseModel = {
    taskId: flowResult?.task?.id || flowResult?.task?.taskId || null,
    recommendedOptionId: flowResult?.selectedOption?.id || null,
    userSelectedOptionId,
    governanceApproved,
    governanceBlocked,
    stages,
  }

  return {
    ...caseModel,
    nextAction: getNextCaseAction(caseModel),
  }
}
