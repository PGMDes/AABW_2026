# 05_GOVERNANCE_RULES.md

## Purpose of this file

This file defines the MVP governance logic for `SymbiontOS`.

It explains how the app decides:
- what is allowed
- what requires approval
- what is blocked

This document is intentionally simple so a beginner can implement it with frontend-only JavaScript and fake/sample data.

The important product distinction is:

- the `recommendation engine` decides what path fits best
- the `governance engine` decides what path is allowed

That means the system can recommend one thing and governance can still limit or block it.

---

## What governance does in simple words

Governance is the safety and control layer.

After the recommendation engine says:
- `human`
- `agent`
- or `hybrid`

Governance checks whether that recommendation is safe enough to use.

It answers questions like:
- Is approval required before launch?
- Is agent-only allowed for this task?
- Should the task be limited to hybrid or human-only?
- Is the selected agent trusted enough?
- Is this task too sensitive for direct agent use?

In simple words:

`Recommendation says what fits.`  
`Governance says what is allowed.`

---

## What governance does NOT do in V1

Governance in V1 should **not** do these things:

- no machine learning
- no real LLM calls
- no dynamic policy generation
- no policy editor UI
- no complex enterprise permission system
- no department-by-department exceptions
- no audit log platform
- no backend service
- no database integration
- no identity system
- no advanced legal or compliance engine

V1 governance should just be a small set of hardcoded, explainable rules.

---

## Input objects it uses

The governance engine uses these input objects.

## 1. `Task`

This gives the original task details.

Important fields:
- `title`
- `description`
- `audience`
- `sensitivity`
- `expectedOutput`

Why governance needs it:
- audience and sensitivity often directly affect approval and blocking

---

## 2. `TaskAnalysis`

This gives the structured task factors created earlier.

Important fields:
- `taskClarity`
- `requiredJudgment`
- `dataSensitivity`
- `businessRisk`
- `taskType`

Why governance needs it:
- governance rules are easier to apply against structured values like `high` or `low`

---

## 3. `RecommendationRecord`

This gives the recommendation engineâ€™s result.

Important fields:
- `recommendedPath`
- `humanFitScore`
- `agentFitScore`
- `hybridFitScore`
- `confidence`

Why governance needs it:
- governance should know what the system wanted to recommend before applying restrictions

---

## 4. `AgentProfile` or `MarketplaceOption`

This gives the selected or candidate execution option.

Important fields from `AgentProfile`:
- `id`
- `name`
- `trustTier`
- `sensitiveDataSuitability`
- `supportedTaskTypes`

Important fields from `MarketplaceOption`:
- `id`
- `sourceType`
- `pathType`
- `sourceId`

Why governance needs it:
- some rules depend on the trust level of the selected agent
- some options may be disallowed even if the general path is allowed

## Important implementation note about selected options

For the first frontend-only build, it is okay for `MarketplaceOption` to include copied fields from `AgentProfile`, such as:

- `trustTier`
- `sensitiveDataSuitability`
- `supportedTaskTypes`

This makes governance easier to implement because the governance function can check the selected option directly.

Later, if the app uses a real database, the app can look up the full `AgentProfile` by `sourceId` instead.

Example frontend-friendly `MarketplaceOption`:

```json
{
  "id": "option_001",
  "sourceType": "agent",
  "sourceId": "agent_001",
  "displayName": "Research Analyst Agent",
  "pathType": "agent",
  "trustTier": "trusted",
  "sensitiveDataSuitability": "low_medium",
  "supportedTaskTypes": ["research_brief", "competitive_summary"],
  "eligible": true
}
```

---

## Output object it creates

The governance engine creates one main output object:

## `GovernanceResult`

This object tells the app:
- whether approval is required
- which paths are allowed
- which paths are blocked
- why that happened
- whether the current state is ready to launch

### Important fields

- `taskId`
- `recommendedPath`
- `approvalRequired`
- `approvalReason`
- `allowedPaths`
- `blockedPaths`
- `policyFlags`
- `selectedOptionAllowed`
- `selectedOptionBlockReason`
- `status`
- `policyReason`

### Example JSON

```json
{
  "taskId": "task_001",
  "recommendedPath": "agent",
  "approvalRequired": false,
  "approvalReason": null,
  "allowedPaths": ["agent", "hybrid", "human"],
  "blockedPaths": [],
  "policyFlags": ["internal_use", "low_sensitivity"],
  "selectedOptionAllowed": true,
  "selectedOptionBlockReason": null,
  "status": "approved_for_launch",
  "policyReason": "Low-sensitivity internal research is approved for trusted agents"
}
```

---

## Simple approval rules

Approval rules decide whether a task can launch immediately or must be reviewed first.

For V1, keep these rules explicit and easy to read.

## Approval Rule 1: Medium or high sensitivity
If:
- `dataSensitivity = medium` or `high`

Then:
- approval is required

Reason:
- more sensitive work should not launch freely

---

## Approval Rule 2: Executive audience
If task audience is:
- `executive`
- `internal_leadership`
- `board`

Then:
- approval is required

Reason:
- leadership-facing material carries higher judgment and reputational risk

---

## Approval Rule 3: High business risk
If:
- `businessRisk = high`

Then:
- approval is required

Reason:
- mistakes matter more

---

## Approval Rule 4: Policy or review work
If task type is:
- `document_review`
- `policy_review`
- `compliance_review`

Then:
- approval is required

Reason:
- these tasks often need a human to validate the result

---

## Approval Rule 5: Untrusted or limited-trust agent
If the chosen agent has:
- `trustTier = untrusted`
- or `trustTier = review_required`

Then:
- approval is required

Reason:
- the system should be more cautious with lower-trust agents

---

## Simple blocking rules

Blocking rules decide whether a path is not allowed at all.

These rules are stronger than approval rules.

## Blocking Rule 1: High sensitivity + agent-only
If:
- `dataSensitivity = high`
- and path = `agent`

Then:
- block `agent`

Reason:
- high-sensitivity work should not be agent-only in V1

---

## Blocking Rule 2: External audience + agent-only
If task audience is:
- `external`
- `customer`
- `partner`
- `public`

Then:
- block `agent`

Reason:
- external-facing outputs need human involvement in V1

---

## Blocking Rule 3: High business risk + agent-only
If:
- `businessRisk = high`

Then:
- block `agent`

Reason:
- risky outcomes should not be fully automated in V1

---

## Blocking Rule 4: Untrusted agent selected
If selected agent has:
- `trustTier = untrusted`

Then:
- block that selected option

Reason:
- untrusted agents should not be launchable in the first demo

---

## Blocking Rule 5: Agent cannot handle sensitive data
If selected agent has:
- `sensitiveDataSuitability = low`
- and task sensitivity is `medium` or `high`

Then:
- block that selected option

Reason:
- the option itself is not suitable for the task

---

## Allowed paths logic

Allowed paths are the paths the user is still permitted to choose after governance rules run.

Possible path values:
- `human`
- `agent`
- `hybrid`

Start with all three allowed:
```json
["human", "agent", "hybrid"]
```

Then remove blocked ones.

### General V1 logic

- `human` is almost always allowed
- `agent` is the first path to restrict
- `hybrid` is often the fallback when agent-only is too risky

### Example

If:
- high sensitivity
- external audience

Then:
- `agent` should be blocked
- `hybrid` and `human` remain allowed

Result:
```json
["human", "hybrid"]
```

### Important design rule

Governance should not create confusing dead ends.

If possible:
- block unsafe agent-only use
- but still allow a safer path like `hybrid` or `human`

---

## Agent trust tier rules

For V1, use simple trust tiers.

### Suggested trust tiers

- `trusted`
- `review_required`
- `untrusted`

### Rules

#### `trusted`
- can be used for low-risk internal tasks
- may still require approval depending on task sensitivity or audience

#### `review_required`
- can appear in the marketplace
- requires approval before launch
- should not be auto-launched

#### `untrusted`
- may exist in sample data
- should be blocked from launch in V1

### Example

```json
{
  "id": "agent_003",
  "name": "Executive Memo Agent",
  "trustTier": "review_required"
}
```

Governance result:
- path may still be allowed
- approval is required
- direct launch is not allowed without review

---

## Sensitive data rules

Sensitive data should affect governance strongly.

### If sensitivity is `low`
- agent can be allowed
- approval may not be required

### If sensitivity is `medium`
- approval is required
- agent-only may still be allowed if trust is high and audience is internal
- hybrid is often preferred as a safer allowed path

### If sensitivity is `high`
- approval is required
- agent-only should be blocked
- human or hybrid should remain allowed

### Example rule summary

| Sensitivity | Approval | Agent-only |
|---|---|---|
| `low` | usually no | usually allowed |
| `medium` | yes | sometimes allowed |
| `high` | yes | blocked |

---

## Audience rules

Audience is one of the simplest governance inputs.

### Internal working audience
Examples:
- `internal`
- `internal_team`

Effect:
- low-risk tasks may launch without approval

### Leadership audience
Examples:
- `internal_leadership`
- `executive`
- `board`

Effect:
- approval required
- hybrid or human often safer

### External audience
Examples:
- `external`
- `customer`
- `partner`
- `public`

Effect:
- approval required
- agent-only blocked in V1

### Example summary

| Audience | Approval | Agent-only |
|---|---|---|
| `internal` | maybe not | often allowed |
| `internal_leadership` | yes | often restricted |
| `external` | yes | blocked |

---

## Governance flow in simple steps

The governance engine should run in this order:

1. read task and analysis
2. start with all paths allowed
3. check approval rules
4. check blocking rules
5. remove blocked paths
6. if a selected option exists, validate it too
7. return a `GovernanceResult`

This order keeps the code easy to follow.

---

## Pseudocode

The pseudocode below is intentionally simple and JavaScript-friendly.

## `evaluateGovernanceRules(task, taskAnalysis, recommendation, selectedOption = null)`

```text
function evaluateGovernanceRules(task, taskAnalysis, recommendation, selectedOption = null):
  approvalInfo = checkApprovalRequired(task, taskAnalysis, recommendation, selectedOption)
  blockedInfo = checkBlockedPaths(task, taskAnalysis, recommendation, selectedOption)
  allowedPaths = getAllowedPaths(blockedInfo.blockedPaths)

  selectedOptionAllowed = true
  selectedOptionBlockReason = null

  if selectedOption is not null:
    if blockedInfo.blockedOptionIds includes selectedOption.id:
      selectedOptionAllowed = false
      selectedOptionBlockReason = blockedInfo.blockedOptionReasonMap[selectedOption.id]

  return buildGovernanceResult(
    task,
    recommendation,
    approvalInfo,
    blockedInfo,
    allowedPaths,
    selectedOptionAllowed,
    selectedOptionBlockReason
  )
```

---

## `checkApprovalRequired(task, taskAnalysis, recommendation, selectedOption = null)`

```text
function checkApprovalRequired(task, taskAnalysis, recommendation, selectedOption = null):
  reasons = []

  if taskAnalysis.dataSensitivity == "medium" or taskAnalysis.dataSensitivity == "high":
    reasons.push("Task contains medium or high sensitivity content")

  if task.audience == "internal_leadership" or task.audience == "executive" or task.audience == "board":
    reasons.push("Audience is leadership or executive")

  if task.audience == "external" or task.audience == "customer" or task.audience == "partner" or task.audience == "public":
    reasons.push("Output is for an external audience")

  if taskAnalysis.businessRisk == "high":
    reasons.push("Task has high business risk")

  if taskAnalysis.taskType == "document_review" or taskAnalysis.taskType == "policy_review" or taskAnalysis.taskType == "compliance_review":
    reasons.push("Policy or review work needs human validation")

  if selectedOption is not null:
    if selectedOption.trustTier == "review_required":
      reasons.push("Selected agent requires human review before launch")

    if selectedOption.trustTier == "untrusted":
      reasons.push("Selected agent is not trusted")

  return {
    approvalRequired: reasons.length > 0,
    approvalReasons: reasons
  }
```

---

## `checkBlockedPaths(task, taskAnalysis, recommendation, selectedOption = null)`

```text
function checkBlockedPaths(task, taskAnalysis, recommendation, selectedOption = null):
  blockedPaths = []
  blockedOptionIds = []
  blockedOptionReasonMap = {}

  if taskAnalysis.dataSensitivity == "high":
    blockedPaths.push("agent")

  if task.audience == "external" or task.audience == "customer" or task.audience == "partner" or task.audience == "public":
    if blockedPaths does not include "agent":
      blockedPaths.push("agent")

  if taskAnalysis.businessRisk == "high":
    if blockedPaths does not include "agent":
      blockedPaths.push("agent")

  if selectedOption is not null:
    if selectedOption.trustTier == "untrusted":
      blockedOptionIds.push(selectedOption.id)
      blockedOptionReasonMap[selectedOption.id] = "Selected agent is untrusted"

    if selectedOption.sensitiveDataSuitability == "low":
      if taskAnalysis.dataSensitivity == "medium" or taskAnalysis.dataSensitivity == "high":
        blockedOptionIds.push(selectedOption.id)
        blockedOptionReasonMap[selectedOption.id] = "Selected agent cannot handle this sensitivity level"

  return {
    blockedPaths: unique(blockedPaths),
    blockedOptionIds: unique(blockedOptionIds),
    blockedOptionReasonMap
  }
```

---

## `getAllowedPaths(blockedInfoOrBlockedPaths)`

```text
function getAllowedPaths(blockedInfoOrBlockedPaths):
  allPaths = ["human", "agent", "hybrid"]

  blockedPaths = blockedInfoOrBlockedPaths.blockedPaths ? blockedInfoOrBlockedPaths.blockedPaths : blockedInfoOrBlockedPaths

  return allPaths.filter(path => blockedPaths does not include path)
```

---

## `buildGovernanceResult(task, recommendation, approvalInfo, blockedInfo, allowedPaths, selectedOptionAllowed, selectedOptionBlockReason)`

```text
function buildGovernanceResult(
  task,
  recommendation,
  approvalInfo,
  blockedInfo,
  allowedPaths,
  selectedOptionAllowed,
  selectedOptionBlockReason
):
  status = "approved_for_launch"
  policyReason = "Launch allowed"

  if allowedPaths is empty:
    status = "blocked"
    policyReason = "This task is too sensitive and high-risk to launch through the demo workflow"
  else if blockedInfo.blockedPaths includes recommendation.recommendedPath:
    status = "blocked"
    policyReason = "The recommended path is not allowed by policy"
  else if approvalInfo.approvalRequired:
    status = "needs_human_review"
    policyReason = approvalInfo.approvalReasons[0]

  if selectedOptionAllowed == false:
    status = "blocked"
    policyReason = selectedOptionBlockReason

  return {
    taskId: task.id,
    recommendedPath: recommendation.recommendedPath,
    approvalRequired: approvalInfo.approvalRequired,
    approvalReason: approvalInfo.approvalReasons[0] or null,
    approvalReasons: approvalInfo.approvalReasons,
    allowedPaths: allowedPaths,
    blockedPaths: blockedInfo.blockedPaths,
    policyFlags: buildPolicyFlags(task),
    selectedOptionAllowed: selectedOptionAllowed,
    selectedOptionBlockReason: selectedOptionBlockReason,
    status: status,
    policyReason: policyReason
  }
```

---

## Governance status priority

Some tasks may trigger more than one governance result at the same time.

Example:
- approval is required
- agent-only is blocked

When multiple statuses apply, use this priority order:

1. `blocked`
2. `needs_human_review`
3. `approved_for_launch`

Reason:

Blocked states are more serious than review states. If something is blocked,
the UI should show the block first, then explain any approval requirement after
that.

This means the final status should be chosen in this order:
- if all paths are blocked or the recommended path is blocked, use `blocked`
- else if approval is required, use `needs_human_review`
- else use `approved_for_launch`

---

## Optional helper for `policyFlags`

This is not required, but it makes debugging easier.

```text
function buildPolicyFlags(task):
  flags = []

  if task.sensitivity == "low":
    flags.push("low_sensitivity")
  if task.sensitivity == "medium":
    flags.push("medium_sensitivity")
  if task.sensitivity == "high":
    flags.push("high_sensitivity")

  if task.audience == "internal":
    flags.push("internal_use")
  if task.audience == "internal_leadership":
    flags.push("leadership_audience")
  if task.audience == "external":
    flags.push("external_audience")

  return flags
```

---

## Example governance results

These examples use the same product logic as the rest of the MVP docs.

## 1. Low-risk internal research brief

### Example task
`Create internal market research brief about AI competitors`

### Example input summary
- audience: `internal`
- sensitivity: `low`
- taskType: `research_brief`
- businessRisk: `low`
- recommendation: `agent`

### Expected governance result
```json
{
  "taskId": "task_001",
  "recommendedPath": "agent",
  "approvalRequired": false,
  "approvalReason": null,
  "allowedPaths": ["human", "agent", "hybrid"],
  "blockedPaths": [],
  "policyFlags": ["low_sensitivity", "internal_use"],
  "selectedOptionAllowed": true,
  "selectedOptionBlockReason": null,
  "status": "approved_for_launch",
  "policyReason": "Low-sensitivity internal research is allowed for trusted agents"
}
```

### Meaning
This is the clean happy path.

---

## 2. Executive memo draft

### Example task
`Draft executive memo about AI adoption strategy`

### Example input summary
- audience: `internal_leadership`
- sensitivity: `medium`
- taskType: `memo_or_strategy`
- businessRisk: `medium`
- recommendation: `hybrid`

### Expected governance result
```json
{
  "taskId": "task_002",
  "recommendedPath": "hybrid",
  "approvalRequired": true,
  "approvalReason": "Audience is leadership or executive",
  "allowedPaths": ["human", "agent", "hybrid"],
  "blockedPaths": [],
  "policyFlags": ["medium_sensitivity", "leadership_audience"],
  "selectedOptionAllowed": true,
  "selectedOptionBlockReason": null,
  "status": "needs_human_review",
  "policyReason": "Audience is leadership or executive"
}
```

### Meaning
The route is allowed, but it cannot launch freely.

---

## 3. Sensitive external strategy memo

### Example task
`Prepare a sensitive external strategy memo`

### Example input summary
- audience: `external`
- sensitivity: `high`
- taskType: `memo_or_strategy`
- businessRisk: `high`
- recommendation: `human` or `hybrid`

### Expected governance result
```json
{
  "taskId": "task_003",
  "recommendedPath": "hybrid",
  "approvalRequired": true,
  "approvalReason": "Task contains medium or high sensitivity content",
  "allowedPaths": ["human", "hybrid"],
  "blockedPaths": ["agent"],
  "policyFlags": ["high_sensitivity", "external_audience"],
  "selectedOptionAllowed": true,
  "selectedOptionBlockReason": null,
  "status": "needs_human_review",
  "policyReason": "Task contains medium or high sensitivity content"
}
```

### Meaning
Agent-only is blocked. Safer paths remain available.

---

## 4. Untrusted agent selected

### Example task
`Create internal research summary using an untrusted agent`

### Example selected agent
```json
{
  "id": "agent_099",
  "name": "Experimental Research Bot",
  "trustTier": "untrusted",
  "sensitiveDataSuitability": "low"
}
```

### Expected governance result
```json
{
  "taskId": "task_004",
  "recommendedPath": "agent",
  "approvalRequired": true,
  "approvalReason": "Selected agent is not trusted",
  "allowedPaths": ["human", "agent", "hybrid"],
  "blockedPaths": [],
  "policyFlags": ["low_sensitivity", "internal_use"],
  "selectedOptionAllowed": false,
  "selectedOptionBlockReason": "Selected agent is untrusted",
  "status": "blocked",
  "policyReason": "Selected agent is untrusted"
}
```

### Meaning
The general path may be okay, but this specific option is not allowed.

---

## 5. Policy review task

### Example task
`Review internal policy document for gaps`

### Example input summary
- audience: `internal_leadership`
- sensitivity: `medium`
- taskType: `document_review`
- businessRisk: `medium`
- recommendation: `hybrid`

### Expected governance result
```json
{
  "taskId": "task_005",
  "recommendedPath": "hybrid",
  "approvalRequired": true,
  "approvalReason": "Policy or review work needs human validation",
  "allowedPaths": ["human", "agent", "hybrid"],
  "blockedPaths": [],
  "policyFlags": ["medium_sensitivity", "leadership_audience"],
  "selectedOptionAllowed": true,
  "selectedOptionBlockReason": null,
  "status": "needs_human_review",
  "policyReason": "Policy or review work needs human validation"
}
```

### Meaning
The task can still use hybrid help, but human validation is required.

---

## Suggested simple rule summary

This is a good quick-reference version for implementation.

| Condition | Result |
|---|---|
| `dataSensitivity = medium` | approval required |
| `dataSensitivity = high` | approval required, block `agent` |
| `audience = internal_leadership` | approval required |
| `audience = external` | approval required, block `agent` |
| `businessRisk = high` | approval required, block `agent` |
| `taskType = document_review` | approval required |
| `selectedAgent.trustTier = review_required` | approval required |
| `selectedAgent.trustTier = untrusted` | block selected option |
| `selectedAgent.sensitiveDataSuitability = low` and task sensitivity is `medium/high` | block selected option |

---

## Common mistakes to avoid

## 1. Mixing governance into recommendation
Do not put policy rules inside the recommendation engine.

Bad:
- recommendation returns `human` only because external audience is blocked

Good:
- recommendation returns best-fit path
- governance then restricts unsafe paths

---

## 2. Making governance too complicated
Do not create 50 rules for V1.

Use a small set of rules based on:
- sensitivity
- audience
- business risk
- task type
- agent trust tier

That is enough for the MVP.

---

## 3. Blocking too many paths
If governance blocks everything too often, the demo becomes frustrating.

Prefer this pattern:
- block `agent`
- still allow `hybrid` or `human`

This keeps the product usable.

---

## 4. Forgetting option-level governance
A path may be allowed, but a specific agent may still be unsafe.

Example:
- `agent` path allowed
- chosen agent is `untrusted`
- selected option must still be blocked

Make sure the code handles both:
- path-level rules
- option-level rules

---

## 5. Making approval and blocking the same thing
These are different.

### Approval required
Means:
- path can still be used
- but someone must review first

### Blocked
Means:
- this path or option cannot be used in the current state

Do not mix these into one boolean.

---

## 6. Hiding the reason from the UI
Governance must return plain-language reasons.

The user should be able to see:
- why approval is needed
- why a path is blocked
- what safer paths remain

Do not return only:
- `true`
- `false`

Always return reasons.

---

## 7. Treating all agents the same
Even in a simple MVP, trust tier matters.

A trusted research agent and an untrusted experimental agent should not behave the same way.

---

## 8. Forgetting that governance happens after recommendation
The system flow must stay:

`submit task -> analyze task -> recommend -> explain -> apply governance -> select execution option -> launch`

Do not reorder this in the implementation.

---

## 9. Creating dead-end blocked states
If possible, the blocked state should still help the user.

Good:
- `Agent-only is blocked. Try hybrid or human review.`

Bad:
- `Blocked.`

Always guide the user to the next allowed path.

---

## 10. Over-engineering sample data
For V1, sample data can be small.

You only need enough fake data to prove:
- happy path
- approval-required path
- blocked-by-policy path
- untrusted agent blocked

Do not model a full corporate policy system yet.

---

## Suggested helper functions

For a beginner-friendly JavaScript implementation, these helpers are enough:

- `evaluateGovernanceRules(task, taskAnalysis, recommendation, selectedOption)`
- `checkApprovalRequired(task, taskAnalysis, recommendation, selectedOption)`
- `checkBlockedPaths(task, taskAnalysis, recommendation, selectedOption)`
- `getAllowedPaths(blockedPaths)`
- `buildGovernanceResult(task, recommendation, approvalInfo, blockedInfo, allowedPaths, selectedOptionAllowed, selectedOptionBlockReason)`

Optional helper:
- `buildPolicyFlags(task)`

---

## Final rule for the MVP

If a governance rule cannot be explained in one or two simple sentences, it is probably too complicated for V1.

The MVP governance engine should be:
- deterministic
- readable
- easy to test
- separate from recommendation logic
- strict enough to feel credible
- simple enough for a beginner to implement in JavaScript
