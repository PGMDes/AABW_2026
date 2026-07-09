# 11_SUBMISSION_PACKAGE.md

## Devpost-ready project title

Human-AgentOS

## Short tagline

A decision-first workforce control plane that routes knowledge work to a Human, an Agent, or a Hybrid team with visible governance.

## Confirmed track

Founder Mode track

## Submission field checklist

Use this list to close the final submission form.

- [x] Source code URL: [PGMDes/AABW_2026](https://github.com/PGMDes/AABW_2026)
- [x] Live demo URL: https://aabw-2026.vercel.app/
- [ ] Demo video URL: TODO, not recorded yet.
- [x] Screenshots: captured in `docs/assets/screenshots/`.
- [x] AI documentation: use the `Models and tools used` section below.
- [x] Selected project target: Founder Mode.
- [x] Exact model/tool names: ChatGPT, Codex in VSCode, deterministic local JavaScript, and optional live AI draft adapter default model `gpt-4.1`.

## Source code URL

[PGMDes/AABW_2026](https://github.com/PGMDes/AABW_2026)

## Live demo URL

https://aabw-2026.vercel.app/

## Demo video URL

TODO: not recorded yet.

## Screenshots

Use the repeatable capture command:

```bash
npm.cmd --prefix app run capture:screenshots
```

Screenshot package:

- `docs/assets/screenshots/01_dashboard.png` - Fresh Dashboard with task queue, metrics, and decision mix.
- `docs/assets/screenshots/02_recommendation_agent_path.png` - `task_001` Agent recommendation with governance approval and selected Research Analyst Agent.
- `docs/assets/screenshots/03_agent_runner_output_review.png` - `task_001` after deterministic Agent run with output-review controls visible.
- `docs/assets/screenshots/04_hybrid_human_gate.png` - `task_002` Hybrid path showing Agent run gated before Human approval.
- `docs/assets/screenshots/05_blocked_policy_path.png` - `task_003` blocked policy path with no Agent run or output-review controls.
- `docs/assets/screenshots/06_audit_lifecycle.png` - Lifecycle and audit evidence after Agent run and Human output review.

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
- Optional live AI draft adapter inside Agent Runner for local/demo verification
- Agent output review gate for Accept output, Request revision, and Reroute to Human decisions
- Lifecycle and audit trail for each task
- Built-in deterministic demo scenarios
- Browser-local custom tasks, Human review decisions, and Agent run outputs through `localStorage`
- Lightweight scenario validation command with `11/11` expected checks
- Static deployment readiness through Vite build output in `app/dist`

## Hackathon evidence docs

Use these docs as the main judge-facing evidence pack:

- [Executive Briefing](15_EXECUTIVE_BRIEFING.md)
- [Architecture](12_ARCHITECTURE.md)
- [Domain model](13_DOMAIN_MODEL.md)
- [Hackathon Benchmark Alignment](16_HACKATHON_BENCHMARK_ALIGNMENT.md)
- [Production Contracts](17_PRODUCTION_CONTRACTS.md)
- [Live Test Plan](18_LIVE_TEST_PLAN.md)
- [Deployment QA](19_DEPLOYMENT_QA.md)
- [Demo Script](14_DEMO_SCRIPT.md)

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

Important boundary: the current app demonstrates an agentic workflow control plane. The default runtime is deterministic local JavaScript. The optional live AI draft adapter is browser-side, demo/local only, and does not make governance, routing, blocked/unblocked, audit, or final approval decisions.

## Models and tools used

The project used AI assistance during planning, implementation, and review:

- ChatGPT acted as advisor, orchestrator, reviewer, and product explanation partner across the build.
- Codex in VSCode acted as the IDE coding agent for implementation, documentation updates, validation checks, and scoped frontend polish.
- The in-repo scenario validator was used as a regression guardrail to protect deterministic demo behavior.
- The validation loop kept the product wedge stable while the UI and submission package became clearer for judges.

Inside the app itself:

- Runtime default: deterministic local JavaScript for recommendation, governance, marketplace selection, controlled Agent output, lifecycle, and audit behavior.
- Runtime optional: live AI draft adapter inside Agent Runner. It can draft text only after the user enters a session-only API key in the browser UI.
- The optional live adapter is demo/local only and should not use production, shared, or sensitive API keys.
- The model never controls governance, routing, blocked/unblocked decisions, audit policy, or final approval.
- Human output review still controls `Accept output`, `Request revision`, and `Reroute to Human`.
- The app works fully without API keys or network access.

Exact model/tool names to list:

- ChatGPT: advisor, orchestrator, and reviewer.
- Codex in VSCode: coding agent.
- Runtime default: deterministic local JavaScript.
- Runtime optional: Agent Runner live AI draft adapter. The current adapter default model is `gpt-4.1` when live mode is used.

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
npm --prefix app run build
npm --prefix app run validate:scenarios
npm --prefix app run test:e2e
npm --prefix app run lint
npm --prefix app run capture:screenshots
```

Windows PowerShell equivalent:

```bash
npm.cmd --prefix app run build
npm.cmd --prefix app run validate:scenarios
npm.cmd --prefix app run test:e2e
npm.cmd --prefix app run lint
npm.cmd --prefix app run capture:screenshots
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
- No app-owned backend APIs
- No required external agent execution; the deterministic local runner is the default
- Optional live AI draft mode is browser-side and for local/demo verification only
- No durable shared storage
- Custom tasks, Human review decisions, Agent run outputs, and Agent output review decisions persist only in each browser through `localStorage`
- Built-in demo scenarios are deterministic sample data
- Demo video field still needs the final submission value

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
- [x] Add source code URL
- [x] Add live demo URL
- [ ] Add demo video URL
- [x] Add screenshots
- [x] Add AI documentation summary from this file
- [x] Add exact model/tool names from the final development session
- [ ] Run `npm --prefix app run build`
- [ ] Run `npm --prefix app run validate:scenarios`
- [ ] Run `npm --prefix app run test:e2e`
- [ ] Run `npm --prefix app run lint`
- [ ] Run `npm --prefix app run capture:screenshots`
- [ ] Review `docs/08_DEMO_WALKTHROUGH.md`
- [ ] Review `docs/09_DEPLOYMENT.md`
- [ ] Review `docs/19_DEPLOYMENT_QA.md`
- [ ] Review `docs/10_QA_NOTES.md`
- [ ] Review `docs/12_ARCHITECTURE.md`
- [ ] Review `docs/13_DOMAIN_MODEL.md`
- [ ] Review `docs/14_DEMO_SCRIPT.md`
- [ ] Review `docs/15_EXECUTIVE_BRIEFING.md`
- [ ] Review `docs/16_HACKATHON_BENCHMARK_ALIGNMENT.md`
- [ ] Review `docs/17_PRODUCTION_CONTRACTS.md`
- [ ] Review `docs/18_LIVE_TEST_PLAN.md`
