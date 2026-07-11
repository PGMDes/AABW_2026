# SymbiontOS Front-End Redesign Design

Date: 2026-07-12  
Status: Approved design awaiting written-spec review  
Reference: `reference/testing-os-main`  
Implementation approach: Incremental redesign on the existing React and Tailwind application

## Purpose

Redesign SymbiontOS so the UI follows the locked back-end flow:

`Submit task -> Analyze task -> Recommend human / agent / hybrid -> Explain why -> Apply governance -> Select execution option -> Launch -> Track outcome`

This remains a decision-first workforce control plane for knowledge work. It must not become a project-management system, HR system, open agent store, or full execution platform.

## Approved Direction

- Rebuild the complete primary experience while preserving current API contracts and useful front-end logic.
- Implement vertical slices rather than replacing the whole application in one release.
- Keep React and Tailwind CSS. Do not migrate to Chakra UI.
- Use `testing-os-main` as visual and interaction inspiration only.
- English-only V1; desktop-first with usable mobile primary actions.
- One V1 role: `Workspace Administrator`. Use authenticated identity when available; otherwise use `Workspace administrator` for local demo mode.
- Light mode is default. Dark mode is available by toggle.
- Visual direction is 80% enterprise control plane and 20% restrained AI energy.

## Navigation

The app has a fixed dark sidebar and a light content area.

1. `Dashboard`: action-required queue, lightweight summaries, recent activity.
2. `Tasks`: task portfolio with table and card views.
3. `Governance`: approval queue, blocked work, decisions, policy context.
4. `Marketplace`: approved agent catalog.
5. `Activity`: audit, launch, execution, and outcome events.

Sidebar footer contains system status, light/dark control, and user account area.

Task detail uses contextual navigation instead of extra sidebar items:

`Intake -> Analysis -> Decision -> Governance -> Selection -> Execution -> Outcome`

## Visual and Interaction System

- Blue/cyan: primary actions and analysis.
- Green: approved, completed, or safe to proceed.
- Amber: needs review or approval.
- Red: blocked, failed, or high risk.
- Human route: blue; Agent: cyan/teal; Hybrid: purple.
- Governance colors remain distinct from route colors.
- Shared Tailwind components: buttons, badges, cards, headers, form controls, tables, empty states, skeletons, toasts, dialogs, drawers, tabs, and step indicators.
- Use 150-250 ms motion only. Respect `prefers-reduced-motion`.
- Support keyboard usage, visible focus, and text/icon labels in addition to color.
- On small screens, collapse the sidebar and use task cards instead of unsafe table layouts.

## Dashboard

The Dashboard answers: “What needs my attention today?”

- Header contains neutral user greeting, action summary, and `New task`.
- `Needs your attention` prioritizes approval-required, blocked, ready-to-launch-without-selection, and failed tasks.
- Each item has one direct action: `Review`, `Resolve`, or `Select option`.
- Metrics: open tasks, approval queue, active executions, and Human/Agent/Hybrid mix. Show only data the back end supports; do not invent ROI or savings claims.
- Recent activity links creation, recommendations, approvals, launches, completions, and failures to task detail.

## Tasks

Default table columns:

`Task | Recommended path | Governance | Execution | Updated`

- Task shows title and a short description.
- Route shows Human/Agent/Hybrid and confidence when provided.
- Governance shows Approved, Approval required, or Blocked.
- Execution shows Draft, Ready to launch, Running, Completed, or Failed.
- Support search; filters for workflow, route, governance, execution, and sensitivity; sorting by latest update, deadline, urgency, or creation date.
- Support `Table / Card` view and save the local choice.
- Card view is optional on desktop and the responsive fallback on smaller screens.
- Do not build Kanban.

## Create Task Wizard

Dedicated page with persistent steps, `Save draft`, validation, and input preservation after recoverable errors.

### Step 1: Define the work

- `Task title`
- `Task description`
- `Expected output`
- `Audience`

### Step 2: Context and constraints

- `Deadline`
- `Urgency`
- `Sensitivity`
- `Budget range`
- Supporting files

### Step 3: Review and submit

- Summary of submitted data.
- Contextual validation of missing fields.
- `Back`, `Save draft`, and `Analyze task`.

Required API-aligned fields: `title`, `description`, `expectedOutput`, `audience`, `sensitivity`, `urgency`, and `budgetRange`. `deadline` is optional. Submit with an idempotency key to make retry safe.

### File support

V1 supports only `.txt` and `.md`. The UI supports drag-and-drop and `Upload files`, then shows filename, size, upload state, and a remove action. Validate type and configured size before upload. Upload errors must not clear form input. State that PDF, `.doc`, and `.docx` support is planned later, and reject them in V1.

## Decision Page

Present information from answer to action:

1. Task header: title, owner, sensitivity, deadline, workflow state, stage indicator.
2. Recommendation hero: Human/Agent/Hybrid, confidence, three fit scores, short explanation.
3. Explainability: top reasons, alternatives, risks, and route-changing conditions.
4. Governance snapshot: status, policy reasons, allowed/blocked paths, `Open Governance`.
5. Eligible execution shortlist: recommendation- and governance-allowed options only. Agent records show capability, trust, cost/speed, and data limits. Hybrid records divide human and agent responsibilities.
6. Next action: request approval, select option, or return to correct blocked input.

The user selects an execution option manually; the application never launches automatically.

## Governance, Marketplace, Execution, and Outcomes

### Governance

A dedicated page contains awaiting approval, blocked work, completed decisions, and policy context. Reviewers see reasons, allowed/blocked paths, a decision note, and explicit approve/reject actions. Tasks retain concise governance badges elsewhere.

### Marketplace

Marketplace is a curated capability catalog, not an open store. Agents display capability, trust tier, approval state, allowed sensitivity, estimated cost/speed, and operating limits.

`Approved catalog -> Capability match -> Governance filter -> Eligible shortlist -> User selection`

### Launch and tracking

Before launch, show selected option, human/agent responsibilities, governance result, estimates when available, and data limits. After launch, show a timeline: approved, launched, running/updated, completed/failed, outcome recorded. Display real API state only.

At terminal state, collect lightweight outcome data: status, actual time, actual cost, short quality note, and optional recommendation feedback if supported. `Activity` is an audit stream, not an analytics platform.

## Loading, Errors, and Accessibility

- Skeletons for page loading and action-level spinners for mutations.
- Brief analysis transition, then truthful API loading/error state.
- Actionable errors: `Retry`, `Save draft`, or `Refresh`.
- Prevent invalid UI actions while treating back end as final authority.
- Preserve input after recoverable API or upload errors.

## Implementation Sequence

1. Design tokens, shared components, theme, app shell.
2. Create Task wizard and `.txt`/`.md` upload.
3. Analysis and Decision page.
4. Governance review.
5. Option selection and launch confirmation.
6. Execution timeline and outcome capture.
7. Dashboard and Tasks redesign.
8. Marketplace and Activity redesign.
9. Responsive, accessibility, dark-mode, loading, and error verification.

## Deferred Scope

- PDF, `.doc`, and `.docx` ingestion.
- Open agent publishing, ratings, or monetization.
- Advanced analytics, ROI claims, and configurable role administration.
- Complex approval chains, Kanban/project management, and full downstream execution behavior.

## Acceptance Criteria

- A user completes intake, analysis, recommendation, governance, selection, launch, and outcome tracking without builder assistance.
- Supported `.txt` and `.md` files can be selected, validated, displayed, removed, and uploaded through supported back-end behavior.
- Unsupported PDF and Word types are clearly rejected.
- Governance explains and prevents invalid launches.
- Dashboard prioritizes action rather than decorative metrics.
- Tasks support table/card views with search, filters, and sorting.
- Light default, dark mode, desktop-first layout, mobile usability, loading, error, empty, blocked, and completed states are explicitly covered.
- The front end remains within locked V1 scope.
