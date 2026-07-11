> **Phase 22 status (2026-07-12):** This historical frontend-only document is superseded for `full_stack` mode by `docs/22_PHASE_22_PRODUCTION_PILOT.md`. `local_demo` remains supported for previews and judge-safe demonstrations. Phase 22 is single-Admin; it does not implement workspace membership or multi-user collaboration.

# 19_DEPLOYMENT_QA.md

## Purpose

This document is the static deployment and final QA checklist for the
`Human-AgentOS` submission build.

The app is a Vite frontend in `app/`. It does not need a backend,
authentication, database, serverless functions, or committed secrets.

## Recommended deployment target

Use Vercel for the simplest judge-facing static deployment.

Current deployment:

| Field | Value |
|---|---|
| Deployment platform | Vercel |
| Live demo URL | https://aabw-2026.vercel.app/ |
| Deployment QA date | 2026-07-08 |

Recommended Vercel settings:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `app` |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `dist` |

If the host builds from the repository root instead of `app`, use:

| Setting | Value |
|---|---|
| Install command | `npm --prefix app install` |
| Build command | `npm --prefix app run build` |
| Output directory | `app/dist` |

Netlify can use the same setup:

| Setting | Value |
|---|---|
| Base directory | `app` |
| Build command | `npm run build` |
| Publish directory | `dist` |

## Local deployment check

From the repository root:

```bash
npm --prefix app install
npm --prefix app run build
npm --prefix app run preview -- --host 127.0.0.1
```

On Windows PowerShell, `npm.cmd` can be used instead:

```bash
npm.cmd --prefix app install
npm.cmd --prefix app run build
npm.cmd --prefix app run preview -- --host 127.0.0.1
```

## Required validation before deploy

From the repository root:

```bash
npm --prefix app run build
npm --prefix app run validate:scenarios
npm --prefix app run test:e2e
npm --prefix app run lint
```

Expected scenario result:

```text
Result: 11/11 scenarios passed
```

## Post-deploy smoke test checklist

After the live URL is available:

- [ ] Open the live app URL.
- [ ] Confirm Dashboard loads first.
- [ ] Click `New Task`.
- [ ] Load the `Agent path` demo scenario.
- [ ] Click `Analyze Task`.
- [ ] Confirm Recommendation Result shows Agent routing and `Approved for launch`.
- [ ] Continue to Task Detail.
- [ ] Confirm Agent Runner defaults to `Deterministic demo runner`.
- [ ] Click `Run demo agent`.
- [ ] Confirm Agent output appears.
- [ ] Confirm `Agent output review` appears.
- [ ] Click `Accept output`.
- [ ] Confirm lifecycle and audit trail show the output review decision.
- [ ] Run the `Hybrid path` scenario and confirm Agent Runner waits for Human review.
- [ ] Run the `Blocked` scenario and confirm no Agent run or output review controls appear.

## Recorded deployment smoke summary

Manual smoke notes recorded on 2026-07-08 for
https://aabw-2026.vercel.app/:

- [x] Fresh load opens Dashboard: passed.
- [x] New Task -> Analyze Task -> Recommendation: passed.
- [x] Recommendation -> Continue to Detail: passed.
- [x] `task_001` Agent path -> Run demo agent -> Accept output: passed.
- [x] `task_002` Hybrid gate blocks Agent run until Human review approval: passed.
- [x] `task_003` blocked path exposes no Agent run or output review controls: passed.
- [x] Reset local demo state clears Agent output and review state: passed.
- [x] Optional live AI mode does not require a key by default: passed.
- [x] Incognito fresh load: passed.

## localStorage reset check

The deployed app stores demo session state only in the current browser through
`localStorage`.

Check reset behavior:

1. Run `task_001`.
2. Click `Run demo agent`.
3. Click `Accept output`.
4. Return to Dashboard.
5. Confirm the local session count shows one Agent output and one output review.
6. Click `Reset local demo state`.
7. Confirm the local session count returns to zero.
8. Reopen `task_001` and confirm the Agent Runner is ready but no saved output review appears.

## Optional live AI warning

The optional live AI draft mode is a browser-side adapter for local/demo
verification only. It can send task context to an external provider if a user
enters a session-only API key in the Agent Runner UI.

Do not enter production, shared, or sensitive API keys.

The app works fully without API keys. The default runtime is deterministic local
JavaScript, and no model controls routing, governance, blocked/unblocked
decisions, audit policy, or final approval.
