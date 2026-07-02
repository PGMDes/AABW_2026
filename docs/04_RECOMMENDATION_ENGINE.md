# 04_RECOMMENDATION_ENGINE.md

## Purpose of this file

This file defines the MVP recommendation logic for `Human-AgentOS`.

It explains, in beginner-friendly terms, how the app should decide whether a task should be handled by:
- a `human`
- an `agent`
- a `hybrid human-agent team`

This version is intentionally simple:
- frontend-only
- fake/sample data friendly
- deterministic
- explainable
- easy to implement in JavaScript

---

## What the recommendation engine does in simple words

The recommendation engine reads a task, turns it into a few simple factors, scores three possible execution paths, and picks the best one.

Those three paths are:

- `human`
- `agent`
- `hybrid`

The engine should answer:

- Is this task clear and repeatable enough for an agent?
- Does it need judgment or careful review from a human?
- Is the best answer a combination, where an agent helps but a human stays involved?

The recommendation engine is the part of the MVP that creates the first answer.

Governance comes after this. The engine recommends. Governance checks whether that recommendation is allowed.

---

## What it does NOT do in V1

The recommendation engine in V1 should **not** do these things:

- no machine learning
- no real LLM calls
- no fuzzy black-box ranking
- no learning from historical data
- no automatic policy editing
- no advanced optimization across speed, cost, and quality
- no deep org chart reasoning
- no real skill testing of agents
- no backend service
- no database queries

This is just simple, readable business logic that a beginner can inspect and change.

---

## Input objects it uses

The MVP recommendation engine uses these objects:

### `Task`
This is the raw user input.

Main fields it reads:
- `title`
- `description`
- `expectedOutput`
- `audience`
- `sensitivity`
- `urgency`
- `budgetRange`

### `TaskAnalysis`
This is the structured version of the task.

Main fields:
- `taskType`
- `taskClarity`
- `requiredJudgment`
- `dataSensitivity`
- `businessRisk`
- `speedPressure`
- `costPressure`

The engine should first create `TaskAnalysis`, then score the three paths.

---

## Output objects it creates

The recommendation engine creates these outputs:

### `RecommendationRecord`
This stores:
- `humanFitScore`
- `agentFitScore`
- `hybridFitScore`
- `recommendedPath`
- `confidence`

### `RecommendationExplanation`
This stores:
- `topReasons`
- `keyFactors`
- `alternatives`
- `conditions`

Important: governance is a separate later step. The engine does not decide approval rules. It only recommends the best path from a task-fit point of view.

---

## Task analysis factors

The engine should analyze each task into a small set of factors.

These factors should use simple values like `low`, `medium`, and `high`.

### 1. `taskType`
What kind of work this is.

Example values:
- `research_brief`
- `summary`
- `memo_draft`
- `document_review`
- `strategy_work`

### 2. `taskClarity`
How clearly the task is defined.

Meaning:
- `high`: the task is specific and easy to understand
- `medium`: the task is mostly clear but still open-ended
- `low`: the task is vague or underspecified

### 3. `requiredJudgment`
How much human thinking, business sense, or interpretation is needed.

Meaning:
- `high`: sensitive thinking, tradeoffs, or executive judgment needed
- `medium`: some interpretation needed
- `low`: mostly repeatable structured work

### 4. `dataSensitivity`
How sensitive the content is.

Meaning:
- `high`: sensitive internal or external material
- `medium`: some risk if mishandled
- `low`: low-risk internal work

### 5. `businessRisk`
How bad the outcome would be if the result is wrong.

Meaning:
- `high`: mistakes would matter a lot
- `medium`: mistakes are manageable but not ideal
- `low`: mistakes are easy to catch or low impact

### 6. `speedPressure`
How much speed matters.

Meaning:
- `high`: fast turnaround matters a lot
- `medium`: speed matters somewhat
- `low`: speed is not the main driver

### 7. `costPressure`
How much cost savings matter.

Meaning:
- `high`: cheaper option strongly preferred
- `medium`: cost matters somewhat
- `low`: cost is not the main factor

---

## Suggested keyword-based task analysis

For the first build, analysis can be done with simple string checks.

### Example keyword hints

#### Research-like tasks
If title or description contains words like:
- `research`
- `brief`
- `summary`
- `summarize`
- `competitor`
- `analysis`

Then:
- `taskType = research_brief` or `summary`
- often `taskClarity = high`
- often `requiredJudgment = low` or `medium`

#### Executive or strategy tasks
If it contains:
- `executive`
- `board`
- `strategy`
- `decision`
- `recommendation`
- `memo`

Then:
- `requiredJudgment = high`
- `businessRisk = medium` or `high`

#### Review tasks
If it contains:
- `review`
- `check`
- `policy`
- `compliance`

Then:
- `requiredJudgment = medium` or `high`
- `businessRisk = medium` or `high`

This does not need to be perfect. It only needs to be consistent and explainable.

---

## Simple scoring rules

Use a 0 to 100 scale for each fit score.

The easiest beginner approach is:

1. start each score at a base value
2. add or subtract points based on each factor
3. clamp the final score between `0` and `100`

### Suggested base scores

- `humanFitScore = 40`
- `agentFitScore = 40`
- `hybridFitScore = 40`

Then apply rules.

---

## Scoring rules for `humanFitScore`

Humans should score higher when the task is ambiguous, sensitive, risky, or judgment-heavy.

### Add points

- if `taskClarity = low` -> `+20`
- if `requiredJudgment = high` -> `+25`
- if `requiredJudgment = medium` -> `+10`
- if `dataSensitivity = high` -> `+20`
- if `dataSensitivity = medium` -> `+10`
- if `businessRisk = high` -> `+20`
- if `businessRisk = medium` -> `+10`

### Subtract points

- if `taskClarity = high` -> `-10`
- if `requiredJudgment = low` -> `-10`
- if `speedPressure = high` -> `-5`
- if `costPressure = high` -> `-5`

### Human interpretation

A high human score means:
- this task is risky
- this task is vague
- this task needs business sense or human judgment

---

## Scoring rules for `agentFitScore`

Agents should score higher when the task is clear, repeatable, low-risk, and time-sensitive.

### Add points

- if `taskClarity = high` -> `+20`
- if `taskClarity = medium` -> `+10`
- if `requiredJudgment = low` -> `+20`
- if `requiredJudgment = medium` -> `+5`
- if `dataSensitivity = low` -> `+15`
- if `businessRisk = low` -> `+15`
- if `speedPressure = high` -> `+10`
- if `costPressure = high` -> `+10`

### Subtract points

- if `taskClarity = low` -> `-20`
- if `requiredJudgment = high` -> `-25`
- if `dataSensitivity = high` -> `-20`
- if `businessRisk = high` -> `-20`

### Agent interpretation

A high agent score means:
- the task is well-defined
- the output is structured or repeatable
- automation is likely helpful
- the downside of mistakes is manageable

---

## Scoring rules for `hybridFitScore`

Hybrid should score higher when the task is partly automatable but still needs human review or judgment.

### Add points

- if `taskClarity = high` -> `+10`
- if `taskClarity = medium` -> `+15`
- if `requiredJudgment = medium` -> `+20`
- if `requiredJudgment = high` -> `+10`
- if `dataSensitivity = medium` -> `+15`
- if `businessRisk = medium` -> `+15`
- if `speedPressure = high` -> `+5`

### Subtract points

- if `taskClarity = low` and `requiredJudgment = high` -> `-10`
- if `requiredJudgment = low` and `dataSensitivity = low` -> `-10`
- if `businessRisk = high` and `dataSensitivity = high` -> `-10`

### Hybrid interpretation

A high hybrid score means:
- an agent can help
- but a human should still guide, review, or approve

---

## Helpful tiebreaking idea

Sometimes scores will be close. That is okay.

Use these simple tie rules:

1. if top two scores are within `5 points`, prefer `hybrid`
2. if `requiredJudgment = high` and scores are close, prefer `human` or `hybrid`, not `agent`
3. if `taskClarity = high` and `dataSensitivity = low` and scores are close, prefer `agent` or `hybrid`

This keeps the engine safer and easier to explain.

---

## How to choose `recommendedPath`

After calculating the three scores:

1. compare `humanFitScore`, `agentFitScore`, and `hybridFitScore`
2. choose the highest score
3. apply the tie rules above if scores are very close

### Example

If scores are:
- `human = 48`
- `agent = 82`
- `hybrid = 67`

Then:
- `recommendedPath = agent`

If scores are:
- `human = 69`
- `agent = 65`
- `hybrid = 70`

Then:
- `recommendedPath = hybrid`

If scores are:
- `human = 75`
- `agent = 52`
- `hybrid = 74`

Then:
- `recommendedPath = human`
- because human is highest, and close scores still lean safer when judgment is high

---

## How to calculate confidence in a simple way

Confidence should be easy to understand.

Use this idea:

### Step 1
Sort the three scores from highest to lowest.

### Step 2
Take the difference between the top score and the second-highest score.

### Step 3
Map that gap to a confidence label and number.

### Suggested formula

```text
gap = topScore - secondScore
confidence = min(95, 55 + gap * 2)
```

Then round to a whole number.

### Example

If scores are:
- `agent = 82`
- `hybrid = 67`
- `human = 45`

Then:
- `gap = 82 - 67 = 15`
- `confidence = 55 + (15 * 2) = 100`
- clamp to `85`

Final:
- `confidence = 85`

### Confidence guide

- `0-60`: low confidence
- `61-75`: medium confidence
- `76-95`: high confidence

This is simple and works well for a frontend demo.

---

## How to generate explanation reasons

The explanation should come directly from the factors and the winning path.

Do not invent fancy language.

### Rule

For each important factor, add a plain-language reason.

### If the winner is `agent`
Possible reasons:
- task is clearly defined
- output is structured or repeatable
- sensitivity is low
- business risk is low
- speed matters
- cost savings matter

### If the winner is `human`
Possible reasons:
- task is ambiguous
- strong human judgment is needed
- sensitivity is high
- business risk is high
- mistakes would be costly

### If the winner is `hybrid`
Possible reasons:
- an agent can help with drafting or research
- a human should still review or guide the result
- task needs both speed and judgment
- medium sensitivity suggests shared handling
- medium risk makes review useful

### Explanation output should include

- `topReasons`
- `keyFactors`
- `alternatives`
- `conditions`

### Example explanation for the AI competitors task

```json
{
  "topReasons": [
    "Task is clearly defined",
    "This is repeatable research work",
    "Sensitivity is low",
    "Agent assistance improves speed"
  ],
  "keyFactors": {
    "taskClarity": "high",
    "requiredJudgment": "medium",
    "dataSensitivity": "low",
    "businessRisk": "low"
  },
  "alternatives": [
    {
      "path": "hybrid",
      "reason": "Useful if a human wants to review the final research brief"
    },
    {
      "path": "human",
      "reason": "Possible, but slower than needed for this type of structured task"
    }
  ],
  "conditions": [
    "Use a trusted research agent",
    "Escalate to human review if the audience changes to external"
  ]
}
```

---

## Pseudocode

The pseudocode below is intentionally simple and JavaScript-friendly.

## `analyzeTask(task)`

```text
function analyzeTask(task):
  combinedText = (task.title + " " + task.description + " " + task.expectedOutput).toLowerCase()

  taskType = "general_knowledge_work"
  taskClarity = "medium"
  requiredJudgment = "medium"
  dataSensitivity = task.sensitivity or "medium"
  businessRisk = "medium"
  speedPressure = task.urgency or "medium"
  costPressure = task.budgetRange == "low" ? "high" : "medium"

  if combinedText contains "research" or "competitor" or "summary" or "brief":
    taskType = "research_brief"
    taskClarity = "high"
    requiredJudgment = "medium"
    businessRisk = "low"

  if combinedText contains "executive" or "board" or "strategy" or "memo":
    taskType = "memo_or_strategy"
    requiredJudgment = "high"
    businessRisk = "medium"

  if combinedText contains "policy" or "compliance" or "review":
    taskType = "document_review"
    requiredJudgment = "high"
    businessRisk = "high"

  if task.audience == "external":
    businessRisk = "high"

  if task.audience == "internal_leadership" and businessRisk == "low":
    businessRisk = "medium"

  if task.sensitivity == "high":
    dataSensitivity = "high"

  return {
    taskId: task.id,
    taskType,
    taskClarity,
    requiredJudgment,
    dataSensitivity,
    businessRisk,
    speedPressure,
    costPressure
  }
```

---

## `scoreHumanFit(taskAnalysis)`

```text
function scoreHumanFit(taskAnalysis):
  score = 40

  if taskAnalysis.taskClarity == "low":
    score += 20
  if taskAnalysis.taskClarity == "high":
    score -= 10

  if taskAnalysis.requiredJudgment == "high":
    score += 25
  if taskAnalysis.requiredJudgment == "medium":
    score += 10
  if taskAnalysis.requiredJudgment == "low":
    score -= 10

  if taskAnalysis.dataSensitivity == "high":
    score += 20
  if taskAnalysis.dataSensitivity == "medium":
    score += 10

  if taskAnalysis.businessRisk == "high":
    score += 20
  if taskAnalysis.businessRisk == "medium":
    score += 10

  if taskAnalysis.speedPressure == "high":
    score -= 5

  if taskAnalysis.costPressure == "high":
    score -= 5

  return clamp(score, 0, 100)
```

---

## `scoreAgentFit(taskAnalysis)`

```text
function scoreAgentFit(taskAnalysis):
  score = 40

  if taskAnalysis.taskClarity == "high":
    score += 20
  if taskAnalysis.taskClarity == "medium":
    score += 10
  if taskAnalysis.taskClarity == "low":
    score -= 20

  if taskAnalysis.requiredJudgment == "low":
    score += 20
  if taskAnalysis.requiredJudgment == "medium":
    score += 5
  if taskAnalysis.requiredJudgment == "high":
    score -= 25

  if taskAnalysis.dataSensitivity == "low":
    score += 15
  if taskAnalysis.dataSensitivity == "high":
    score -= 20

  if taskAnalysis.businessRisk == "low":
    score += 15
  if taskAnalysis.businessRisk == "high":
    score -= 20

  if taskAnalysis.speedPressure == "high":
    score += 10

  if taskAnalysis.costPressure == "high":
    score += 10

  return clamp(score, 0, 100)
```

---

## `scoreHybridFit(taskAnalysis)`

```text
function scoreHybridFit(taskAnalysis):
  score = 40

  if taskAnalysis.taskClarity == "high":
    score += 10
  if taskAnalysis.taskClarity == "medium":
    score += 15

  if taskAnalysis.requiredJudgment == "medium":
    score += 20
  if taskAnalysis.requiredJudgment == "high":
    score += 10

  if taskAnalysis.dataSensitivity == "medium":
    score += 15

  if taskAnalysis.businessRisk == "medium":
    score += 15

  if taskAnalysis.speedPressure == "high":
    score += 5

  if taskAnalysis.taskClarity == "low" and taskAnalysis.requiredJudgment == "high":
    score -= 10

  if taskAnalysis.requiredJudgment == "low" and taskAnalysis.dataSensitivity == "low":
    score -= 10

  if taskAnalysis.businessRisk == "high" and taskAnalysis.dataSensitivity == "high":
    score -= 10

  return clamp(score, 0, 100)
```

---

## `buildRecommendation(taskAnalysis)`

```text
function buildRecommendation(taskAnalysis):
  humanFitScore = scoreHumanFit(taskAnalysis)
  agentFitScore = scoreAgentFit(taskAnalysis)
  hybridFitScore = scoreHybridFit(taskAnalysis)

  scores = [
    { path: "human", score: humanFitScore },
    { path: "agent", score: agentFitScore },
    { path: "hybrid", score: hybridFitScore }
  ]

  sort scores by score descending

  top = scores[0]
  second = scores[1]

  recommendedPath = top.path

  if top.score - second.score <= 5:
    if taskAnalysis.requiredJudgment == "high":
      if top.path == "agent":
        recommendedPath = "hybrid"
      else:
        recommendedPath = "human"
    else:
      recommendedPath = "hybrid"

  gap = top.score - second.score
  confidence = 55 + (gap * 3)
  if confidence > 95:
    confidence = 95
  if confidence < 55:
    confidence = 55

  return {
    taskId: taskAnalysis.taskId,
    humanFitScore,
    agentFitScore,
    hybridFitScore,
    recommendedPath,
    confidence: round(confidence),
    createdAt: current timestamp
  }
```

---

## `buildRecommendationExplanation(taskAnalysis, recommendation)`

```text
function buildRecommendationExplanation(taskAnalysis, recommendation):
  reasons = []
  conditions = []

  if recommendation.recommendedPath == "agent":
    if taskAnalysis.taskClarity == "high":
      reasons.push("Task is clearly defined")
    if taskAnalysis.requiredJudgment != "high":
      reasons.push("The work is structured enough for agent support")
    if taskAnalysis.dataSensitivity == "low":
      reasons.push("Sensitivity is low")
    if taskAnalysis.businessRisk == "low":
      reasons.push("Business risk is manageable")
    if taskAnalysis.speedPressure == "high":
      reasons.push("Agent use can speed up delivery")

  if recommendation.recommendedPath == "human":
    if taskAnalysis.taskClarity == "low":
      reasons.push("Task is still ambiguous")
    if taskAnalysis.requiredJudgment == "high":
      reasons.push("Strong human judgment is needed")
    if taskAnalysis.dataSensitivity == "high":
      reasons.push("The content is sensitive")
    if taskAnalysis.businessRisk == "high":
      reasons.push("Mistakes would have high business impact")

  if recommendation.recommendedPath == "hybrid":
    reasons.push("An agent can help with the first pass")
    reasons.push("A human should stay involved for review or judgment")
    if taskAnalysis.requiredJudgment == "medium" or taskAnalysis.requiredJudgment == "high":
      reasons.push("The task needs both speed and human thinking")
    if taskAnalysis.dataSensitivity == "medium":
      reasons.push("Shared handling is safer than agent-only")

  if taskAnalysis.dataSensitivity != "low":
    conditions.push("Check governance before launch")

  if taskAnalysis.businessRisk == "high":
    conditions.push("Human review should remain in the loop")

  alternatives = []

  if recommendation.recommendedPath != "agent":
    alternatives.push({
      path: "agent",
      reason: "Useful when the task becomes more structured and lower risk"
    })

  if recommendation.recommendedPath != "human":
    alternatives.push({
      path: "human",
      reason: "Safer when sensitivity or judgment needs increase"
    })

  if recommendation.recommendedPath != "hybrid":
    alternatives.push({
      path: "hybrid",
      reason: "Useful when agent speed is valuable but human review still matters"
    })

  return {
    taskId: taskAnalysis.taskId,
    topReasons: first 4 reasons,
    keyFactors: {
      taskClarity: taskAnalysis.taskClarity,
      requiredJudgment: taskAnalysis.requiredJudgment,
      dataSensitivity: taskAnalysis.dataSensitivity,
      businessRisk: taskAnalysis.businessRisk
    },
    alternatives: first 2 alternatives,
    conditions
  }
```

---

## At least 5 example tasks with expected recommendations

These examples are for the MVP demo and for testing the scoring logic.

## Example 1: Agent case

### Task
`Create internal market research brief about AI competitors`

### Why
- clear task
- repeatable output
- low sensitivity
- low to medium judgment
- speed matters

### Expected `TaskAnalysis`
```json
{
  "taskType": "research_brief",
  "taskClarity": "high",
  "requiredJudgment": "medium",
  "dataSensitivity": "low",
  "businessRisk": "low",
  "speedPressure": "medium",
  "costPressure": "high"
}
```

### Expected recommendation
- `recommendedPath = agent`

---

## Example 2: Human case

### Task
`Decide whether we should change our AI product strategy for enterprise customers`

### Why
- ambiguous task
- high judgment
- important business decision
- high risk if wrong

### Expected `TaskAnalysis`
```json
{
  "taskType": "strategy_work",
  "taskClarity": "low",
  "requiredJudgment": "high",
  "dataSensitivity": "medium",
  "businessRisk": "high",
  "speedPressure": "medium",
  "costPressure": "low"
}
```

### Expected recommendation
- `recommendedPath = human`

---

## Example 3: Hybrid case

### Task
`Draft executive memo about AI adoption strategy`

### Why
- drafting can be helped by an agent
- executive audience raises judgment needs
- human review should stay involved

### Expected `TaskAnalysis`
```json
{
  "taskType": "memo_or_strategy",
  "taskClarity": "medium",
  "requiredJudgment": "high",
  "dataSensitivity": "medium",
  "businessRisk": "medium",
  "speedPressure": "medium",
  "costPressure": "medium"
}
```

### Expected recommendation
- `recommendedPath = hybrid`

---

## Example 4: Approval-required case

### Task
`Summarize internal policy review findings for leadership`

### Why
- partially automatable
- leadership audience
- policy subject matter
- likely needs review before use

### Expected `TaskAnalysis`
```json
{
  "taskType": "document_review",
  "taskClarity": "medium",
  "requiredJudgment": "high",
  "dataSensitivity": "medium",
  "businessRisk": "medium",
  "speedPressure": "medium",
  "costPressure": "medium"
}
```

### Expected recommendation
- `recommendedPath = hybrid`

### Governance note
The recommendation engine still returns `hybrid`.
A later governance rule would likely say:
- `approvalRequired = true`

Important: approval is not decided here. It is decided in the governance step.

---

## Example 5: Blocked-by-policy case

### Task
`Use an agent to prepare a sensitive external strategy memo`

### Why
- the task may look partly automatable
- but it is sensitive and external-facing
- governance may later block the unsafe path

### Expected `TaskAnalysis`
```json
{
  "taskType": "memo_or_strategy",
  "taskClarity": "medium",
  "requiredJudgment": "high",
  "dataSensitivity": "high",
  "businessRisk": "high",
  "speedPressure": "high",
  "costPressure": "medium"
}
```

### Expected recommendation
- `recommendedPath = human` or `hybrid`

Safer expected choice for this ruleset:
- `recommendedPath = human`

### Governance note
If a user later tries to force an untrusted agent option, governance should block it.

Again, the engine recommends. Governance blocks.

---

## Extra sample case for testing

## Example 6: Fast low-risk summary

### Task
`Summarize 20 interview notes into a 1-page internal findings summary`

### Expected `TaskAnalysis`
```json
{
  "taskType": "summary",
  "taskClarity": "high",
  "requiredJudgment": "low",
  "dataSensitivity": "low",
  "businessRisk": "low",
  "speedPressure": "high",
  "costPressure": "high"
}
```

### Expected recommendation
- `recommendedPath = agent`

---

## Common mistakes to avoid

## 1. Mixing recommendation and governance
Do not let the recommendation engine become the policy engine.

Good:
- recommendation says what fits best
- governance says what is allowed

Bad:
- recommendation directly blocks things for policy reasons

---

## 2. Making the logic too clever too early
Do not add:
- ML
- embeddings
- LLM classification
- hidden weights from external models

The first version must be readable in plain JavaScript.

---

## 3. Using too many factors
Do not analyze 20 different dimensions in V1.

Stick to:
- clarity
- judgment
- sensitivity
- risk
- speed
- cost

That is enough for the MVP.

---

## 4. Making every task become hybrid
Hybrid is useful, but it should not become the answer for everything.

If the rules are too soft, every task will look mixed and the demo will feel weak.

Make sure:
- clearly structured low-risk work can become `agent`
- clearly risky judgment-heavy work can become `human`

---

## 5. Forgetting explainability
Do not return just a winning label.

Always return:
- scores
- confidence
- reasons
- alternatives

The explanation is part of the product, not extra decoration.

---

## 6. Using unclear field names
Use clear names like:
- `humanFitScore`
- `agentFitScore`
- `hybridFitScore`
- `recommendedPath`
- `confidence`

Do not use vague names like:
- `value1`
- `resultMeta`
- `smartScore`

---

## 7. Making confidence feel fake
Confidence does not need to be “scientifically true” in V1.

It just needs to be:
- consistent
- based on score separation
- easy to explain

Use the score gap approach and keep it simple.

---

## 8. Forgetting edge cases
Test at least these cases:
- clear low-risk task
- vague strategy task
- medium-risk drafting task
- approval-required task
- blocked-by-policy task

The demo will feel much stronger if these all work.

---

## 9. Hardcoding recommendation text separately from logic
If possible, build explanation reasons from the same factors used in scoring.

That keeps the product consistent.

Bad example:
- score says `agent`
- explanation says “this needs heavy human judgment”

Good example:
- explanation matches the factors that raised the winning score

---

## 10. Trying to perfect the analysis step
The first analysis step can be simple and imperfect.

It only needs to produce stable demo behavior for known example tasks.

That is enough for V1.

---

## Suggested helper functions

For a beginner-friendly JavaScript build, these helpers are enough:

- `clamp(value, min, max)`
- `analyzeTask(task)`
- `scoreHumanFit(taskAnalysis)`
- `scoreAgentFit(taskAnalysis)`
- `scoreHybridFit(taskAnalysis)`
- `buildRecommendation(taskAnalysis)`
- `buildRecommendationExplanation(taskAnalysis, recommendation)`

Optional later helpers:
- `getTaskTypeFromText(text)`
- `getFactorLabel(value)`
- `buildAlternativePaths(scores)`

---

## Final rule for the MVP

If the recommendation logic cannot be explained in simple words to a beginner, it is too complicated for V1.

The MVP recommendation engine should be:
- deterministic
- readable
- easy to test
- easy to change
- clearly separate from governance

That is enough to power the first believable `Human-AgentOS` demo.