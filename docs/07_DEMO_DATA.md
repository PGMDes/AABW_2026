# 07_DEMO_DATA.md

## Purpose of this file

This file defines the fake/sample data for the first `Human-AgentOS` frontend demo.

The goal is to let a beginner build a believable React + Vite + Tailwind app before adding any backend or database.

All examples here are written in JSON-like format so they can be copied into JavaScript files with only small edits.

Field names stay consistent with `docs/03_DATA_MODEL.md`.

---

## Main rule for the first demo

Use sample data first.

Do not wait for:
- backend APIs
- database tables
- authentication
- real user accounts
- real agent integrations

The first frontend demo only needs enough data to prove:
- `agent` path
- `human` path
- `hybrid` path
- approval-required path
- blocked-by-policy path

---

## 1. Sample current user

```js
export const currentUser = {
  id: "user_001",
  name: "Maya Chen",
  role: "Innovation / AI Transformation Lead",
  team: "Strategy and Transformation",
  organization: "Human-AgentOS Demo Org"
}
```

### Why this user exists
This is the main demo user who creates tasks and reviews recommendations.

---

## 2. Sample tasks

At least 5 sample tasks are needed so the app can show different recommendation and governance outcomes.

```js
export const tasks = [
  {
    id: "task_001",
    title: "Create internal market research brief about AI competitors",
    description: "Summarize the top 5 AI competitors, their positioning, strengths, weaknesses, and likely impact on our product strategy.",
    expectedOutput: "2-page internal research brief",
    deadline: "2026-07-10",
    audience: "internal",
    sensitivity: "low",
    urgency: "medium",
    budgetRange: "low",
    status: "completed"
  },
  {
    id: "task_002",
    title: "Draft executive memo about AI adoption strategy",
    description: "Prepare a leadership memo explaining the risks, opportunities, and rollout recommendation for AI adoption in the organization.",
    expectedOutput: "1-page executive memo",
    deadline: "2026-07-08",
    audience: "internal_leadership",
    sensitivity: "medium",
    urgency: "high",
    budgetRange: "medium",
    status: "approval_required"
  },
  {
    id: "task_003",
    title: "Prepare sensitive external strategy memo",
    description: "Draft a partner-facing strategy memo using sensitive internal planning material.",
    expectedOutput: "External strategy memo",
    deadline: "2026-07-06",
    audience: "external",
    sensitivity: "high",
    urgency: "high",
    budgetRange: "medium",
    status: "blocked"
  },
  {
    id: "task_004",
    title: "Decide whether to change AI product strategy for enterprise customers",
    description: "Review current market direction and decide whether our AI product strategy should change for enterprise customers this quarter.",
    expectedOutput: "Decision recommendation with rationale",
    deadline: "2026-07-15",
    audience: "internal_leadership",
    sensitivity: "medium",
    urgency: "medium",
    budgetRange: "low",
    status: "recommended"
  },
  {
    id: "task_005",
    title: "Review internal policy document for governance gaps",
    description: "Review the internal AI use policy and identify missing governance controls, weak language, and operational risks.",
    expectedOutput: "Policy gap review summary",
    deadline: "2026-07-12",
    audience: "internal_leadership",
    sensitivity: "medium",
    urgency: "medium",
    budgetRange: "medium",
    status: "ready_to_launch"
  },
  {
    id: "task_006",
    title: "Summarize 20 customer interview notes into one internal findings page",
    description: "Create a concise internal summary of common customer pain points and opportunity themes from 20 interview notes.",
    expectedOutput: "1-page internal findings summary",
    deadline: "2026-07-09",
    audience: "internal",
    sensitivity: "low",
    urgency: "high",
    budgetRange: "low",
    status: "recommended"
  }
]
```

---

## 3. Sample task analyses

These are the structured outputs created after task analysis.

```js
export const taskAnalyses = [
  {
    taskId: "task_001",
    taskType: "research_brief",
    taskClarity: "high",
    requiredJudgment: "medium",
    dataSensitivity: "low",
    businessRisk: "low",
    speedPressure: "medium",
    costPressure: "high"
  },
  {
    taskId: "task_002",
    taskType: "memo_or_strategy",
    taskClarity: "medium",
    requiredJudgment: "high",
    dataSensitivity: "medium",
    businessRisk: "medium",
    speedPressure: "high",
    costPressure: "medium"
  },
  {
    taskId: "task_003",
    taskType: "memo_or_strategy",
    taskClarity: "medium",
    requiredJudgment: "high",
    dataSensitivity: "high",
    businessRisk: "high",
    speedPressure: "high",
    costPressure: "medium"
  },
  {
    taskId: "task_004",
    taskType: "strategy_work",
    taskClarity: "low",
    requiredJudgment: "high",
    dataSensitivity: "medium",
    businessRisk: "high",
    speedPressure: "medium",
    costPressure: "low"
  },
  {
    taskId: "task_005",
    taskType: "document_review",
    taskClarity: "medium",
    requiredJudgment: "high",
    dataSensitivity: "medium",
    businessRisk: "medium",
    speedPressure: "medium",
    costPressure: "medium"
  },
  {
    taskId: "task_006",
    taskType: "summary",
    taskClarity: "high",
    requiredJudgment: "low",
    dataSensitivity: "low",
    businessRisk: "low",
    speedPressure: "high",
    costPressure: "high"
  }
]
```

---

## 4. Sample recommendation records

These are the outputs of the recommendation engine.

```js
export const recommendationRecords = [
  {
    taskId: "task_001",
    humanFitScore: 45,
    agentFitScore: 82,
    hybridFitScore: 67,
    recommendedPath: "agent",
    confidence: 85,
    createdAt: "2026-07-03T10:30:00Z"
  },
  {
    taskId: "task_002",
    humanFitScore: 72,
    agentFitScore: 48,
    hybridFitScore: 79,
    recommendedPath: "hybrid",
    confidence: 69,
    createdAt: "2026-07-03T10:35:00Z"
  },
  {
    taskId: "task_003",
    humanFitScore: 88,
    agentFitScore: 22,
    hybridFitScore: 69,
    recommendedPath: "human",
    confidence: 93,
    createdAt: "2026-07-03T10:40:00Z"
  },
  {
    taskId: "task_004",
    humanFitScore: 90,
    agentFitScore: 20,
    hybridFitScore: 68,
    recommendedPath: "human",
    confidence: 95,
    createdAt: "2026-07-03T10:45:00Z"
  },
  {
    taskId: "task_005",
    humanFitScore: 74,
    agentFitScore: 42,
    hybridFitScore: 81,
    recommendedPath: "hybrid",
    confidence: 69,
    createdAt: "2026-07-03T10:50:00Z"
  },
  {
    taskId: "task_006",
    humanFitScore: 32,
    agentFitScore: 90,
    hybridFitScore: 58,
    recommendedPath: "agent",
    confidence: 95,
    createdAt: "2026-07-03T10:55:00Z"
  }
]
```

---

## 5. Sample recommendation explanations

These explain why the recommendation was chosen.

```js
export const recommendationExplanations = [
  {
    taskId: "task_001",
    topReasons: [
      "Task is clearly defined",
      "This is repeatable research work",
      "Sensitivity is low",
      "Agent support improves speed"
    ],
    keyFactors: {
      taskClarity: "high",
      requiredJudgment: "medium",
      dataSensitivity: "low",
      businessRisk: "low"
    },
    alternatives: [
      {
        path: "hybrid",
        reason: "Useful if a human wants to review the final brief"
      },
      {
        path: "human",
        reason: "Possible, but slower than needed for this structured task"
      }
    ],
    conditions: [
      "Use a trusted research agent",
      "Escalate to human review if the audience changes to external"
    ]
  },
  {
    taskId: "task_002",
    topReasons: [
      "An agent can help draft the first pass",
      "Leadership-facing work needs human judgment",
      "Sensitivity is medium",
      "Hybrid is safer than agent-only"
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "medium"
    },
    alternatives: [
      {
        path: "human",
        reason: "Safer, but slower than needed"
      },
      {
        path: "agent",
        reason: "Too risky without human review"
      }
    ],
    conditions: [
      "Human review should stay in the loop",
      "Approval is likely required before launch"
    ]
  },
  {
    taskId: "task_003",
    topReasons: [
      "This task is sensitive",
      "The output is external-facing",
      "Mistakes would have high business impact",
      "Human control is safest"
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "high",
      businessRisk: "high"
    },
    alternatives: [
      {
        path: "hybrid",
        reason: "Possible only with strict human review"
      },
      {
        path: "agent",
        reason: "Not suitable for this level of risk"
      }
    ],
    conditions: [
      "Do not use agent-only for this task",
      "Human approval and control are required"
    ]
  },
  {
    taskId: "task_004",
    topReasons: [
      "The task is ambiguous",
      "High judgment is required",
      "Business impact is high",
      "Human decision-making is the safer path"
    ],
    keyFactors: {
      taskClarity: "low",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "high"
    },
    alternatives: [
      {
        path: "hybrid",
        reason: "Could support background research, but final judgment should stay human"
      },
      {
        path: "agent",
        reason: "Too much strategic ambiguity for agent-only"
      }
    ],
    conditions: [
      "Human ownership should remain primary"
    ]
  },
  {
    taskId: "task_005",
    topReasons: [
      "An agent can help review the document",
      "Policy work still needs human validation",
      "Sensitivity is medium",
      "Hybrid gives speed with safer oversight"
    ],
    keyFactors: {
      taskClarity: "medium",
      requiredJudgment: "high",
      dataSensitivity: "medium",
      businessRisk: "medium"
    },
    alternatives: [
      {
        path: "human",
        reason: "Safer, but slower"
      },
      {
        path: "agent",
        reason: "Too risky without human review"
      }
    ],
    conditions: [
      "Approval should happen before launch",
      "Human validation is required before using the final review"
    ]
  },
  {
    taskId: "task_006",
    topReasons: [
      "Task is clearly defined",
      "This is structured summarization work",
      "Sensitivity is low",
      "Agent use is fast and cost-efficient"
    ],
    keyFactors: {
      taskClarity: "high",
      requiredJudgment: "low",
      dataSensitivity: "low",
      businessRisk: "low"
    },
    alternatives: [
      {
        path: "hybrid",
        reason: "Useful if a reviewer wants to polish the output"
      },
      {
        path: "human",
        reason: "Possible, but slower and less cost-efficient"
      }
    ],
    conditions: [
      "Use trusted summarization agents"
    ]
  }
]
```

---

## 6. Sample governance results

These are created after recommendation.

```js
export const governanceResults = [
  {
    taskId: "task_001",
    recommendedPath: "agent",
    approvalRequired: false,
    approvalReason: null,
    approvalReasons: [],
    allowedPaths: ["human", "agent", "hybrid"],
    blockedPaths: [],
    policyFlags: ["low_sensitivity", "internal_use"],
    selectedOptionAllowed: true,
    selectedOptionBlockReason: null,
    status: "approved_for_launch",
    policyReason: "Low-sensitivity internal research is allowed for trusted agents"
  },
  {
    taskId: "task_002",
    recommendedPath: "hybrid",
    approvalRequired: true,
    approvalReason: "Audience is leadership or executive",
    approvalReasons: [
      "Audience is leadership or executive",
      "Task contains medium or high sensitivity content"
    ],
    allowedPaths: ["human", "agent", "hybrid"],
    blockedPaths: [],
    policyFlags: ["medium_sensitivity", "leadership_audience"],
    selectedOptionAllowed: true,
    selectedOptionBlockReason: null,
    status: "approval_required",
    policyReason: "Leadership-facing work requires approval before launch"
  },
  {
    taskId: "task_003",
    recommendedPath: "human",
    approvalRequired: true,
    approvalReason: "Task contains medium or high sensitivity content",
    approvalReasons: [
      "Task contains medium or high sensitivity content",
      "Output is for an external audience",
      "Task has high business risk"
    ],
    allowedPaths: ["human", "hybrid"],
    blockedPaths: ["agent"],
    policyFlags: ["high_sensitivity", "external_audience"],
    selectedOptionAllowed: true,
    selectedOptionBlockReason: null,
    status: "approval_required",
    policyReason: "Agent-only is blocked for sensitive external work"
  },
  {
    taskId: "task_004",
    recommendedPath: "human",
    approvalRequired: true,
    approvalReason: "Task has high business risk",
    approvalReasons: [
      "Task has high business risk",
      "Audience is leadership or executive"
    ],
    allowedPaths: ["human", "hybrid"],
    blockedPaths: ["agent"],
    policyFlags: ["medium_sensitivity", "leadership_audience"],
    selectedOptionAllowed: true,
    selectedOptionBlockReason: null,
    status: "approval_required",
    policyReason: "High-risk strategy work should not be agent-only"
  },
  {
    taskId: "task_005",
    recommendedPath: "hybrid",
    approvalRequired: true,
    approvalReason: "Policy or review work needs human validation",
    approvalReasons: [
      "Policy or review work needs human validation",
      "Audience is leadership or executive"
    ],
    allowedPaths: ["human", "agent", "hybrid"],
    blockedPaths: [],
    policyFlags: ["medium_sensitivity", "leadership_audience"],
    selectedOptionAllowed: true,
    selectedOptionBlockReason: null,
    status: "approval_required",
    policyReason: "Policy review work requires human validation before launch"
  },
  {
    taskId: "task_006",
    recommendedPath: "agent",
    approvalRequired: false,
    approvalReason: null,
    approvalReasons: [],
    allowedPaths: ["human", "agent", "hybrid"],
    blockedPaths: [],
    policyFlags: ["low_sensitivity", "internal_use"],
    selectedOptionAllowed: true,
    selectedOptionBlockReason: null,
    status: "approved_for_launch",
    policyReason: "Low-risk summarization work is allowed for trusted agents"
  }
]
```

---

## 7. Sample agent profiles

At least 4 agents are needed.

```js
export const agentProfiles = [
  {
    id: "agent_001",
    name: "Research Analyst Agent",
    capabilities: ["research", "summarization", "brief_drafting"],
    supportedTaskTypes: ["research_brief", "competitive_summary"],
    trustTier: "trusted",
    sensitiveDataSuitability: "low_medium",
    costLevel: "low",
    limitations: [
      "Needs human review for external-facing documents"
    ],
    status: "active"
  },
  {
    id: "agent_002",
    name: "Competitive Scan Agent",
    capabilities: ["competitor_analysis", "market_scan", "summary_writing"],
    supportedTaskTypes: ["research_brief", "summary"],
    trustTier: "trusted",
    sensitiveDataSuitability: "low",
    costLevel: "low",
    limitations: [
      "Best for internal summaries, not for sensitive strategic memos"
    ],
    status: "active"
  },
  {
    id: "agent_003",
    name: "Executive Memo Agent",
    capabilities: ["memo_drafting", "executive_summary", "structured_writing"],
    supportedTaskTypes: ["memo_or_strategy", "summary"],
    trustTier: "review_required",
    sensitiveDataSuitability: "medium",
    costLevel: "medium",
    limitations: [
      "Requires human review before final use"
    ],
    status: "active"
  },
  {
    id: "agent_004",
    name: "Policy Review Agent",
    capabilities: ["document_review", "gap_analysis", "policy_checking"],
    supportedTaskTypes: ["document_review", "policy_review"],
    trustTier: "trusted",
    sensitiveDataSuitability: "medium",
    costLevel: "medium",
    limitations: [
      "Should not be used without human validation for final policy decisions"
    ],
    status: "active"
  },
  {
    id: "agent_005",
    name: "Experimental Strategy Bot",
    capabilities: ["drafting", "brainstorming"],
    supportedTaskTypes: ["memo_or_strategy", "strategy_work"],
    trustTier: "untrusted",
    sensitiveDataSuitability: "low",
    costLevel: "low",
    limitations: [
      "Not approved for real decision support"
    ],
    status: "active"
  }
]
```

---

## 8. Sample human role profiles

At least 2 are needed.

```js
export const humanRoleProfiles = [
  {
    id: "human_role_001",
    name: "Human Reviewer",
    roleType: "reviewer",
    skills: ["document_review", "business_judgment", "approval"],
    reviewAuthority: "can_approve_internal_knowledge_work",
    costLevel: "medium",
    availabilityNote: "Available for same-day review"
  },
  {
    id: "human_role_002",
    name: "Strategy Lead",
    roleType: "decision_maker",
    skills: ["strategy", "judgment", "leadership_review"],
    reviewAuthority: "can_approve_high_risk_strategy_work",
    costLevel: "high",
    availabilityNote: "Available with scheduling"
  }
]
```

---

## 9. Sample marketplace options

These are the screen-ready selectable options.

It is okay if they are generated from profiles later, but for the first demo they can be hardcoded.

```js
export const marketplaceOptions = [
  {
    id: "option_001",
    taskId: "task_001",
    sourceType: "agent",
    sourceId: "agent_001",
    displayName: "Research Analyst Agent",
    pathType: "agent",
    trustTier: "trusted",
    sensitiveDataSuitability: "low_medium",
    supportedTaskTypes: ["research_brief", "competitive_summary"],
    fitScore: 90,
    eligible: true,
    whyShown: [
      "Matches research brief tasks",
      "Trusted for low-sensitivity internal work",
      "Low cost and fast turnaround"
    ],
    whyLimited: [
      "Needs human review for external-facing use"
    ]
  },
  {
    id: "option_002",
    taskId: "task_001",
    sourceType: "agent",
    sourceId: "agent_002",
    displayName: "Competitive Scan Agent",
    pathType: "agent",
    trustTier: "trusted",
    sensitiveDataSuitability: "low",
    supportedTaskTypes: ["research_brief", "summary"],
    fitScore: 84,
    eligible: true,
    whyShown: [
      "Strong fit for competitor summaries",
      "Trusted for internal research"
    ],
    whyLimited: [
      "Not suitable for strategy memos"
    ]
  },
  {
    id: "option_003",
    taskId: "task_002",
    sourceType: "agent",
    sourceId: "agent_003",
    displayName: "Executive Memo Agent",
    pathType: "hybrid",
    trustTier: "review_required",
    sensitiveDataSuitability: "medium",
    supportedTaskTypes: ["memo_or_strategy", "summary"],
    fitScore: 82,
    eligible: true,
    whyShown: [
      "Useful for first-draft memo writing",
      "Fits leadership communication support"
    ],
    whyLimited: [
      "Requires human review before launch"
    ]
  },
  {
    id: "option_004",
    taskId: "task_002",
    sourceType: "human_role",
    sourceId: "human_role_001",
    displayName: "Human Reviewer",
    pathType: "hybrid",
    trustTier: "human_review",
    sensitiveDataSuitability: "medium_high",
    supportedTaskTypes: ["memo_or_strategy", "document_review"],
    fitScore: 75,
    eligible: true,
    whyShown: [
      "Can review and approve leadership-facing outputs"
    ],
    whyLimited: []
  },
  {
    id: "option_005",
    taskId: "task_003",
    sourceType: "human_role",
    sourceId: "human_role_002",
    displayName: "Strategy Lead",
    pathType: "human",
    trustTier: "human_review",
    sensitiveDataSuitability: "medium_high",
    supportedTaskTypes: ["strategy_work", "memo_or_strategy"],
    fitScore: 92,
    eligible: true,
    whyShown: [
      "High-risk external strategy work needs human ownership"
    ],
    whyLimited: []
  },
  {
    id: "option_006",
    taskId: "task_003",
    sourceType: "agent",
    sourceId: "agent_005",
    displayName: "Experimental Strategy Bot",
    pathType: "agent",
    trustTier: "untrusted",
    sensitiveDataSuitability: "low",
    supportedTaskTypes: ["memo_or_strategy", "strategy_work"],
    fitScore: 40,
    eligible: false,
    whyShown: [
      "Could draft early ideas"
    ],
    whyLimited: [
      "Blocked because the agent is untrusted",
      "Blocked for sensitive external work"
    ]
  },
  {
    id: "option_007",
    taskId: "task_004",
    sourceType: "human_role",
    sourceId: "human_role_002",
    displayName: "Strategy Lead",
    pathType: "human",
    trustTier: "human_review",
    sensitiveDataSuitability: "medium_high",
    supportedTaskTypes: ["strategy_work", "memo_or_strategy"],
    fitScore: 95,
    eligible: true,
    whyShown: [
      "Best fit for high-judgment strategic decisions"
    ],
    whyLimited: []
  },
  {
    id: "option_008",
    taskId: "task_005",
    sourceType: "agent",
    sourceId: "agent_004",
    displayName: "Policy Review Agent",
    pathType: "hybrid",
    trustTier: "trusted",
    sensitiveDataSuitability: "medium",
    supportedTaskTypes: ["document_review", "policy_review"],
    fitScore: 85,
    eligible: true,
    whyShown: [
      "Strong fit for policy review work",
      "Can accelerate first-pass gap analysis"
    ],
    whyLimited: [
      "Requires human validation before final use"
    ]
  },
  {
    id: "option_009",
    taskId: "task_005",
    sourceType: "human_role",
    sourceId: "human_role_001",
    displayName: "Human Reviewer",
    pathType: "hybrid",
    trustTier: "human_review",
    sensitiveDataSuitability: "medium_high",
    supportedTaskTypes: ["document_review", "policy_review"],
    fitScore: 72,
    eligible: true,
    whyShown: [
      "Can validate policy review findings before launch"
    ],
    whyLimited: []
  },
  {
    id: "option_010",
    taskId: "task_006",
    sourceType: "agent",
    sourceId: "agent_002",
    displayName: "Competitive Scan Agent",
    pathType: "agent",
    trustTier: "trusted",
    sensitiveDataSuitability: "low",
    supportedTaskTypes: ["research_brief", "summary"],
    fitScore: 88,
    eligible: true,
    whyShown: [
      "Good fit for summary work",
      "Fast and low cost"
    ],
    whyLimited: []
  }
]
```

---

## 10. Sample execution records

At least 1 completed example is needed, but having more helps the dashboard feel real.

```js
export const executionRecords = [
  {
    id: "execution_001",
    taskId: "task_001",
    selectedPath: "agent",
    selectedOptionId: "option_001",
    selectedOptionType: "agent",
    approvalStatus: "not_required",
    launchStatus: "launched",
    launchedAt: "2026-07-03T11:00:00Z"
  },
  {
    id: "execution_002",
    taskId: "task_002",
    selectedPath: "hybrid",
    selectedOptionId: "option_003",
    selectedOptionType: "agent",
    approvalStatus: "pending",
    launchStatus: "pending_approval",
    launchedAt: null
  },
  {
    id: "execution_003",
    taskId: "task_005",
    selectedPath: "hybrid",
    selectedOptionId: "option_008",
    selectedOptionType: "agent",
    approvalStatus: "approved",
    launchStatus: "launched",
    launchedAt: "2026-07-03T11:20:00Z"
  }
]
```

---

## 11. Sample outcome reviews

At least 1 completed outcome review is required.

```js
export const outcomeReviews = [
  {
    id: "outcome_001",
    executionId: "execution_001",
    status: "completed",
    outputSummary: "Draft market research brief created",
    reviewOutcome: "accepted_with_minor_edits",
    editLevel: "minor",
    reviewNotes: "Good first pass. Reviewer adjusted competitor prioritization and wording."
  },
  {
    id: "outcome_002",
    executionId: "execution_003",
    status: "completed",
    outputSummary: "Policy gap review summary created",
    reviewOutcome: "approved_after_review",
    editLevel: "moderate",
    reviewNotes: "Agent found useful gaps. Human reviewer refined wording and removed one weak finding."
  }
]
```

---

## 12. Generated lifecycle and audit trail

Lifecycle and audit data should be generated from the task flow instead of copied into separate sample arrays.

This keeps the demo consistent when recommendation, governance, selected option, execution, or outcome data changes.

### Example lifecycle state

```js
{
  taskId: "task_001",
  currentStage: "reviewed",
  governanceState: "approved",
  steps: [
    { id: "recommended", label: "Recommended", status: "completed" },
    { id: "approved", label: "Approved", status: "approved" },
    { id: "selected", label: "Selected", status: "selected" },
    { id: "launched", label: "Launched", status: "launched" },
    { id: "in_progress", label: "In progress", status: "completed" },
    { id: "completed", label: "Completed", status: "completed" },
    { id: "reviewed", label: "Reviewed", status: "reviewed" }
  ]
}
```

### Example audit event

```js
{
  id: "task_001_audit_006_execution_launched",
  label: "Execution launched",
  description: "Execution launched through Research Analyst Agent.",
  actorType: "human",
  relativeTimestamp: "T+05m",
  status: "completed"
}
```

---

## 13. Recommended `src/data` file structure

A simple frontend-only structure could look like this:

```text
src/
  data/
    currentUser.js
    tasks.js
    taskAnalyses.js
    recommendationRecords.js
    recommendationExplanations.js
    governanceResults.js
    agentProfiles.js
    humanRoleProfiles.js
    marketplaceOptions.js
    executionRecords.js
    outcomeReviews.js
    index.js
```

### Suggested `index.js`

This file can re-export everything:

```js
export { currentUser } from "./currentUser"
export { tasks } from "./tasks"
export { taskAnalyses } from "./taskAnalyses"
export { recommendationRecords } from "./recommendationRecords"
export { recommendationExplanations } from "./recommendationExplanations"
export { governanceResults } from "./governanceResults"
export { agentProfiles } from "./agentProfiles"
export { humanRoleProfiles } from "./humanRoleProfiles"
export { marketplaceOptions } from "./marketplaceOptions"
export { executionRecords } from "./executionRecords"
export { outcomeReviews } from "./outcomeReviews"
```

### Beginner-friendly note
This file structure is simple and clear. It is easier to debug than putting all sample data into one giant file.

---

## 14. Which sample task proves which path

This helps the demo stay clear.

### Happy path
- `task_001`
- title: `Create internal market research brief about AI competitors`
- proves:
  - clean end-to-end flow
  - `agent` recommendation
  - no approval needed
  - successful launch
  - completed outcome

### Approval-required path
- `task_002`
- title: `Draft executive memo about AI adoption strategy`
- proves:
  - `hybrid` recommendation
  - governance requires approval
  - cannot launch directly

### Blocked-by-policy path
- `task_003`
- title: `Prepare sensitive external strategy memo`
- proves:
  - high-risk governance restrictions
  - `agent` path blocked
  - safer fallback paths remain

### Human-only path
- `task_004`
- title: `Decide whether to change AI product strategy for enterprise customers`
- proves:
  - `human` recommendation
  - high judgment and high business risk

### Hybrid path
- `task_005`
- title: `Review internal policy document for governance gaps`
- proves:
  - `hybrid` recommendation
  - human validation still needed
  - policy review flow

### Agent path
- `task_006`
- title: `Summarize 20 customer interview notes into one internal findings page`
- proves:
  - strong low-risk `agent` use case
  - speed and cost efficiency

---

## Recommended first demo set

If the builder wants the smallest useful first demo, start by wiring these objects first:

- `currentUser`
- `tasks`
- `taskAnalyses`
- `recommendationRecords`
- `recommendationExplanations`
- `governanceResults`
- `marketplaceOptions`
- `executionRecords`
- `outcomeReviews`

Then add:
- `agentProfiles`
- `humanRoleProfiles`

This order helps the UI screens work faster.

---

## Suggested dashboard summary numbers

These can be hardcoded first, or derived from sample data later.

```js
export const dashboardSummary = {
  totalTasks: 6,
  agentRecommendations: 2,
  hybridRecommendations: 2,
  humanRecommendations: 2,
  approvalRequiredCount: 3,
  blockedCount: 1,
  completedCount: 2
}
```

---

## Suggested dropdown option data

This helps the task form feel consistent.

```js
export const taskFormOptions = {
  audienceOptions: [
    { label: "Internal", value: "internal" },
    { label: "Internal leadership", value: "internal_leadership" },
    { label: "External", value: "external" }
  ],
  sensitivityOptions: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" }
  ],
  urgencyOptions: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" }
  ],
  budgetRangeOptions: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" }
  ]
}
```

---

## Suggested demo-only task template for the intake form

This is useful for a prefilled form state.

```js
export const defaultNewTaskFormData = {
  title: "Create internal market research brief about AI competitors",
  description: "Summarize the top 5 AI competitors, their positioning, strengths, weaknesses, and likely impact on our product strategy.",
  expectedOutput: "2-page internal research brief",
  deadline: "2026-07-10",
  audience: "internal",
  sensitivity: "low",
  urgency: "medium",
  budgetRange: "low"
}
```

---

## Final build reminder

The sample data should do one job well:

help the frontend prove the full product story before any backend work starts.

If a sample object does not support this flow, it probably does not need to exist yet:

`submit task -> analyze task -> recommend -> explain why -> apply governance -> select execution option -> launch -> track outcome`

---

## Phase 4 Decision Scenario Coverage

### Why this section exists

The earlier sections preserve the original detailed demo-data source of truth.
That older context is still useful because it explains the intended static data
shape, the original happy-path demo, and the broader sample records a future
agent may need to understand.

Phase 4 added live decision scenario coverage in the React frontend. The New
Task screen now includes a small demo scenario picker that loads task examples
into the same intake form. The app still runs those tasks through the normal
frontend logic:

`analyzeTask -> buildRecommendation -> buildRecommendationExplanation -> evaluateGovernance -> getExecutionOptions -> createExecutionRecord -> createDemoOutcomeReview`

The Phase 4 implementation is documented in:

- `app/src/data/demoScenarios.js`
- `app/src/data/tasks.js`
- `app/src/logic/validateDemoScenarios.js`

### Relationship to the original happy path

The original happy-path demo remains `task_001`.

That task should continue to prove:

- an `agent` recommendation
- `85` confidence
- governance status `approved_for_launch`
- selected option `Research Analyst Agent`
- completed/reviewed lifecycle behavior

Phase 4 does not replace that happy path. It adds four additional scenario
paths so the frontend demonstrates more than one recommendation and governance
outcome.

### Scenario summary

| Task ID | Scenario | Expected `recommendedPath` | Expected governance status | Expected selected option behavior | Expected lifecycle behavior |
|---|---|---|---|---|---|
| `task_001` | Agent path | `agent` | `approved_for_launch` | Selects `Research Analyst Agent` | Launches and reaches `reviewed` |
| `task_002` | Hybrid path | `hybrid` | `needs_human_review` | Selects a hybrid human-agent option | Waits at `selected` / pending approval |
| `task_003` | Blocked path | `human` | `blocked` | No launched execution option | Stops at `blocked` |
| `task_004` | Human path | `human` | `needs_human_review` | Selects a human owner / human role | Waits at `selected` / pending approval |
| `task_005` | Needs human review path | `hybrid` | `needs_human_review` | Selects a hybrid review option | Waits at `selected` / pending approval |

### `task_001`: Agent path

Purpose:

This is the original happy-path demo. It proves that clear, low-sensitivity,
repeatable internal knowledge work can be routed to a trusted agent.

Expected behavior:

- `recommendedPath`: `agent`
- confidence: `85`
- governance status: `approved_for_launch`
- selected option: `Research Analyst Agent`
- selected option path type: `agent`
- execution launch status: `launched`
- lifecycle final stage: `reviewed`
- outcome: completed demo review with minor edits

### `task_002`: Hybrid path

Purpose:

This scenario proves that an agent can help with leadership-facing drafting,
but human review should stay in the loop.

Expected behavior:

- `recommendedPath`: `hybrid`
- governance status: `needs_human_review`
- selected option behavior: choose a human-agent team or hybrid execution option
- current implementation selected option: `Executive Memo Agent + Human Reviewer`
- selected option path type: `hybrid`
- execution launch status: `pending_approval`
- lifecycle final stage: `selected`

### `task_003`: Blocked path

Purpose:

This scenario proves that the product can stop work that is too sensitive and
too high-risk for the demo workflow.

Expected behavior:

- `recommendedPath`: `human`
- governance status: `blocked`
- allowed paths: none in the current Phase 4 demo behavior
- blocked paths: `human`, `agent`, and `hybrid`
- selected option behavior: no eligible execution option should be selected
- execution launch status: `not_launched`
- lifecycle final stage: `blocked`

Important rule:

The blocked scenario must not show a launched execution option. It should make
the policy stop visible instead of pretending the work launched.

### `task_004`: Human path

Purpose:

This scenario proves that high-ambiguity, high-judgment, high-accountability
strategy work routes to a human owner instead of auto-launching an agent.

Expected behavior:

- `recommendedPath`: `human`
- governance status: `needs_human_review`
- selected option behavior: choose a human owner or human-led option
- current implementation selected option: `Strategy Lead`
- selected option path type: `human`
- selected option source type: `human_role`
- execution launch status: `pending_approval`
- lifecycle final stage: `selected`

### `task_005`: Needs human review path

Purpose:

This scenario proves that automation may assist policy or review work, but the
workflow still requires human validation before launch or final use.

Expected behavior:

- `recommendedPath`: `hybrid`
- governance status: `needs_human_review`
- selected option behavior: choose a hybrid review option
- current implementation selected option: `Policy Review Agent + Human Reviewer`
- selected option path type: `hybrid`
- execution launch status: `pending_approval`
- lifecycle final stage: `selected`

### Validation helper

`app/src/logic/validateDemoScenarios.js` exports a lightweight internal helper
for checking the Phase 4 scenario expectations without adding a test framework.

Use it when changing scenario data or decision logic so the demo keeps covering:

- agent path
- human path
- hybrid path
- needs human review path
- blocked path
