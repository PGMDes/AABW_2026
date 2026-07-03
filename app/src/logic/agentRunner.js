const RUN_TIMESTAMP = "2026-07-03T11:15:00Z"

function formatValue(value) {
  if (!value) return "not set"

  return String(value).replaceAll("_", " ")
}

function getRunnerAgentName(selectedOption) {
  if (!selectedOption) return "Demo Agent"

  return selectedOption.displayName.replace(" + Human Reviewer", "")
}

function buildRunId(task, selectedOption) {
  const optionPart = selectedOption?.sourceId || selectedOption?.id || "option"

  return `agent_run_${task.id}_${optionPart}_v1`
}

function buildStep(id, label, detail) {
  return {
    id,
    label,
    detail,
    status: "completed",
  }
}

function buildDraft({ task, analysis, selectedOption }) {
  const agentName = getRunnerAgentName(selectedOption)

  if (analysis.taskType === "research_brief") {
    return [
      `Draft from ${agentName}`,
      "",
      `Topic: ${task.title}`,
      "",
      "1. Market frame",
      "AI competitors should be grouped by workflow depth, data access, and buyer trust. The strongest near-term threat is not only model quality; it is how quickly each competitor can become part of a team's daily operating system.",
      "",
      "2. Competitive signals to verify",
      "- Which competitors already own the workflow where the buyer starts the task.",
      "- Which products can show clear governance, auditability, and human approval controls.",
      "- Which competitors are positioned as safe adoption layers instead of isolated agent tools.",
      "",
      "3. Initial recommendation",
      "Prioritize the competitors that combine useful automation with visible control. The strongest positioning for Human-AgentOS is the governance and routing layer that helps leaders decide when Agent, Human, or Hybrid execution is appropriate.",
    ].join("\n")
  }

  if (analysis.taskType === "memo_or_strategy") {
    return [
      `Draft from ${agentName}`,
      "",
      `Memo topic: ${task.title}`,
      "",
      "Executive summary",
      "The organization should scale AI adoption through controlled workflows, not isolated experiments. The immediate opportunity is faster knowledge work, but the risk is inconsistent routing, weak approval discipline, and unclear accountability.",
      "",
      "Recommended stance",
      "Use Hybrid execution for leadership-facing work: let an Agent create the first structured draft, then require a Human reviewer to validate assumptions, tone, business risk, and final recommendations before launch.",
      "",
      "Decision points for Human review",
      "- Confirm whether the recommendation is politically and operationally realistic.",
      "- Check that sensitive assumptions are not overstated.",
      "- Decide whether the memo is ready for leadership distribution.",
    ].join("\n")
  }

  if (analysis.taskType === "document_review") {
    return [
      `Draft from ${agentName}`,
      "",
      `Review target: ${task.title}`,
      "",
      "Initial gap review",
      "The policy should be checked for clear ownership, allowed data categories, required Human approval points, and escalation rules when an Agent cannot safely complete the work.",
      "",
      "Likely gaps",
      "- Approval rules may be implied but not tied to specific task risk levels.",
      "- Agent outputs may not have a required acceptance or rejection step.",
      "- Audit trail expectations may not say who records the final decision.",
      "",
      "Recommended next pass",
      "Have the policy owner validate each gap, then convert confirmed gaps into plain-language controls that can be enforced before Agent launch.",
    ].join("\n")
  }

  return [
    `Draft from ${agentName}`,
    "",
    `Task: ${task.title}`,
    "",
    "Controlled demo output",
    "The demo runner created a structured first pass from the task description, recommendation, governance result, and selected execution option.",
    "",
    "Recommended next pass",
    "A Human reviewer should verify facts, business context, sensitive details, and whether the output is ready to use.",
  ].join("\n")
}

function buildAssumptions({ task, analysis }) {
  return [
    `The task is treated as ${formatValue(analysis.taskType)} work.`,
    `The intended audience is ${formatValue(task.audience)}.`,
    `The expected output is ${task.expectedOutput || "a concise work product"}.`,
  ]
}

function buildRisks({ analysis, selectedOption }) {
  const risks = [
    "Verify facts and source quality before using the draft outside the demo.",
    "Confirm the output matches the requested audience, tone, and business context.",
  ]

  if (analysis.requiredJudgment === "high") {
    risks.push("High-judgment claims need Human validation before launch.")
  }

  if (selectedOption?.pathType === "hybrid") {
    risks.push("Hybrid execution requires the Human reviewer to approve final use.")
  }

  return risks
}

function buildReviewChecklist({ governance, selectedOption }) {
  const checklist = [
    "Check whether the draft answers the original task.",
    "Review sensitive or leadership-facing claims before sharing.",
    "Record whether the output should be accepted, edited, or rerouted.",
  ]

  if (governance.approvalRequired) {
    checklist.push("Confirm the Human approval decision is recorded before use.")
  }

  if (selectedOption?.whyLimited?.length) {
    checklist.push("Review the selected option limitations before accepting output.")
  }

  return checklist
}

export function getAgentRunnerState(flowResult, agentRun) {
  const { governance, selectedOption, execution, humanReview } = flowResult

  if (
    governance.status === "blocked" ||
    humanReview?.decision?.decisionStatus === "blocked" ||
    execution.launchStatus === "blocked"
  ) {
    return {
      status: "blocked",
      canRun: false,
      title: "Policy blocked",
      message:
        "Governance blocks launch for this task, so no demo agent can run.",
    }
  }

  if (execution.launchStatus === "pending_approval") {
    return {
      status: "waiting_on_review",
      canRun: false,
      title: "Waiting for Human review",
      message:
        "The Agent runner is paused until a Human reviewer approves the recommended option.",
    }
  }

  if (!selectedOption) {
    return {
      status: "not_available",
      canRun: false,
      title: "No execution option selected",
      message:
        "The demo runner needs an eligible selected option before it can create output.",
    }
  }

  if (selectedOption.sourceType !== "agent") {
    return {
      status: "human_led",
      canRun: false,
      title: "Human-led execution",
      message:
        "This task is routed to a Human-led option, so no demo agent run is started.",
    }
  }

  if (execution.launchStatus !== "launched") {
    return {
      status: "not_launched",
      canRun: false,
      title: "Not launched",
      message:
        "The selected Agent option has not launched yet, so output is not available.",
    }
  }

  if (agentRun) {
    return {
      status: "agent_output_ready",
      canRun: true,
      title: "Agent output ready",
      message:
        "A deterministic local demo run is saved for this task in this browser.",
    }
  }

  return {
    status: "ready_to_launch",
    canRun: true,
    title: "Ready to run demo agent",
    message:
      "Run a deterministic local agent simulation that creates a draft deliverable without calling an external API.",
  }
}

export function createDemoAgentRun(flowResult) {
  const state = getAgentRunnerState(flowResult, null)

  if (!state.canRun) {
    return null
  }

  const { task, analysis, governance, selectedOption, execution } = flowResult
  const runnerName = getRunnerAgentName(selectedOption)

  return {
    id: buildRunId(task, selectedOption),
    taskId: task.id,
    executionId: execution.id,
    optionId: selectedOption.id,
    runnerName,
    runMode: "local_deterministic",
    status: "completed",
    generatedAt: RUN_TIMESTAMP,
    confidence: Math.max(70, Math.min(96, selectedOption.fitScore - 4)),
    steps: [
      buildStep(
        "read_task_context",
        "Read task context",
        `Reviewed the task request, expected output, and ${formatValue(analysis.taskType)} classification.`,
      ),
      buildStep(
        "apply_governance_context",
        "Applied governance context",
        `Checked that current launch status is ${formatValue(execution.launchStatus)} before generating output.`,
      ),
      buildStep(
        "draft_deliverable",
        "Drafted deliverable",
        `Generated a first-pass ${formatValue(analysis.taskType)} output for Human review.`,
      ),
    ],
    output: {
      title: `${task.expectedOutput || "Draft output"} - demo agent draft`,
      draft: buildDraft({ task, analysis, selectedOption }),
      assumptions: buildAssumptions({ task, analysis }),
      risks: buildRisks({ analysis, selectedOption }),
      reviewChecklist: buildReviewChecklist({ governance, selectedOption }),
      limitations: [
        "This is deterministic local demo output, not a live external model response.",
        "A Human reviewer should verify facts, tone, and sensitive details before use.",
      ],
    },
  }
}

export function buildLifecycleWithAgentRun(lifecycle, agentRun) {
  if (!agentRun) return lifecycle

  return {
    ...lifecycle,
    currentStage: "agent_output_ready",
    steps: [
      ...lifecycle.steps,
      {
        id: "agent_runner",
        label: "Agent runner",
        description: `${agentRun.runnerName} generated a controlled local draft output for Human review.`,
        status: "agent_output_ready",
      },
    ],
  }
}

export function buildAuditTrailWithAgentRun(auditTrail, agentRun) {
  if (!agentRun) return auditTrail

  return [
    ...auditTrail,
    {
      id: `${agentRun.taskId}_audit_011_agent_runner_completed`,
      label: "Demo agent run completed",
      description: `${agentRun.runnerName} generated local demo output ${agentRun.id}.`,
      actorType: "agent",
      relativeTimestamp: "T+25m",
      status: "completed",
    },
  ]
}
