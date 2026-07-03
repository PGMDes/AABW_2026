function buildExecutionId(taskId) {
  return `execution_${taskId}`
}

export function createExecutionRecord(task, recommendation, selectedOption) {
  if (!selectedOption) {
    return {
      id: buildExecutionId(task.id),
      taskId: task.id,
      selectedPath: null,
      selectedOptionId: null,
      selectedOptionType: null,
      approvalStatus: "not_started",
      launchStatus: "not_launched",
      launchedAt: null,
    }
  }

  const blocked = selectedOption.eligible === false
  const approvalRequired = selectedOption.approvalRequired === true

  let approvalStatus = "not_required"
  let launchStatus = "launched"
  let launchedAt = "2026-07-03T11:00:00Z"

  if (blocked) {
    approvalStatus = "blocked"
    launchStatus = "blocked"
    launchedAt = null
  } else if (approvalRequired) {
    approvalStatus = "pending"
    launchStatus = "pending_approval"
    launchedAt = null
  }

  return {
    id: buildExecutionId(task.id),
    taskId: task.id,
    selectedPath: selectedOption.pathType,
    selectedOptionId: selectedOption.id,
    selectedOptionType: selectedOption.sourceType,
    approvalStatus,
    launchStatus,
    launchedAt,
  }
}

export function createDemoOutcomeReview(executionRecord, taskAnalysis) {
  if (executionRecord.launchStatus !== "launched") {
    return null
  }

  const isResearchBrief = taskAnalysis.taskType === "research_brief"

  return {
    id: `outcome_${executionRecord.id}`,
    executionId: executionRecord.id,
    status: "completed",
    outputSummary: isResearchBrief
      ? "Draft market research brief created"
      : "Demo execution completed",
    reviewOutcome: isResearchBrief
      ? "accepted_with_minor_edits"
      : "demo_completed",
    editLevel: isResearchBrief ? "minor" : "demo",
    reviewNotes: isResearchBrief
      ? "Good first pass. Reviewer adjusted competitor prioritization and wording."
      : "Demo task reached the generated completion state.",
  }
}

export function getTaskStatusFromExecution(governanceResult, executionRecord) {
  if (executionRecord.launchStatus === "launched") {
    return "completed"
  }

  if (executionRecord.launchStatus === "pending_approval") {
    return "approval_required"
  }

  if (executionRecord.launchStatus === "blocked") {
    return "blocked"
  }

  return governanceResult.status
}
