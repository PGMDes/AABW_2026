export const recommendationExplanations = [
  {
    taskId: "task_001",
    topReasons: [
      "Task is clearly defined",
      "The work is structured enough for agent support",
      "Sensitivity is low",
      "Business risk is manageable",
    ],
    keyFactors: {
      taskClarity: "high",
      requiredJudgment: "medium",
      dataSensitivity: "low",
      businessRisk: "low",
    },
    alternatives: [
      {
        path: "human",
        reason: "Safer when sensitivity or judgment needs increase",
      },
      {
        path: "hybrid",
        reason: "Useful when agent speed is valuable but human review still matters",
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
      "An agent can help with the first pass",
      "A human should stay involved for review or judgment",
      "The task needs both speed and human thinking",
      "Shared handling is safer than agent-only",
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "medium",
    },
    alternatives: [
      {
        path: "agent",
        reason: "Useful when the task becomes more structured and lower risk",
      },
      {
        path: "human",
        reason: "Safer when sensitivity or judgment needs increase",
      },
    ],
    conditions: ["Check governance before launch"],
  },
  {
    taskId: "task_003",
    topReasons: [
      "Strong human judgment is needed",
      "The content is sensitive",
      "Mistakes would have high business impact",
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "high",
      businessRisk: "high",
    },
    alternatives: [
      {
        path: "agent",
        reason: "Useful when the task becomes more structured and lower risk",
      },
      {
        path: "hybrid",
        reason: "Useful when agent speed is valuable but human review still matters",
      },
    ],
    conditions: [
      "Check governance before launch",
      "Human review should remain in the loop",
    ],
  },
  {
    taskId: "task_004",
    topReasons: [
      "Task is still ambiguous",
      "Strong human judgment is needed",
      "Mistakes would have high business impact",
    ],
    keyFactors: {
      taskClarity: "low",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "high",
    },
    alternatives: [
      {
        path: "agent",
        reason: "Useful when the task becomes more structured and lower risk",
      },
      {
        path: "hybrid",
        reason: "Useful when agent speed is valuable but human review still matters",
      },
    ],
    conditions: [
      "Check governance before launch",
      "Human review should remain in the loop",
    ],
  },
  {
    taskId: "task_005",
    topReasons: [
      "An agent can help with the first pass",
      "A human should stay involved for review or judgment",
      "The task needs both speed and human thinking",
      "Shared handling is safer than agent-only",
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "medium",
    },
    alternatives: [
      {
        path: "agent",
        reason: "Useful when the task becomes more structured and lower risk",
      },
      {
        path: "human",
        reason: "Safer when sensitivity or judgment needs increase",
      },
    ],
    conditions: ["Check governance before launch"],
  },
]
