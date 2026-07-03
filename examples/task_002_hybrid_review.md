# task_002 Hybrid Review

## Purpose

This example proves the Hybrid path: leadership-facing work can use Agent drafting, but Human review must approve launch first.

## Task

- ID: `task_002`
- Title: `Draft executive memo about AI adoption strategy`
- Expected output: `1-page executive memo`
- Audience: `internal_leadership`
- Sensitivity: `medium`
- Urgency: `high`
- Budget range: `medium`

## Expected Baseline Flow

| Step | Expected result |
|---|---|
| Recommendation | `Hybrid` |
| Governance | `Needs human review` |
| Selected option | `Executive Memo Agent + Human Reviewer` |
| Execution | `pending_approval` |
| Lifecycle | waits at `selected` |
| Agent Runner | waiting on Human review |

## Click Path

1. Open `Dashboard`.
2. Click `New Task`.
3. Choose `Hybrid path`.
4. Click `Analyze Task`.
5. Click `Continue to Detail`.
6. In `Human review`, click `Approve recommended option`.
7. Optional: click `Run demo agent`.
8. Optional: click `Request revision`.

## What To Inspect

Before Human approval:

- governance says `Needs human review`
- execution is `pending_approval`
- Agent Runner is paused
- no Agent output review actions are shown

After `Approve recommended option`:

- selected option remains `Executive Memo Agent + Human Reviewer`
- execution changes to `launched`
- lifecycle advances
- audit trail records the Human review decision

After optional Agent output:

- `Request revision` records that Human review did not accept the first draft automatically
- lifecycle and audit trail show the output review decision

## Why This Matters

Hybrid is not a vague middle state. It means the Agent can create leverage while a Human remains accountable for launch and final output.
