import { clamp } from "./recommendationEngine.js"

const EXECUTION_PROFILES = [
  {
    id: "agent_001",
    sourceType: "agent",
    displayName: "Research Analyst Agent",
    pathType: "agent",
    trustTier: "trusted",
    sensitiveDataSuitability: "low_medium",
    supportedTaskTypes: ["research_brief", "competitive_summary"],
    baseFitScore: 82,
    whyShown: [
      "Matches research brief tasks",
      "Trusted for low-sensitivity internal work",
      "Low cost and fast turnaround",
    ],
    whyLimited: ["Needs human review for external-facing use"],
  },
  {
    id: "agent_002",
    sourceType: "agent",
    displayName: "Competitive Scan Agent",
    pathType: "agent",
    trustTier: "trusted",
    sensitiveDataSuitability: "low",
    supportedTaskTypes: ["research_brief", "summary"],
    baseFitScore: 76,
    whyShown: [
      "Strong fit for competitor summaries",
      "Trusted for internal research",
    ],
    whyLimited: ["Not suitable for strategy memos"],
  },
  {
    id: "agent_003",
    sourceType: "agent",
    displayName: "Executive Memo Agent + Human Reviewer",
    pathType: "hybrid",
    trustTier: "review_required",
    sensitiveDataSuitability: "medium",
    supportedTaskTypes: ["memo_or_strategy", "summary"],
    baseFitScore: 78,
    whyShown: [
      "Useful for first-draft memo writing",
      "Fits leadership communication support",
    ],
    whyLimited: ["Requires human review before launch"],
  },
  {
    id: "agent_004",
    sourceType: "agent",
    displayName: "Policy Review Agent + Human Reviewer",
    pathType: "hybrid",
    trustTier: "trusted",
    sensitiveDataSuitability: "medium",
    supportedTaskTypes: ["document_review", "policy_review"],
    baseFitScore: 80,
    whyShown: [
      "Strong fit for policy review work",
      "Can accelerate first-pass gap analysis",
    ],
    whyLimited: ["Requires human validation before final use"],
  },
  {
    id: "human_role_001",
    sourceType: "human_role",
    displayName: "Human Reviewer",
    pathType: "hybrid",
    trustTier: "human_review",
    sensitiveDataSuitability: "medium_high",
    supportedTaskTypes: ["memo_or_strategy", "document_review", "summary"],
    baseFitScore: 70,
    whyShown: ["Can review and approve higher-risk outputs"],
    whyLimited: [],
  },
  {
    id: "human_role_003",
    sourceType: "human_role",
    displayName: "Policy Owner",
    pathType: "human",
    trustTier: "human_review",
    sensitiveDataSuitability: "medium_high",
    supportedTaskTypes: ["document_review", "policy_review"],
    baseFitScore: 78,
    whyShown: ["Can own policy review when automation needs to be bypassed"],
    whyLimited: [],
  },
  {
    id: "human_role_002",
    sourceType: "human_role",
    displayName: "Strategy Lead",
    pathType: "human",
    trustTier: "human_review",
    sensitiveDataSuitability: "medium_high",
    supportedTaskTypes: ["strategy_work", "memo_or_strategy"],
    baseFitScore: 84,
    whyShown: ["Best fit for high-judgment strategic decisions"],
    whyLimited: [],
  },
]

function supportsTask(profile, taskType) {
  return profile.supportedTaskTypes.includes(taskType)
}

function optionCanHandleSensitivity(profile, taskAnalysis) {
  if (profile.sensitiveDataSuitability === "low") {
    return taskAnalysis.dataSensitivity === "low"
  }

  if (profile.sensitiveDataSuitability === "low_medium") {
    return (
      taskAnalysis.dataSensitivity === "low" ||
      taskAnalysis.dataSensitivity === "medium"
    )
  }

  return true
}

function scoreOption(profile, taskAnalysis, recommendation) {
  let fitScore = profile.baseFitScore

  if (supportsTask(profile, taskAnalysis.taskType)) {
    fitScore += 8
  }

  if (profile.pathType === recommendation.recommendedPath) {
    fitScore += 8
  }

  if (profile.trustTier === "trusted") {
    fitScore += 4
  }

  if (taskAnalysis.costPressure === "high" && profile.sourceType === "agent") {
    fitScore += 3
  }

  return clamp(fitScore, 0, 100)
}

function buildWhyLimited(profile, taskAnalysis, governanceResult, eligible) {
  const whyLimited = [...profile.whyLimited]

  if (!governanceResult.allowedPaths.includes(profile.pathType)) {
    whyLimited.push(`The ${profile.pathType} path is blocked by governance`)
  }

  if (!supportsTask(profile, taskAnalysis.taskType)) {
    whyLimited.push("This option is not a direct match for this task type")
  }

  if (!optionCanHandleSensitivity(profile, taskAnalysis)) {
    whyLimited.push("This option is not suitable for the task sensitivity")
  }

  if (!eligible && whyLimited.length === 0) {
    whyLimited.push("This option is limited by the current task context")
  }

  return whyLimited
}

export function getExecutionOptions(
  taskAnalysis,
  recommendation,
  governanceResult,
) {
  return EXECUTION_PROFILES.map((profile) => {
    const pathAllowed = governanceResult.allowedPaths.includes(profile.pathType)
    const taskSupported = supportsTask(profile, taskAnalysis.taskType)
    const sensitivityAllowed = optionCanHandleSensitivity(profile, taskAnalysis)
    const eligible = pathAllowed && taskSupported && sensitivityAllowed
    const fitScore = scoreOption(profile, taskAnalysis, recommendation)

    return {
      id: `${taskAnalysis.taskId}_${profile.id}`,
      taskId: taskAnalysis.taskId,
      sourceType: profile.sourceType,
      sourceId: profile.id,
      displayName: profile.displayName,
      pathType: profile.pathType,
      trustTier: profile.trustTier,
      sensitiveDataSuitability: profile.sensitiveDataSuitability,
      supportedTaskTypes: profile.supportedTaskTypes,
      fitScore,
      eligible,
      approvalRequired:
        governanceResult.approvalRequired ||
        profile.trustTier === "review_required",
      whyShown: profile.whyShown,
      whyLimited: buildWhyLimited(
        profile,
        taskAnalysis,
        governanceResult,
        eligible,
      ),
    }
  }).sort((first, second) => {
    if (first.eligible !== second.eligible) {
      return first.eligible ? -1 : 1
    }

    if (first.pathType !== second.pathType) {
      if (first.pathType === recommendation.recommendedPath) return -1
      if (second.pathType === recommendation.recommendedPath) return 1
    }

    return second.fitScore - first.fitScore
  })
}
