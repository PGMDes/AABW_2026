# task_003 Blocked Policy

## Purpose

This example proves the safety path: sensitive, high-risk external work is blocked instead of being forced into an unsafe Agent launch.

## Task

- ID: `task_003`
- Title: `Prepare sensitive external strategy memo`
- Expected output: `External strategy memo`
- Audience: `external`
- Sensitivity: `high`
- Urgency: `high`
- Budget range: `medium`

## Expected Flow

| Step | Expected result |
|---|---|
| Recommendation | `Human` |
| Governance | `Blocked` |
| Selected option | none |
| Execution | `not_launched` |
| Lifecycle | `blocked` |
| Outcome | none |
| Agent Runner | blocked, no run button |
| Output review | not shown |

## Click Path

1. Open `Dashboard`.
2. Click `New Task`.
3. Choose `Blocked`.
4. Click `Analyze Task`.
5. Click `Continue to Detail`.
6. Optional: click `Confirm policy block`.

## What To Inspect

On `Recommendation Result`:

- governance says `Blocked`
- selected option area explains there is no eligible launch option

On `Task Detail`:

- no selected launch option appears
- execution does not launch
- lifecycle stops at `Blocked`
- outcome summary says no outcome is recorded because the task has not launched
- Agent Runner explains the policy block
- no Agent output acceptance controls appear
- audit trail records the policy stop

## Why This Matters

A serious control plane must be able to say no. The blocked scenario shows that SymbiontOS values safe routing and governance evidence over maximizing Agent usage.
