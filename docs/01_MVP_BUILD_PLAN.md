# 01_MVP_BUILD_PLAN.md

## What we are building in simple words

We are building the first demo of `Human-AgentOS`.

This first version is a small working product that helps an `Innovation / AI transformation lead` answer one question:

`Should this knowledge-work task be done by a human, an AI agent, or a hybrid team?`

The first demo should let a user:

1. submit a task
2. see the task analyzed
3. get a recommendation: `human`, `agent`, or `hybrid`
4. see a simple explanation for that recommendation
5. see whether governance approval is needed
6. choose an execution option from a small curated marketplace
7. launch the task
8. track the result

This is not the full future platform. It is a focused MVP demo that proves the main idea.

---

## What we are not building

We are **not** building these things in V1:

- full HR or recruiting system
- full project management system
- full workflow automation platform
- open public marketplace for anyone to publish agents
- full agent builder
- subscriptions or monetization
- complex enterprise compliance system
- deep analytics platform
- real-time team collaboration suite
- advanced permissions system for many departments
- complex backend before the product flow works

If a feature does not directly help the core flow, leave it out for now.

---

## MVP phases

We should build this MVP in small phases. Each phase should produce something visible and testable.

### Phase 0: Static foundation
### Phase 1: Task intake and recommendation
### Phase 2: Explainability and governance
### Phase 3: Curated marketplace and launch
### Phase 4: Outcome tracking and first demo polish

---

## Phase 0: Static foundation

### Goal

Create a simple frontend skeleton with fake data so the product flow can be seen before building any backend.

This phase is about making the product feel real as quickly as possible.

### Exact screens

1. `Home / Dashboard`
   - short intro
   - button: `New Task`
   - list of sample recent tasks

2. `Task Intake`
   - form for entering a task

3. `Recommendation Result`
   - placeholder result card for `human / agent / hybrid`

4. `Task Detail`
   - shows one task and its current status

### Components

- top navigation
- page layout container
- task card
- status badge
- input field
- textarea
- select dropdown
- recommendation card
- explanation box
- sample task list

### Fake/sample data needed

Use hardcoded sample data first.

#### Sample tasks
- `Create internal research brief on AI competitors`
- `Draft executive memo about AI adoption risks`
- `Summarize 20 customer interview notes`
- `Review policy document for gaps`

#### Sample users
- `Maya Chen` - AI Transformation Lead
- `Jordan Lee` - Human Reviewer
- `Priya Raman` - Department Manager

#### Sample task fields
- title
- description
- deadline
- sensitivity
- audience
- urgency
- budget range

### Simple functions needed

- `getSampleTasks()`
- `getSampleCurrentUser()`
- `createLocalTaskObject(formData)`
- `goToTaskIntake()`
- `goToRecommendation(taskId)`

These functions can be frontend-only at first.

### Expected output

By the end of this phase, the app should let someone click through a fake but believable product shell.

The user should already understand:
- what this product is
- what the main flow looks like
- what data the product asks for

---

## Phase 1: Task intake and recommendation

### Goal

Make the core product moment work:

`submit task -> analyze task -> recommend human / agent / hybrid`

This is the heart of the MVP.

### Exact screens

1. `Task Intake`
   - title
   - task description
   - expected output
   - deadline
   - audience
   - sensitivity
   - urgency
   - budget range

2. `Recommendation Result`
   - task summary
   - analyzed task attributes
   - recommendation type
   - confidence
   - simple reason list

### Components

- task intake form
- field validation messages
- submit button
- analysis summary panel
- recommendation badge
- confidence meter
- reason list
- alternate option list

### Fake/sample data needed

#### Sample task analysis results
Each task should be converted into simple structured attributes:

- `taskType`
- `taskClarity`
- `requiredJudgment`
- `dataSensitivity`
- `businessRisk`
- `speedPressure`
- `costPressure`

#### Example analyzed task
For `Summarize 20 customer interview notes`:
- `taskType: summarization`
- `taskClarity: high`
- `requiredJudgment: medium`
- `dataSensitivity: low`
- `businessRisk: low`
- `speedPressure: medium`
- `costPressure: medium`

### Simple functions needed

- `validateTaskForm(formData)`
- `analyzeTask(formData)`
- `scoreHumanFit(taskAnalysis)`
- `scoreAgentFit(taskAnalysis)`
- `scoreHybridFit(taskAnalysis)`
- `buildRecommendation(scores)`
- `getRecommendationExplanation(taskAnalysis, recommendation)`

Keep the scoring very simple at first.

Example rule ideas:
- high sensitivity -> increase `human`
- high judgment -> increase `human` or `hybrid`
- high clarity + low risk -> increase `agent`
- medium judgment + low risk -> increase `hybrid`

### Expected output

By the end of this phase, a user can enter a task and see:
- analyzed task attributes
- recommended path
- basic confidence
- simple reasons

This should already feel like a real product demo even without backend storage.

---

## Phase 2: Explainability and governance

### Goal

Show that the system is not just making a guess. It should explain why it chose a route and whether approval is required.

This is what makes the MVP feel trustworthy.

### Exact screens

1. `Recommendation Result`
   - now expanded with explanation details
   - conditions
   - approval status

2. `Approval Check`
   - small panel or screen showing whether the task can proceed
   - if approval needed, show reviewer and reason

### Components

- explanation section
- factor score list
- recommendation reason chips
- approval requirement banner
- governance rule panel
- approval status badge
- reviewer card

### Fake/sample data needed

#### Sample governance rules
Start with 3 to 5 hardcoded rules.

Examples:
- if `sensitivity = high` -> approval required
- if `audience = executive` -> require human review
- if `agent trust tier < trusted` -> block agent-only path
- if `businessRisk = high` -> force `hybrid` or `human`
- if `external audience = true` -> require human approval before release

#### Sample reviewers
- `Jordan Lee` - Policy Reviewer
- `Maya Chen` - AI Transformation Lead

### Simple functions needed

- `evaluateGovernanceRules(taskAnalysis, recommendation)`
- `isApprovalRequired(governanceResult)`
- `getApprovalReason(governanceResult)`
- `getAllowedExecutionModes(governanceResult, recommendation)`

Keep governance logic explicit and readable. Avoid anything “smart” here.

### Expected output

By the end of this phase, the product should clearly show:
- why the route was chosen
- what factors mattered most
- whether approval is required
- whether the recommendation was changed by governance

This is the first moment where the product becomes more than a scoring demo.

---

## Phase 3: Curated marketplace and launch

### Goal

Let the user choose a real execution option after the recommendation.

This phase turns the recommendation into action.

### Exact screens

1. `Recommendation Result`
   - adds matching execution options

2. `Marketplace`
   - list of eligible agents
   - optional simple human reviewer options
   - filters or tags

3. `Launch Confirmation`
   - chosen option
   - approval result
   - launch button

### Components

- marketplace list
- agent profile card
- trust tier badge
- capability tags
- known limitations section
- select button
- launch summary box
- launch confirmation modal

### Fake/sample data needed

#### Sample agents
1. `Research Analyst Agent`
   - capabilities: research, summarization, brief drafting
   - trust tier: trusted
   - tools: web search, document summarization
   - sensitive data suitability: low-medium
   - cost: low

2. `Executive Memo Agent`
   - capabilities: memo drafting, summary writing
   - trust tier: review-required
   - tools: text drafting
   - sensitive data suitability: medium
   - cost: low

3. `Policy Review Agent`
   - capabilities: document review, gap finding
   - trust tier: trusted
   - tools: document analysis
   - sensitive data suitability: medium
   - cost: medium

#### Sample human options
Keep this simple in V1:
- `Human Reviewer`
- `Domain Expert Reviewer`

#### Sample launch states
- `ready`
- `approval required`
- `blocked by policy`
- `launched`

### Simple functions needed

- `getMarketplaceOptions(taskAnalysis, recommendation)`
- `filterEligibleAgents(options, governanceResult)`
- `rankOptionsForTask(options, taskAnalysis)`
- `selectExecutionOption(optionId)`
- `launchTask(taskId, optionId)`
- `createExecutionRecord(task, option, governanceResult)`

### Expected output

By the end of this phase, the user should be able to:
- see eligible execution options
- understand why some options are shown or hidden
- select one option
- launch the task
- create a visible execution record

This is the first full end-to-end product loop.

---

## Phase 4: Outcome tracking and first demo polish

### Goal

Let the user see what happened after launch and whether the recommendation worked.

This phase completes the story for the first demo.

### Exact screens

1. `Task Detail`
   - full task summary
   - recommendation
   - governance result
   - selected option
   - execution status
   - output summary
   - outcome review

2. `Execution Tracker`
   - list of launched tasks
   - status timeline

3. `Demo Dashboard`
   - recent tasks
   - recommendation type counts
   - simple outcome summaries

### Components

- execution timeline
- output card
- outcome review form
- status tracker
- recent execution list
- summary cards
- empty state messages

### Fake/sample data needed

#### Sample execution records
- task launched with `Research Analyst Agent`
- status: `completed`
- output summary: `draft brief created`
- review result: `accepted with minor edits`

- task launched with `Hybrid`
- status: `completed`
- output summary: `agent draft reviewed by human`
- review result: `approved`

- task launched with `Agent-only`
- status: `needs review`
- output summary: `draft completed`
- review result: `human approval pending`

#### Sample outcome review fields
- was recommendation correct?
- was output usable?
- were edits minor or major?
- would you use this route again?

### Simple functions needed

- `getExecutionHistory()`
- `updateExecutionStatus(taskId, status)`
- `saveOutcomeReview(taskId, reviewData)`
- `getTaskDetail(taskId)`
- `buildDashboardSummary(tasks, reviews)`

### Expected output

By the end of this phase, the first demo should show the full story:

- a task was submitted
- it was analyzed
- a route was recommended
- governance was applied
- an option was selected
- the task was launched
- the outcome was tracked

That is enough for a believable MVP demo.

---

## Recommended build order

Build in this order, even if it feels too simple at first.

1. `Static screens only`
   - create pages and layout
   - hardcode sample content

2. `Task intake form`
   - collect data
   - validate required fields

3. `Task analysis function`
   - convert form input into simple task attributes

4. `Recommendation scoring`
   - return `human`, `agent`, or `hybrid`

5. `Explanation UI`
   - show why the result happened

6. `Governance rules`
   - apply approval and blocking logic

7. `Marketplace screen`
   - show eligible options after governance

8. `Launch action`
   - create execution record

9. `Task detail and tracker`
   - show status and outcome

10. `Demo polish`
   - improve labels, clarity, fake data realism, and UX flow

This order matters because each step depends on the previous one, but each step is still small enough for a beginner to understand.

---

## What should be hardcoded first

Hardcode these things first before building a backend or database.

### Hardcode task inputs
- sample form options
- sample submitted tasks

### Hardcode analysis logic
- simple scoring rules
- fixed weight values
- fixed thresholds for confidence

### Hardcode governance rules
- approval rules
- blocked conditions
- forced hybrid conditions

### Hardcode marketplace data
- 3 to 5 sample agents
- 1 to 2 simple human reviewer options
- trust tiers
- capabilities
- cost labels

### Hardcode execution records
- launched
- needs approval
- completed
- failed

### Hardcode dashboard summaries
- total tasks
- tasks by recommendation type
- tasks by status

Why hardcode first:
- easier to build
- easier to debug
- easier to demo
- easier to change after the product flow is proven

---

## What can be improved later

Do **not** build these first. Add them later only after the main flow works.

### Data and storage
- real database
- user accounts
- persistent sessions
- audit logs stored in backend

### Recommendation quality
- more advanced scoring
- better weighting
- configurable policy engine
- learning from past outcomes

### Marketplace quality
- richer agent profiles
- search and filter improvements
- better ranking logic
- more detailed capability graph

### Governance quality
- multiple approval steps
- role-based permission logic
- policy editing UI
- more detailed risk categories

### Execution tracking
- real task runs
- real status updates
- external tool integrations
- richer timeline and output storage

### Analytics
- trend charts
- recommendation accuracy scoring
- route effectiveness over time
- cost and speed comparison

---

## Definition of done for the first demo

The first demo is done when a beginner can open the app and complete this full flow without needing the builder to explain every step:

1. click `New Task`
2. submit a knowledge-work task
3. see analyzed task fields
4. see a recommendation of `human`, `agent`, or `hybrid`
5. read a plain-language explanation
6. see whether governance approval is required
7. view a small set of eligible execution options
8. choose one option
9. launch the task
10. open task detail and see execution status and outcome summary

### The first demo should also meet these quality checks

- the screens feel connected, not like random pages
- the recommendation is understandable in plain language
- the governance result is visible and believable
- at least 3 sample tasks produce different recommendation paths
- at least 3 sample agents are available in the marketplace
- one demo task shows `human`
- one demo task shows `agent`
- one demo task shows `hybrid`
- one demo task requires approval
- one demo task can launch directly
- the user can follow the full product story without backend setup

---

## Suggested sample demo scenarios

Use these during development so the MVP has believable examples.

### Scenario 1: Internal research brief
- input: `Create internal research brief on AI competitors`
- likely result: `agent`
- why: clear task, low sensitivity, repeatable work

### Scenario 2: Executive memo draft
- input: `Draft executive memo on AI adoption strategy`
- likely result: `hybrid`
- why: needs judgment, executive audience, human review needed

### Scenario 3: Sensitive policy review
- input: `Review internal policy document for compliance gaps`
- likely result: `hybrid` or `human`
- why: higher sensitivity, governance required

These three examples are enough to prove the product concept.

## Recommended beginner tech stack for first build

For the first build, use a frontend-only app.

Recommended stack:

- React + Vite for the app
- Tailwind CSS for styling
- Hardcoded JavaScript or TypeScript data files for sample tasks, agents, governance rules, and execution records
- No backend in Phase 0 to Phase 2
- No database in Phase 0 to Phase 2
- No authentication in the first demo

Reason:

This lets the builder focus on the product flow first. The first goal is not to build infrastructure. The first goal is to make the Human-AgentOS demo understandable and clickable.

Backend, database, authentication, and real agent execution can be added later after the flow works.

---

## Final advice for building

If you are unsure what to build next, always ask:

`Does this directly help the user go from task submission to recommendation, governance, selection, launch, or tracking?`

If the answer is no, it probably should not be built yet.

The MVP wins by being:
- small
- understandable
- believable
- demo-ready

Not by being big.