import { getAgentRunnerState, getAgentRunModeLabel } from "./agentRunner.js"
import { buildAgentWorkflowRecord } from "./agentWorkflowEngine.js"

export const GOVERNED_AGENT_BOUNDARY_COPY =
  "The agent drafts work only after deterministic governance allows execution. It does not decide routing, blocked status, or final approval."

function formatValue(value) {
  if (!value) return "not set"

  return String(value).replaceAll("_", " ")
}

export function buildAgentWorkSession(flowResult, agentRun) {
  if (!flowResult || !agentRun) {
    return null
  }

  const runnerState = getAgentRunnerState(flowResult, agentRun)

  if (runnerState.status !== "agent_output_ready") {
    return null
  }

  const { execution } = flowResult
  const workflow = buildAgentWorkflowRecord(flowResult, agentRun)
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
    workflow,
  }
}
