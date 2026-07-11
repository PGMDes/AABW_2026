# 08_DEMO_WALKTHROUGH.md

## Purpose

This document is the live demo guide for `SymbiontOS`.

Use it when presenting the project from GitHub or walking through the app live. It explains what to show, what each scenario proves, and how to describe the product in plain language.

## What SymbiontOS is

`SymbiontOS` is a decision-first workforce control plane for knowledge work.

In simple words: it helps a company decide whether a task should be done by a `Human`, an `Agent`, or a `Hybrid` human-agent team. It also explains the decision, checks governance, selects a safe execution option, and tracks what happened.

This demo is frontend-only. It uses sample data and local logic. There is no backend, database, auth, API, or external service integration yet.

## Target User

The target user is an Innovation / AI transformation lead.

This person wants to introduce AI agents into real work, but they need a controlled way to decide:

- where agents are safe
- where humans should stay in charge
- where a hybrid setup is best
- when governance should stop or review work
- whether the chosen route produced a usable outcome

## Core Problem

Companies are adding AI agents faster than their operating systems can manage them.

Without a control plane, teams make one-off decisions about agent use, governance, review, and ownership. That makes AI adoption hard to explain, hard to audit, and risky for sensitive work.

`SymbiontOS` solves the first slice of that problem: routing a knowledge-work task to the right execution path with clear reasoning and governance.

## Demo Storyline

Tell the story in this order:

1. The user starts on the Dashboard and sees the current task mix.
2. The user opens New Task and chooses a demo scenario.
3. The system analyzes the task and recommends `Human`, `Agent`, or `Hybrid`.
4. Governance either approves launch, requires Human review, or blocks the task.
5. The detail page shows the final task record: recommendation, governance, Human review, lifecycle, selected option, execution state, outcome, and audit trail.
6. Different scenarios prove that the product is not just pushing every task to an Agent.

## Demo Checklist

Before presenting:

- run `npm.cmd --prefix app run build`
- run `npm.cmd --prefix app run validate:scenarios`
- start the app with `npm.cmd --prefix app run dev -- --host 127.0.0.1`
- open the local Vite URL, usually `http://127.0.0.1:5173`

During the walkthrough:

- show Dashboard
- show the Dashboard `Walkthrough order` panel
- show the New Task scenario picker
- show `task_001` Agent path
- show `task_002` Hybrid path with Human review
- show `task_003` Blocked path
- show Task Detail lifecycle and audit trail
- show the Human review buttons on review-required or blocked tasks

## Recommended Click Path

### 1. Dashboard

Start on `Dashboard`.

Say:

`This is the operating view. It shows the demo task queue, governance status, launched work, and the Human / Agent / Hybrid mix.`

Point out:

- total demo tasks
- Approved for launch count
- Needs human review count
- Blocked count
- launched work
- Human / Agent / Hybrid mix
- Walkthrough order panel

### 2. New Task Scenario Picker

Click `New Task`.

Say:

`The scenario picker is a demo shortcut. It fills the same task intake form with known scenarios, but the task still goes through the normal frontend decision flow.`

Show the picker options:

- Agent path
- Hybrid path
- Blocked
- Human path
- Needs human review

### 3. task_001 Agent Path

Choose `Agent path` or keep the default scenario, then click `Analyze Task`.

On Recommendation Result, say:

`This is clear, low-sensitivity internal research. The system recommends Agent because the work is structured, repeatable, and safe for a trusted research agent.`

Click `Continue to Detail`.

On Task Detail, show:

- recommendation summary: `Agent`
- governance: `Approved for launch`
- selected option: `Research Analyst Agent`
- lifecycle reaches `Reviewed`
- outcome summary exists
- audit trail shows the decision and launch history

### 4. task_002 Hybrid + Human Review

Go back to `New Task`, choose `Hybrid path`, then click `Analyze Task`.

Say:

`This is leadership-facing work. The Agent can draft, but Human judgment should stay in the loop before launch.`

On Task Detail, show the `Human review` panel.

Click `Approve recommended option` if you want to show the review action live.

Then show:

- selected option stays `Executive Memo Agent + Human Reviewer`
- execution changes from pending approval to launched
- lifecycle advances
- audit trail records the Human review decision

### 5. task_003 Blocked Path

Go back to `New Task`, choose `Blocked`, then click `Analyze Task`.

Say:

`This is sensitive external strategy work. The important point is that the product does not force an unsafe Agent launch. Governance blocks the work and explains why.`

On Task Detail, show:

- governance status: `Blocked`
- selected option: no launch option
- lifecycle stops at `Blocked`
- outcome is not recorded because nothing launched
- audit trail explains the policy stop

Click `Confirm policy block` if you want to show the Human reviewer confirming the safe stop.

## What Each Scenario Proves

| Task | Scenario | What it proves |
|---|---|---|
| `task_001` | Agent path | Trusted Agent launch for clear, low-risk internal work. |
| `task_002` | Hybrid path | Agent draft plus Human review for leadership-facing work. |
| `task_003` | Blocked | Governance can stop work that is too sensitive or risky. |
| `task_004` | Human path | High-judgment strategy decisions should stay Human-owned. |
| `task_005` | Needs human review | Policy work can use Agent help but still needs Human validation. |

## How To Explain The Status Labels

### Agent

Use this when the task is clear, repeatable, low sensitivity, and has a trusted Agent option.

Say:

`Agent does not mean uncontrolled automation. It means this task is safe enough for a trusted Agent under the current governance rules.`

### Human

Use this when the task needs judgment, accountability, sensitive context, or strategic ownership.

Say:

`Human means the product is protecting judgment-heavy work instead of pretending every task belongs to automation.`

### Hybrid

Use this when an Agent can help, but a Human must review, approve, or own the final result.

Say:

`Hybrid is not a vague middle option. It means the Agent does useful work while a Human keeps control over quality and risk.`

### Needs human review

Use this when governance allows work to continue, but not without a person making a decision.

Say:

`Needs human review means the system found a useful path, but policy requires a Human checkpoint before launch or acceptance.`

### Blocked

Use this when governance decides no demo-safe launch path is available.

Say:

`Blocked is a successful safety behavior. The system is showing that it can stop risky work instead of launching it anyway.`

## What To Say On Task Detail

### Recommendation summary

Say:

`This section shows the route decision, confidence, and the main reasons. It is here so the user can understand why the system chose Human, Agent, or Hybrid.`

### Governance status

Say:

`This section shows what policy allows before launch. It separates the recommendation from the governance decision, which is important for trust.`

### Human review

Say:

`This panel is the demo version of a review checkpoint. A person can approve the recommended option, switch to a safer Human-led path, or confirm a policy block.`

### Execution lifecycle

Say:

`The lifecycle shows the current state of the task from recommendation through review, launch, completion, and outcome review.`

### Selected execution option

Say:

`This shows the actual option chosen after recommendation and governance. It might be an Agent, a Human role, or a Hybrid team.`

### Outcome summary

Say:

`This shows whether the work produced a useful result. In V1 it is lightweight sample data, not a real execution backend.`

### Audit trail

Say:

`The audit trail is the explainable record. It shows what the system did, what the Human reviewer did, and why the task is in its current state.`

## Presentation Notes

Keep the demo focused on the V1 promise:

- trusted decisioning
- explainable recommendations
- lightweight governance
- curated execution options
- visible lifecycle and audit trail

Do not present this as a full HR platform, full project management system, open marketplace, agent builder, or enterprise compliance product. Those are outside the current frontend-only MVP.
