# 17_PRODUCTION_CONTRACTS.md

## Purpose

This document proposes future production contracts for `Human-AgentOS`.

These contracts are not implemented in the current MVP. The current app uses frontend local state only: source-controlled demo data, deterministic JavaScript logic, an optional browser-side live AI draft adapter, and browser `localStorage` for local custom tasks, Human review decisions, Agent run outputs, and Agent output review decisions.

The goal of this document is to show how the same workflow could become production infrastructure without changing the product promise.

## Current boundary

Current MVP:

- React + Vite frontend
- deterministic local task flow logic
- optional live AI draft adapter after governance allows Agent Runner use
- hardcoded demo data
- browser `localStorage`
- no backend
- no database
- no authentication
- no app-owned backend APIs
- no queues
- no required live model calls
- no production provider adapter
- no committed secrets

The optional live AI draft adapter is execution-only. It can produce draft text,
but the deterministic product logic still controls recommendation, governance,
blocked status, Human review gates, lifecycle policy, and audit policy. The
session API key is entered in the UI and is not stored in `localStorage`.

Future production infrastructure should preserve the same visible flow:

`task intake -> recommendation -> governance -> Human review -> execution -> Agent run -> output review -> audit trail`

## Backend API route proposal

These routes are proposed future contracts, not current files.

| Route | Method | Purpose |
|---|---:|---|
| `/api/tasks` | `POST` | Create a task from intake fields. |
| `/api/tasks` | `GET` | List tasks visible to the current user or organization. |
| `/api/tasks/:taskId` | `GET` | Return one task with latest recommendation, governance, execution, and audit summary. |
| `/api/tasks/:taskId` | `PATCH` | Update editable task fields before launch. |
| `/api/tasks/:taskId/recommendations` | `POST` | Generate or refresh a recommendation record. |
| `/api/tasks/:taskId/governance` | `POST` | Evaluate policy and create a governance result. |
| `/api/tasks/:taskId/human-review-decisions` | `POST` | Record approve, switch to Human, block, or confirm-policy-block decisions. |
| `/api/tasks/:taskId/executions` | `POST` | Launch an allowed execution option or create a pending execution record. |
| `/api/tasks/:taskId/agent-runs` | `POST` | Enqueue or start an Agent run after launch is allowed. |
| `/api/tasks/:taskId/agent-runs/:agentRunId` | `GET` | Return Agent run status and normalized output. |
| `/api/tasks/:taskId/output-review-decisions` | `POST` | Record accept output, request revision, or reroute to Human. |
| `/api/tasks/:taskId/audit-events` | `GET` | Return the immutable audit event stream for one task. |

## Database schema proposal

The tables below are a future schema sketch. Field names are intentionally plain so the contract stays easy to review.

### `tasks`

Stores the work request.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `organization_id` | `uuid` | Tenant or organization boundary. |
| `created_by_user_id` | `uuid` | User who submitted the task. |
| `title` | `text` | Task title. |
| `description` | `text` | Task details. |
| `expected_output` | `text` | Desired deliverable. |
| `deadline` | `date` | Requested deadline. |
| `audience` | `text` | Internal, leadership, external, or future enum. |
| `sensitivity` | `text` | Low, medium, high, or future enum. |
| `urgency` | `text` | Low, medium, high, or future enum. |
| `budget_range` | `text` | Low, medium, high, or future enum. |
| `status` | `text` | Submitted, recommended, pending review, launched, blocked, completed. |
| `created_at` | `timestamp` | Creation time. |
| `updated_at` | `timestamp` | Last update time. |

### `recommendations`

Stores the routing answer separately from execution.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `task_id` | `uuid` | Related task. |
| `recommended_path` | `text` | Human, Agent, or Hybrid. |
| `confidence` | `integer` | 0 to 100. |
| `human_fit_score` | `integer` | Human score. |
| `agent_fit_score` | `integer` | Agent score. |
| `hybrid_fit_score` | `integer` | Hybrid score. |
| `top_reasons_json` | `json` | Plain-language reasons. |
| `key_factors_json` | `json` | Task attributes used by scoring. |
| `alternatives_json` | `json` | Runner-up paths and reasons. |
| `created_at` | `timestamp` | Recommendation time. |
| `created_by` | `text` | System, model, or versioned engine name. |

### `governance_results`

Stores the policy decision after recommendation.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `task_id` | `uuid` | Related task. |
| `recommendation_id` | `uuid` | Recommendation evaluated by policy. |
| `status` | `text` | Approved for launch, Needs human review, or Blocked. |
| `approval_required` | `boolean` | Whether review is required. |
| `policy_reason` | `text` | Judge-facing explanation. |
| `approval_reasons_json` | `json` | Specific reasons review is required. |
| `allowed_paths_json` | `json` | Paths allowed by policy. |
| `blocked_paths_json` | `json` | Paths blocked by policy. |
| `policy_flags_json` | `json` | Rule flags triggered by the task. |
| `policy_version` | `text` | Version of policy rules used. |
| `created_at` | `timestamp` | Governance evaluation time. |

### `human_review_decisions`

Stores pre-launch Human decisions.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `task_id` | `uuid` | Related task. |
| `governance_result_id` | `uuid` | Policy result being reviewed. |
| `reviewer_user_id` | `uuid` | Human reviewer. |
| `action` | `text` | Approve recommended, switch to Human, block execution, confirm policy block. |
| `decision_status` | `text` | Approved or blocked. |
| `selected_path` | `text` | Human, Agent, Hybrid, or null. |
| `selected_option_id` | `uuid` | Chosen execution option, if any. |
| `reason` | `text` | Human-readable decision reason. |
| `decided_at` | `timestamp` | Decision time. |

### `execution_records`

Stores what actually launched or why launch paused.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `task_id` | `uuid` | Related task. |
| `recommendation_id` | `uuid` | Recommendation context. |
| `governance_result_id` | `uuid` | Governance context. |
| `human_review_decision_id` | `uuid` | Optional Human review context. |
| `selected_path` | `text` | Human, Agent, Hybrid, or null. |
| `selected_option_id` | `uuid` | Chosen option. |
| `approval_status` | `text` | Not required, pending, approved, blocked. |
| `launch_status` | `text` | Not launched, pending approval, launched, blocked, failed, completed. |
| `launched_at` | `timestamp` | Launch time, if any. |
| `completed_at` | `timestamp` | Completion time, if any. |

### `agent_runs`

Stores real provider execution attempts after launch is allowed.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `task_id` | `uuid` | Related task. |
| `execution_record_id` | `uuid` | Execution context. |
| `provider_adapter_id` | `text` | Which backend adapter ran the work. |
| `provider_run_id` | `text` | Provider-side run identifier, if available. |
| `status` | `text` | Queued, running, completed, failed, canceled. |
| `run_mode` | `text` | Production provider, sandbox, optional live draft, or local deterministic. |
| `input_snapshot_json` | `json` | Versioned task and policy context sent to provider. |
| `output_json` | `json` | Normalized output package. |
| `error_json` | `json` | Error details if failed. |
| `started_at` | `timestamp` | Start time. |
| `completed_at` | `timestamp` | Completion time. |

### `output_review_decisions`

Stores the final Human gate after Agent output exists.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `task_id` | `uuid` | Related task. |
| `agent_run_id` | `uuid` | Agent output being reviewed. |
| `reviewer_user_id` | `uuid` | Human reviewer. |
| `action` | `text` | Accept output, request revision, or reroute to Human. |
| `decision_status` | `text` | Accepted for use, needs revision, rerouted to Human. |
| `comments` | `text` | Optional Human notes. |
| `decided_at` | `timestamp` | Review time. |

### `audit_events`

Stores immutable evidence for task decisions.

| Field | Example type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. |
| `task_id` | `uuid` | Related task. |
| `actor_type` | `text` | Human, system, agent, provider. |
| `actor_id` | `text` | User ID, system ID, or provider ID. |
| `event_type` | `text` | Recommendation created, governance evaluated, launch blocked, Agent run completed, output accepted, etc. |
| `label` | `text` | Short display label. |
| `description` | `text` | Plain-language event explanation. |
| `status` | `text` | Event status. |
| `metadata_json` | `json` | Extra event context. |
| `occurred_at` | `timestamp` | Event time. |
| `trace_id` | `text` | Shared trace for production observability. |

## Queue job concept

Real Agent runs may take longer than a page interaction. A queue should handle those jobs outside the browser.

Future queue jobs could include:

- `agent_run.execute`: call a provider adapter after governance and launch checks pass
- `agent_run.poll_status`: check long-running provider jobs
- `agent_run.retry`: retry safe failures under policy limits
- `agent_run.normalize_output`: convert provider output into the product output schema
- `audit_event.emit`: write immutable audit events for run status changes
- `observability.flush`: send structured metrics and traces to monitoring tools

Queue jobs should carry `task_id`, `execution_record_id`, `policy_version`, `provider_adapter_id`, and `trace_id` so operations can be audited later.

## Provider adapter concept

Production provider adapters should run behind the backend, not in the frontend.

The current `liveAgentAdapter` is a demo-only browser adapter that proves the
pluggable execution shape. It is not the production security pattern because a
production app should not ask end users to place provider credentials in the
browser.

Responsibilities:

- hold server-side credentials and secrets
- translate Human-AgentOS task context into provider-specific requests
- enforce launch eligibility before execution
- normalize provider responses into `agent_runs.output_json`
- capture provider errors and latency
- emit audit events and observability traces
- prevent blocked or pending-review tasks from running
- prevent models from changing routing, governance, blocked status, or audit policy

The adapter boundary lets the product add OpenAI, other model providers, or specialized agent providers later while keeping the frontend workflow stable.

## Production contract principle

Do not let infrastructure blur the product concepts.

Recommendation, governance, Human review, execution, Agent run, output review, and audit event should remain separate records. That separation is what lets leaders understand what was recommended, what policy allowed, what actually launched, what the Agent produced, what a Human decided, and why the task ended in its final state.
