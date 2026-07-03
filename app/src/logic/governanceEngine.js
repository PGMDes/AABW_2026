const ALL_PATHS = ["human", "agent", "hybrid"]

function unique(values) {
  return Array.from(new Set(values))
}

export function buildPolicyFlags(taskAnalysis) {
  const flags = []

  if (taskAnalysis.dataSensitivity) {
    flags.push(`${taskAnalysis.dataSensitivity}_sensitivity`)
  }

  if (taskAnalysis.businessRisk) {
    flags.push(`${taskAnalysis.businessRisk}_risk`)
  }

  if (taskAnalysis.taskType === "research_brief") {
    flags.push("research_work")
  }

  if (taskAnalysis.taskType === "document_review") {
    flags.push("review_work")
  }

  return flags
}

export function checkApprovalRequired(taskAnalysis, recommendation) {
  const approvalReasons = []

  if (
    taskAnalysis.taskType === "document_review" ||
    taskAnalysis.taskType === "policy_review" ||
    taskAnalysis.taskType === "compliance_review"
  ) {
    approvalReasons.push("Policy or review work needs human validation")
  }

  if (taskAnalysis.businessRisk === "high") {
    approvalReasons.push("Task has high business risk")
  }

  if (
    taskAnalysis.dataSensitivity === "medium" ||
    taskAnalysis.dataSensitivity === "high"
  ) {
    approvalReasons.push("Task contains medium or high sensitivity content")
  }

  if (
    recommendation.recommendedPath === "agent" &&
    recommendation.confidence < 70
  ) {
    approvalReasons.push("Agent recommendation confidence is below the launch threshold")
  }

  return {
    approvalRequired: approvalReasons.length > 0,
    approvalReasons,
  }
}

export function checkBlockedPaths(taskAnalysis) {
  const blockedPaths = []

  if (
    taskAnalysis.dataSensitivity === "high" &&
    taskAnalysis.businessRisk === "high"
  ) {
    return {
      blockedPaths: ALL_PATHS,
    }
  }

  if (taskAnalysis.dataSensitivity === "high") {
    blockedPaths.push("agent")
  }

  if (taskAnalysis.businessRisk === "high") {
    blockedPaths.push("agent")
  }

  return {
    blockedPaths: unique(blockedPaths),
  }
}

export function getAllowedPaths(blockedPaths) {
  return ALL_PATHS.filter((path) => !blockedPaths.includes(path))
}

export function evaluateGovernance(taskAnalysis, recommendation) {
  const approvalInfo = checkApprovalRequired(taskAnalysis, recommendation)
  const blockedInfo = checkBlockedPaths(taskAnalysis)
  const allowedPaths = getAllowedPaths(blockedInfo.blockedPaths)
  const recommendedPathBlocked = blockedInfo.blockedPaths.includes(
    recommendation.recommendedPath,
  )
  const allPathsBlocked = allowedPaths.length === 0

  let status = "approved_for_launch"
  let policyReason = "Launch allowed"

  if (
    taskAnalysis.taskType === "research_brief" &&
    taskAnalysis.dataSensitivity === "low" &&
    taskAnalysis.businessRisk === "low"
  ) {
    policyReason =
      "Low-sensitivity internal research is allowed for trusted agents"
  }

  if (allPathsBlocked) {
    status = "blocked"
    policyReason =
      "This task is too sensitive and high-risk to launch through the demo workflow"
  } else if (recommendedPathBlocked) {
    status = "blocked"
    policyReason = "The recommended path is not allowed by policy"
  } else if (approvalInfo.approvalRequired) {
    status = "needs_human_review"
    policyReason = approvalInfo.approvalReasons[0]
  }

  return {
    taskId: taskAnalysis.taskId,
    recommendedPath: recommendation.recommendedPath,
    approvalRequired: approvalInfo.approvalRequired,
    approvalReason: approvalInfo.approvalReasons[0] || null,
    approvalReasons: approvalInfo.approvalReasons,
    allowedPaths,
    blockedPaths: blockedInfo.blockedPaths,
    policyFlags: buildPolicyFlags(taskAnalysis),
    selectedOptionAllowed: true,
    selectedOptionBlockReason: null,
    status,
    policyReason,
  }
}
