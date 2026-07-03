# Human-AgentOS Frontend App

This folder contains the React + Vite frontend demo for `Human-AgentOS`.

The app is frontend-only. It uses sample data and local React state to show the MVP flow:

- submit a knowledge-work task
- analyze it
- recommend `Human`, `Agent`, or `Hybrid`
- apply governance
- select an execution option
- show lifecycle, audit trail, Human review, and outcome state

Custom tasks and Human review decisions are saved in browser `localStorage` only. Use the Dashboard `Reset local demo state` button to clear them.

There is no backend, database, auth, API, or external service integration yet.

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

For the full GitHub entry point and live demo script, see the root `README.md` and `docs/08_DEMO_WALKTHROUGH.md`.
