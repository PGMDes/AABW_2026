export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function scoreHumanFit(taskAnalysis) {
  let score = 40

  if (taskAnalysis.taskClarity === "low") score += 20
  if (taskAnalysis.taskClarity === "high") score -= 5

  if (taskAnalysis.requiredJudgment === "high") score += 25
  if (taskAnalysis.requiredJudgment === "medium") score += 10
  if (taskAnalysis.requiredJudgment === "low") score -= 10

  if (taskAnalysis.dataSensitivity === "high") score += 20
  if (taskAnalysis.dataSensitivity === "medium") score += 10

  if (taskAnalysis.businessRisk === "high") score += 20
  if (taskAnalysis.businessRisk === "medium") score += 10

  if (taskAnalysis.speedPressure === "high") score -= 5

  return clamp(score, 0, 100)
}

export function scoreAgentFit(taskAnalysis) {
  let score = 40

  if (taskAnalysis.taskClarity === "high") score += 20
  if (taskAnalysis.taskClarity === "medium") score += 10
  if (taskAnalysis.taskClarity === "low") score -= 20

  if (taskAnalysis.requiredJudgment === "low") score += 20
  if (taskAnalysis.requiredJudgment === "medium") score += 5
  if (taskAnalysis.requiredJudgment === "high") score -= 25

  if (taskAnalysis.dataSensitivity === "low") score += 10
  if (taskAnalysis.dataSensitivity === "high") score -= 20

  if (taskAnalysis.businessRisk === "low") score += 2
  if (taskAnalysis.businessRisk === "high") score -= 20

  if (taskAnalysis.speedPressure === "high") score += 10
  if (taskAnalysis.costPressure === "high") score += 5

  return clamp(score, 0, 100)
}

export function scoreHybridFit(taskAnalysis) {
  let score = 40

  if (taskAnalysis.taskClarity === "high") score += 10
  if (taskAnalysis.taskClarity === "medium") score += 15

  if (taskAnalysis.requiredJudgment === "medium") score += 17
  if (taskAnalysis.requiredJudgment === "high") score += 10

  if (taskAnalysis.dataSensitivity === "medium") score += 15
  if (taskAnalysis.businessRisk === "medium") score += 15
  if (taskAnalysis.speedPressure === "high") score += 5

  if (
    taskAnalysis.taskClarity === "low" &&
    taskAnalysis.requiredJudgment === "high"
  ) {
    score -= 10
  }

  if (
    taskAnalysis.requiredJudgment === "low" &&
    taskAnalysis.dataSensitivity === "low"
  ) {
    score -= 10
  }

  if (
    taskAnalysis.businessRisk === "high" &&
    taskAnalysis.dataSensitivity === "high"
  ) {
    score -= 10
  }

  return clamp(score, 0, 100)
}

export function buildRecommendation(taskAnalysis) {
  const humanFitScore = scoreHumanFit(taskAnalysis)
  const agentFitScore = scoreAgentFit(taskAnalysis)
  const hybridFitScore = scoreHybridFit(taskAnalysis)

  const scores = [
    { path: "human", score: humanFitScore },
    { path: "agent", score: agentFitScore },
    { path: "hybrid", score: hybridFitScore },
  ].sort((first, second) => second.score - first.score)

  const top = scores[0]
  const second = scores[1]
  let recommendedPath = top.path

  if (top.score - second.score <= 5) {
    if (taskAnalysis.requiredJudgment === "high") {
      recommendedPath = top.path === "agent" ? "hybrid" : "human"
    } else {
      recommendedPath = "hybrid"
    }
  }

  const scoreGap = top.score - second.score
  const confidence = Math.min(95, 55 + scoreGap * 2)

  return {
    taskId: taskAnalysis.taskId,
    humanFitScore,
    agentFitScore,
    hybridFitScore,
    recommendedPath,
    confidence,
    createdAt: new Date().toISOString(),
  }
}

export function buildRecommendationExplanation(taskAnalysis, recommendation) {
  const reasons = []
  const conditions = []

  if (recommendation.recommendedPath === "agent") {
    if (taskAnalysis.taskClarity === "high") {
      reasons.push("Task is clearly defined")
    }
    if (taskAnalysis.requiredJudgment !== "high") {
      reasons.push("The work is structured enough for agent support")
    }
    if (taskAnalysis.dataSensitivity === "low") {
      reasons.push("Sensitivity is low")
    }
    if (taskAnalysis.businessRisk === "low") {
      reasons.push("Business risk is manageable")
    }
    if (taskAnalysis.speedPressure === "high") {
      reasons.push("Agent use can speed up delivery")
    }
  }

  if (recommendation.recommendedPath === "human") {
    if (taskAnalysis.taskClarity === "low") {
      reasons.push("Task is still ambiguous")
    }
    if (taskAnalysis.requiredJudgment === "high") {
      reasons.push("Strong human judgment is needed")
    }
    if (taskAnalysis.dataSensitivity === "high") {
      reasons.push("The content is sensitive")
    }
    if (taskAnalysis.businessRisk === "high") {
      reasons.push("Mistakes would have high business impact")
    }
  }

  if (recommendation.recommendedPath === "hybrid") {
    reasons.push("An agent can help with the first pass")
    reasons.push("A human should stay involved for review or judgment")
    if (
      taskAnalysis.requiredJudgment === "medium" ||
      taskAnalysis.requiredJudgment === "high"
    ) {
      reasons.push("The task needs both speed and human thinking")
    }
    if (taskAnalysis.dataSensitivity === "medium") {
      reasons.push("Shared handling is safer than agent-only")
    }
  }

  if (taskAnalysis.dataSensitivity !== "low") {
    conditions.push("Check governance before launch")
  }

  if (taskAnalysis.businessRisk === "high") {
    conditions.push("Human review should remain in the loop")
  }

  if (recommendation.recommendedPath === "agent") {
    conditions.push("Use a trusted research agent")
    conditions.push("Escalate to human review if the audience changes to external")
  }

  const alternatives = []

  if (recommendation.recommendedPath !== "agent") {
    alternatives.push({
      path: "agent",
      reason: "Useful when the task becomes more structured and lower risk",
    })
  }

  if (recommendation.recommendedPath !== "human") {
    alternatives.push({
      path: "human",
      reason: "Safer when sensitivity or judgment needs increase",
    })
  }

  if (recommendation.recommendedPath !== "hybrid") {
    alternatives.push({
      path: "hybrid",
      reason: "Useful when agent speed is valuable but human review still matters",
    })
  }

  return {
    taskId: taskAnalysis.taskId,
    topReasons: reasons.slice(0, 4),
    keyFactors: {
      taskClarity: taskAnalysis.taskClarity,
      requiredJudgment: taskAnalysis.requiredJudgment,
      dataSensitivity: taskAnalysis.dataSensitivity,
      businessRisk: taskAnalysis.businessRisk,
    },
    alternatives: alternatives.slice(0, 2),
    conditions,
  }
}
