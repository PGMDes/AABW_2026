# 03_DATA_MODEL.md

## Purpose of this file

This file defines the minimum data objects for the first `Human-AgentOS` MVP.

It is written for a beginner-friendly build process:
- use fake/sample data first
- keep objects simple
- do not design a big backend yet
- do not expand beyond the locked MVP

The goal is to make it easy for a coding agent to build screens and move data from one step to the next in the demo flow.

Main demo example used in this file:

`Create internal market research brief about AI competitors`

---

## Main idea

The app needs a small set of data objects because each step of the user flow creates new information.

Example:

1. the user types a task
2. the system analyzes it
3. the system recommends a path
4. the system explains the recommendation
5. the system applies governance
6. the system finds matching execution options
7. the user launches one option
8. the system records the outcome
9. the system shows lifecycle and audit history

Each of those steps should produce a clear object.

---

## Object list

The MVP uses these 12 objects:

1. `Task`
2. `TaskAnalysis`
3. `RecommendationRecord`
4. `RecommendationExplanation`
5. `GovernanceResult`
6. `AgentProfile`
7. `HumanRoleProfile`
8. `MarketplaceOption`
9. `ExecutionRecord`
10. `OutcomeReview`
11. `LifecycleState`
12. `AuditEvent`

---

## 1. Task

### What it means in simple words

`Task` is the original work request created by the user.

It is the starting point of the whole flow.

### Why the app needs it

The app cannot analyze or recommend anything until it knows what the user wants done.

### Important fields

- `id`
- `title`
- `description`
- `expectedOutput`
- `deadline`
- `audience`
- `sensitivity`
- `urgency`
- `budgetRange`
- `status`

### Example JSON

```json
{
  "id": "task_001",
  "title": "Create internal market research brief about AI competitors",
  "description": "Summarize the top 5 AI competitors, their positioning, strengths, weaknesses, and likely impact on our product strategy.",
  "expectedOutput": "2-page internal research brief",
  "deadline": "2026-07-10",
  "audience": "internal_leadership",
  "sensitivity": "low",
  "urgency": "medium",
  "budgetRange": "low",
  "status": "submitted"
}
```

### Which step creates or uses it

- created in `Task Intake`
- used in every later step

---

## 2. TaskAnalysis

### What it means in simple words

`TaskAnalysis` is the system’s structured reading of the task.

The user gives raw text. The system converts it into simple attributes that can be scored.

### Why the app needs it

The app needs a consistent way to compare tasks. It is easier to score `taskClarity = high` than to score a whole paragraph directly.

### Important fields

- `taskId`
- `taskType`
- `taskClarity`
- `requiredJudgment`
- `dataSensitivity`
- `businessRisk`
- `speedPressure`
- `costPressure`

### Example JSON

```json
{
  "taskId": "task_001",
  "taskType": "research_brief",
  "taskClarity": "high",
  "requiredJudgment": "medium",
  "dataSensitivity": "low",
  "businessRisk": "low",
  "speedPressure": "medium",
  "costPressure": "medium"
}
```

### Which step creates or uses it

- created in `Analyze Task`
- used by recommendation and governance

---

## 3. RecommendationRecord

### What it means in simple words

`RecommendationRecord` stores the system’s actual recommendation result.

This is the object that answers:
- should a human do it?
- should an agent do it?
- should they work together?

### Why the app needs it

The app needs a saved recommendation result so the UI can show the chosen path and the scores behind it.

### Important fields

- `taskId`
- `humanFitScore`
- `agentFitScore`
- `hybridFitScore`
- `recommendedPath`
- `confidence`
- `createdAt`

### Example JSON

```json
{
  "taskId": "task_001",
  "humanFitScore": 45,
  "agentFitScore": 82,
  "hybridFitScore": 67,
  "recommendedPath": "agent",
  "confidence": 82,
  "createdAt": "2026-07-03T10:30:00Z"
}
```

### Which step creates or uses it

- created in `Recommend Human / Agent / Hybrid`
- used in recommendation screen, governance step, marketplace step, and task detail screen

---

## 4. RecommendationExplanation

### What it means in simple words

`RecommendationExplanation` stores the plain-language reasons behind the recommendation.

It explains the recommendation in a way the user can understand.

### Why the app needs it

The product promise is not just to recommend a path. It must also explain why that path was chosen.

### Important fields

- `taskId`
- `topReasons`
- `keyFactors`
- `alternatives`
- `conditions`

### Example JSON

```json
{
  "taskId": "task_001",
  "topReasons": [
    "Task is clearly defined",
    "Output is repeatable",
    "Sensitivity is low",
    "This is internal research work"
  ],
  "keyFactors": {
    "taskClarity": "high",
    "requiredJudgment": "medium",
    "dataSensitivity": "low"
  },
  "alternatives": [
    {
      "path": "hybrid",
      "reason": "Useful if human review is preferred before internal sharing"
    },
    {
      "path": "human",
      "reason": "Less efficient for a structured low-risk research brief"
    }
  ],
  "conditions": [
    "Use only trusted research agents",
    "Human review is recommended if the brief is later shared externally"
  ]
}
```

### Which step creates or uses it

- created in `Explain Why`
- used in the recommendation screen and task detail screen

---

## 5. GovernanceResult

### What it means in simple words

`GovernanceResult` stores the policy decision after the recommendation is made.

It answers:
- is approval required?
- is the recommended path allowed?
- is anything blocked?

### Why the app needs it

The app must show that some tasks are safe to move quickly, while others need more control.

### Important fields

- `taskId`
- `approvalRequired`
- `allowedPaths`
- `blockedPaths`
- `policyReason`
- `reviewerRole`
- `status`

### Example JSON

```json
{
  "taskId": "task_001",
  "approvalRequired": false,
  "allowedPaths": ["agent", "hybrid", "human"],
  "blockedPaths": [],
  "policyReason": "Low-sensitivity internal research is approved for trusted agents",
  "reviewerRole": null,
  "status": "approved_for_launch"
}
```

### Which step creates or uses it

- created in `Apply Governance`
- used in recommendation screen, marketplace filtering, launch confirmation, and task detail screen

---

## 6. AgentProfile

### What it means in simple words

`AgentProfile` describes one AI agent available in the curated marketplace.

It tells the app what the agent is good at and when it should or should not be used.

### Why the app needs it

The app cannot show a marketplace without profiles for candidate agents.

### Important fields

- `id`
- `name`
- `capabilities`
- `supportedTaskTypes`
- `trustTier`
- `sensitiveDataSuitability`
- `costLevel`
- `limitations`
- `status`

### Example JSON

```json
{
  "id": "agent_001",
  "name": "Research Analyst Agent",
  "capabilities": ["research", "summarization", "brief_drafting"],
  "supportedTaskTypes": ["research_brief", "competitive_summary"],
  "trustTier": "trusted",
  "sensitiveDataSuitability": "low_medium",
  "costLevel": "low",
  "limitations": [
    "Needs human review for external-facing documents"
  ],
  "status": "active"
}
```

### Which step creates or uses it

- hardcoded before the marketplace screen exists
- used in `Select Execution Option`

---

## 7. HumanRoleProfile

### What it means in simple words

`HumanRoleProfile` describes a simple human role that can participate in the workflow.

In V1, this is not a full employee system. It is a lightweight role card.

### Why the app needs it

The product recommends `human` and `hybrid` too, so the app needs a simple way to represent the human side.

### Important fields

- `id`
- `name`
- `roleType`
- `skills`
- `reviewAuthority`
- `costLevel`
- `availabilityNote`

### Example JSON

```json
{
  "id": "human_role_001",
  "name": "Human Reviewer",
  "roleType": "reviewer",
  "skills": ["document_review", "business_judgment", "approval"],
  "reviewAuthority": "can_approve_internal_knowledge_work",
  "costLevel": "medium",
  "availabilityNote": "Available for same-day review"
}
```

### Which step creates or uses it

- hardcoded before the marketplace screen exists
- used in `Select Execution Option`
- often shown in `hybrid` and `approval-required` flows

---

## 8. MarketplaceOption

### What it means in simple words

`MarketplaceOption` is a screen-ready option the user can choose from.

It is not the same thing as an `AgentProfile` or `HumanRoleProfile`. It is the actual selectable item after recommendation and governance are applied.

### Why the app needs it

The app needs a single shape for marketplace cards, even if some cards come from agents and others come from human roles.

### Important fields

- `id`
- `sourceType`
- `sourceId`
- `displayName`
- `pathType`
- `fitScore`
- `eligible`
- `whyShown`
- `whyLimited`

### Example JSON

```json
{
  "id": "option_001",
  "sourceType": "agent",
  "sourceId": "agent_001",
  "displayName": "Research Analyst Agent",
  "pathType": "agent",
  "fitScore": 90,
  "eligible": true,
  "whyShown": [
    "Matches research brief tasks",
    "Trusted for low-sensitivity internal work",
    "Low cost for repeatable knowledge work"
  ],
  "whyLimited": [
    "Not suitable for external-facing sensitive outputs without review"
  ]
}
```

### Which step creates or uses it

- created in `Select Execution Option`
- used in marketplace screen and launch confirmation

---

## 9. ExecutionRecord

### What it means in simple words

`ExecutionRecord` stores what the user actually chose and launched.

This is about action, not recommendation.

### Why the app needs it

A recommendation is only advice. The app still needs to record what was actually selected and launched.

### Important fields

- `id`
- `taskId`
- `selectedPath`
- `selectedOptionId`
- `selectedOptionType`
- `approvalStatus`
- `launchStatus`
- `launchedAt`

### Example JSON

```json
{
  "id": "execution_001",
  "taskId": "task_001",
  "selectedPath": "agent",
  "selectedOptionId": "option_001",
  "selectedOptionType": "agent",
  "approvalStatus": "not_required",
  "launchStatus": "launched",
  "launchedAt": "2026-07-03T10:40:00Z"
}
```

### Which step creates or uses it

- created in `Launch`
- used in task detail, tracker, and dashboard summaries

---

## 10. OutcomeReview

### What it means in simple words

`OutcomeReview` stores what happened after execution and whether the result was good.

This is the final feedback step.

### Why the app needs it

The MVP should show that the platform does not stop at launch. It also records whether the chosen route worked.

### Important fields

- `id`
- `executionId`
- `status`
- `outputSummary`
- `reviewOutcome`
- `editLevel`
- `reviewNotes`

### Example JSON

```json
{
  "id": "outcome_001",
  "executionId": "execution_001",
  "status": "completed",
  "outputSummary": "Draft market research brief created",
  "reviewOutcome": "accepted_with_minor_edits",
  "editLevel": "minor",
  "reviewNotes": "Good first pass. Reviewer adjusted competitor prioritization and final wording."
}
```

### Which step creates or uses it

- created in `Track Outcome`
- used in task detail, execution tracker, and later analytics

---

## 11. LifecycleState

### What it means in simple words

`LifecycleState` shows where the task is in the execution journey.

It is the simple tracker behind labels like `recommended`, `selected`, `launched`, `completed`, and `reviewed`.

### Why the app needs it

The task detail page should feel like a control plane, not just a static result page. A lifecycle state helps the user see what already happened and what is still pending.

### Important fields

- `taskId`
- `currentStage`
- `governanceState`
- `steps`

### Required lifecycle concepts

- `recommended`
- `approved`
- `needs_human_review`
- `blocked`
- `selected`
- `launched`
- `in_progress`
- `completed`
- `reviewed`

### Example JSON

```json
{
  "taskId": "task_001",
  "currentStage": "reviewed",
  "governanceState": "approved",
  "steps": [
    {
      "id": "recommended",
      "label": "Recommended",
      "status": "completed"
    },
    {
      "id": "reviewed",
      "label": "Reviewed",
      "status": "reviewed"
    }
  ]
}
```

### Which step creates or uses it

- generated after execution and outcome data are available
- used on the task detail page

---

## 12. AuditEvent

### What it means in simple words

`AuditEvent` is one entry in the task activity log.

It records who or what performed each major step, such as task submission, recommendation, governance evaluation, launch, completion, and review.

### Why the app needs it

The user needs to trust the decision path. A readable audit trail makes the work route explainable after the fact.

### Important fields

- `id`
- `label`
- `description`
- `actorType`
- `relativeTimestamp`
- `status`

### Example JSON

```json
{
  "id": "task_001_audit_004_governance_evaluated",
  "label": "Governance evaluated",
  "description": "Low-sensitivity internal research is allowed for trusted agents",
  "actorType": "system",
  "relativeTimestamp": "T+03m",
  "status": "approved"
}
```

### Which step creates or uses it

- generated from the existing task flow objects
- used on the task detail page as an activity timeline

---

## How the objects connect together

This is the simplest way to understand the object relationships.

```text
Task
  -> TaskAnalysis
  -> RecommendationRecord
  -> RecommendationExplanation
  -> GovernanceResult
  -> MarketplaceOption(s)
  -> ExecutionRecord
  -> OutcomeReview
  -> LifecycleState
  -> AuditEvent(s)
```

Supporting objects used by marketplace:
- `AgentProfile`
- `HumanRoleProfile`

### Simple relationship map

- one `Task` has one `TaskAnalysis`
- one `Task` has one `RecommendationRecord`
- one `Task` has one `RecommendationExplanation`
- one `Task` has one `GovernanceResult`
- one `Task` can have many `MarketplaceOption` items
- one `Task` has zero or one `ExecutionRecord` in the first demo
- one `ExecutionRecord` has zero or one `OutcomeReview`
- one `Task` has one generated `LifecycleState`
- one `Task` has many generated `AuditEvent` items
- many `MarketplaceOption` items can be built from `AgentProfile` and `HumanRoleProfile`

---

## Example full flow with connected objects

For the AI competitors market research task:

### 1. User submits `Task`
```json
{
  "id": "task_001",
  "title": "Create internal market research brief about AI competitors"
}
```

### 2. System creates `TaskAnalysis`
```json
{
  "taskId": "task_001",
  "taskType": "research_brief",
  "taskClarity": "high"
}
```

### 3. System creates `RecommendationRecord`
```json
{
  "taskId": "task_001",
  "recommendedPath": "agent",
  "confidence": 82
}
```

### 4. System creates `RecommendationExplanation`
```json
{
  "taskId": "task_001",
  "topReasons": ["Task is clearly defined", "Sensitivity is low"]
}
```

### 5. System creates `GovernanceResult`
```json
{
  "taskId": "task_001",
  "approvalRequired": false,
  "status": "approved_for_launch"
}
```

### 6. System builds `MarketplaceOption`
```json
{
  "id": "option_001",
  "sourceType": "agent",
  "displayName": "Research Analyst Agent",
  "eligible": true
}
```

### 7. User launches and app creates `ExecutionRecord`
```json
{
  "id": "execution_001",
  "taskId": "task_001",
  "selectedPath": "agent",
  "launchStatus": "launched"
}
```

### 8. System later shows `OutcomeReview`
```json
{
  "id": "outcome_001",
  "executionId": "execution_001",
  "status": "completed"
}
```

### 9. System builds `LifecycleState`
```json
{
  "taskId": "task_001",
  "currentStage": "reviewed"
}
```

### 10. System builds `AuditEvent` items
```json
{
  "id": "task_001_audit_009_outcome_reviewed",
  "label": "Outcome reviewed",
  "actorType": "human",
  "relativeTimestamp": "T+50m",
  "status": "completed"
}
```

---

## Which objects should be hardcoded first

For the first build, these objects should be hardcoded in frontend files, sample data files, or generated from the frontend flow.

### Hardcode first
- `Task`
- `TaskAnalysis`
- `RecommendationRecord`
- `RecommendationExplanation`
- `GovernanceResult`
- `AgentProfile`
- `HumanRoleProfile`
- `MarketplaceOption`
- `ExecutionRecord`
- `OutcomeReview`
- `LifecycleState`
- `AuditEvent`

Note: `LifecycleState` and `AuditEvent` can be generated from the task flow instead of stored as separate sample data arrays.

### Best starting order for hardcoded data

1. `AgentProfile`
2. `HumanRoleProfile`
3. `Task`
4. `TaskAnalysis`
5. `RecommendationRecord`
6. `RecommendationExplanation`
7. `GovernanceResult`
8. `MarketplaceOption`
9. `ExecutionRecord`
10. `OutcomeReview`
11. `LifecycleState`
12. `AuditEvent`

### Why hardcode first

This lets the app:
- show all screens early
- prove the user flow before backend work
- make debugging easier
- let a beginner understand the flow faster

---

## Which objects might become database tables later

Do not build tables now, but these objects are likely candidates later.

### Likely future stored objects
- `Task`
- `TaskAnalysis`
- `RecommendationRecord`
- `RecommendationExplanation`
- `GovernanceResult`
- `AgentProfile`
- `HumanRoleProfile`
- `ExecutionRecord`
- `OutcomeReview`
- `AuditEvent`

### Maybe stored later, maybe generated on the fly
- `MarketplaceOption`
- `LifecycleState`

Why `MarketplaceOption` may not need its own table later:
- it is often a generated view
- it can be built from recommendation, governance, and profile data
- it is mainly a UI selection object

For the first demo, it is fine to hardcode it or build it in memory.

---

## Naming rules for fields

Keep field naming simple and consistent.

### Use `camelCase` for JSON fields
Good:
- `taskId`
- `recommendedPath`
- `approvalRequired`

Avoid mixing styles like:
- `task_id`
- `recommended-path`
- `RecommendedPath`

### Use simple enum-like string values
Good:
- `low`
- `medium`
- `high`
- `agent`
- `human`
- `hybrid`
- `launched`
- `completed`

Avoid long unclear values unless needed.

### Use IDs that are easy to read in sample data
Good:
- `task_001`
- `agent_001`
- `option_001`
- `execution_001`

### Keep field names literal
Prefer:
- `confidence`
- `policyReason`
- `selectedPath`

Avoid vague names like:
- `meta`
- `info`
- `details`
- `misc`

### Use arrays for repeatable things
Examples:
- `topReasons`
- `allowedPaths`
- `blockedPaths`
- `capabilities`
- `limitations`

### Keep dates as strings in the first demo
Example:
- `2026-07-10`
- `2026-07-03T10:40:00Z`

This is easier for sample data and easier to debug.

---

## Why `RecommendationRecord` and `ExecutionRecord` should be separate

This matters a lot, even in a simple MVP.

### Beginner-friendly explanation

`RecommendationRecord` is what the system thinks should happen.

`ExecutionRecord` is what the user actually does.

Those are not always the same.

### Example

The system may recommend:
- `agent`

But the user may actually choose:
- `hybrid`

Or governance may allow only:
- `human` or `hybrid`

If recommendation and execution are stored in the same object, the app loses an important truth:
- what was recommended
- what was actually chosen

That difference is valuable.

### Why keeping them separate helps

#### 1. Better UI clarity
The recommendation screen can show the system’s advice.
The launch screen can show the user’s actual choice.

#### 2. Better outcome review
Later, the app can ask:
- was the recommendation good?
- did the user follow it?
- did the chosen path work?

#### 3. Better future analytics
Even if analytics are simple later, the app may want to compare:
- recommended path
- selected path
- outcome quality

#### 4. Better debugging
If a demo looks wrong, it helps to know whether:
- the recommendation was wrong
- the user picked a different option
- governance changed the route

### Simple example

#### RecommendationRecord
```json
{
  "taskId": "task_002",
  "recommendedPath": "agent",
  "confidence": 78
}
```

#### ExecutionRecord
```json
{
  "id": "execution_002",
  "taskId": "task_002",
  "selectedPath": "hybrid",
  "selectedOptionId": "option_003",
  "launchStatus": "launched"
}
```

That tells a much clearer story than one merged object.

---

## Suggested sample data set for the first demo

To make the MVP feel real, use at least these sample tasks:

### Task 1
`Create internal market research brief about AI competitors`
- likely recommendation: `agent`

### Task 2
`Draft executive memo about AI adoption strategy`
- likely recommendation: `hybrid`
- likely governance: `approval required`

### Task 3
`Review sensitive external strategy memo with untrusted agent`
- likely recommendation before governance: `agent` or `hybrid`
- likely governance result: `blocked path`

This sample set helps the app demonstrate:
- happy path
- approval-required path
- blocked-by-policy path

---

## Minimum object set for the first clickable demo

If the builder wants the smallest possible first version, start with these objects first:

1. `Task`
2. `AgentProfile`
3. `HumanRoleProfile`
4. `TaskAnalysis`
5. `RecommendationRecord`
6. `RecommendationExplanation`
7. `GovernanceResult`
8. `MarketplaceOption`
9. `ExecutionRecord`
10. `OutcomeReview`
11. `LifecycleState`
12. `AuditEvent`

This order works because it lets the main screens appear early.

## Recommended frontend file structure for sample data

When coding starts, keep the fake data and logic separated.

Recommended structure:

```text
src/
  data/
    sampleTasks.js
    sampleAgents.js
    sampleHumanRoles.js
    sampleExecutions.js
    sampleOutcomes.js

  logic/
    analyzeTask.js
    recommendPath.js
    evaluateGovernance.js
    buildMarketplaceOptions.js
    lifecycleEngine.js
    auditTrailEngine.js

  types/
    dataShapes.js
```

---

## Final build reminder

If an object does not directly help the user move through this flow, do not add it yet:

`submit task -> analyze task -> recommend -> explain why -> apply governance -> select execution option -> launch -> track outcome`

For V1, small clear objects are better than a big flexible model.
