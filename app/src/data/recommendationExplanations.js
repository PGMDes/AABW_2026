export const recommendationExplanations = [
  {
    taskId: "task_001",
    topReasons: [
      "Task is clearly defined",
      "This is repeatable research work",
      "Sensitivity is low",
      "Agent support improves speed",
    ],
    keyFactors: {
      taskClarity: "high",
      requiredJudgment: "medium",
      dataSensitivity: "low",
      businessRisk: "low",
    },
    alternatives: [
      {
        path: "hybrid",
        reason: "Useful if a human wants to review the final brief",
      },
      {
        path: "human",
        reason: "Possible, but slower than needed for this structured task",
      },
    ],
    conditions: [
      "Use a trusted research agent",
      "Escalate to human review if the audience changes to external",
    ],
  },
  {
    taskId: "task_002",
    topReasons: [
      "An agent can help draft the first pass",
      "Leadership-facing work needs human judgment",
      "Sensitivity is medium",
      "Hybrid is safer than agent-only",
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "medium",
    },
    alternatives: [
      { path: "human", reason: "Safer, but slower than needed" },
      { path: "agent", reason: "Too risky without human review" },
    ],
    conditions: [
      "Human review should stay in the loop",
      "Approval is likely required before launch",
    ],
  },
  {
    taskId: "task_003",
    topReasons: [
      "This task is sensitive",
      "The output is external-facing",
      "Mistakes would have high business impact",
      "Human control is safest",
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "high",
      businessRisk: "high",
    },
    alternatives: [
      { path: "hybrid", reason: "Possible only with strict human review" },
      { path: "agent", reason: "Not suitable for this level of risk" },
    ],
    conditions: [
      "Do not use agent-only for this task",
      "Human approval and control are required",
    ],
  },
  {
    taskId: "task_004",
    topReasons: [
      "An agent can help review the document",
      "Policy work still needs human validation",
      "Sensitivity is medium",
      "Hybrid gives speed with safer oversight",
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "medium",
    },
    alternatives: [
      { path: "human", reason: "Safer, but slower" },
      { path: "agent", reason: "Too risky without human review" },
    ],
    conditions: [
      "Approval should happen before launch",
      "Human validation is required before using the final review",
    ],
  },
]
