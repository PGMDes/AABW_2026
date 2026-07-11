# 14_DEMO_SCRIPT.md

## Purpose

This is the judge-facing demo script for `SymbiontOS`.

Use it when presenting the project live or recording a short walkthrough. It keeps the story focused on the Founder Mode wedge: a serious control plane for agentic work, not a broad enterprise platform.

## Setup Before Demo

Run:

```bash
npm.cmd --prefix app run build
npm.cmd --prefix app run validate:scenarios
npm.cmd --prefix app run dev -- --host 127.0.0.1
```

Open the Vite URL, usually:

```text
http://127.0.0.1:5173
```

Expected validator result:

```text
Result: 11/11 scenarios passed
```

## 2-Minute Demo

### Goal

Show the core value quickly: SymbiontOS routes work, applies governance, and records evidence before agentic work scales.

### Script

1. Start on `Dashboard`.

Say:

`SymbiontOS is a decision-first workforce control plane. It helps an AI transformation lead decide whether knowledge work should go to a Human, an Agent, or a Hybrid team, then records the governance and audit trail.`

Point to:

- total tasks
- `Approved for launch`
- `Needs human review`
- `Blocked`
- Human / Agent / Hybrid mix

2. Click `New Task`.

Say:

`These scenarios prove the product is not blindly agent-first. The same frontend flow handles approved Agent work, Hybrid work with Human review, and blocked sensitive work.`

3. Keep `Agent path` selected and click `Analyze Task`.

Say:

`This task is clear, low-sensitivity internal research, so the system recommends Agent and explains why.`

4. On `Recommendation Result`, point to:

- recommended path: `Agent`
- confidence
- reasons
- governance: `Approved for launch`
- selected option: `Research Analyst Agent`

5. Click `Continue to Detail`.

Say:

`Task Detail is the control-plane record. It separates recommendation, governance, execution, lifecycle, and audit evidence.`

6. Click `Run demo agent`.

Say:

`The current runner is deterministic local demo output, not a live model call. The point is to show where controlled Agent output fits after governance allows launch.`

7. Click `Accept output`.

Say:

`The final Human gate records whether Agent output is accepted, needs revision, or should be rerouted to Human. That decision is added to lifecycle and audit trail.`

8. Briefly mention blocked path.

Say:

`The blocked scenario stops sensitive external work instead of forcing an unsafe Agent launch. That safety behavior is part of the product value.`

## 5-Minute Demo

### Goal

Show all three important routes: approved Agent, Hybrid with Human review, and Blocked policy stop.

### Exact Click Path

#### 1. Dashboard

Click path:

`Dashboard`

Show:

- task queue
- summary metrics
- `Walkthrough order`
- `What this demo proves`

Say:

`This is the operating view for agentic work. It shows the task mix, governance states, and where work is ready, waiting for Human review, or blocked.`

#### 2. task_001 Agent path

Click path:

`New Task` -> `Load demo scenario: Agent path` -> `Analyze Task` -> `Continue to Detail`

Show:

- `Agent` recommendation
- `Approved for launch`
- `Research Analyst Agent`
- lifecycle reaches `Reviewed`
- audit trail records recommendation, governance, selection, launch, completion, and review

Then click:

`Run demo agent` -> `Accept output`

Say:

`This is the clean Agent path. The task is structured, internal, and low sensitivity. Governance allows launch, the local demo Agent produces a draft, and a Human records the final output decision.`

#### 3. task_002 Hybrid with Human review

Click path:

`New Task` -> `Load demo scenario: Hybrid path` -> `Analyze Task` -> `Continue to Detail`

Show:

- `Hybrid` recommendation
- governance status `Needs human review`
- selected option `Executive Memo Agent + Human Reviewer`
- Agent Runner waiting for Human review

Then click:

`Approve recommended option`

Optional follow-up:

`Run demo agent` -> `Request revision`

Say:

`This is leadership-facing work. The Agent can help draft, but Human review is required before launch. After output exists, the Human can still request a revision instead of accepting it automatically.`

#### 4. task_003 Blocked policy stop

Click path:

`New Task` -> `Load demo scenario: Blocked` -> `Analyze Task` -> `Continue to Detail`

Show:

- recommendation path `Human`
- governance status `Blocked`
- no selected launch option
- no Agent run button
- lifecycle stops at `Blocked`
- audit trail explains the policy stop

Then click, if useful:

`Confirm policy block`

Say:

`This is the safety proof. Sensitive, high-risk external work is not pushed into an Agent path. The product can stop launch and leave evidence explaining why.`

#### 5. Close on architecture

Open GitHub docs or mention:

- [Architecture](12_ARCHITECTURE.md)
- [Domain model](13_DOMAIN_MODEL.md)
- [Examples](../examples/task_001_agent_path.md)

Say:

`The current MVP is frontend-only and deterministic. The architecture already shows where backend, database, queues, provider adapters, and observability would fit later without changing the core workflow.`

## Judge Q&A

### Is this a real production agent system?

Not yet. The current submission is a frontend-only MVP demo. It uses deterministic local JavaScript, sample data, and browser `localStorage`. There are no live model calls, backend APIs, secrets, or external agent providers in this version.

### Why is that still valuable?

The hard product question is not only whether an agent can produce text. It is whether a company can decide when an Agent should be used, when a Human should stay accountable, what governance should happen, and how the decision is recorded. This MVP proves that operating layer.

### What makes this Founder Mode?

It starts with a focused wedge instead of trying to build a large enterprise suite. The wedge is decisioning and governance for knowledge-work tasks. It is small enough to demo, clear enough to validate, and extensible into production infrastructure later.

### What is the primary user?

An Innovation / AI transformation lead who wants to introduce AI agents into real work without losing control, trust, or explainability.

### Why Human, Agent, and Hybrid?

Those are the three practical execution routes for agentic work. Some tasks are safe for a trusted Agent, some need Human ownership, and some benefit from Agent speed plus Human judgment.

### Why does the blocked scenario matter?

It proves the product is not automation for its own sake. A useful control plane must stop unsafe work when governance says launch is not allowed.

### What would you build next?

The next production step is a backend that stores tasks, recommendations, governance results, review decisions, Agent runs, output review decisions, and audit events. After that, provider adapters can connect real model or agent execution behind server-side credentials.

### Where would live AI calls go?

Behind a backend provider adapter. The frontend should never hold production API keys. The adapter would call OpenAI or another provider, normalize the result, and write Agent run output plus audit events.

### Where would a database fit?

The database would replace hardcoded demo data and browser-only `localStorage`. It would store shared task history, review decisions, execution records, Agent outputs, and audit events.

### What does `validate:scenarios` prove?

It proves the deterministic demo behavior still works. It checks the five baseline scenarios plus six Human review decision cases, and the expected healthy result is `11/11 scenarios passed`.

### What are the biggest current limitations?

- frontend-only
- no backend
- no auth
- no database
- no real external agent execution
- local state only in the current browser
- sample governance rules instead of organization-specific policies

### How do you avoid scope creep?

Keep the V1 boundary clear. SymbiontOS owns task routing, explainability, governance, controlled launch, output review, lifecycle, and audit trail. It does not become a full HR system, project management suite, open marketplace, or general workflow automation platform in the current MVP.
