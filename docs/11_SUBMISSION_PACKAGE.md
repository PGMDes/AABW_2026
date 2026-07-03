# 11_SUBMISSION_PACKAGE.md

## Devpost-ready project title

Human-AgentOS

## Short tagline

A decision-first workforce control plane that routes knowledge work to a Human, an Agent, or a Hybrid team with visible governance.

## Confirmed track

Founder Mode track

## Source code link

TODO: Add source code URL.

## Live demo URL

TODO: Add live demo URL.

## Demo video

TODO: Add demo video URL if recorded.

## Problem statement

Teams are adopting AI agents faster than their operating systems can manage them. The hard question is no longer only "Can an agent do this?" It is "Should this task go to a Human, an Agent, or a Hybrid team, and what governance should happen before launch?"

Today, those decisions are often made manually, inconsistently, and without a clear audit trail.

That creates risk:

- low-risk work may move too slowly
- sensitive work may be automated too aggressively
- leaders cannot easily explain why an Agent was selected
- governance approval is disconnected from execution
- outcomes are hard to review after launch

## Solution summary

Human-AgentOS is a frontend-only MVP demo for a decision-first workforce control plane for agentic work.

It helps an Innovation / AI transformation lead submit a knowledge-work task, see whether the work should go to a Human, an Agent, or a Hybrid team, understand why that route was recommended, apply governance, select a curated execution option, and review the lifecycle and audit trail.

The demo is intentionally narrow. It proves the workflow and control layer before adding backend infrastructure, authentication, databases, APIs, or real external agent execution.

## Founder Mode alignment

This project fits the Founder Mode track because it starts with a real operating pain: teams want to move faster with AI agents, but they need a way to decide where agents are safe, where humans should stay accountable, and where a hybrid team is the right wedge.

Human-AgentOS does not try to become a broad enterprise platform first. It focuses on one sharp workflow:

`submit task -> recommend Human / Agent / Hybrid -> apply governance -> review if needed -> run controlled Agent output when allowed -> review output -> accept, revise, or reroute -> record audit trail`

That focused wedge makes the product understandable, testable, and extensible. The current MVP proves the control layer before scaling into real integrations, shared storage, authentication, or production agent execution.

The build process also followed a Founder Mode pattern: use agentic development tools to move quickly, but keep deterministic scenario validation as a guardrail so speed does not break the demo story.

## How it works

1. The user starts on the Dashboard and sees the current Human / Agent / Hybrid task mix.
2. The user opens New Task and chooses a built-in demo scenario or creates a local custom task.
3. The frontend analyzes task fields like clarity, sensitivity, business risk, urgency, and budget pressure.
4. The recommendation engine scores Human, Agent, and Hybrid paths.
5. The app explains why the recommended route fits and shows alternatives.
6. Governance rules decide whether the task is Approved for launch, Needs human review, or Blocked.
7. The marketplace logic selects an eligible execution option when one is allowed.
8. Human review controls let a reviewer approve, switch to a safer Human-led path, or confirm a policy block.
9. The Agent Runner can generate deterministic local demo output only when governance and Human review allow Agent execution.
10. Agent output review lets a Human accept the output, request revision, or reroute final execution to a Human-led path.
11. Task Detail shows the final recommendation, governance result, selected option, Agent run, output review decision, lifecycle, outcome, and audit trail.

Direct navigation to Recommendation or Task Detail does not preload a hidden
demo task. Those screens show empty states until the user analyzes a task or
opens one from Dashboard.

## Key features

- Task intake for knowledge-work requests
- Deterministic recommendation engine for Human, Agent, and Hybrid routing
- Plain-language explanation of recommendation reasons and alternatives
- Governance status for Approved for launch, Needs human review, and Blocked paths
- Curated marketplace-style execution option selection
- Human review and override controls
- Controlled local Agent Runner with deterministic draft output
- Agent output review gate for Accept output, Request revision, and Reroute to Human decisions
- Lifecycle and audit trail for each task
- Built-in deterministic demo scenarios
- Browser-local custom tasks, Human review decisions, and Agent run outputs through `localStorage`
- Lightweight scenario validation command with `11/11` expected checks
- Static deployment readiness through Vite build output in `app/dist`

## Demo scenario walkthrough

Use the full walkthrough script in `docs/08_DEMO_WALKTHROUGH.md`. Use
`docs/14_DEMO_SCRIPT.md` for the tighter 2-minute and 5-minute judge scripts.

Recommended judge flow:

1. Start on Dashboard.
   Show the task counts, Human / Agent / Hybrid mix, and the "What this demo proves" panel.
2. Open New Task.
   Show the scenario picker and explain that each scenario uses the same frontend decision flow.
3. Run `task_001`.
   This demonstrates an Agent path that is Approved for launch with the Research Analyst Agent. In Task Detail, use `Run demo agent`, then use `Accept output` to show the post-output Human decision gate.
4. Run `task_002`.
   This demonstrates a Hybrid path where an Agent can draft but Human review is required before launch. The Agent Runner stays paused until the recommended option is approved.
5. Run `task_003`.
   This demonstrates a Blocked path where governance prevents unsafe launch and no Agent run button is exposed.
6. Open Task Detail.
   Show recommendation, governance, Human review, Agent run output, Agent output review, lifecycle, outcome, and audit trail.
7. Optional: create a custom local task.
   Explain that custom work persists only in the current browser through `localStorage`.

## What makes it agentic

Human-AgentOS is not just a static task list. It models the operating layer around agentic work:

- It decides whether a task is appropriate for Human, Agent, or Hybrid execution.
- It explains the decision in terms a non-technical leader can review.
- It applies governance before work launches.
- It selects eligible Agent or Human execution options from curated sample capability profiles.
- It supports Human review when policy says a person must stay in control.
- It includes a controlled local Agent Runner that only produces output after the route is allowed.
- It adds a post-output Human decision gate so Agent work can be accepted, revised, or rerouted before final use.
- It records lifecycle and audit information so agentic decisions can be reviewed later.

Important boundary: the current app demonstrates an agentic workflow control plane with a deterministic local demo runner, not production agent execution. It does not connect to real external agents or run real agent APIs yet.

## Models and tools used

The project used AI assistance during planning, implementation, and review:

- ChatGPT / Codex was used as an AI coding and product planning assistant.
- Codex in VSCode implemented code phases, documentation updates, validation checks, and scoped frontend polish.
- ChatGPT acted as advisor, orchestrator, reviewer, and product explanation partner across the build.
- The in-repo scenario validator was used as a regression guardrail to protect deterministic demo behavior.
- The validation loop kept the product wedge stable while the UI and submission package became clearer for judges.

Inside the app itself:

- No real external Agent execution API is connected yet.
- No OpenAI API key or other model API key is used by the frontend.
- The app uses deterministic local JavaScript logic to simulate recommendation, governance, marketplace selection, controlled Agent output, lifecycle, and audit behavior.
- The app demonstrates how an organization could control agentic work before connecting real execution systems.
- This means the AI usage is in the build workflow and product concept, while the submitted app itself stays frontend-only and deterministic.

If the submission form requires exact model names, use:

- TODO: Confirm exact ChatGPT / Codex model names used for development.

## Technical stack

- React
- Vite
- Tailwind CSS
- Plain JavaScript data and logic modules
- Browser `localStorage` for local custom tasks, Human review decisions, Agent run outputs, and Agent output review decisions
- Node-based scenario validation script
- Static frontend build output in `app/dist`

## Validation

Run these commands before submission:

```bash
npm.cmd --prefix app run build
npm.cmd --prefix app run validate:scenarios
```

Expected scenario validation result:

```text
Result: 11/11 scenarios passed
```

## Current limitations

- Frontend-only MVP demo
- No backend
- No authentication
- No database
- No APIs
- No real external agent execution; Agent Runner output is deterministic local demo output
- No durable shared storage
- Custom tasks, Human review decisions, Agent run outputs, and Agent output review decisions persist only in each browser through `localStorage`
- Built-in demo scenarios are deterministic sample data
- Source code, live demo, and demo video URLs still need final links

## Future roadmap

Possible next steps after the hackathon demo:

- Connect real agent execution providers behind the curated marketplace layer
- Add a secure backend/provider adapter for live model calls instead of putting API keys in the frontend
- Add backend storage for shared tasks, approvals, lifecycle events, and audit trails
- Add user accounts and role-based approval flows
- Expand governance rules into an editable policy configuration surface
- Add richer capability profiles for Agents and Human reviewer roles
- Add outcome analytics to compare recommendation quality over time
- Support organization-specific deployment settings and secure integrations

## Submission checklist

- [x] Confirm track: Founder Mode track
- [ ] Add source code URL
- [ ] Add live demo URL if deployed
- [ ] Add demo video URL if recorded
- [ ] Run `npm.cmd --prefix app run build`
- [ ] Run `npm.cmd --prefix app run validate:scenarios`
- [ ] Review `docs/08_DEMO_WALKTHROUGH.md`
- [ ] Review `docs/09_DEPLOYMENT.md`
- [ ] Review `docs/10_QA_NOTES.md`
- [ ] Review `docs/12_ARCHITECTURE.md`
- [ ] Review `docs/13_DOMAIN_MODEL.md`
- [ ] Review `docs/14_DEMO_SCRIPT.md`
