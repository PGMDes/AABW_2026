function normalizeValue(value, fallback = "") {
  return String(value || fallback).toLowerCase().trim()
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword))
}

export function analyzeTask(task) {
  const title = normalizeValue(task.title)
  const description = normalizeValue(task.description)
  const expectedOutput = normalizeValue(task.expectedOutput)
  const combinedText = `${title} ${description} ${expectedOutput}`

  let taskType = "general_knowledge_work"
  let taskClarity = "medium"
  let requiredJudgment = "medium"
  let dataSensitivity = normalizeValue(task.sensitivity, "medium")
  let businessRisk = "medium"
  const speedPressure = normalizeValue(task.urgency, "medium")
  const costPressure =
    normalizeValue(task.budgetRange, "medium") === "low" ? "high" : "medium"

  if (
    includesAny(combinedText, [
      "research",
      "competitor",
      "competitive",
      "brief",
      "market",
    ])
  ) {
    taskType = "research_brief"
    taskClarity = "high"
    requiredJudgment = "medium"
    businessRisk = "low"
  }

  if (
    includesAny(combinedText, ["summary", "summarize"]) &&
    taskType !== "research_brief"
  ) {
    taskType = "summary"
    taskClarity = "high"
    requiredJudgment = "low"
    businessRisk = "low"
  }

  if (includesAny(combinedText, ["executive", "board", "memo"])) {
    taskType = "memo_or_strategy"
    taskClarity = taskClarity === "high" ? "medium" : taskClarity
    requiredJudgment = "high"
    businessRisk = businessRisk === "low" ? "medium" : businessRisk
  }

  if (
    includesAny(combinedText, [
      "decide whether",
      "decision recommendation",
      "change ai product strategy",
    ])
  ) {
    taskType = "strategy_work"
    taskClarity = "low"
    requiredJudgment = "high"
    businessRisk = "high"
  }

  if (includesAny(combinedText, ["policy", "compliance", "review"])) {
    taskType = "document_review"
    taskClarity = taskClarity === "high" ? "medium" : taskClarity
    requiredJudgment = "high"
    businessRisk = businessRisk === "low" ? "medium" : businessRisk
  }

  if (task.audience === "external") {
    businessRisk = "high"
  }

  if (task.sensitivity === "high") {
    dataSensitivity = "high"
  }

  return {
    taskId: task.id,
    taskType,
    taskClarity,
    requiredJudgment,
    dataSensitivity,
    businessRisk,
    speedPressure,
    costPressure,
  }
}
