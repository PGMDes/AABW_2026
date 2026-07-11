-- ============================================================================
-- Phase 22B.1 - Supabase database foundation
-- SymbiontOS workflow control plane
-- ----------------------------------------------------------------------------
-- Source of truth: docs/20_PHASE_22_FULLSTACK_IMPLEMENTATION_PLAN.md (Section 4)
-- Confirmed by:    docs/21_PHASE_22A_INFRASTRUCTURE_CONTRACTS.md
--
-- Scope of this slice: schema, columns, relationships, check constraints,
-- indexes, RLS, and least-privilege grants for five tables:
--   tasks, task_flows, agent_runs, review_decisions, audit_events
--
-- Not in this slice (deferred): triggers, stored functions, RPCs, views,
-- seed data, Auth configuration, server Functions, snapshot-append function,
-- reset/seed contract, pgTAP tests. Flow identity is enforced by the
-- composite foreign key agent_runs_flow_identity_fkey, so a separate
-- flow-identity validation trigger is no longer required.
--
-- Identifier contract (authoritative per docs/20 Section 4):
--   tasks.id                                  -> text  (domain task id: task_001, task_<UUID>)
--   every task_id foreign key                 -> text   (compatible with tasks.id)
--   task_flows.execution_id                   -> text   (domain execution id: execution_task_001)
--   agent_runs.execution_id                   -> text   (domain execution id)
--   agent_runs.id                             -> uuid   (database record key)
--   agent_runs.run_key                        -> text   (unique domain agent-run key)
--   agent_runs.provider_run_id                -> text   (nullable provider-side run id)
--   task_flows.id / review_decisions.id /
--     audit_events.id                         -> uuid   (database record key)
--   owner_user_id / actor_user_id             -> uuid   (references auth.users(id))
--   trace_id                                  -> uuid
--   audit_events.actor_id                     -> text   (human/system/agent/provider id)
--
-- Relational ownership enforcement:
--   Composite foreign keys prevent privileged server mistakes from connecting
--   records across owners or tasks. A flow must belong to the same owner as
--   its task; a run must match its flow on flow ID, task ID, owner ID, and
--   execution ID; review decisions must match their flow/run on task and
--   owner; task-linked audit events must match their task's owner. The
--   minimum non-partial UNIQUE constraints required by PostgreSQL for these
--   composite foreign keys are added on tasks, task_flows, and agent_runs.
--
-- Delete behavior:
--   * auth.users -> owner rows: cascade (direct owner delete).
--   * tasks -> task_flows / agent_runs / review_decisions / audit_events:
--     cascade (task-linked reset cascades per approved plan).
--   * agent_runs.task_flow_id: NO ACTION (do not cascade-delete runs when a
--     flow is removed; server code manages ordering).
--   * review_decisions.task_flow_id / agent_run_id: NO ACTION (append-only
--     evidence is never silently orphaned).
--   * review_decisions.actor_user_id: NO ACTION (an actor who recorded
--     decisions cannot be removed while evidence references them).
--
-- Security:
--   * RLS enabled on every table.
--   * anon has no access.
--   * authenticated has owner-scoped SELECT only.
--   * No authenticated INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER.
--   * Policies use TO authenticated plus (select auth.uid()) = owner_user_id.
--   * No SECURITY DEFINER functions, views, RPCs, triggers, or seed data.
-- ============================================================================

-- ============================================================================
-- 1. tasks
--    Durable task intake owned by the authenticated user.
-- ============================================================================
create table public.tasks (
    id text primary key,
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    description text not null,
    expected_output text not null,
    deadline date null,
    audience text not null,
    sensitivity text not null,
    urgency text not null,
    budget_range text not null,
    workflow_status text not null,
    source text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint tasks_audience_check
        check (audience in ('internal', 'internal_leadership', 'external')),
    constraint tasks_sensitivity_check
        check (sensitivity in ('low', 'medium', 'high')),
    constraint tasks_urgency_check
        check (urgency in ('low', 'medium', 'high')),
    constraint tasks_budget_range_check
        check (budget_range in ('low', 'medium', 'high')),
    constraint tasks_source_check
        check (source in ('demo', 'full_stack')),
    constraint tasks_workflow_status_check
        check (
            workflow_status in (
                'submitted',
                'recommended',
                'needs_human_review',
                'approval_required',
                'approved_for_launch',
                'blocked',
                'completed'
            )
        ),
    -- Supports composite foreign keys from task_flows and audit_events that
    -- enforce the referenced task belongs to the same owner.
    constraint tasks_id_owner_user_id_key unique (id, owner_user_id)
);

create index tasks_owner_user_id_idx
    on public.tasks (owner_user_id);

-- ============================================================================
-- 2. task_flows
--    Server-generated, immutable, versioned snapshots of deterministic state.
--    These are evidence, not browser assertions.
-- ============================================================================
create table public.task_flows (
    id uuid primary key default gen_random_uuid(),
    task_id text not null references public.tasks(id) on delete cascade,
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    flow_version integer not null check (flow_version > 0),
    execution_id text not null,
    analysis jsonb not null,
    recommendation jsonb not null,
    governance jsonb not null,
    prelaunch_review jsonb null,
    selected_option jsonb null,
    execution_record jsonb not null,
    policy_version text not null,
    engine_version text not null,
    created_at timestamptz not null default now(),
    -- Enforce relational ownership: the referenced task must belong to the
    -- same owner as this flow.
    constraint task_flows_task_id_owner_user_id_fkey
        foreign key (task_id, owner_user_id)
        references public.tasks(id, owner_user_id) on delete cascade,
    -- Supports composite foreign key from agent_runs enforcing flow identity
    -- (flow ID, task ID, owner ID, execution ID all match).
    constraint task_flows_id_task_id_owner_user_id_execution_id_key
        unique (id, task_id, owner_user_id, execution_id),
    -- Supports composite foreign key from pre-launch review_decisions
    -- enforcing the referenced flow belongs to the same task and owner.
    constraint task_flows_id_task_id_owner_user_id_key
        unique (id, task_id, owner_user_id)
);

-- One immutable snapshot per (task, version).
create unique index task_flows_task_id_flow_version_idx
    on public.task_flows (task_id, flow_version);

-- Deliberately non-unique: pre-launch Human decisions can change the flow
-- while execution_<task-id> stays stable, so multiple versions share one
-- execution id.
create index task_flows_task_id_execution_id_idx
    on public.task_flows (task_id, execution_id);

create index task_flows_owner_user_id_idx
    on public.task_flows (owner_user_id);

create index task_flows_task_id_idx
    on public.task_flows (task_id);

-- ============================================================================
-- 3. agent_runs
--    Durable deterministic or real provider attempts tied to one execution.
-- ============================================================================
create table public.agent_runs (
    id uuid primary key default gen_random_uuid(),
    run_key text not null unique,
    task_id text not null references public.tasks(id) on delete cascade,
    task_flow_id uuid not null references public.task_flows(id),
    execution_id text not null,
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    provider text not null,
    provider_run_id text null,
    requested_model text null,
    returned_model text null,
    run_mode text not null,
    status text not null,
    input_snapshot jsonb not null,
    normalized_output jsonb null,
    normalized_error jsonb null,
    trace_id uuid not null,
    started_at timestamptz not null default now(),
    completed_at timestamptz null,
    constraint agent_runs_run_mode_check
        check (run_mode in ('local_deterministic', 'live_provider')),
    constraint agent_runs_status_check
        check (status in ('running', 'completed', 'failed', 'timed_out')),
    constraint agent_runs_lifecycle_check
        check (
            (status = 'running' and completed_at is null)
            or (status in ('completed', 'failed', 'timed_out')
                and completed_at is not null)
        ),
    constraint agent_runs_failure_evidence_check
        check (
            status not in ('failed', 'timed_out')
            or normalized_error is not null
        ),
    -- Enforce relational identity: the referenced flow must have the same
    -- flow ID, task ID, owner ID, and execution ID as this run.
    constraint agent_runs_flow_identity_fkey
        foreign key (task_flow_id, task_id, owner_user_id, execution_id)
        references public.task_flows(id, task_id, owner_user_id, execution_id),
    -- Supports composite foreign key from post-output review_decisions
    -- enforcing the referenced run belongs to the same task and owner.
    constraint agent_runs_id_task_id_owner_user_id_key
        unique (id, task_id, owner_user_id)
);

-- Globally unique server-generated domain run key.

-- At most one running Agent run per task. Partial unique index is
-- database-enforced so concurrent reservations cannot create duplicates.
create unique index agent_runs_active_run_idx
    on public.agent_runs (task_id)
    where status = 'running';

create index agent_runs_owner_user_id_idx
    on public.agent_runs (owner_user_id);

create index agent_runs_task_id_idx
    on public.agent_runs (task_id);

create index agent_runs_task_flow_id_idx
    on public.agent_runs (task_flow_id);

create index agent_runs_execution_id_idx
    on public.agent_runs (execution_id);

create index agent_runs_trace_id_idx
    on public.agent_runs (trace_id);

-- ============================================================================
-- 4. review_decisions
--    One immutable record shape for pre-launch and post-output Human decisions.
-- ============================================================================
create table public.review_decisions (
    id uuid primary key default gen_random_uuid(),
    task_id text not null references public.tasks(id) on delete cascade,
    task_flow_id uuid null references public.task_flows(id),
    agent_run_id uuid null references public.agent_runs(id),
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    stage text not null,
    action text not null,
    decision_status text not null,
    rationale text null,
    actor_user_id uuid not null references auth.users(id),
    related_governance jsonb null,
    decided_at timestamptz not null default now(),
    constraint review_decisions_stage_check
        check (stage in ('pre_launch', 'post_output')),
    constraint review_decisions_action_check
        check (
            action in (
                'approve_recommended',
                'switch_to_human',
                'block_execution',
                'confirm_policy_block',
                'accept_output',
                'request_revision',
                'reroute_to_human'
            )
        ),
    constraint review_decisions_decision_status_check
        check (
            decision_status in (
                'approved',
                'blocked',
                'accepted_for_use',
                'needs_revision',
                'rerouted_to_human'
            )
        ),
    -- A pre-launch decision references its flow and no run; a post-output
    -- decision references a run. (Run-completeness is enforced by server
    -- code and a later validation trigger, not in this slice.)
    constraint review_decisions_stage_shape_check
        check (
            (stage = 'pre_launch'
                and task_flow_id is not null
                and agent_run_id is null)
            or (stage = 'post_output'
                and agent_run_id is not null)
        ),
    -- Action must match the stage's deterministic action map.
    constraint review_decisions_stage_action_check
        check (
            (stage = 'pre_launch'
                and action in (
                    'approve_recommended',
                    'switch_to_human',
                    'block_execution',
                    'confirm_policy_block'
                ))
            or (stage = 'post_output'
                and action in (
                    'accept_output',
                    'request_revision',
                    'reroute_to_human'
                ))
        ),
    -- Decision status must match the stage's deterministic outcomes.
    constraint review_decisions_stage_decision_status_check
        check (
            (stage = 'pre_launch'
                and decision_status in ('approved', 'blocked'))
            or (stage = 'post_output'
                and decision_status in (
                    'accepted_for_use',
                    'needs_revision',
                    'rerouted_to_human'
                ))
        ),
    -- Enforce relational ownership for pre-launch decisions: the referenced
    -- flow must belong to the same task and owner. MATCH SIMPLE (PostgreSQL
    -- default): only enforced when task_flow_id is non-null.
    constraint review_decisions_flow_owner_fkey
        foreign key (task_flow_id, task_id, owner_user_id)
        references public.task_flows(id, task_id, owner_user_id),
    -- Enforce relational ownership for post-output decisions: the referenced
    -- run must belong to the same task and owner. MATCH SIMPLE: only
    -- enforced when agent_run_id is non-null.
    constraint review_decisions_run_owner_fkey
        foreign key (agent_run_id, task_id, owner_user_id)
        references public.agent_runs(id, task_id, owner_user_id)
);

-- One effective pre-launch decision per reviewed flow.
create unique index review_decisions_prelaunch_unique_idx
    on public.review_decisions (task_flow_id)
    where stage = 'pre_launch';

-- One effective post-output decision per reviewed run.
create unique index review_decisions_postoutput_unique_idx
    on public.review_decisions (agent_run_id)
    where stage = 'post_output';

create index review_decisions_owner_user_id_idx
    on public.review_decisions (owner_user_id);

create index review_decisions_task_id_idx
    on public.review_decisions (task_id);

create index review_decisions_task_flow_id_idx
    on public.review_decisions (task_flow_id);

create index review_decisions_agent_run_id_idx
    on public.review_decisions (agent_run_id);

-- ============================================================================
-- 5. audit_events
--    Append-only evidence across task/flow/decision/run/review/reset events.
-- ============================================================================
create table public.audit_events (
    id uuid primary key default gen_random_uuid(),
    -- task_id is nullable only for legitimate workspace/system events such as
    -- a demo_workspace_reset marker that is not tied to a single task.
    task_id text null references public.tasks(id) on delete cascade,
    owner_user_id uuid not null references auth.users(id) on delete cascade,
    actor_type text not null,
    -- actor_id is text because actors can be Human, system, Agent, or provider
    -- identities, not only Supabase Auth UUIDs.
    actor_id text not null,
    event_type text not null,
    label text not null,
    description text not null,
    status text not null,
    metadata jsonb not null default '{}'::jsonb,
    trace_id uuid null,
    occurred_at timestamptz not null default now(),
    constraint audit_events_actor_type_check
        check (actor_type in ('human', 'system', 'agent', 'provider')),
    constraint audit_events_status_check
        check (
            status in (
                'completed',
                'approved',
                'needs_human_review',
                'blocked',
                'pending',
                'in_progress',
                'accepted_for_use',
                'needs_revision',
                'rerouted_to_human',
                'running',
                'failed',
                'timed_out'
            )
        ),
    -- Enforce relational ownership for task-linked events: when task_id is
    -- non-null, the referenced task must belong to the same owner. MATCH
    -- SIMPLE: not enforced when task_id is null, allowing legitimate
    -- workspace/system events with null task_id.
    constraint audit_events_task_owner_fkey
        foreign key (task_id, owner_user_id)
        references public.tasks(id, owner_user_id) on delete cascade
);

create index audit_events_owner_user_id_idx
    on public.audit_events (owner_user_id);

create index audit_events_task_id_idx
    on public.audit_events (task_id);

create index audit_events_trace_id_idx
    on public.audit_events (trace_id);

create index audit_events_occurred_at_idx
    on public.audit_events (occurred_at);

-- ============================================================================
-- Row Level Security
-- Every exposed table enables RLS. Browser access is owner-scoped SELECT only.
-- No browser INSERT/UPDATE/DELETE policies exist; writes are server-owned.
-- ============================================================================

alter table public.tasks enable row level security;
alter table public.task_flows enable row level security;
alter table public.agent_runs enable row level security;
alter table public.review_decisions enable row level security;
alter table public.audit_events enable row level security;

-- ============================================================================
-- Grants (least privilege)
-- Grants and RLS are separate controls. anon gets nothing. authenticated gets
-- owner-scoped SELECT only. service_role is intentionally left to Supabase
-- defaults so server-owned writes can bypass RLS in later phases.
-- ============================================================================

revoke all on public.tasks from anon, authenticated, PUBLIC;
revoke all on public.task_flows from anon, authenticated, PUBLIC;
revoke all on public.agent_runs from anon, authenticated, PUBLIC;
revoke all on public.review_decisions from anon, authenticated, PUBLIC;
revoke all on public.audit_events from anon, authenticated, PUBLIC;

grant select on public.tasks to authenticated;
grant select on public.task_flows to authenticated;
grant select on public.agent_runs to authenticated;
grant select on public.review_decisions to authenticated;
grant select on public.audit_events to authenticated;

-- ============================================================================
-- RLS policies
-- TO authenticated plus owner predicate. TO authenticated alone is forbidden.
-- No role-only policies and no deprecated auth.role() usage.
-- ============================================================================

create policy tasks_owner_select on public.tasks
    for select to authenticated
    using ((select auth.uid()) = owner_user_id);

create policy task_flows_owner_select on public.task_flows
    for select to authenticated
    using ((select auth.uid()) = owner_user_id);

create policy agent_runs_owner_select on public.agent_runs
    for select to authenticated
    using ((select auth.uid()) = owner_user_id);

create policy review_decisions_owner_select on public.review_decisions
    for select to authenticated
    using ((select auth.uid()) = owner_user_id);

create policy audit_events_owner_select on public.audit_events
    for select to authenticated
    using ((select auth.uid()) = owner_user_id);
