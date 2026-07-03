# Human-AgentOS

`Human-AgentOS` is a frontend-only MVP demo for a decision-first workforce control plane.

It helps an Innovation / AI transformation lead decide whether a knowledge-work task should be handled by a `Human`, an `Agent`, or a `Hybrid` human-agent team. The demo also shows why the recommendation was made, what governance allows, which execution option was selected, and what happened after launch.

## Current Scope

This repository is intentionally scoped to a clickable frontend demo:

- React + Vite app in `app/`
- hardcoded sample tasks, marketplace options, governance results, lifecycle states, and audit events
- deterministic recommendation, governance, marketplace, execution, lifecycle, and scenario validation logic
- localStorage persistence for browser-local custom tasks and Human review decisions
- no backend
- no database
- no authentication
- no API or external service integration

## Tech Stack

- React
- Vite
- Tailwind CSS
- Plain JavaScript data and logic modules
- Lightweight scenario validation script with no added test framework

## Run Locally

Install dependencies:

```bash
npm.cmd --prefix app install
```

Start the local dev server:

```bash
npm.cmd --prefix app run dev -- --host 127.0.0.1
```

Open the URL printed by Vite, usually:

```text
http://127.0.0.1:5173
```

If you are not on Windows, use `npm` instead of `npm.cmd`.

## Build

```bash
npm.cmd --prefix app run build
```

## Scenario Validation

```bash
npm.cmd --prefix app run validate:scenarios
```

The validator checks the baseline demo scenarios and the Human review decision scenarios. Phase 6 currently expects `11/11 scenarios passed`.

## Phase Summary

- Phase 0: React/Vite frontend skeleton and happy path
- Phase 1: recommendation engine
- Phase 2: governance, marketplace, execution, and task flow engines
- Phase 3: lifecycle and audit trail
- Phase 4: decision scenario coverage
- Phase 5: Human review and override controls
- Phase 6: scenario validation guardrails
- Phase 7: product walkthrough polish
- Phase 8: GitHub-ready README, live demo walkthrough, demo checklist, and compact dashboard walkthrough order
- Phase 9: custom local tasks, persisted Human review decisions, Demo/Local labels, and reset local demo state

## Local Demo Persistence

Custom tasks and Human review decisions persist in browser `localStorage` only. They are local to the current browser and can be cleared with `Reset local demo state` on the Dashboard.

The built-in demo scenarios are still fixed sample data, and `validate:scenarios` checks only those deterministic scenarios.

## Important Demo Scenarios

| Task | Path | Governance | What it proves |
|---|---|---|---|
| `task_001` | Agent | Approved for launch | Clear, low-risk internal research can launch with a trusted Agent. |
| `task_002` | Hybrid | Needs human review | Leadership-facing drafting can use an Agent draft while a Human stays in control. |
| `task_003` | Human | Blocked | Sensitive external work is stopped by governance instead of launching unsafely. |
| `task_004` | Human | Needs human review | High-judgment strategy work belongs with a Human owner. |
| `task_005` | Hybrid | Needs human review | Policy review can use Agent help, but Human validation is required. |

## Demo Walkthrough

Use [docs/08_DEMO_WALKTHROUGH.md](docs/08_DEMO_WALKTHROUGH.md) for the live presentation script, click path, checklist, and talking points.

## Useful Docs

- [Product spec](docs/00_PRODUCT_SPEC.md)
- [MVP build plan](docs/01_MVP_BUILD_PLAN.md)
- [UI screen spec](docs/06_UI_SCREENS.md)
- [Demo data guide](docs/07_DEMO_DATA.md)
- [Phase 8 demo walkthrough](docs/08_DEMO_WALKTHROUGH.md)
