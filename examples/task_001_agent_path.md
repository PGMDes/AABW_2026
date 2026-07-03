# task_001 Agent Path

## Purpose

This example proves the clean Agent path: clear, low-sensitivity internal research can launch through a trusted Agent and still leave lifecycle and audit evidence.

## Task

- ID: `task_001`
- Title: `Create internal market research brief about AI competitors`
- Expected output: `2-page internal research brief`
- Audience: `internal`
- Sensitivity: `low`
- Urgency: `medium`
- Budget range: `low`

## Expected Flow

| Step | Expected result |
|---|---|
| Recommendation | `Agent` |
| Confidence | `85` |
| Governance | `Approved for launch` |
| Selected option | `Research Analyst Agent` |
| Execution | `launched` |
| Lifecycle | reaches `reviewed` before optional Agent Runner output |
| Agent Runner | available after launch |
| Output review | available after `Run demo agent` |

## Click Path

1. Open `Dashboard`.
2. Click `New Task`.
3. Keep `Agent path` selected.
4. Click `Analyze Task`.
5. Review the `Recommendation Result`.
6. Click `Continue to Detail`.
7. Click `Run demo agent`.
8. Click `Accept output`.

## What To Inspect

On `Recommendation Result`:

- recommendation badge says `Agent`
- governance says `Approved for launch`
- selected execution option is `Research Analyst Agent`

On `Task Detail`:

- `Agent Runner` shows deterministic local output after `Run demo agent`
- `Agent output review` appears only after output exists
- lifecycle gains Agent output and output review evidence
- audit trail records the Agent run and final Human output decision

## Why This Matters

This is the fastest path in the demo, but it is not uncontrolled automation. It still passes through recommendation, governance, selected option, execution, output review, lifecycle, and audit trail.
