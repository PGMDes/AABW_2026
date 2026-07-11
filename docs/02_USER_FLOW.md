# 02_USER_FLOW.md

## Purpose of this file

This file explains the main user journey for the first demo of `SymbiontOS` in simple words.

It is written so a beginner developer or future coding agent can build the screens and the flow without restarting product strategy.

This flow is for the locked V1 only:
- decision-first workforce control plane
- knowledge-work tasks
- fake/sample data first
- no real backend required yet

---

## Main user persona

### Primary user
`Innovation / AI Transformation Lead`

### Who this person is
This is someone inside a company who is trying to introduce AI into real work without causing chaos.

They want to answer questions like:
- Can an AI agent handle this task?
- Does a human need to stay involved?
- Is this task safe enough for agent use?
- Which agent should we trust for this kind of work?
- Do we need approval before using an agent here?

### What this person cares about
- speed
- trust
- explainability
- governance
- choosing the right execution path

They do **not** want a giant HR system or a giant project management tool. They want a fast decision and a controlled next step.

---

## Main demo scenario

### Demo task
`Create an internal market research brief about AI competitors`

This is the main example for the first demo because it fits the V1 scope well:
- it is knowledge work
- it is easy to imagine an AI agent helping
- it is low enough risk for an `agent` or `hybrid` recommendation
- it helps show recommendation, governance, marketplace, and launch in one clean flow

### Example task input
- `Title`: Create internal market research brief about AI competitors
- `Description`: Summarize the top 5 AI competitors, their positioning, strengths, weaknesses, and likely impact on our product strategy.
- `Expected output`: 2-page internal research brief
- `Deadline`: End of this week
- `Audience`: Internal leadership team
- `Sensitivity`: Low
- `Urgency`: Medium
- `Budget range`: Low

---

## Full user journey at a glance

The full MVP journey is:

1. user opens the app
2. user starts a new task
3. user fills in the task intake form
4. system analyzes the task
5. system recommends `human`, `agent`, or `hybrid`
6. system explains why
7. system checks governance rules
8. user sees eligible execution options
9. user selects an option
10. user launches the task
11. user sees a task detail page with execution status and outcome

---

## Main fake/sample data rule

For V1, this flow should run on fake/sample data first.

That means:
- fake task records
- fake analysis results
- fake recommendation scores
- fake governance rules
- fake agent marketplace profiles
- fake launch states
- fake outcome records

Do not wait for a backend before building the flow.

---

## Step-by-step user flow

## Step 1: Home or dashboard

### What the user sees
The user lands on a simple dashboard.

It should show:
- page title: `SymbiontOS`
- short description of what the product does
- button: `New Task`
- list of recent sample tasks
- simple summary cards such as:
  - total tasks
  - tasks recommended to agents
  - tasks needing approval

### What the system does behind the scenes
- loads sample current user
- loads sample task list
- loads sample summary numbers

### Data on this screen
Example current user:
```json
{
  "id": "user_001",
  "name": "Current workspace administrator",
  "role": "AI Transformation Lead"
}
```

Example recent task:
```json
{
  "id": "task_001",
  "title": "Create internal market research brief about AI competitors",
  "status": "draft",
  "latestRecommendation": null
}
```

### What moves to the next step
When the user clicks `New Task`, no complex data is needed yet. The app just routes to the task intake page.

---

## Step 2: Task intake

### What the user sees
A form where the user describes the task.

Fields should be visible and easy to understand:
- task title
- task description
- expected output
- deadline
- audience
- sensitivity
- urgency
- budget range

Suggested field types:
- text input for title
- textarea for description
- text input or textarea for expected output
- date picker for deadline
- dropdown for audience
- dropdown for sensitivity
- dropdown for urgency
- dropdown for budget range

### Example values for the main demo
- `Title`: Create internal market research brief about AI competitors
- `Description`: Summarize the top 5 AI competitors, their positioning, strengths, weaknesses, and likely impact on our product strategy.
- `Expected output`: 2-page internal research brief
- `Deadline`: 2026-07-10
- `Audience`: Internal leadership
- `Sensitivity`: Low
- `Urgency`: Medium
- `Budget range`: Low

### What the system does behind the scenes
- validates required fields
- creates a local task object
- stores the draft task in frontend state
- prepares the task for analysis

### Data moving to the next step
Example task object:
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

---

## Step 3: Task analysis

### What the user sees
A transition state or loading state such as:
- `Analyzing task...`
- `Reviewing task clarity, risk, sensitivity, and execution fit`

This can be simple for V1.

### What the system does behind the scenes
The system converts the raw task into structured task attributes.

These attributes are not typed by the user directly. The system infers them.

### Example analyzed result
```json
{
  "taskType": "research_brief",
  "taskClarity": "high",
  "requiredJudgment": "medium",
  "dataSensitivity": "low",
  "businessRisk": "low",
  "speedPressure": "medium",
  "costPressure": "medium"
}
```

### Beginner-friendly meaning of these fields
- `taskType`: what kind of work this is
- `taskClarity`: how clearly defined the task is
- `requiredJudgment`: how much human thinking is needed
- `dataSensitivity`: whether the content is risky or sensitive
- `businessRisk`: how risky a bad result would be
- `speedPressure`: how much speed matters
- `costPressure`: how much cost matters

### What moves to the next step
The app passes:
- original task object
- analyzed task attributes

---

## Step 4: Recommendation result

### What the user sees
A result screen that answers the main product question.

It should show:
- task summary
- recommendation: `Human`, `Agent`, or `Hybrid`
- confidence
- top reasons
- alternative options

For the main demo scenario, the likely result is:
- `Recommendation`: Agent
- `Confidence`: High

### Example visible content
- `Recommended path`: Agent
- `Why this fits`: Clear research task, low sensitivity, repeatable output format
- `Confidence`: 82%
- `Alternative option`: Hybrid if human review is preferred

### What the system does behind the scenes
The system scores three possible routes:
- human-fit
- agent-fit
- hybrid-fit

Example scoring result:
```json
{
  "humanFit": 45,
  "agentFit": 82,
  "hybridFit": 67,
  "recommendedPath": "agent",
  "confidence": 82
}
```

### Example explanation object
```json
{
  "topReasons": [
    "Task is clearly defined",
    "Output is a repeatable internal research brief",
    "Sensitivity is low",
    "No high-risk external delivery is involved"
  ],
  "alternatives": [
    {
      "path": "hybrid",
      "reason": "Useful if human review is preferred before sharing internally"
    },
    {
      "path": "human",
      "reason": "Less efficient for this task because the work is structured and low risk"
    }
  ]
}
```

### What moves to the next step
The app passes:
- task
- analysis
- score result
- explanation result

---

## Step 5: Governance check

### What the user sees
The same recommendation screen can include a governance section, or there can be a separate small screen.

The user should see:
- whether approval is required
- whether the recommended path is allowed
- whether anything is blocked
- why that governance result happened

For the main demo scenario, the likely result is:
- `Approval required`: No
- `Allowed path`: Agent
- `Reason`: Low sensitivity and internal use

### Example visible content
- `Governance status`: Approved for agent use
- `Approval required`: No
- `Policy note`: Trusted research agents may handle low-sensitivity internal briefs

### What the system does behind the scenes
The system applies simple hardcoded rules.

Example rules:
- high sensitivity -> approval required
- executive audience -> hybrid or human review required
- external audience -> approval required
- untrusted agent -> block agent-only path

### Example governance result
```json
{
  "approvalRequired": false,
  "allowedPaths": ["agent", "hybrid", "human"],
  "blockedPaths": [],
  "policyReason": "Low-sensitivity internal research is approved for trusted agents"
}
```

### What moves to the next step
The app passes:
- task
- analysis
- recommendation
- governance result

---

## Step 6: Marketplace selection

### What the user sees
A curated list of execution options that fit the task and pass governance.

For the main demo scenario, the user should see a small set of agent cards.

Each card should show:
- agent name
- capability tags
- trust tier
- supported task types
- cost level
- limitations
- select button

### Example visible options
#### Option 1
`Research Analyst Agent`
- capabilities: research, summarization, brief drafting
- trust tier: trusted
- cost: low
- best for: internal market research

#### Option 2
`Competitive Scan Agent`
- capabilities: competitor comparison, market scan, summary writing
- trust tier: trusted
- cost: low
- best for: fast first-pass research

#### Option 3
`Hybrid with Human Reviewer`
- flow: agent drafts, human reviews
- best for: leadership-facing research with extra caution

### What the system does behind the scenes
The system:
- loads sample marketplace profiles
- filters them using the recommendation and governance result
- ranks them for task fit

### Example marketplace profile
```json
{
  "id": "agent_001",
  "name": "Research Analyst Agent",
  "capabilities": ["research", "summarization", "brief_drafting"],
  "supportedTaskTypes": ["research_brief", "competitive_summary"],
  "trustTier": "trusted",
  "sensitiveDataSuitability": "low_medium",
  "costLevel": "low",
  "limitations": ["Needs human review for external-facing documents"]
}
```

### What moves to the next step
The app passes:
- selected execution option
- all previous task, recommendation, and governance data

---

## Step 7: Launch confirmation

### What the user sees
A confirmation view before launch.

It should clearly show:
- chosen task
- chosen execution path
- selected agent or human option
- governance result
- whether approval is already satisfied
- launch button

### Example visible summary
- `Task`: Create internal market research brief about AI competitors
- `Recommended path`: Agent
- `Selected option`: Research Analyst Agent
- `Approval required`: No
- `Ready to launch`

### What the system does behind the scenes
The system creates an execution record.

### Example execution record
```json
{
  "executionId": "exec_001",
  "taskId": "task_001",
  "selectedPath": "agent",
  "selectedOptionId": "agent_001",
  "approvalStatus": "not_required",
  "status": "launched"
}
```

### What moves to the next step
The app passes:
- execution record
- task detail route id

---

## Step 8: Task detail and outcome tracking

### What the user sees
A task detail page that tells the story of what happened.

It should show:
- task summary
- analyzed attributes
- recommendation
- explanation
- governance result
- selected option
- lifecycle status
- launch status
- audit trail
- output summary
- outcome review

### Example visible content
- `Status`: Completed
- `Output`: Draft market research brief created
- `Recommendation used`: Agent
- `Selected option`: Research Analyst Agent
- `Outcome review`: Accepted with minor edits

### What the system does behind the scenes
The system loads a sample execution outcome.
It also builds a deterministic lifecycle state and audit trail so the task detail page can show what happened step by step.

### Example outcome object
```json
{
  "executionId": "exec_001",
  "status": "completed",
  "outputSummary": "Draft market research brief created",
  "reviewOutcome": "accepted_with_minor_edits",
  "reviewNotes": "Good first pass. Human reviewer adjusted competitor prioritization."
}
```

### Final data shown together
By this point, the task detail page combines:
- intake data
- analyzed data
- recommendation data
- governance data
- marketplace selection
- launch record
- lifecycle state
- audit trail
- outcome record

This is the full MVP story in one place.

---

## What data moves from one step to the next

This section is important for building the screens.

## Data chain

### 1. Task intake creates `Task`
```json
{
  "id": "task_001",
  "title": "...",
  "description": "...",
  "expectedOutput": "...",
  "deadline": "...",
  "audience": "...",
  "sensitivity": "...",
  "urgency": "...",
  "budgetRange": "..."
}
```

### 2. Analysis creates `TaskAnalysis`
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

### 3. Recommendation creates `Recommendation`
```json
{
  "taskId": "task_001",
  "humanFit": 45,
  "agentFit": 82,
  "hybridFit": 67,
  "recommendedPath": "agent",
  "confidence": 82
}
```

### 4. Explainability creates `RecommendationExplanation`
```json
{
  "taskId": "task_001",
  "topReasons": [
    "Task is clearly defined",
    "Output is repeatable",
    "Sensitivity is low"
  ],
  "alternatives": [
    {
      "path": "hybrid",
      "reason": "Safer if human review is preferred"
    }
  ]
}
```

### 5. Governance creates `GovernanceResult`
```json
{
  "taskId": "task_001",
  "approvalRequired": false,
  "allowedPaths": ["agent", "hybrid", "human"],
  "blockedPaths": [],
  "policyReason": "Low-sensitivity internal research is approved for trusted agents"
}
```

### 6. Marketplace creates `EligibleOptions`
```json
{
  "taskId": "task_001",
  "options": [
    {
      "id": "agent_001",
      "name": "Research Analyst Agent"
    },
    {
      "id": "agent_002",
      "name": "Competitive Scan Agent"
    }
  ]
}
```

### 7. Launch creates `ExecutionRecord`
```json
{
  "executionId": "exec_001",
  "taskId": "task_001",
  "selectedPath": "agent",
  "selectedOptionId": "agent_001",
  "approvalStatus": "not_required",
  "status": "launched"
}
```

### 8. Tracking creates `OutcomeRecord`
```json
{
  "executionId": "exec_001",
  "status": "completed",
  "outputSummary": "Draft market research brief created",
  "reviewOutcome": "accepted_with_minor_edits"
}
```

### 9. Lifecycle and audit trail show the task story
```json
{
  "currentStage": "reviewed",
  "events": [
    {
      "label": "Task submitted",
      "actorType": "human",
      "relativeTimestamp": "T+00m",
      "status": "completed"
    },
    {
      "label": "Outcome reviewed",
      "actorType": "human",
      "relativeTimestamp": "T+50m",
      "status": "completed"
    }
  ]
}
```

---

## Happy path

This is the cleanest path and should be the first one built.

## Example
Task: `Create internal market research brief about AI competitors`

## Flow
1. user opens dashboard
2. user clicks `New Task`
3. user fills in the task intake form
4. system analyzes the task
5. system recommends `Agent`
6. system explains why
7. system checks policy
8. policy says no approval is required
9. system shows trusted research agents
10. user selects `Research Analyst Agent`
11. user clicks `Launch`
12. task detail page shows launched status
13. sample outcome later shows `Completed`

## Why this is the best first demo path
- it is easy to understand
- it shows the core product value quickly
- it uses low-risk internal work
- it does not require a complicated approval UI first

---

## Approval-required path

This path proves that governance matters.

## Example task
`Draft executive memo about AI adoption strategy`

## Why this path is different
This task has:
- executive audience
- more judgment
- higher sensitivity than a simple internal research brief

## Likely system result
- recommendation: `Hybrid`
- approval required: `Yes`

## Flow
1. user submits task
2. system analyzes task
3. system recommends `Hybrid`
4. system explains:
   - executive audience
   - higher judgment needed
   - human review should stay in the loop
5. governance rules detect elevated risk
6. system shows `Approval required`
7. user sees eligible option such as:
   - `Executive Memo Agent + Human Reviewer`
8. user cannot directly launch as agent-only
9. user sees approval state:
   - `Pending approval`
10. after sample approval, task can move to launch

## What the user should see
- a clear message saying why approval is needed
- a reviewer name or reviewer role
- a path that still works, not just a block

## Important beginner rule
Approval-required does **not** mean the flow is broken. It means the system is doing its governance job.

---

## Blocked-by-policy path

This path proves the product can say `no`.

## Example task
`Use an untrusted agent to prepare a sensitive external strategy memo`

## Why this path is different
This task combines risky conditions:
- sensitive content
- external-facing use
- agent does not meet trust level

## Likely system result
- recommendation might start as `Hybrid` or `Agent`
- governance then blocks the unsafe option

## Flow
1. user submits task
2. system analyzes the task
3. recommendation engine suggests a possible route
4. governance rules run after recommendation
5. governance detects policy violation
6. system blocks the unsafe agent path
7. user sees:
   - what was blocked
   - why it was blocked
   - safer alternatives

## Example blocked result
- `Blocked path`: Agent-only
- `Why`: External-facing sensitive output requires approved trusted path and human review
- `Suggested alternative`: Human or Hybrid with approved reviewer

## What the user should see
- a clear blocked message
- plain-language explanation
- safer next option
- no confusing dead end

## Important beginner rule
Blocked-by-policy is a valid product state. Build it intentionally.

---

## What the user sees on each screen

## 1. Dashboard
User sees:
- product title
- recent tasks
- new task button
- simple summary cards

## 2. Task Intake
User sees:
- form fields
- clear labels
- submit button

## 3. Analysis / Transition
User sees:
- analyzing state
- short helper text

## 4. Recommendation Result
User sees:
- task summary
- recommendation
- confidence
- reasons
- alternatives

## 5. Governance Section or Screen
User sees:
- approval required or not
- allowed or blocked paths
- policy reason

## 6. Marketplace
User sees:
- eligible options
- agent cards
- trust tier
- capability tags
- select button

## 7. Launch Confirmation
User sees:
- chosen option
- recommendation summary
- governance summary
- launch button

## 8. Task Detail / Tracker
User sees:
- everything that happened
- current status
- lifecycle tracker
- audit/activity timeline
- output summary
- review result

---

## What the system does behind the scenes on each screen

## 1. Dashboard
- load sample user
- load sample tasks
- load sample stats

## 2. Task Intake
- validate required fields
- create task object
- store task locally

## 3. Analysis
- infer structured task attributes

## 4. Recommendation
- score human-fit
- score agent-fit
- score hybrid-fit
- choose best path
- create explanation

## 5. Governance
- apply hardcoded policy rules
- decide approval, allowed paths, blocked paths

## 6. Marketplace
- load fake marketplace profiles
- filter and rank eligible options

## 7. Launch
- create execution record
- update task state to launched

## 8. Tracking
- load sample outcome
- display status and review summary

---

## Screen-building notes for coding agents

These notes make the flow easier to build.

## Recommendation screen must include
- recommendation label
- confidence
- top reasons
- alternatives
- governance result
- next action button

## Marketplace screen must include
- only eligible options
- trust tier
- capability tags
- short limitations text
- selection state

## Task detail screen must include
- original task input
- analyzed attributes
- recommendation
- policy result
- selected option
- execution status
- lifecycle tracker
- audit trail
- output summary

## Fake states to support early
Build sample versions of these states:
- `draft`
- `submitted`
- `analyzed`
- `recommended`
- `approval_required`
- `blocked`
- `ready_to_launch`
- `launched`
- `completed`

---

## Final demo story in simple words

Here is the simplest way to explain the demo:

A companyâ€™s AI Transformation Lead wants help deciding how a task should be done.

They enter a task:
`Create internal market research brief about AI competitors`

SymbiontOS reads the task, breaks it into simple factors like clarity, sensitivity, and judgment, and recommends the best route.

In this case, it recommends an `Agent` because the task is clear, repeatable, and low sensitivity.

The system explains why it made that choice, checks whether policy allows it, shows trusted agent options, and lets the user launch the work.

Then the user can open the task detail page and see what happened:
- what was submitted
- what was recommended
- why
- whether approval was needed
- what was launched
- what outcome was recorded

That is the full story of the first MVP demo.

## Phase 5 human review and override flow

Phase 5 adds the missing control-plane behavior for tasks where governance says
`needs_human_review` or `blocked`.

This is still frontend-only. The app does not add auth, a backend, a database,
or external approval services. A human decision is stored in React state for the
current browser session.

### Where review happens

Human review happens on `Task Detail / Execution Tracker` because that page
already shows the recommendation, governance result, selected option, lifecycle,
execution status, and audit trail together.

### If governance says `needs_human_review`

The user can choose one of three deterministic review decisions:

- `Approve recommended option`: approves the current recommended eligible option and launches it in the demo.
- `Switch to human-led execution`: overrides the selected option with an eligible human-led option when governance allows one.
- `Block execution`: records that the human reviewer stopped the task from launching.

After the decision:

- lifecycle shows the human review step as `approved` or `blocked`
- execution status updates from `pending_approval` to `launched` or `blocked`
- the audit trail records a `Human review decision` event
- approved launches create the same kind of demo outcome record as other launched work

### If governance says `blocked`

Blocked tasks must still not launch an agent.

The review panel shows that launch is unavailable. It only offers a human-led
fallback when the existing governance result still allows the `human` path and
there is an eligible human option.

For the current `task_003` blocked scenario, governance blocks `human`, `agent`,
and `hybrid`, so the app does not offer a human-led launch fallback. It only lets
the user confirm the policy block.

## First path to build

Build the happy path first.

First build only this path:

1. Dashboard
2. New Task
3. Task Analysis
4. Recommendation Result
5. Governance Check
6. Marketplace Selection
7. Launch Confirmation
8. Task Detail

Use the main demo task:

`Create internal market research brief about AI competitors`

Expected result:

- recommended path: `Agent`
- approval required: `No`
- selected option: `Research Analyst Agent`
- final status: `Completed`

Do not build the approval-required path or blocked-by-policy path until the happy path works end to end.

---

## One-sentence build reminder

If a screen or feature does not help the user move from `task submission` to `recommendation`, `governance`, `selection`, `launch`, or `tracking`, it probably does not belong in this first demo.
