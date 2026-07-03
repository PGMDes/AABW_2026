# 06_UI_SCREENS.md

## Purpose of this file

This file defines the exact MVP screens for `Human-AgentOS`.

It is written so a coding agent can build a first frontend in:
- `React`
- `Vite`
- `Tailwind CSS`

This is a beginner-friendly UI spec for the locked V1 only:
- decision-first workforce control plane
- knowledge-work tasks
- fake/sample data first
- frontend-only logic first
- no backend, no database, no auth

The UI should help the user move through this flow:

`submit task -> analyze task -> recommend human/agent/hybrid -> explain why -> apply governance -> select execution option -> launch -> track outcome`

---

## Main design rule

Each screen should do one clear job.

Do not try to build a huge enterprise app in the first pass. Build a simple, believable demo where each page clearly supports the core flow.

---

## Suggested route list

A simple first routing setup could look like this:

- `/` -> `Dashboard`
- `/tasks/new` -> `New Task / Task Intake`
- `/tasks/:taskId/analysis` -> `Task Analysis`
- `/tasks/:taskId/recommendation` -> `Recommendation Result`
- `/tasks/:taskId/governance` -> `Governance Check`
- `/tasks/:taskId/marketplace` -> `Marketplace Selection`
- `/tasks/:taskId/launch` -> `Launch Confirmation`
- `/tasks/:taskId/detail` -> `Task Detail / Execution Tracker`

For the very first build, it is also fine to combine some steps into fewer pages, but the screen responsibilities below should still stay clear.

---

## Shared layout

All screens should reuse a simple shared layout.

### Common layout pieces

- top navbar
- page title
- short helper text
- main content container
- optional side summary panel
- back button where helpful

### Suggested shared components

- `AppShell`
- `TopNav`
- `PageHeader`
- `SectionCard`
- `StatusBadge`
- `PrimaryButton`
- `SecondaryButton`
- `InfoBanner`
- `EmptyState`
- `ErrorState`

These shared pieces reduce duplicated work.

---

## 1. Dashboard

### Purpose of the screen

The dashboard gives the user a simple starting point.

It should answer:
- what this product does
- what tasks exist already
- where to start a new task

### What the user sees

- product title: `Human-AgentOS`
- short one-line description
- button: `New Task`
- small summary cards
- recent tasks list

### Components needed

- `DashboardSummaryCard`
- `RecentTaskList`
- `TaskListItem`
- `PrimaryButton`
- `PageHeader`

### Data objects used

- sample current user object
- `Task`
- optionally summary counts derived from tasks

### User actions

- click `New Task`
- click a recent task to open its detail page

### What happens after the action

- `New Task` -> go to `New Task / Task Intake`
- task row click -> go to the task detail page route `/tasks/:taskId/detail`

### Empty/error states if useful

#### Empty state
If there are no sample tasks yet:
- show message: `No tasks yet`
- show `Create your first task`

#### Error state
Not very important in the first demo. A simple fallback card is enough.

### Beginner-friendly implementation notes

- hardcode 3 sample tasks first
- hardcode summary numbers if needed
- do not build filtering, search, or charts yet
- keep this page visually simple

---

## 2. New Task / Task Intake

### Purpose of the screen

This is where the user creates the original work request.

This screen is the input step for everything else.

### What the user sees

A simple form with labeled fields:

- task title
- task description
- expected output
- deadline
- audience
- sensitivity
- urgency
- budget range

Optional helper text can explain why the app asks for these fields.

Phase 4 adds a small `Load demo scenario` dropdown above the form. It fills the
same task fields with one of the deterministic demo scenarios:

- `Agent path`
- `Human path`
- `Hybrid path`
- `Needs human review`
- `Blocked`

This is only a demo shortcut. It does not replace the intake form or create a
separate workflow.

### Components needed

- `TaskForm`
- `TextInput`
- `TextArea`
- `SelectInput`
- `DateInput`
- `FormSection`
- `ValidationMessage`
- `PrimaryButton`
- `SecondaryButton`

### Data objects used

- creates a `Task`

### User actions

- type into fields
- choose dropdown values
- click `Analyze Task`

### What happens after the action

1. validate required fields
2. create local `Task` object
3. save it in frontend state or sample store
4. move to `Task Analysis`

### Empty/error states if useful

#### Validation state
Show field-level messages like:
- `Task title is required`
- `Description is required`
- `Please select audience`

#### Helpful default values
To speed up the demo, the form preloads the original `task_001` agent happy
path. The scenario picker can load the other Phase 4 tasks into the same form.

### Beginner-friendly implementation notes

- start with controlled React state
- use one object like `formData`
- keep the selected scenario ID separate from the editable task fields
- keep dropdown options hardcoded first
- do not build autosave
- do not build attachments, templates, or advanced settings

---

## 3. Task Analysis

### Purpose of the screen

This screen shows that the system is analyzing the task before recommending a path.

It bridges the gap between user input and recommendation.

### What the user sees

The user should see either:

#### Version 1: very simple loading state
- `Analyzing task...`
- short explanation like:
  - `Reviewing task clarity, judgment, sensitivity, and risk`

#### Version 2: richer analysis screen
- original task summary
- analyzed attributes
- button to continue to recommendation

### Components needed

- `LoadingPanel`
- `TaskSummaryCard`
- `AnalysisFactorList`
- `FactorBadge`
- `PrimaryButton`

### Data objects used

- `Task`
- creates `TaskAnalysis`

### User actions

- click `Continue to Recommendation`
- optionally click `Back` to edit task

### What happens after the action

1. run `analyzeTask(task)`
2. create `TaskAnalysis`
3. store it in local state
4. route to `Recommendation Result`

### Empty/error states if useful

#### Loading state
Useful even if the logic is instant, because it makes the flow feel more real.

#### Failed analysis state
Simple message is enough:
- `We could not analyze this task`
- button: `Back to Edit Task`

### Beginner-friendly implementation notes

- this can first be a fake 1-second delay with `setTimeout`
- show low/medium/high labels clearly
- avoid too many factors on screen
- start with the 6 to 7 factors already defined in docs

---

## 4. Recommendation Result

### Purpose of the screen

This is the core product moment.

The screen should answer:
- what path is recommended
- how strong that recommendation is
- why it was chosen

### What the user sees

- recommendation card with `Human`, `Agent`, or `Hybrid`
- confidence value
- score summary
- top reasons
- alternatives
- next action button

### Components needed

- `RecommendationCard`
- `ConfidenceBadge`
- `ScoreBarGroup`
- `ReasonList`
- `AlternativePathsCard`
- `TaskSummaryCard`
- `PrimaryButton`
- `SecondaryButton`

### Data objects used

- `Task`
- `TaskAnalysis`
- `RecommendationRecord`
- `RecommendationExplanation`

### User actions

- review the recommendation
- click `Continue to Governance`
- optionally click `Edit Task`

### What happens after the action

- route to `Governance Check`

### Empty/error states if useful

#### No recommendation state
Show simple fallback:
- `Recommendation not available`
- button: `Run analysis again`

### Beginner-friendly implementation notes

- make the recommendation visually obvious
- use a large label like `Recommended: Agent`
- do not hide the reasons in accordions at first
- show scores as simple horizontal bars or numbers
- the main purpose is clarity, not visual complexity

---

## 5. Governance Check

### Purpose of the screen

This screen explains what is allowed after policy rules are applied.

It should answer:
- does this task need approval?
- is the recommended path allowed?
- is anything blocked?

### What the user sees

- governance status
- approval required or not
- policy reason
- allowed paths
- blocked paths
- next step guidance

### Components needed

- `GovernanceStatusCard`
- `ApprovalBanner`
- `AllowedPathsList`
- `BlockedPathsList`
- `PolicyReasonCard`
- `PrimaryButton`
- `SecondaryButton`

### Data objects used

- `Task`
- `TaskAnalysis`
- `RecommendationRecord`
- creates `GovernanceResult`

### User actions

- click `Continue to Marketplace`
- click `Back to Recommendation`

### What happens after the action

1. run governance logic
2. create `GovernanceResult`
3. route to `Marketplace Selection`

### Empty/error states if useful

#### Approval required state
Show:
- `Approval required before launch`
- short reason
- note that marketplace browsing can still continue if allowed

#### Recommended path blocked state
Show:
- `Recommended path is restricted by policy`
- safer alternatives

### Beginner-friendly implementation notes

- do not make this feel like a scary compliance screen
- keep the copy simple
- use colored status badges:
  - green for ready
  - yellow for approval required
  - red for blocked
- this screen should help the user understand what to do next

---

## 6. Marketplace Selection

### Purpose of the screen

This is where the user chooses how to actually execute the task.

It turns recommendation plus governance into a selectable next step.

### What the user sees

- selected task summary
- recommended path
- governance summary
- list of eligible execution options
- each option shown as a card

### Each option card should show

- name
- type: `Agent`, `Human`, or `Hybrid`
- capability tags
- trust tier
- fit summary
- limitations
- select button

### Components needed

- `MarketplaceOptionCard`
- `OptionTagList`
- `TrustTierBadge`
- `FitScoreBadge`
- `PolicyHint`
- `SelectionPanel`
- `PrimaryButton`

### Data objects used

- `Task`
- `RecommendationRecord`
- `GovernanceResult`
- `AgentProfile`
- `HumanRoleProfile`
- `MarketplaceOption`

### User actions

- compare options
- select one option
- click `Continue to Launch`

### What happens after the action

1. save selected option in frontend state
2. route to `Launch Confirmation`

### Empty/error states if useful

#### No eligible options
Show:
- `No eligible options found`
- explain whether it is because of policy or sample data limits
- suggest going back or selecting a safer path

#### Option blocked state
If a specific option is blocked:
- disable its action button
- show reason directly on the card

### Beginner-friendly implementation notes

- start with 3 to 4 sample options only
- do not build filters, sorting controls, or tabs first
- show one recommended badge on the best-fit option if helpful
- it is okay if all data is hardcoded in a sample file

---

## 7. Launch Confirmation

### Purpose of the screen

This screen is the final check before launch.

It should make the user feel confident about what they are about to do.

### What the user sees

- task title
- recommended path
- selected option
- governance status
- approval status
- launch button

### Components needed

- `LaunchSummaryCard`
- `SelectedOptionCard`
- `ApprovalStatusBadge`
- `LaunchChecklist`
- `PrimaryButton`
- `SecondaryButton`

### Data objects used

- `Task`
- `RecommendationRecord`
- `GovernanceResult`
- `MarketplaceOption`
- creates `ExecutionRecord`

### User actions

- click `Launch Task`
- click `Back to Marketplace`

### What happens after the action

1. create local `ExecutionRecord`
2. set launch status
3. route to `Task Detail / Execution Tracker`

### Empty/error states if useful

#### Approval pending
If approval is required:
- show button as disabled or replaced with `Await Approval`
- if using fake data, it is okay to add a demo-only `Approve and Continue` action

#### Blocked option
If selected option is blocked:
- do not allow launch
- show reason and route back to marketplace

### Beginner-friendly implementation notes

- do not overcomplicate this screen
- this can be a summary card plus one action button
- the main goal is clarity
- use fake execution IDs and fake timestamps first

---

## 8. Task Detail / Execution Tracker

### Purpose of the screen

This screen shows the full story of the task after launch.

It is the final state of the demo flow.

### What the user sees

- original task information
- task analysis summary
- recommendation result
- explanation reasons
- governance result
- human review decision panel when governance requires it
- selected option
- execution status
- lifecycle status
- audit trail
- output summary
- outcome review

### Components needed

- `TaskDetailHeader`
- `TaskInfoCard`
- `AnalysisSummaryCard`
- `RecommendationSummaryCard`
- `GovernanceSummaryCard`
- `HumanReviewDecisionPanel`
- `ExecutionStatusCard`
- `OutcomeReviewCard`
- `LifecycleStepList`
- `TimelineList`
- `AuditTrailList`
- `StatusBadge`

### Data objects used

- `Task`
- `TaskAnalysis`
- `RecommendationRecord`
- `RecommendationExplanation`
- `GovernanceResult`
- `HumanReviewDecision`
- `MarketplaceOption`
- `ExecutionRecord`
- `OutcomeReview`
- `LifecycleState`
- `AuditEvent`

### User actions

- review status
- review output summary
- optionally return to dashboard

### What happens after the action

- no complex action needed in the first demo
- later this screen can support retries or review submission, but not needed now

### Empty/error states if useful

#### Not launched yet
If task exists but has no execution record:
- show `Not launched yet`
- button: `Return to Launch`

#### No outcome yet
If launched but outcome not complete:
- show `Execution in progress`
- show sample timeline state

### Beginner-friendly implementation notes

- this screen can reuse many summary cards from earlier screens
- do not rebuild everything from scratch here
- start with one sample completed task
- this page is where the demo story feels complete

---

## First happy-path screen order

This is the first screen order that should work end to end.

1. `Dashboard`
2. `New Task / Task Intake`
3. `Task Analysis`
4. `Recommendation Result`
5. `Governance Check`
6. `Marketplace Selection`
7. `Launch Confirmation`
8. `Task Detail / Execution Tracker`

This is the most important flow to build first.

---

## Approval-required screen behavior

This is how the UI should behave when approval is required.

### Where it first shows up
Usually on `Governance Check`

### What the user should see
- clear message: `Approval required`
- reason in plain language
- allowed paths still visible
- marketplace can still show valid options if that makes the flow easier

### On `Launch Confirmation`
- launch button should not look fully ready
- show:
  - `Approval required before launch`
  - or demo-only action like `Approve and Launch`

### Beginner-friendly implementation note
For a first frontend demo, it is okay to fake approval with:
- `Pending approval`
- `Approved`
- `Rejected`

stored in local state.

Do not build a real approval system yet.

---

## Phase 5 human review controls

Phase 5 adds a `Human review decision` panel to `Task Detail / Execution
Tracker`.

Show this panel when governance returns:

- `needs_human_review`
- `blocked`

Do not show it for clean `approved_for_launch` tasks.

### Review-required panel actions

When governance returns `needs_human_review`, the panel should offer:

- `Approve recommended option`
- `Switch to human-led execution`
- `Block execution`

The `Switch to human-led execution` button should only be enabled when the
marketplace has an eligible human-led option and governance allows the `human`
path.

### Blocked panel actions

When governance returns `blocked`, the panel must show that launch is
unavailable.

Only enable a human-led fallback if governance still allows the `human` path.
If governance blocks every path, show only a safe review action such as
`Confirm policy block`.

### What changes after a decision

After the user records a decision:

- the selected option may change
- execution can move from `pending_approval` to `launched`
- execution can move to `blocked`
- lifecycle shows a human review step
- audit trail shows a `Human review decision` event

All of this remains frontend-only sample behavior.

---

## Phase 7 product walkthrough polish

Phase 7 keeps the same frontend-only flow and scenario behavior, but makes the
screens easier to present in a product demo.

### Dashboard polish

The dashboard now emphasizes operational summary metrics derived from the demo
task flows:

- total tasks
- `Approved for launch`
- `Needs human review`
- `Blocked`
- launched work
- Human / Agent / Hybrid recommendation mix

The task queue shows the recommended path, governance status, selected option
when one exists, and a short next-step hint. This makes it clear which tasks are
ready, waiting for Human review, or blocked.

### New Task scenario preview

The `Load demo scenario` picker now has a compact scenario preview. For the
selected scenario, it shows:

- scenario name
- expected recommendation: Human, Agent, or Hybrid
- expected governance result: `Approved for launch`, `Needs human review`, or `Blocked`
- what the scenario demonstrates
- expected selected option, or `No launch option` for the blocked scenario

The picker still only fills the same intake form. It does not create a separate
workflow.

### Task Detail polish

Task Detail now presents the final walkthrough record in clearer sections:

- recommendation summary
- analyzed attributes
- governance status with next-step guidance
- Human review panel when needed
- execution lifecycle as an ordered step list
- selected execution option
- execution status
- outcome summary
- audit trail

The blocked scenario must still show no selected launch option and no launched
execution. It should explain that governance stopped launch instead of making
the screen look broken.

### Label consistency

Use these user-facing labels consistently:

- `Human`
- `Agent`
- `Hybrid`
- `Approved for launch`
- `Needs human review`
- `Blocked`

Internal enum values can stay lower-case in code, but visible labels should be
plain and consistent.

---

## Phase 8 demo walkthrough support

Phase 8 keeps the same frontend-only behavior and scenario expectations, but
adds a compact `Walkthrough order` panel to the Dashboard.

### Dashboard walkthrough order panel

The panel is static presentation guidance. It does not add new state, routing,
decision logic, governance logic, scenario data, dependencies, backend, database,
auth, API, or external service integration.

It should remind the presenter to show:

- Dashboard metrics
- New Task scenario picker
- `task_001` Agent path
- `task_002` Hybrid path with Human review
- `task_003` Blocked path
- lifecycle and audit trail on Task Detail

This panel should stay compact so the Dashboard remains an operational demo
screen, not a documentation page.

---

## Phase 9 custom task and local session UI

Phase 9 keeps the deterministic demo scenarios but adds browser-local session
realism.

### Dashboard local session behavior

The Dashboard task queue should show both:

- built-in scenario tasks with a `Demo` badge
- user-created browser-local tasks with a `Local` badge

The summary metric for total tasks should make it clear how many are demo tasks
and how many are local tasks.

Add a small `Reset local demo state` control on the Dashboard. It should:

- clear local custom tasks
- clear persisted Human review decisions
- leave built-in demo scenarios untouched
- stay disabled or unobtrusive when there is no local state to clear

### New Task custom behavior

The New Task screen should still start with the demo scenario picker.

If the user edits a form field or clicks `Start custom task`, the task becomes a
local custom task. On submit, the app should:

- generate a local ID such as `custom_task_<timestamp>`
- save the task in browser `localStorage`
- route the task through the same task flow engine as demo tasks
- show the result on Recommendation and Task Detail
- add the task to the Dashboard queue with a `Local` badge

### Task Detail local behavior

Task Detail should show the same sections for local tasks as for demo tasks:

- Task summary
- recommendation summary
- analyzed attributes
- governance status
- Human review when needed
- lifecycle
- selected execution option
- outcome summary
- audit trail

If a local custom task has no eligible sample marketplace option, the UI should
explain that the current sample marketplace does not have a direct match yet.
This is different from a policy block.

### Persistence boundary

This is browser `localStorage` only. It is not a backend, database, API, auth
system, or durable product storage.

---

## Blocked-by-policy screen behavior

This is how the UI should behave when a path or option is blocked.

### On `Governance Check`
Show:
- what was blocked
- why it was blocked
- what safer paths remain

### On `Marketplace Selection`
If a specific option is blocked:
- disable the button
- show the block reason directly on the card

### On `Launch Confirmation`
If the selected option is blocked:
- do not allow launch
- show a clear message and send user back to marketplace

### Important UI rule
Blocked should not feel like a dead end.

The screen should guide the user toward:
- `Hybrid`
- or `Human`
- or a trusted alternative agent

---

## Difference between demo flow order and build order

The demo flow order is the order the user experiences screens in the final MVP.

The build order is the order a beginner developer can create screens in to see progress quickly.

These are not always the same.

For the final happy-path demo, the screen order should be:

1. `Dashboard`
2. `New Task / Task Intake`
3. `Task Analysis`
4. `Recommendation Result`
5. `Governance Check`
6. `Marketplace Selection`
7. `Launch Confirmation`
8. `Task Detail / Execution Tracker`

For early development, it is acceptable to create placeholder versions of some later screens first. However, before the MVP is considered demo-ready, the full happy-path order above must work end to end.

---

## Which screens should be built first

Build in this order.

## Tier 1: build first
1. `Dashboard`
2. `New Task / Task Intake`
3. `Recommendation Result`
4. `Task Detail / Execution Tracker`

These four screens already make the product feel real.

## Tier 2: build next
5. `Task Analysis`
6. `Governance Check`

These make the decision logic more understandable.

## Tier 3: build after that
7. `Marketplace Selection`
8. `Launch Confirmation`

These complete the end-to-end execution loop.

### Why this order works
It helps a beginner ship visible progress faster.
You can show a clickable demo before every screen is perfect.

---

## What can be hardcoded first

Hardcode these things before any backend work.

### Hardcoded page data
- current user name and role
- recent sample tasks
- task summary counts

### Hardcoded form choices
- audience options
- sensitivity options
- urgency options
- budget options

### Hardcoded recommendation outputs
- one `agent` example
- one `hybrid` example
- one `human` example

### Hardcoded governance outputs
- one happy path
- one approval-required path
- one blocked path

### Hardcoded marketplace options
- 3 sample agents
- 1 sample human reviewer
- 1 sample hybrid option

### Hardcoded execution states
- `draft`
- `analyzed`
- `recommended`
- `approval_required`
- `ready_to_launch`
- `launched`
- `completed`

---

## Suggested component list by file idea

This is not required, but it gives a practical React shape.

### Page components
- `DashboardPage`
- `NewTaskPage`
- `TaskAnalysisPage`
- `RecommendationPage`
- `GovernancePage`
- `MarketplacePage`
- `LaunchPage`
- `TaskDetailPage`

### Reusable UI components
- `TaskSummaryCard`
- `RecommendationCard`
- `GovernanceStatusCard`
- `MarketplaceOptionCard`
- `StatusBadge`
- `ReasonList`
- `ScoreBarGroup`
- `PageHeader`
- `EmptyState`
- `ErrorState`

### Sample data files
- `sampleTasks.js`
- `sampleAgents.js`
- `sampleHumanRoles.js`
- `sampleExecutionRecords.js`

### Simple logic files
- `recommendationEngine.js`
- `governanceRules.js`

---

## Common UI mistakes to avoid

## 1. Putting too much on one screen
Do not turn one page into a giant dashboard with every detail.

Each screen should focus on one step.

---

## 2. Hiding the main answer
The recommendation should be the biggest thing on the recommendation page.

Do not make users hunt for:
- `Human`
- `Agent`
- `Hybrid`

---

## 3. Making governance language too technical
Do not show complicated policy jargon.

Use plain messages like:
- `Approval required because this is leadership-facing work`
- `Agent-only is blocked because this task is high sensitivity`

---

## 4. Making cards too dense
Agent cards and result cards should be easy to scan.

Prefer:
- short bullet-style facts
- clear badges
- short labels

Avoid giant paragraphs inside cards.

---

## 5. Forgetting empty states
Even a demo app should handle:
- no tasks
- no eligible options
- task not launched
- no outcome yet

These states make the app feel more complete.

---

## 6. Building filters and advanced controls too early
Do not build:
- search
- advanced filtering
- sort controls
- multi-step modals
- tab-heavy layouts

until the core flow works.

---

## 7. Making blocked states feel broken
If something is blocked, the UI should explain:
- what is blocked
- why
- what to do next

Never just show:
- `error`
- `not allowed`

---

## 8. Using inconsistent labels
Use the same labels everywhere.

Examples:
- always use `Agent`, not sometimes `AI Worker`
- always use `Hybrid`, not sometimes `Mixed Mode`
- always use `Approval required`, not sometimes `Needs gate review`

Consistency helps beginners build and debug faster.

---

## 9. Styling too early instead of proving the flow
Tailwind styling matters, but not before the user journey works.

First make sure:
- buttons go to the right screens
- sample data renders correctly
- recommendation and governance states are clear

Then polish spacing and colors.

---

## 10. Rebuilding the same summary information over and over
Reuse components.

For example:
- `TaskSummaryCard` can appear on analysis, recommendation, governance, marketplace, launch, and detail screens

This saves time and keeps the UI consistent.

---

## Suggested happy-path sample for screen testing

Use this sample task first:

- title: `Create internal market research brief about AI competitors`
- audience: `internal`
- sensitivity: `low`
- urgency: `medium`
- expected recommendation: `Agent`
- expected governance result: `approved_for_launch`
- expected selected option: `Research Analyst Agent`
- expected final status: `completed`

This single example is enough to build the first full clickable demo.

---

## Final build reminder

If a screen does not help the user move through this path, it probably does not belong in the first build:

`task intake -> analysis -> recommendation -> governance -> marketplace -> launch -> tracking`

For V1, simple screens with clear roles are better than ambitious screens with too many features.
