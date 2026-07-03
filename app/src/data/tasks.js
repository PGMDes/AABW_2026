export const tasks = [
  {
    id: "task_001",
    title: "Create internal market research brief about AI competitors",
    description:
      "Summarize the top 5 AI competitors, their positioning, strengths, weaknesses, and likely impact on our product strategy.",
    expectedOutput: "2-page internal research brief",
    deadline: "2026-07-10",
    audience: "internal",
    sensitivity: "low",
    urgency: "medium",
    budgetRange: "low",
    status: "completed",
  },
  {
    id: "task_002",
    title: "Draft executive memo about AI adoption strategy",
    description:
      "Prepare a leadership memo explaining the risks, opportunities, and rollout recommendation for AI adoption in the organization.",
    expectedOutput: "1-page executive memo",
    deadline: "2026-07-08",
    audience: "internal_leadership",
    sensitivity: "medium",
    urgency: "high",
    budgetRange: "medium",
    status: "approval_required",
  },
  {
    id: "task_003",
    title: "Prepare sensitive external strategy memo",
    description:
      "Draft a partner-facing strategy memo using sensitive internal planning material.",
    expectedOutput: "External strategy memo",
    deadline: "2026-07-06",
    audience: "external",
    sensitivity: "high",
    urgency: "high",
    budgetRange: "medium",
    status: "blocked",
  },
  {
    id: "task_004",
    title: "Decide whether to change AI product strategy for enterprise customers",
    description:
      "Assess current market direction and decide whether our AI product strategy should change for enterprise customers this quarter.",
    expectedOutput: "Decision recommendation with rationale",
    deadline: "2026-07-15",
    audience: "internal_leadership",
    sensitivity: "medium",
    urgency: "medium",
    budgetRange: "low",
    status: "recommended",
  },
  {
    id: "task_005",
    title: "Review internal policy document for governance gaps",
    description:
      "Review the internal AI use policy and identify missing governance controls, weak language, and operational risks.",
    expectedOutput: "Policy gap review summary",
    deadline: "2026-07-12",
    audience: "internal_leadership",
    sensitivity: "medium",
    urgency: "medium",
    budgetRange: "medium",
    status: "needs_human_review",
  },
]

export const taskAnalyses = [
  {
    taskId: "task_001",
    taskType: "research_brief",
    taskClarity: "high",
    requiredJudgment: "medium",
    dataSensitivity: "low",
    businessRisk: "low",
    speedPressure: "medium",
    costPressure: "high",
  },
  {
    taskId: "task_002",
    taskType: "memo_or_strategy",
    taskClarity: "medium",
    requiredJudgment: "high",
    dataSensitivity: "medium",
    businessRisk: "medium",
    speedPressure: "high",
    costPressure: "medium",
  },
  {
    taskId: "task_003",
    taskType: "memo_or_strategy",
    taskClarity: "medium",
    requiredJudgment: "high",
    dataSensitivity: "high",
    businessRisk: "high",
    speedPressure: "high",
    costPressure: "medium",
  },
  {
    taskId: "task_004",
    taskType: "strategy_work",
    taskClarity: "low",
    requiredJudgment: "high",
    dataSensitivity: "medium",
    businessRisk: "high",
    speedPressure: "medium",
    costPressure: "high",
  },
  {
    taskId: "task_005",
    taskType: "document_review",
    taskClarity: "medium",
    requiredJudgment: "high",
    dataSensitivity: "medium",
    businessRisk: "medium",
    speedPressure: "medium",
    costPressure: "medium",
  },
]

export const defaultNewTaskFormData = {
  title: "Create internal market research brief about AI competitors",
  description:
    "Summarize the top 5 AI competitors, their positioning, strengths, weaknesses, and likely impact on our product strategy.",
  expectedOutput: "2-page internal research brief",
  deadline: "2026-07-10",
  audience: "internal",
  sensitivity: "low",
  urgency: "medium",
  budgetRange: "low",
}

export const taskFormOptions = {
  audienceOptions: [
    { label: "Internal", value: "internal" },
    { label: "Internal leadership", value: "internal_leadership" },
    { label: "External", value: "external" },
  ],
  sensitivityOptions: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ],
  urgencyOptions: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ],
  budgetRangeOptions: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ],
}
