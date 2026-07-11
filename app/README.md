# SymbiontOS Frontend App

This folder contains the React + Vite frontend demo for `SymbiontOS`.

The app is frontend-only. It uses sample data and local React state to show the MVP flow:

- submit a knowledge-work task
- analyze it
- recommend `Human`, `Agent`, or `Hybrid`
- apply governance
- select an execution option
- show lifecycle, audit trail, Human review, and outcome state

Custom tasks, Human review decisions, Agent outputs, and Agent output review decisions are saved in browser `localStorage` only. Use the Dashboard `Reset local demo state` button to clear them.

There is no backend, database, auth, app-owned API, committed secret, or required external service. Optional live AI draft mode can call a provider only after the user enters a session-only API key in the Agent Runner UI; policy decisions stay deterministic.

## Commands

Install dependencies:

```bash
npm.cmd install
```

Run locally:

```bash
npm.cmd run dev -- --host 127.0.0.1
```

Build:

```bash
npm.cmd run build
```

Validate demo scenarios:

```bash
npm.cmd run validate:scenarios
```

Run the browser E2E checks:

```bash
npm.cmd run test:e2e
```

Run lint:

```bash
npm.cmd run lint
```

Preview the built static app:

```bash
npm.cmd run preview -- --host 127.0.0.1
```

For the full GitHub entry point, live demo script, deployment guide, and QA notes, see the root `README.md`, `docs/08_DEMO_WALKTHROUGH.md`, `docs/09_DEPLOYMENT.md`, and `docs/10_QA_NOTES.md`.


## Decision Case Files experience

The frontend is organized around five product areas: **Action Queue**, **Cases**, **Governance**, **Catalog**, and **Activity**. Each task opens as one Decision Case File with seven governed stages: **Intake**, **Analysis**, **Decision**, **Governance**, **Selection**, **Execution**, and **Outcome**.

The recommendation is guidance rather than an automatic launch. A user must select an eligible option, governance must permit execution, and launch remains an explicit action. Local demo selections are stored in the browser; full-stack mode continues to use the existing authenticated API actions.
