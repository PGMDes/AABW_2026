> **Phase 22 status (2026-07-12):** This historical frontend-only document is superseded for `full_stack` mode by `docs/22_PHASE_22_PRODUCTION_PILOT.md`. `local_demo` remains supported for previews and judge-safe demonstrations. Phase 22 is single-Admin; it does not implement workspace membership or multi-user collaboration.

# 18_LIVE_TEST_PLAN.md

## Purpose

This plan documents manual operational MVP tests for `Human-AgentOS`.

Use it when recording a demo video, preparing judge evidence, or checking that the frontend behavior still matches the repository docs.

## Setup

From the repository root:

```bash
npm.cmd --prefix app run build
npm.cmd --prefix app run validate:scenarios
npm.cmd --prefix app run dev -- --host 127.0.0.1
```

Open the Vite URL printed in the terminal, usually:

```text
http://127.0.0.1:5173
```

Expected validator ending:

```text
Result: 11/11 scenarios passed
```

## Automated E2E verification

Run the Playwright browser tests from the repository root:

```bash
npm.cmd --prefix app run test:e2e
```

This command starts the Vite app on a local Playwright test port and verifies:

- fresh load opens Dashboard and keeps Recommendation / Task Detail empty until user action
- `task_001` Agent path can run demo Agent output and accept it
- `task_002` Hybrid path waits for Human review before Agent output can run
- `task_003` Blocked path has no Agent run or output review controls
- reset local demo state clears saved Agent output and output review state

These tests strengthen technical evidence for judges, but they do not replace
the manual video or screenshot walkthrough when presentation evidence is needed.

## Evidence capture checklist

Capture screenshots or video clips of:

- terminal output for build success
- terminal output for `Result: 11/11 scenarios passed`
- terminal output for the Playwright `test:e2e` run
- Dashboard summary metrics and task queue
- New Task scenario picker
- Recommendation Result for each tested scenario
- Task Detail recommendation, governance, Human review, Agent Runner, lifecycle, outcome, and audit trail sections
- blocked task showing no Agent run button
- Dashboard after local state reset

## Test 1: `task_001` Agent path

Manual steps:

1. Open `Dashboard`.
2. Click `New Task`.
3. Select `Agent path`.
4. Click `Analyze Task`.
5. On `Recommendation Result`, confirm the recommendation is `Agent`.
6. Confirm governance is `Approved for launch`.
7. Confirm selected option is `Research Analyst Agent`.
8. Click `Continue to Detail`.
9. Confirm execution status is launched and lifecycle reaches `Reviewed`.
10. Click `Run demo agent`.
11. Confirm deterministic local Agent output appears.
12. Click `Accept output`.
13. Confirm `Agent output review` records `Accepted for use`.

Expected result:

- `task_001` recommends `Agent`.
- Confidence is `85`.
- Governance status is `Approved for launch`.
- Selected option is `Research Analyst Agent`.
- Agent Runner is available only because the task launched.
- Output review decision appears in lifecycle and audit trail.

Evidence to capture:

- Recommendation Result showing `Agent`, `85% confidence`, `Approved for launch`, and `Research Analyst Agent`.
- Task Detail after `Run demo agent` showing local deterministic output.
- Task Detail after `Accept output` showing the output review decision and audit event.

## Test 2: `task_002` Hybrid review path

Manual steps:

1. Open `New Task`.
2. Select `Hybrid path`.
3. Click `Analyze Task`.
4. Confirm the recommendation is `Hybrid`.
5. Confirm governance is `Needs human review`.
6. Click `Continue to Detail`.
7. Confirm selected option is `Executive Memo Agent + Human Reviewer`.
8. Confirm Agent Runner says it is waiting for Human review.
9. Click `Approve recommended option`.
10. Confirm execution changes to launched.
11. Optional: click `Run demo agent`, then click `Request revision`.

Expected result:

- `task_002` recommends `Hybrid`.
- Governance requires Human review before launch.
- The Agent Runner does not run before Human approval.
- After approval, the Hybrid option launches and audit trail records the Human review decision.
- If output is generated, `Request revision` records a Human output review decision without auto-regenerating output.

Evidence to capture:

- Task Detail before approval showing `Needs human review` and Agent Runner waiting.
- Task Detail after approval showing launch state and Human review audit evidence.
- Optional output review state showing `Needs revision`.

## Test 3: `task_003` Blocked path

Manual steps:

1. Open `New Task`.
2. Select `Blocked`.
3. Click `Analyze Task`.
4. Confirm the recommendation is `Human`.
5. Confirm governance is `Blocked`.
6. Click `Continue to Detail`.
7. Confirm there is no selected execution option.
8. Confirm execution status is `not_launched` before any Human confirmation.
9. Confirm lifecycle stops at `Blocked`.
10. Confirm the Agent Runner shows `Policy blocked`.
11. Confirm there is no `Run demo agent` button.
12. Optional: click `Confirm policy block`.

Expected result:

- `task_003` recommends `Human` but governance blocks launch.
- No Agent, Human, or Hybrid option launches.
- No Agent output is generated.
- Audit trail explains the policy stop.

Evidence to capture:

- Recommendation Result showing `Blocked`.
- Task Detail selected execution option panel showing no launch option.
- Agent Runner panel showing `Policy blocked` with no run button.
- Lifecycle and audit trail showing the blocked policy stop.

## Test 4: Reset local state

Manual steps:

1. Create any local evidence first, such as running `task_001` Agent output or approving `task_002`.
2. Return to `Dashboard`.
3. Confirm the local session line shows nonzero local state counts.
4. Click `Reset local demo state`.
5. Confirm the app stays on or returns to `Dashboard`.
6. Confirm custom tasks, Human reviews, Agent outputs, and output reviews show zero local counts.
7. Open `Task Detail` directly from navigation if available and confirm no old analyzed task is selected unless you choose one from the task queue.

Expected result:

- Browser-local demo state is cleared.
- Built-in demo scenarios remain visible.
- The active analyzed task and selected task are cleared.
- The app returns to Dashboard context.

Evidence to capture:

- Dashboard before reset showing local session counts.
- Dashboard after reset showing zero local session counts.
- Built-in demo task queue still present.

## Test 5: `localStorage` persistence

Manual steps:

1. Open `New Task`.
2. Click `Start custom task`.
3. Enter a title and description.
4. Click `Analyze Task`.
5. Return to `Dashboard`.
6. Confirm the new task appears with a `Local` badge.
7. Refresh the browser.
8. Confirm the local task still appears.
9. Run `task_001`, click `Run demo agent`, then refresh.
10. Confirm the Agent output remains visible for `task_001`.
11. Click `Reset local demo state`.
12. Refresh again.
13. Confirm the local task and saved Agent output are gone.

Expected result:

- Custom local tasks persist in the same browser until reset.
- Agent run output and review decisions persist in the same browser until reset.
- Persistence is browser-local only and is not shared production storage.

Evidence to capture:

- Dashboard showing a `Local` task before refresh.
- Same `Local` task after refresh.
- `task_001` Agent output still visible after refresh.
- Dashboard after reset and refresh showing local state cleared.

## Test 6: No blocked Agent launch

Manual steps:

1. Reset local demo state.
2. Open `New Task`.
3. Select `Blocked`.
4. Click `Analyze Task`.
5. Click `Continue to Detail`.
6. Inspect `Selected execution option`.
7. Inspect `Execution status`.
8. Inspect `Agent Runner`.
9. Inspect `Agent output review`.

Expected result:

- Selected execution option is absent because governance blocked launch.
- Execution does not launch.
- Agent Runner status is blocked.
- No `Run demo agent` button appears.
- Agent output review does not appear because there is no valid Agent output.
- Confirming the policy block still does not create an Agent launch.

Evidence to capture:

- Selected execution option panel with no launch option.
- Execution status showing no launch.
- Agent Runner panel with blocked state and no run button.
- Absence of Agent output review controls.

## Manual test summary

| Test | Scenario | Expected proof |
|---|---|---|
| `task_001` Agent path | Approved low-risk internal research | Trusted Agent launch, local output, Human output acceptance. |
| `task_002` Hybrid review path | Leadership-facing memo | Agent help pauses until Human review approves launch. |
| `task_003` Blocked path | Sensitive external strategy memo | Governance stops unsafe launch and records evidence. |
| Reset local state | Browser-local state reset | Local demo state clears while built-in scenarios remain. |
| `localStorage` persistence | Local custom task and Agent run | Demo state survives refresh in the same browser only. |
| No blocked Agent launch | Blocked scenario recheck | No run button, no output review, no launched execution. |
