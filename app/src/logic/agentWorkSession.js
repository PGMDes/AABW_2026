import { getAgentRunnerState, getAgentRunModeLabel } from "./agentRunner.js"

export const GOVERNED_AGENT_BOUNDARY_COPY =
  "The agent drafts work only after deterministic governance allows execution. It does not decide routing, blocked status, or final approval."

function formatValue(value) {
  if (!value) return "not set"

  return String(value).replaceAll("_", " ")
}

function buildToolStep(toolName, result, status = "completed") {
  return {
    id: toolName,
    toolName,
    result,
    status,
  }
}

function getReviewSignal(humanReview) {
  if (humanReview?.decision?.action) {
    return `Human review decision ${formatValue(humanReview.decision.action)} is recorded.`
  }

  if (humanReview?.required) {
    return "Human review was required before Agent execution could start."
  }

  return "No pre-launch Human approval was required for this task."
}

export function buildAgentWorkSession(flowResult, agentRun) {
  if (!flowResult || !agentRun) {
    return null
  }

  const runnerState = getAgentRunnerState(flowResult, agentRun)

  if (runnerState.status !== "agent_output_ready") {
    return null
  }

  const {
    task,
    analysis,
    recommendation,
    governance,
    humanReview,
    selectedOption,
    execution,
  } = flowResult
  const requestedModel = agentRun.requestedModel || agentRun.model || ""
  const returnedModel = agentRun.returnedModel || ""

  return {
    id: `agent_work_session_${agentRun.id}`,
    status: "completed",
    runnerName: agentRun.runnerName,
    runMode: agentRun.runMode || "local_deterministic",
    runModeLabel: getAgentRunModeLabel(agentRun),
    requestedModel,
    returnedModel,
    summary: `${agentRun.runnerName} completed a bounded work session after Human-AgentOS launched the ${formatValue(
      execution.selectedPath,
    )} path.`,
    toolSteps: [
      buildToolStep(
        "readTaskBrief",
        `Read "${task.title}" and the requested output "${task.expectedOutput || "work product"}" for ${formatValue(
          task.audience,
        )} use.`,
      ),
      buildToolStep(
        "inspectGovernance",
        `Confirmed governance status ${formatValue(governance.status)} and launch status ${formatValue(
          execution.launchStatus,
        )}. ${getReviewSignal(humanReview)}`,
      ),
      buildToolStep(
        "createExecutionPlan",
        `Used selected option "${selectedOption.displayName}" for ${formatValue(
          recommendation.recommendedPath,
        )} work with ${recommendation.confidence}% recommendation confidence.`,
      ),
      buildToolStep(
        "draftOutput",
        `Drafted a ${formatValue(analysis.taskType)} work product for Human review, using the existing Agent Runner output format.`,
      ),
      buildToolStep(
        "runPolicySelfCheck",
        "Checked that routing, blocked status, lifecycle policy, and final approval remain controlled by deterministic Human-AgentOS logic.",
      ),
      buildToolStep(
        "prepareHumanReviewPacket",
        `Prepared assumptions, risks, limitations, and review checklist for the post-output Human decision gate.`,
      ),
    ],
  }
}
