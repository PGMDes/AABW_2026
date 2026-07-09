import { getAgentRunnerState } from "./agentRunner.js"

export const ROUTER_WORKER_BOUNDARY_COPY =
  "The workflow router selects a worker only after deterministic governance allows agent execution. It does not decide Human/Agent/Hybrid routing, blocked status, or final approval."

function formatValue(value) {
  if (!value) return "not set"

  return String(value).replaceAll("_", " ")
}

function buildWorkflowId(agentRun) {
  return `router_worker_${agentRun?.id || "not_ready"}`
}

function buildToolStep(id, toolName, result, status = "completed") {
  return {
    id,
    toolName,
    result,
    status,
  }
}

function isReviewSensitive({ task, analysis, governance, humanReview }) {
  return Boolean(
    governance.approvalRequired ||
      humanReview?.required ||
      task.sensitivity === "high" ||
      analysis.dataSensitivity === "high" ||
      analysis.businessRisk === "high",
  )
}

function selectWorker(flowResult) {
  const { task, analysis, governance, humanReview } = flowResult

  if (isReviewSensitive({ task, analysis, governance, humanReview })) {
    return {
      selectedWorker: "reviewPacketWorker",
      workerReason:
        "Review-sensitive or Human-gated work needs a Human review packet before final use.",
    }
  }

  if (
    analysis.taskType === "memo_or_strategy" ||
    task.audience === "external" ||
    task.audience === "internal_leadership"
  ) {
    return {
      selectedWorker: "communicationWorker",
      workerReason:
        "Stakeholder-facing work needs a concise communication plan and audience-ready summary.",
    }
  }

  return {
    selectedWorker: "analysisWorker",
    workerReason:
      "Clear internal knowledge work is best handled by an analysis worker that structures evidence and next steps.",
  }
}

function buildWorkerOutput({ selectedWorker, flowResult, agentRun }) {
  const { analysis, recommendation, selectedOption } = flowResult

  if (selectedWorker === "reviewPacketWorker") {
    return {
      executionPlan:
        "Package the Agent draft with risk notes, assumptions, source-check prompts, and final Human decision choices.",
      outputSummary: `${agentRun.runnerName} prepared review material for ${formatValue(
        analysis.taskType,
      )} work before any final approval.`,
    }
  }

  if (selectedWorker === "communicationWorker") {
    return {
      executionPlan:
        "Turn the task brief into a stakeholder-ready draft plan with audience, tone, decision points, and next action clearly separated.",
      outputSummary: `${selectedOption.displayName} prepared an audience-ready ${formatValue(
        recommendation.recommendedPath,
      )} draft for Human review.`,
    }
  }

  return {
    executionPlan:
      "Read the brief, structure the work into findings, identify assumptions, and prepare a concise first-pass output.",
    outputSummary: `${agentRun.runnerName} produced an analysis-style ${formatValue(
      analysis.taskType,
    )} draft with review notes.`,
  }
}

function buildHumanReviewPacket({ flowResult, agentRun, workerOutput }) {
  const { task, governance, selectedOption } = flowResult

  return {
    summary: `Review ${agentRun.runnerName}'s draft for "${task.title}" before final use.`,
    items: [
      `Confirm the selected option stayed ${selectedOption.displayName}.`,
      `Check governance reason: ${governance.policyReason}`,
      `Review worker output summary: ${workerOutput.outputSummary}`,
      "Choose Accept output, Request revision, or Reroute to Human in the existing final decision gate.",
    ],
  }
}

function buildGuardrailCheck(flowResult) {
  const { governance, recommendation, execution } = flowResult

  return {
    status: "completed",
    result: `Passed: router read fixed ${formatValue(
      recommendation.recommendedPath,
    )} routing, ${formatValue(governance.status)} governance, and ${formatValue(
      execution.launchStatus,
    )} launch state without changing them.`,
  }
}

function buildStoppedWorkflow({ flowResult, agentRun, runnerState }) {
  const terminalState = runnerState.status === "blocked" ? "blocked" : "not_ready"

  return {
    workflowId: buildWorkflowId(agentRun),
    routerDecision: {
      status: terminalState,
      result:
        terminalState === "blocked"
          ? "Router did not select a worker because governance blocked Agent execution."
          : "Router is waiting for a valid allowed Agent run before worker selection.",
    },
    selectedWorker: null,
    workerReason: "No worker selected.",
    workerOutput: null,
    toolSteps: [
      buildToolStep(
        "inspectGovernance",
        "inspectGovernance",
        `Stopped at ${formatValue(flowResult.execution.launchStatus)} launch state.`,
        terminalState === "blocked" ? "blocked" : "waiting",
      ),
    ],
    guardrailCheck: {
      status: terminalState === "blocked" ? "blocked" : "waiting",
      result:
        "No worker execution occurred because Agent Runner requirements were not met.",
    },
    humanReviewPacket: null,
    terminalState,
  }
}

export function buildAgentWorkflowRecord(flowResult, agentRun) {
  if (!flowResult) {
    return null
  }

  const runnerState = getAgentRunnerState(flowResult, agentRun)

  if (runnerState.status !== "agent_output_ready") {
    return buildStoppedWorkflow({ flowResult, agentRun, runnerState })
  }

  const { task, analysis, recommendation, governance, execution } = flowResult
  const { selectedWorker, workerReason } = selectWorker(flowResult)
  const workerOutput = buildWorkerOutput({
    selectedWorker,
    flowResult,
    agentRun,
  })
  const guardrailCheck = buildGuardrailCheck(flowResult)
  const humanReviewPacket = buildHumanReviewPacket({
    flowResult,
    agentRun,
    workerOutput,
  })

  return {
    workflowId: buildWorkflowId(agentRun),
    routerDecision: {
      status: "worker_selected",
      result: `Router selected ${selectedWorker} after reading deterministic ${formatValue(
        governance.status,
      )} governance and ${formatValue(execution.launchStatus)} launch state.`,
    },
    selectedWorker,
    workerReason,
    workerOutput,
    toolSteps: [
      buildToolStep(
        "readTaskBrief",
        "readTaskBrief",
        `Read "${task.title}" as ${formatValue(analysis.taskType)} work for ${formatValue(
          task.audience,
        )} use.`,
      ),
      buildToolStep(
        "inspectGovernance",
        "inspectGovernance",
        `Confirmed recommendation ${formatValue(
          recommendation.recommendedPath,
        )}, governance ${formatValue(governance.status)}, and launch state ${formatValue(
          execution.launchStatus,
        )}.`,
      ),
      buildToolStep(
        "routeToWorker",
        "routeToWorker",
        `Selected ${selectedWorker}. ${workerReason}`,
      ),
      buildToolStep(
        "runSelectedWorker",
        selectedWorker,
        workerOutput.executionPlan,
      ),
      buildToolStep(
        "runPolicySelfCheck",
        "runPolicySelfCheck",
        guardrailCheck.result,
      ),
      buildToolStep(
        "prepareHumanReviewPacket",
        "prepareHumanReviewPacket",
        humanReviewPacket.summary,
      ),
    ],
    guardrailCheck,
    humanReviewPacket,
    terminalState: "completed",
  }
}
