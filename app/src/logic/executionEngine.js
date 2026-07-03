function buildExecutionId(taskId) {
  return `execution_${taskId}`
}

function getDemoOutcomeCopy(executionRecord, taskAnalysis) {
  if (taskAnalysis.taskType === "research_brief") {
    return {
      outputSummary: "Draft market research brief created",
      reviewOutcome: "accepted_with_minor_edits",
      editLevel: "minor",
      reviewNotes:
        "Good first pass. Reviewer adjusted competitor prioritization and wording.",
    }
  }

  if (executionRecord.selectedPath === "human") {
    return {
      outputSummary: "Human-led execution completed",
      reviewOutcome: "human_led_completed",
      editLevel: "reviewed",
      reviewNotes: "Human owner completed the work after review approval.",
    }
  }

  if (executionRecord.selectedPath === "hybrid") {
    return {
      outputSummary: "Human-agent review completed",
      reviewOutcome: "approved_after_review",
      editLevel: "reviewed",
      reviewNotes:
        "Human reviewer approved the assisted workflow and validated the result.",
    }
  }

  return {
    outputSummary: "Demo execution completed",
    reviewOutcome: "demo_completed",
    editLevel: "demo",
    reviewNotes: "Demo task reached the generated completion state.",
  }
}

export function createExecutionRecord(
  task,
  recommendation,
  selectedOption,
  humanReview = null,
) {
  const reviewDecisionStatus = humanReview?.decision?.decisionStatus

  if (reviewDecisionStatus === "blocked") {
    return {
      id: buildExecutionId(task.id),
      taskId: task.id,
      selectedPath: selectedOption?.pathType || null,
      selectedOptionId: selectedOption?.id || null,
      selectedOptionType: selectedOption?.sourceType || null,
      approvalStatus: "blocked",
      launchStatus: "blocked",
      launchedAt: null,
    }
  }

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
  const approvalRequired =
    selectedOption.approvalRequired === true &&
    reviewDecisionStatus !== "approved"

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
  } else if (reviewDecisionStatus === "approved") {
    approvalStatus = "approved"
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

  const outcomeCopy = getDemoOutcomeCopy(executionRecord, taskAnalysis)

  return {
    id: `outcome_${executionRecord.id}`,
    executionId: executionRecord.id,
    status: "completed",
    ...outcomeCopy,
  }
}

export function getTaskStatusFromExecution(
  governanceResult,
  executionRecord,
  humanReview = null,
) {
  if (humanReview?.decision?.decisionStatus === "blocked") {
    return "blocked"
  }

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
